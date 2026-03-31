import { createHash, randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { runFunctionalTests, type FunctionalTestCase } from '@/lib/execution/test-runner'
import { measureEnergy } from '@/lib/execution/energy-executor'
import type { RunnerLanguage } from '@/lib/execution/templates'

export const runtime = 'nodejs'

type AppLanguage = 'PYTHON' | 'CPP' | 'C' | 'JAVASCRIPT'
type AppSubmissionStatus = 'PASSED' | 'FAILED'

interface SubmitBody {
  code: string
  language: string
}

interface UiSubmitResponse {
  passed: boolean
  score: number
  executionTime: number
  yourEnergy: number
  message: string
}

function toRunnerLanguage(language: AppLanguage): RunnerLanguage | null {
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

function toUiResponse(input: Partial<UiSubmitResponse>): UiSubmitResponse {
  return {
    passed: !!input.passed,
    score: input.score ?? 0,
    executionTime: input.executionTime ?? 0,
    yourEnergy: input.yourEnergy ?? 0,
    message: input.message ?? 'Submission processed.',
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const challengeId = Number.parseInt(id, 10)
  if (!Number.isInteger(challengeId) || challengeId <= 0) {
    return NextResponse.json({ error: 'Invalid challenge id.' }, { status: 400 })
  }

  const body = (await req.json().catch(() => null)) as SubmitBody | null
  if (!body?.code || !body?.language) {
    return NextResponse.json({ error: 'Missing code or language.' }, { status: 400 })
  }

  const language = body.language.toUpperCase() as AppLanguage
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { id: true, languages: true },
  })

  if (!challenge) {
    return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 })
  }

  if (!challenge.languages.includes(language)) {
    return NextResponse.json({ error: 'Language is not allowed for this challenge.' }, { status: 400 })
  }

  const runnerLanguage = toRunnerLanguage(language)
  if (!runnerLanguage) {
    const unsupported = toUiResponse({
      passed: false,
      message: `Functional runner is not enabled for ${language} yet. Use PYTHON or CPP.`,
    })

    await prisma.userChallenge.create({
      data: {
        userId: session.user.id,
        challengeId,
        score: 0,
        language,
        energyConsumed: 0,
        co2Consumed: 0,
        status: 'FAILED',
        code: body.code,
      },
    })

    return NextResponse.json(unsupported)
  }

  const seed = resolveTestSeed(challengeId, session.user.id)
  const testCases = getHiddenTestCases(challengeId, runnerLanguage, seed)
  if (!testCases) {
    return NextResponse.json({
      error: `No functional test configuration found for assignment ${challengeId}.`,
    }, { status: 500 })
  }

  console.info(`[leafcode-functional] challenge=${challengeId} user=${session.user.id} seed=${seed} tests=${testCases.length}`)

  const startedAt = Date.now()
  const functional = await runFunctionalTests({
    language: runnerLanguage,
    assignmentId: challengeId,
    studentCode: body.code,
    testCases,
  })

  const passed = functional.passed
  const score = passed ? 100 : 0
  const status: AppSubmissionStatus = passed ? 'PASSED' : 'FAILED'

  // Measure energy consumption if functional tests passed
  let energyConsumed = 0
  let energyMessage = ''
  if (passed) {
    const energyResult = await measureEnergy(body.code, runnerLanguage)
    if (energyResult.status === 'accepted') {
      energyConsumed = energyResult.energyJoules
      console.info(`[leafcode-energy] challenge=${challengeId} user=${session.user.id} energy=${energyConsumed}J`)
    } else {
      energyMessage = ' (Energy measurement failed)'
      console.warn(`[leafcode-energy] challenge=${challengeId} error: status=${energyResult.status}`)
    }
  }

  const executionTime = Number(((Date.now() - startedAt) / 1000).toFixed(3))

  await prisma.$transaction([
    prisma.userChallenge.create({
      data: {
        userId: session.user.id,
        challengeId,
        score,
        language,
        energyConsumed,
        co2Consumed: 0,
        status,
        code: body.code,
      },
    }),
    prisma.challenge.update({
      where: { id: challengeId },
      data: { submissionCount: { increment: 1 } },
    }),
    ...(passed
      ? [prisma.user.update({ where: { id: session.user.id }, data: { totScore: { increment: score } } })]
      : []),
  ])

  return NextResponse.json(toUiResponse({
    passed,
    score,
    executionTime,
    yourEnergy: energyConsumed,
    message: passed
      ? `All functional tests passed. Energy consumed: ${energyConsumed.toFixed(2)}J.${energyMessage}`
      : (functional.compileStderr || functional.stderr || functional.message),
  }))
}
