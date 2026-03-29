import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Users } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ChallengeIDE from '@/components/ui/ChallengeIDE'
import type { ChallengeSubmission, SerializedStartingCode } from '@/components/ui/ChallengeIDE'

const DIFF_STYLES = {
  EASY:   'border-emerald-400/30 text-emerald-400 bg-emerald-400/8',
  MEDIUM: 'border-amber-400/30  text-amber-400   bg-amber-400/8',
  HARD:   'border-red-400/30    text-red-400      bg-red-400/8',
}

interface PageProps {
  params: { id: string }
}

export default async function ChallengePage({ params }: PageProps) {
  const { id } = await params
  const challengeId = parseInt(id)
  if (isNaN(challengeId)) notFound()

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      startingCodes: true,
    },
  })
  if (!challenge) notFound()

  const rawLeaderboard = await prisma.userChallenge.findMany({
    where:   { challengeId, status: 'PASSED' },
    orderBy: { score: 'desc' },
    take:    20,
    include: { user: { select: { id: true, name: true, image: true } } },
  })

  const leaderboard: ChallengeSubmission[] = rawLeaderboard.map((s, idx) => ({
    id:              s.id,
    userId:          s.userId,
    userName:        s.user.name,
    userAvatar:      s.user.image
      ?? `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${s.userId}`,
    language:        s.language,
    score:           s.score,
    submittedAt:     s.submittedAt.toISOString(),
  }))

  const startingCodes: SerializedStartingCode[] = challenge.startingCodes.map(sc => ({
    id:          sc.id,
    language:    sc.language,
    code:        sc.code,
    challengeId: sc.challengeId,
  }))

  const allowedLanguages = challenge.languages.length > 0
    ? challenge.languages
    : (['PYTHON', 'CPP', 'C', 'JAVASCRIPT'] as const)

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">

      {/* Back link */}
      <Link
        href="/challenges"
        className="inline-flex items-center gap-2 font-['Space_Mono',monospace] text-xs
                  text-slate-600 hover:text-slate-300 transition-colors mb-8 group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to challenges
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">

        {/* LEFT: Description */}
        <div className="flex flex-col gap-6">

          {/* Title block */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold
                                font-['Space_Mono',monospace] ${DIFF_STYLES[challenge.difficulty]}`}>
                {challenge.difficulty}
              </span>
              <span className="flex items-center gap-1.5 font-['Space_Mono',monospace] text-[10px] text-slate-400">
                <Users className="h-3 w-3" />
                {challenge.submissionCount.toLocaleString()} submissions
              </span>
            </div>

            <h1 className="font-['Space_Mono',monospace] text-2xl font-bold text-slate-100">
              {challenge.title}
            </h1>

            {/* Allowed languages */}
            <div className="flex flex-wrap gap-2">
              {allowedLanguages.map(lang => (
                <span
                  key={lang}
                  className="px-2 py-0.5 rounded-md border border-[#28eb70]/20
                            font-['Space_Mono',monospace] text-[10px] text-[#28eb70]/70
                            bg-[#28eb70]/5"
                >
                  {lang.toLowerCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Description — basic markdown-lite rendering */}
          <div className="rounded-2xl border border-[#28eb70]/20 bg-[#06120b]/80 p-8 shadow-[0_0_50px_-12px_rgba(16,185,129,0.15)] backdrop-blur-md">
            {challenge.description.split('\n').map((line, i) => {
              const trimmed = line.trim();

              if (trimmed.startsWith('Concept:')) {
                return (
                  <div key={i} className="mb-6 flex">
                    <span className="rounded-full bg-[#28eb70]/10 px-4 py-1.5 border border-[#28eb70]/30 text-[11px] font-bold uppercase tracking-[0.15em] text-[#28eb70]/400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      {trimmed}
                    </span>
                  </div>
                )
              }

              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={i} className="mt-8 mb-3 font-['Space_Mono',monospace] text-sm font-black uppercase tracking-widest text-[#28eb70] flex items-center gap-3">
                    <span className="h-[1px] w-4 bg-[#28eb70]/50" />
                    {trimmed.slice(3)}
                  </h2>
                )
              }

              if (trimmed.startsWith('- ')) {
                return (
                  <div key={i} className="group flex gap-3 pl-2 py-1">
                    <span className="text-[#28eb70] font-bold transition-transform group-hover:scale-125">›</span>
                    <p className="font-['Space_Mono',monospace] text-[13px] text-[#28eb70]/80 leading-relaxed">
                      {trimmed.slice(2)}
                    </p>
                  </div>
                )
              }

              if (trimmed === '') return <div key={i} className="h-4" />

              // 4. MAIN BODY: Using a very bright "Mint" white
              return (
                <p key={i} className="font-['Space_Mono',monospace] text-[13px] text-emerald-50/90 leading-7 antialiased mb-2">
                  {line}
                </p>
              )
            })}
          </div>
        </div>

        {/* ── RIGHT: IDE ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <p className="font-['Space_Mono',monospace] text-xs uppercase tracking-widest text-[#28eb70]/50">
            Your Solution
          </p>
          <ChallengeIDE
            challengeId={challenge.id}
            allowedLanguages={[...allowedLanguages]}
            startingCodes={startingCodes}
            leaderboard={leaderboard}
          />
        </div>

      </div>
    </main>
  )
}
