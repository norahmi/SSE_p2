import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
<<<<<<< HEAD
import { put, del } from '@vercel/blob'
import { Sandbox } from '@vercel/sandbox'
import { runFunctionalTests, type FunctionalRunResult, type FunctionalTestCase } from '@/lib/execution/test-runner'
import { getRunnerLayout, type RunnerLanguage } from '@/lib/execution/templates'

type AppSubmissionStatus = 'PENDING' | 'PASSED' | 'FAILED'
=======
import { put, del } from '@vercel/blob';
import { Sandbox } from '@vercel/sandbox';
>>>>>>> origin/main

interface SubmissionBody {
  challengeId: string
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

interface GradingResult {
  submissionId: string
  status: "accepted" | "timeout" | "error"
  energyJoules: number 
  executionTimeMs: number
  avgPowerWatts: number
  numReadings: number
}

interface SandboxFunctionalResult {
  status: 'accepted' | 'error' | 'timeout'
  stdout?: string
  stderr?: string
  exitCode?: number | null
  error?: string
}

interface SandboxErrorDetails {
  location?: string
  summary?: string
}

const ALLOWED_LANGUAGES = ['PYTHON', 'CPP', 'C', 'JAVASCRIPT'] as const
type SubmissionLanguage = (typeof ALLOWED_LANGUAGES)[number]

function isSubmissionBody(value: unknown): value is SubmissionBody {
  if (!value || typeof value !== 'object') return false

  const body = value as Record<string, unknown>
  return (
    typeof body.challengeId === 'string' &&
    body.challengeId.trim().length > 0 &&
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

async function runSandboxFunctionalTests(params: {
  assignmentId: number
  studentCode: string
  testCases: FunctionalTestCase[]
}): Promise<FunctionalRunResult> {
  const snapshotId = process.env.SANDBOX_SNAPSHOT_ID
  if (!snapshotId) {
    return {
      passed: false,
      failureKind: 'infrastructure_error',
      message: 'Sandbox is not configured. Missing SANDBOX_SNAPSHOT_ID.',
    }
  }

  const sandbox = await Sandbox.create({
    source: {
      type: 'snapshot',
      snapshotId,
    },
    resources: {
      vcpus: 1,
    },
    runtime: 'python3.13',
    timeout: 120000,
    networkPolicy: 'deny-all',
  })

  const layout = getRunnerLayout('PYTHON', params.assignmentId)
  const runDir = `/tmp/leafcode-functional-${params.assignmentId}-${Date.now()}`

  const extractSandboxErrorDetails = (stderr: string): SandboxErrorDetails => {
    const normalized = stderr.replace(/\r\n/g, '\n').trim()
    if (!normalized) return {}

    const lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean)
    const tracebackRegex = /File "([^"]+)", line (\d+)/g
    const matches = [...normalized.matchAll(tracebackRegex)]

    const preferred = [...matches].reverse().find((match) => match[1]?.startsWith(runDir))
    const fallback = matches.length > 0 ? matches[matches.length - 1] : undefined
    const selected = preferred ?? fallback

    const location = selected
      ? `${selected[1].replace(`${runDir}/`, '')}:${selected[2]}`
      : undefined

    return {
      location,
      summary: lines[lines.length - 1],
    }
  }

