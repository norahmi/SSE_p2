import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/challenges/[id]/submit
 * Body: { code: string, language: string }
 *
 * Execution order:
 *  1. Authenticate
 *  2. Validate inputs + verify challenge exists
 *  3. Grade (mock — swap for sandbox)
 *  4. Persist UserChallenge row + update User.score in one transaction
 *  5. Return result to client
 *
 * NOTE — Int storage for energy values:
 *   energyConsumed and co2Consumed are Int in your schema.
 *   We store yourEnergy * 100 as an integer (e.g. 3.84 mWh → 384)
 *   to avoid Float precision loss. Divide by 100 when reading back.
 *   To use floats natively, change the schema fields to Float or Decimal.
 *
 * NOTE — Language enum:
 *   Client sends lowercase ("python"). We .toUpperCase() to match your
 *   Prisma enum (PYTHON, TYPESCRIPT, JAVASCRIPT, GO, RUST, JAVA, CPP).
 *
 * NOTE — submissionCount:
 *   Challenge has no submissionCount column — we derive it via _count.
 *   If you add `submissionCount Int @default(0)` to the Challenge model,
 *   uncomment the challenge.update call in the transaction below.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
    ) {

    // ── 1. Auth ─────────────────────────────────────────────────────────
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    // ── 2. Validate ──────────────────────────────────────────────────────
    const { id } = await params
    const challengeId = parseInt(id)

    if (isNaN(challengeId)) {
        return NextResponse.json({ error: 'Invalid challenge id' }, { status: 400 })
    }

    const body = await req.json().catch(() => null)
    if (!body?.code || !body?.language) {
        return NextResponse.json({ error: 'Missing code or language' }, { status: 400 })
    }
    const { code, language } = body as { code: string; language: string }

    const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
    })
    if (!challenge) {
        return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    // ── 3. Grade ─────────────────────────────────────────────────────────
    // Replace this block with a real sandbox runner, e.g.:
    //   const graded = await runInSandbox({ code, language, challengeId })
    await new Promise(r => setTimeout(r, 2000))

    const energyReduction = Math.floor(Math.random() * 35) + 50  // 50–85%
    const passed          = energyReduction >= 70
    const score           = passed ? Math.floor(energyReduction * 100) : 0
    const co2Saved        = Math.floor(energyReduction * 52)      // grams
    const baselineEnergy  = 18.4                                  // mWh
    const yourEnergy      = parseFloat(
        (baselineEnergy * (1 - energyReduction / 100)).toFixed(2)
    )
    const executionTime   = parseFloat((Math.random() * 0.8 + 0.2).toFixed(3))
    const status          = passed ? 'PASSED' : 'FAILED'

    // ── 4. Persist atomically ────────────────────────────────────────────
    await prisma.$transaction([

        // Create the submission row
        prisma.userChallenge.create({
        data: {
            userId,
            challengeId,
            score,
            language:       language.toUpperCase() as any,   // → your Language enum
            energyConsumed: Math.round(yourEnergy * 100),    // Int ×100 trick
            co2Consumed:    Math.round(co2Saved),            // grams, already Int
            status:         status as any,                   // → SubmissionStatus enum
            code,
        },
        }),

        // Increment the user's cumulative score
        // Requires: User model has `score Int @default(0)`
        prisma.user.update({
        where: { id: userId },
        data:  { score: { increment: score } },
        }),

        // Uncomment if you add `submissionCount Int @default(0)` to Challenge:
        // prisma.challenge.update({
        //   where: { id: challengeId },
        //   data:  { submissionCount: { increment: 1 } },
        // }),

    ])

    // ── 5. Respond ───────────────────────────────────────────────────────
    return NextResponse.json({
        passed,
        score,
        energyReduction,
        co2Saved,
        executionTime,
        baselineEnergy,
        yourEnergy,
        message: passed
        ? `Great work! You reduced energy by ${energyReduction}% and earned ${score} points.`
        : `Your solution reduced energy by ${energyReduction}%, but the target is 70%. Try again!`,
    })
}