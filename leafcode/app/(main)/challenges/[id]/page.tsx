import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Users, Zap, AlertTriangle } from 'lucide-react'
import { prisma } from '@/lib/prisma'

import ChallengeIDE from '@/components/ui/ChallengeIDE'

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

  const challenge = await prisma.challenge.findUnique({ where: { id: parseInt(id) } })
  if (!challenge) notFound()

  const leaderboard = await prisma.userChallenge.findMany({
    where: { challengeId: challenge.id, status: 'PASSED' },
    orderBy: { score: 'desc' },
    take: 20,
    include: { user: true },
  })

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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-8">

        {/* ── LEFT: Description ───────────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Title block */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold
                                font-['Space_Mono',monospace] ${DIFF_STYLES[challenge.difficulty]}`}>
                {challenge.difficulty}
              </span>
              <div className="flex items-center gap-4 font-['Space_Mono',monospace] text-[10px] text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3 w-3" /> {challenge.submissionCount.toLocaleString()} submissions
                </span>
              </div>
            </div>

            <h1 className="font-['Space_Mono',monospace] text-2xl font-bold text-slate-100">
              {challenge.title}
            </h1>

            {/* Energy target pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
                            border border-[#28eb70]/20 bg-[#28eb70]/5 w-fit">
              <Zap className="h-3.5 w-3.5 text-[#28eb70]" />
            </div>
          </div>

          {/* Full description (markdown-style) */}
          <div className="rounded-xl border border-[#1e3a2a] bg-[#0a1a10]/40 p-6">
            <div className="prose prose-sm prose-invert max-w-none
                            font-['Space_Mono',monospace] text-slate-400
                            prose-headings:text-slate-200 prose-headings:font-bold
                            prose-code:text-[#28eb70] prose-code:bg-[#28eb70]/8
                            prose-code:px-1 prose-code:rounded
                            prose-strong:text-slate-200">
              {/* Render description line by line — use react-markdown for real MD */}
              {challenge.description.split('\n').map((line, i) => {
                if (line.startsWith('## '))
                  return <h2 key={i} className="font-['Space_Mono',monospace] text-base font-bold text-slate-200 mt-5 mb-2">{line.slice(3)}</h2>
                if (line.startsWith('- '))
                  return <p key={i} className="font-['Space_Mono',monospace] text-xs text-slate-500 leading-relaxed pl-4">• {line.slice(2)}</p>
                if (line.trim() === '')
                  return <div key={i} className="h-2" />
                return <p key={i} className="font-['Space_Mono',monospace] text-xs text-slate-400 leading-relaxed">{line}</p>
              })}
            </div>
          </div>

          {/* Constraints */}
          <div className="rounded-xl border border-amber-400/15 bg-amber-400/4 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-['Space_Mono',monospace] text-xs font-bold text-amber-400 uppercase tracking-wider">
                Constraints
              </span>
            </div>
          </div>

          {/* Example I/O */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Example Input',  value: "example input"  },
              { label: 'Example Output', value: "example output" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-[#1e3a2a] bg-[#060f0a] p-4">
                <p className="font-['Space_Mono',monospace] text-[9px] uppercase tracking-wider text-slate-600 mb-2">
                  {label}
                </p>
                <code className="font-['Space_Mono',monospace] text-xs text-[#28eb70]/80">
                  {value}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: IDE + Results + Leaderboard ──────────────────── */}
        <div className="flex flex-col gap-6">
          <p className="font-['Space_Mono',monospace] text-xs uppercase tracking-widest text-[#28eb70]/50">
            Your Solution
          </p>
          <ChallengeIDE
            challenge={challenge}
            leaderboard={leaderboard}
            challengeId={challenge.id}
          />
        </div>

      </div>
    </main>
  )
}