  try {
    await sandbox.mkDir(runDir).catch(() => undefined)
    await sandbox.writeFiles([
      { path: `${runDir}/${layout.studentFileName}`, content: Buffer.from(params.studentCode, 'utf-8') },
      { path: `${runDir}/${layout.driverFileName}`, content: Buffer.from(layout.driverSource, 'utf-8') },
      ...layout.supportFiles.map((file) => ({
        path: `${runDir}/${file.fileName}`,
        content: Buffer.from(file.content, 'utf-8'),
      })),
    ])

    for (let i = 0; i < params.testCases.length; i++) {
      const testCase = params.testCases[i]
      const stdinPath = `${runDir}/stdin_${i}.txt`
      const stdinPayload = `${params.assignmentId}\n${testCase.stdin}`

      await sandbox.writeFiles([
        { path: stdinPath, content: Buffer.from(stdinPayload, 'utf-8') },
      ])

      const gradingResult = await sandbox.runCommand({
        cwd: '/vercel/sandbox/leafcode/runner',
        cmd: 'python3',
        args: [
          'executor.py',
          '--mode', 'functional',
          '-s', `${params.assignmentId}-${i}`,
          '-l', 'python',
          '-f', `${runDir}/${layout.driverFileName}`,
          '--stdin-file', stdinPath,
        ],
      })

      if (gradingResult.exitCode !== 0) {
        const cmdStderr = await gradingResult.output('stderr')
        const details = extractSandboxErrorDetails(cmdStderr)
        const locationText = details.location ? ` at ${details.location}` : ''
        const summaryText = details.summary ? ` ${details.summary}` : ''
        return {
          passed: false,
          failureKind: 'runtime_error',
          failedTestIndex: i,
          stderr: cmdStderr || 'Sandbox functional runner failed to execute.',
          message: `Test #${i + 1} crashed inside the sandbox${locationText}.${summaryText}`,
        }
      }

      const stdout = await gradingResult.output('stdout')
      let executionResult: SandboxFunctionalResult

      try {
        executionResult = JSON.parse(stdout) as SandboxFunctionalResult
      } catch {
        return {
          passed: false,
          failureKind: 'runtime_error',
          failedTestIndex: i,
          stderr: stdout,
          message: `Test #${i + 1} returned malformed sandbox output.`,
        }
      }

      if (executionResult.status === 'timeout') {
        return {
          passed: false,
          failureKind: 'timeout',
          failedTestIndex: i,
          message: `Test #${i + 1} timed out inside the sandbox.`,
        }
      }

      if (executionResult.status !== 'accepted' || (executionResult.exitCode ?? 1) !== 0) {
        const rawStderr = executionResult.stderr || executionResult.error || 'Sandbox execution failed.'
        const details = extractSandboxErrorDetails(rawStderr)
        const locationText = details.location ? ` at ${details.location}` : ''
        const summaryText = details.summary ? ` ${details.summary}` : ''
        return {
          passed: false,
          failureKind: 'runtime_error',
          failedTestIndex: i,
          stderr: rawStderr,
          message: `Test #${i + 1} crashed inside the sandbox${locationText}.${summaryText}`,
        }
      }

      if ((executionResult.stderr ?? '').trim().length > 0) {
        return {
          passed: false,
          failureKind: 'runtime_error',
          failedTestIndex: i,
          stderr: executionResult.stderr,
          message: `Test #${i + 1} wrote to stderr inside the sandbox.`,
        }
      }

      const actual = (executionResult.stdout ?? '').replace(/\r\n/g, '\n').trimEnd()
      const expected = testCase.expectedStdout.replace(/\r\n/g, '\n').trimEnd()

      if (actual !== expected) {
        return {
          passed: false,
          failureKind: 'wrong_answer',
          failedTestIndex: i,
          expectedStdout: expected,
          actualStdout: actual,
          message: `Test #${i + 1} failed: wrong output.`,
        }
      }
    }

    return {
      passed: true,
      message: 'All functional tests passed.',
      cleanStudentCode: params.studentCode,
    }
  } finally {
    await sandbox.stop().catch(() => undefined)
  }
}

