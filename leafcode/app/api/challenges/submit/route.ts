import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put, del } from '@vercel/blob';
import { Sandbox } from '@vercel/sandbox';

interface SubmissionBody {
  challengeId: number
  code: string
  language: SubmissionLanguage
}

interface SubmissionResult {
  passed: boolean
  score: number
  executionTime: number
  yourEnergy: number
  message: string
}

const ALLOWED_LANGUAGES = ['PYTHON', 'CPP', 'C', 'JAVASCRIPT'] as const
type SubmissionLanguage = (typeof ALLOWED_LANGUAGES)[number]

function isSubmissionBody(value: unknown): value is SubmissionBody {
  if (!value || typeof value !== 'object') return false

  const body = value as Record<string, unknown>
  return (
    typeof body.challengeId === 'number' &&
    Number.isInteger(body.challengeId) &&
    body.challengeId > 0 &&
    typeof body.code === 'string' &&
    body.code.trim().length > 0 &&
    typeof body.language === 'string' &&
    ALLOWED_LANGUAGES.includes(body.language as SubmissionLanguage)
  )
}

async function parseSubmissionBody(req: NextRequest): Promise<SubmissionBody | null> {
  const raw = await req.text()
  if (!raw.trim()) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (!isSubmissionBody(parsed)) return null
  return parsed
}

export async function POST(
  req: NextRequest,
) {
  // Authenticate
  // Validate submission validity and challenge existence
  // Create submission record with status 'PENDING'
  // Put code in blob storage and save reference in submission record
  // Trigger async grading process in sandbox
  // Return submission receipt with submission ID and initial status

  const session = await auth.api.getSession({
      headers: await headers()
  })

  if(!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const submissionBody = await parseSubmissionBody(req);
  if (!submissionBody) {
    return NextResponse.json(
      { error: 'Invalid request body. Expected JSON with challengeId, code and language.' },
      { status: 400 }
    );
  }

  const blobToken = process.env.SUBMISSION_BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    console.error('Missing SUBMISSION_BLOB_READ_WRITE_TOKEN environment variable.');
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }

  const snapshotId = process.env.SANDBOX_SNAPSHOT_ID;
  if (!snapshotId) {
    console.error('Missing SANDBOX_SNAPSHOT_ID environment variable.');
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }

  const { challengeId } = submissionBody;

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { id: true }
  });

  if (!challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
  }

  const submission = await prisma.userChallenge.create({
    data: {
      userId: session.user.id,
      challengeId,
      code: '',
      language: submissionBody.language,
      status: 'PENDING',
      co2Consumed: 0,
      energyConsumed: 0,
      score: 0,
    }
  });

  if (!submission) {
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }

  const blobName = `${submission.id}`;
  const blobContent = submissionBody.code;
  const blob = new Blob([blobContent], { type: 'text/plain' });

  try {
    const { url } = await put(blobName, blob, {
      access: 'private',
      token: blobToken,
    });

    await prisma.userChallenge.update({
      where: { id: submission.id },
      data: { code: url }
    });
  } catch (error) {
    // SAGA cause I know DDS
    console.error('Failed to upload code to blob storage:', error);

    await del(blobName, {
      token: blobToken,
    }).catch(err => {
      console.error('Failed to delete blob after upload failure:', err);
    });

    await prisma.userChallenge.delete({ where: { id: submission.id } }).catch(err => {
      console.error('Failed to delete submission after upload failure:', err);
    });

    return NextResponse.json({ error: 'Failed to store submission code' }, { status: 500 });
  }
  
  // TODO: Invoke sandbox grading process asynchronously.

  const sandbox = await Sandbox.create({
    source: {
      type: 'snapshot',
      snapshotId,
    },
    resources: {
      vcpus: 1,
    },
    runtime: 'python3.13',
    timeout: 300000, // 5 minutes
    networkPolicy: 'deny-all',
  });

  return NextResponse.json({
    submissionId: submission.id,
    status: submission.status,
  });
}