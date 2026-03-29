import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import ChallengeCard from '@/components/ui/ChallengeCard'
import DifficultyFilter from '@/components/ui/DifficultyFilter'
import type { Difficulty } from '@prisma/client'

interface PageProps {
  searchParams: Promise<{ difficulty?: string }>
}

export default async function ChallengesPage({ searchParams }: PageProps) {
  const { difficulty } = await searchParams

  // Validate the difficulty param against the Prisma enum values so an
  // arbitrary query string can't cause a Prisma validation error.
  const VALID: Difficulty[] = ['EASY', 'MEDIUM', 'HARD']
  const safeFilter = VALID.includes(difficulty as Difficulty)
    ? (difficulty as Difficulty)
    : undefined

  const challenges = await prisma.challenge.findMany({
    where:   safeFilter ? { difficulty: safeFilter } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      // _count lets us show submissionCount without a separate column
      _count: { select: { submissions: true } },
    },
  })

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">

      {/* Page header */}
      <div className="mb-10 flex flex-col gap-3">
        <p className="font-['Space_Mono',monospace] text-xs uppercase tracking-widest text-[#28eb70]/60">
          Arena
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h1 className="font-['Space_Mono',monospace] text-3xl font-bold text-slate-100">
            Challenges
          </h1>
          <span className="font-['Space_Mono',monospace] text-xs text-slate-600">
            {challenges.length} available
          </span>
        </div>

        {/* Difficulty filter — needs useSearchParams so wrap in Suspense */}
        <div className="mt-2">
          <Suspense fallback={null}>
            <DifficultyFilter />
          </Suspense>
        </div>
      </div>

      {/* Grid */}
      {challenges.length === 0 ? (
        <p className="font-['Space_Mono',monospace] text-sm text-slate-600 text-center py-20">
          No challenges found for this difficulty.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}

    </main>
  )
}