export async function POST(
  req: NextRequest,
) {
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
    select: { id: true, difficulty: true }
  });

  if (!challenge) {
<<<<<<< HEAD
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  if (!challenge.languages.includes(submissionBody.language)) {
    return NextResponse.json({ error: 'Language is not allowed for this challenge.' }, { status: 400 })
  }

  const assignmentId = resolveAssignmentId(challenge.id, challenge.slug)
  if (!assignmentId) {
    return NextResponse.json({ error: `No functional test configuration found for challenge ${challenge.id}.` }, { status: 500 })
  }

  const seed = resolveTestSeed(assignmentId, session.user.id)
  const testCases = getHiddenTestCases(assignmentId, runnerLanguage, seed)
  if (!testCases) {
    return NextResponse.json({ error: `No functional test configuration found for assignment ${assignmentId}.` }, { status: 500 })
  }

  const startedAt = Date.now()
  const functional = runnerLanguage === 'PYTHON'
    ? await runSandboxFunctionalTests({
        assignmentId,
        studentCode: submissionBody.code,
        testCases,
      })
    : await runFunctionalTests({
        language: runnerLanguage,
        assignmentId,
        studentCode: submissionBody.code,
        testCases,
      })

  if (!functional.passed) {
    await prisma.$transaction([
      prisma.userChallenge.create({
        data: {
          userId: session.user.id,
          challengeId: challenge.id,
          code: submissionBody.code,
          language: submissionBody.language,
          status: 'FAILED',
          energyConsumed: 0,
          score: 0,
        },
      }),
      prisma.challenge.update({
        where: { id: challenge.id },
        data: { submissionCount: { increment: 1 } },
      }),
    ])

    const failed: SubmissionResult = {
      passed: false,
      score: 0,
      executionTime: Number(((Date.now() - startedAt) / 1000).toFixed(3)),
      yourEnergy: 0,
      message: functional.compileStderr || functional.stderr || functional.message,
    }

    return NextResponse.json(failed)
  }

  const blobToken = process.env.SUBMISSION_BLOB_READ_WRITE_TOKEN
  const snapshotId = process.env.SANDBOX_SNAPSHOT_ID
  if (!blobToken || !snapshotId) {
    return NextResponse.json(
      { error: 'Sandbox is not configured. Missing SANDBOX_SNAPSHOT_ID or SUBMISSION_BLOB_READ_WRITE_TOKEN.' },
      { status: 500 }
    )
=======
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
>>>>>>> origin/main
  }

  // Score mapping
  const difficultyMaxPoints: Record<string, number> = {
    HARD: 1000,
    MEDIUM: 750,
    EASY: 500
  };
  const maxPoints = difficultyMaxPoints[challenge.difficulty] || 500;

  const submission = await prisma.userChallenge.create({
    data: {
      userId: session.user.id,
      challengeId,
      code: '',
      language: submissionBody.language,
      status: 'PENDING',
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

  const sandbox = await Sandbox.create({
    source: {
      type: 'snapshot',
      snapshotId,
    },
    resources: {
      vcpus: 1,
    },
    runtime: 'python3.13',
    timeout: 120000, // 2 minutes
    networkPolicy: 'deny-all',
  });

  const contentBuffer = Buffer.from(blobContent, 'utf-8');

  await sandbox.writeFiles([{
    path: `/tmp/${submission.id}`,
    content: contentBuffer,
  }]).catch(err => {
    console.error('Failed to write code to sandbox:', err);
    return NextResponse.json({ error: 'Failed to prepare grading environment' }, { status: 500 });
  });

  const gradingResult = await sandbox.runCommand({
    cwd: '/vercel/sandbox/leafcode/runner',
    cmd: 'python3',
    args: ['executor.py', '-s', submission.id, '-l', submissionBody.language.toLowerCase(), '-f', `/tmp/${submission.id}`]
  });

  if (gradingResult.exitCode !== 0) {
    await sandbox.stop();

    await prisma.userChallenge.update({
      where: { id: submission.id },
      data: { status: 'FAILED' }
    });

    console.error('Grading process failed:', gradingResult);
    return NextResponse.json({ error: 'Grading process failed' }, { status: 500 });
  }

  const stdout = await gradingResult.output("stdout");

  await sandbox.stop();

  let gradingOutput: GradingResult;

  try {
    gradingOutput = JSON.parse(stdout) as GradingResult;
  } catch (err) {
    await prisma.userChallenge.update({
      where: { id: submission.id },
      data: { status: 'FAILED' }
    });

    console.error('Failed to parse grading output:', err);
    return NextResponse.json({ error: 'Failed to parse grading results' }, { status: 500 });
  }

  if (gradingOutput.status !== "accepted") {
    await prisma.userChallenge.update({
      where: { id: submission.id },
      data: { status: 'FAILED' }
    });
    
    console.error('Submission rejected by grading process:', gradingOutput);
    return NextResponse.json({ error: 'Submission rejected by grading process', details: gradingOutput }, { status: 400 });
  }

  let finalScore = 0;
  if (gradingOutput.status === "accepted") {
    const energyPenalty = Math.floor(gradingOutput.energyJoules); 
    finalScore = Math.max(1, maxPoints - energyPenalty);
  }

  await prisma.userChallenge.update({
    where: { id: submission.id },
    data: {
      energyConsumed: gradingOutput.energyJoules,
      status: gradingOutput.status === "accepted" ? 'PASSED' : 'FAILED',
      score: finalScore,
    }
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      totScore: {
        increment: finalScore
      }
    }
  });
  
  const returnResult:SubmissionResult = {
    passed: gradingOutput.status === "accepted",
    score: finalScore,
    executionTime: Math.round(gradingOutput.executionTimeMs),
    yourEnergy: Math.round((gradingOutput.energyJoules / 3.6) * 100) / 100,
    message: gradingOutput.status === "accepted" ? "Submission accepted!" : "Submission rejected."
  };

  return NextResponse.json(returnResult);
}
