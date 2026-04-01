import { createHash, randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put, del } from '@vercel/blob'
import { Sandbox } from '@vercel/sandbox'
import { runFunctionalTests, type FunctionalTestCase } from '@/lib/execution/test-runner'
import { measureEnergy } from '@/lib/execution/energy-executor'
import { getRunnerLayout, type RunnerLanguage } from '@/lib/execution/templates'

type AppSubmissionStatus = 'PENDING' | 'PASSED' | 'FAILED'

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

interface GradingResult {
  submissionId: string
  status: 'accepted' | 'timeout' | 'error'
  energyJoules: number
  executionTimeMs: number
  avgPowerWatts: number
  numReadings: number
  error?: string
}

const ALLOWED_LANGUAGES = ['PYTHON', 'CPP', 'C', 'JAVASCRIPT'] as const
type SubmissionLanguage = (typeof ALLOWED_LANGUAGES)[number]

function toRunnerLanguage(language: SubmissionLanguage): RunnerLanguage | null {
  if (language === 'PYTHON') return 'PYTHON'
  if (language === 'CPP') return 'CPP'
  return null
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function normalizeSeed(seed: number): number {
  return (seed >>> 0) || 1
}

function createRng(seed: number): () => number {
  let t = normalizeSeed(seed)
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), t | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function randomWord(rng: () => number, len: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let out = ''
  for (let i = 0; i < len; i++) {
    out += alphabet[randInt(rng, 0, alphabet.length - 1)]
  }
  return out
}

function buildRandomRoute(rng: () => number): string {
  const segments = randInt(rng, 2, 4)
  const parts: string[] = []
  for (let i = 0; i < segments; i++) {
    parts.push(randomWord(rng, randInt(rng, 2, 5)))
  }
  return parts.join('.')
}

function resolveTestSeed(challengeId: number, userId: string): number {
  const fixed = Number.parseInt(process.env.FUNCTIONAL_TEST_SEED ?? '', 10)
  if (Number.isInteger(fixed)) {
    return normalizeSeed(fixed ^ challengeId)
  }

  const entropy = `${Date.now()}:${userId}:${challengeId}:${randomBytes(8).toString('hex')}`
  const digest = createHash('sha256').update(entropy).digest()
  return normalizeSeed(digest.readUInt32BE(0))
}

function getHiddenTestCases(
  assignmentId: number,
  language: RunnerLanguage,
  seed: number
): FunctionalTestCase[] | null {
  const rng = createRng(seed)
  const caseCount = 20

  if (assignmentId === 1) {
    const testCases: FunctionalTestCase[] = []
    for (let i = 0; i < caseCount; i++) {
      const payload = randomWord(rng, randInt(rng, 3, 9)).toLowerCase()
      const delay = randInt(rng, 0, 30)
      testCases.push({
        stdin: `${delay}\n${payload}\n`,
        expectedStdout: language === 'CPP' ? 'mock_hash_for_now' : sha256(payload),
      })
    }
    return testCases
  }

  if (assignmentId === 3) {
    const testCases: FunctionalTestCase[] = []
    for (let t = 0; t < caseCount; t++) {
      const knownCount = randInt(rng, 6, 12)
      const queryCount = randInt(rng, 8, 14)
      const known = Array.from({ length: knownCount }, () => buildRandomRoute(rng))
      const queries: string[] = []

      for (let i = 0; i < queryCount; i++) {
        if (rng() < 0.6) {
          const route = known[randInt(rng, 0, known.length - 1)]
          const parts = route.split('.')
          const keep = randInt(rng, 1, parts.length)
          queries.push(parts.slice(0, keep).join('.'))
        } else {
          queries.push(buildRandomRoute(rng))
        }
      }

      const expected = queries.filter((q) => known.some((k) => k.startsWith(q))).length
      testCases.push({
        stdin: `${known.length}\n${known.join('\n')}\n${queries.length}\n${queries.join('\n')}\n`,
        expectedStdout: String(expected),
      })
    }
    return testCases
  }

  if (assignmentId === 4) {
    const testCases: FunctionalTestCase[] = []
    for (let t = 0; t < caseCount; t++) {
      const n = randInt(rng, 6, 16)
      const k = randInt(rng, 1, n)
      const arr = Array.from({ length: n }, () => randInt(rng, -5, 20))

      let running = 0
      for (let i = 0; i < k; i++) running += arr[i]
      let best = running
      for (let i = k; i < n; i++) {
        running += arr[i] - arr[i - k]
        if (running > best) best = running
      }

      testCases.push({
        stdin: `${n} ${k}\n${arr.join(' ')}\n`,
        expectedStdout: String(best),
      })
    }
    return testCases
  }

  if (assignmentId === 5) {
    const testCases: FunctionalTestCase[] = []
    for (let t = 0; t < caseCount; t++) {
      const r = randInt(rng, 1, 4)
      const c = randInt(rng, 1, 4)
      const grid = Array.from({ length: r }, () => Array.from({ length: c }, () => randInt(rng, -9, 9)))
      const sum = grid.flat().reduce((a, b) => a + b, 0)

      testCases.push({
        stdin: `${r} ${c}\n${grid.map((row) => row.join(' ')).join('\n')}\n`,
        expectedStdout: String(sum),
      })
    }
    return testCases
  }

  if (assignmentId === 6) {
    const testCases: FunctionalTestCase[] = []
    for (let i = 0; i < caseCount; i++) {
      const score = randInt(rng, 0, 120)
      testCases.push({
        stdin: `${score}\n`,
        expectedStdout: score > 90 ? 'true' : 'false',
      })
    }
    return testCases
  }

  if (assignmentId === 7) {
    const testCases: FunctionalTestCase[] = []
    for (let t = 0; t < caseCount; t++) {
      const n = randInt(rng, 5, 9)
      const d = randInt(rng, 2, 7)
      const asteroids = Array.from({ length: n }, () => [randInt(rng, -12, 12), randInt(rng, -12, 12)] as const)
      const d2 = d * d
      let collisions = 0
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = asteroids[i][0] - asteroids[j][0]
          const dy = asteroids[i][1] - asteroids[j][1]
          if ((dx * dx + dy * dy) < d2) collisions++
        }
      }

      testCases.push({
        stdin: `${n} ${d}\n${asteroids.map(([x, y]) => `${x} ${y}`).join('\n')}\n`,
        expectedStdout: String(collisions),
      })
    }
    return testCases
  }

  return null
}

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
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const submissionBody = await parseSubmissionBody(req)
  if (!submissionBody) {
    return NextResponse.json(
      { error: 'Invalid request body. Expected JSON with challengeId, code and language.' },
      { status: 400 }
    )
  }

  const { challengeId } = submissionBody
  const runnerLanguage = toRunnerLanguage(submissionBody.language)
  if (!runnerLanguage) {
    return NextResponse.json({
      passed: false,
      score: 0,
      executionTime: 0,
      yourEnergy: 0,
      message: `Functional runner is not enabled for ${submissionBody.language} yet. Use PYTHON or CPP.`,
    }, { status: 400 })
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { id: true, languages: true },
  })

  if (!challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  if (!challenge.languages.includes(submissionBody.language)) {
    return NextResponse.json({ error: 'Language is not allowed for this challenge.' }, { status: 400 })
  }

  const seed = resolveTestSeed(challengeId, session.user.id)
  const testCases = getHiddenTestCases(challengeId, runnerLanguage, seed)
  if (!testCases) {
    return NextResponse.json({ error: `No functional test configuration found for assignment ${challengeId}.` }, { status: 500 })
  }

  const startedAt = Date.now()
  const functional = await runFunctionalTests({
    language: runnerLanguage,
    assignmentId: challengeId,
    studentCode: submissionBody.code,
    testCases,
  })

  if (!functional.passed) {
    await prisma.$transaction([
      prisma.userChallenge.create({
        data: {
          userId: session.user.id,
          challengeId,
          code: submissionBody.code,
          language: submissionBody.language,
          status: 'FAILED',
          co2Consumed: 0,
          energyConsumed: 0,
          score: 0,
        },
      }),
      prisma.challenge.update({
        where: { id: challengeId },
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
    console.warn('Sandbox env vars missing. Falling back to local energy executor.')

    const localEnergy = await measureEnergy(submissionBody.code, runnerLanguage)
    const energyJ = localEnergy.status === 'accepted' ? localEnergy.energyJoules : 0
    const yourEnergyMwh = Math.round((energyJ / 3.6) * 100) / 100
    const executionTime = Number(((Date.now() - startedAt) / 1000).toFixed(3))

    await prisma.$transaction([
      prisma.userChallenge.create({
        data: {
          userId: session.user.id,
          challengeId,
          code: submissionBody.code,
          language: submissionBody.language,
          status: 'PASSED',
          co2Consumed: 0,
          energyConsumed: Math.max(0, Math.round(energyJ)),
          score: 100,
        },
      }),
      prisma.challenge.update({
        where: { id: challengeId },
        data: { submissionCount: { increment: 1 } },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { totScore: { increment: 100 } },
      }),
    ])

    const localResult: SubmissionResult = {
      passed: true,
      score: 100,
      executionTime,
      yourEnergy: yourEnergyMwh,
      message: localEnergy.status === 'accepted'
        ? `All functional tests passed. Energy consumed: ${energyJ.toFixed(2)}J.`
        : 'All functional tests passed. Energy measurement failed in local mode.',
    }

    return NextResponse.json(localResult)
  }

  const submission = await prisma.userChallenge.create({
    data: {
      userId: session.user.id,
      challengeId,
      code: '',
      language: submissionBody.language,
      status: 'PENDING' as AppSubmissionStatus,
      co2Consumed: 0,
      energyConsumed: 0,
      score: 0,
    },
  })

  if (!submission) {
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
  }

  const blobName = `${submission.id}`
  const blobContent = submissionBody.code
  const blob = new Blob([blobContent], { type: 'text/plain' })

  try {
    const { url } = await put(blobName, blob, {
      access: 'private',
      token: blobToken,
    })

    await prisma.userChallenge.update({
      where: { id: submission.id },
      data: { code: url },
    })
  } catch (error) {
    console.error('Failed to upload code to blob storage:', error)

    await del(blobName, {
      token: blobToken,
    }).catch(err => {
      console.error('Failed to delete blob after upload failure:', err)
    })

    await prisma.userChallenge.delete({ where: { id: submission.id } }).catch(err => {
      console.error('Failed to delete submission after upload failure:', err)
    })

    return NextResponse.json({ error: 'Failed to store submission code' }, { status: 500 })
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
  })

  let totalEnergyJ = 0
  let energyError = ''

  if (runnerLanguage === 'PYTHON') {
    const layout = getRunnerLayout(runnerLanguage, challengeId)
    const runDir = `/tmp/${submission.id}`
    const driverPath = `${runDir}/${layout.driverFileName}`

    const files = [
      { path: `${runDir}/${layout.studentFileName}`, content: Buffer.from(blobContent, 'utf-8') },
      { path: driverPath, content: Buffer.from(layout.driverSource, 'utf-8') },
      ...layout.supportFiles.map((f) => ({ path: `${runDir}/${f.fileName}`, content: Buffer.from(f.content, 'utf-8') })),
    ]

    await sandbox.mkDir(runDir).catch(() => undefined)
    await sandbox.writeFiles(files)

    for (let i = 0; i < testCases.length; i++) {
      console.log(`Energy grading progress: test ${i + 1}/${testCases.length}`)
      const stdinPath = `${runDir}/stdin_${i}.txt`
      const stdinPayload = `${challengeId}\n${testCases[i].stdin}`
      await sandbox.writeFiles([{ path: stdinPath, content: Buffer.from(stdinPayload, 'utf-8') }])

      const gradingResult = await sandbox.runCommand({
        cwd: '/vercel/sandbox/leafcode/runner',
        cmd: 'python3',
        args: [
          'executor.py',
          '-s', `${submission.id}-${i}`,
          '-l', 'python',
          '-f', driverPath,
          '--stdin-file', stdinPath,
        ],
      })

      if (gradingResult.exitCode !== 0) {
        console.error(`Energy grading failed at test ${i + 1}/${testCases.length}`)
        energyError = 'Sandbox energy command failed.'
        break
      }

      const stdout = await gradingResult.output('stdout')
      let gradingOutput: GradingResult
      try {
        gradingOutput = JSON.parse(stdout) as GradingResult
      } catch {
        energyError = 'Failed to parse sandbox energy output.'
        break
      }

      if (gradingOutput.status !== 'accepted') {
        energyError = gradingOutput.error ?? 'Sandbox energy execution failed.'
        break
      }

      totalEnergyJ += Number(gradingOutput.energyJoules ?? 0)
    }

    if (!energyError) {
      console.log(`Energy grading completed: ${testCases.length}/${testCases.length} tests`)
    }
  } else {
    energyError = 'Energy measurement is currently available for Python only.'
  }

  await sandbox.stop()

  const roundedEnergyJ = Math.max(0, Math.round(totalEnergyJ))
  const yourEnergyMwh = Math.round((totalEnergyJ / 3.6) * 100) / 100
  const executionTime = Number(((Date.now() - startedAt) / 1000).toFixed(3))

  await prisma.$transaction([
    prisma.userChallenge.update({
      where: { id: submission.id },
      data: {
        status: 'PASSED' as AppSubmissionStatus,
        score: 100,
        energyConsumed: roundedEnergyJ,
      },
    }),
    prisma.challenge.update({
      where: { id: challengeId },
      data: { submissionCount: { increment: 1 } },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { totScore: { increment: 100 } },
    }),
  ])

  const returnResult: SubmissionResult = {
    passed: true,
    score: 100,
    executionTime,
    yourEnergy: yourEnergyMwh,
    message: energyError
      ? `All functional tests passed. ${energyError}`
      : `All functional tests passed. Energy consumed: ${totalEnergyJ.toFixed(2)}J.`,
  }

  return NextResponse.json(returnResult)
}
