import Link from 'next/link'
import { Clock, Users, Zap } from 'lucide-react'
import type { Challenge, Difficulty } from '@prisma/client'

// Prisma's findMany with _count returns this shape
interface ChallengeWithCount extends Challenge {
  _count: { submissions: number }
}

interface ChallengeCardProps {
  challenge: ChallengeWithCount
}

const DIFF_STYLES = {
  EASY:   { label: 'Easy',   classes: 'border-emerald-400/30 text-emerald-400 bg-emerald-400/8' },
  MEDIUM: { label: 'Medium', classes: 'border-amber-400/30  text-amber-400   bg-amber-400/8'   },
  HARD:   { label: 'Hard',   classes: 'border-red-400/30    text-red-400      bg-red-400/8'     },
}

const LANG_COLORS: Record<string, string> = {
  python:     'text-yellow-400',
  rust:       'text-orange-400',
  go:         'text-cyan-400',
  typescript: 'text-blue-400',
  javascript: 'text-yellow-300',
  java:       'text-amber-400',
  cpp:        'text-red-400',
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const diff = DIFF_STYLES[challenge.difficulty]

  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className="group relative flex flex-col gap-4 rounded-xl border border-[#1e3a2a]
                 bg-[#0a1a10]/40 p-5 transition-all duration-200
                 hover:border-[#28eb70]/30 hover:bg-[#28eb70]/[0.03]"
    >
      {/* Corner accent on hover */}
      <div className="pointer-events-none absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2
                      border-[#28eb70]/0 group-hover:border-[#28eb70]/40
                      rounded-tl-xl transition-colors duration-200" />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-['Space_Mono',monospace] font-bold text-sm text-slate-100
                       group-hover:text-[#28eb70] transition-colors leading-snug">
          {challenge.title}
        </h3>
        <span className={`shrink-0 px-2 py-0.5 rounded-md border text-[10px]
                          font-bold font-['Space_Mono',monospace] ${diff.classes}`}>
          {diff.label}
        </span>
      </div>

      {/* Description */}
      <p className="font-['Space_Mono',monospace] text-xs text-slate-500 leading-relaxed line-clamp-2">
        {challenge.description}
      </p>

      {/* Target badge */}
      <div className="flex items-center gap-1.5">
        <Zap className="h-3 w-3 text-[#28eb70]/60" />
        <span className="font-['Space_Mono',monospace] text-[10px] text-[#28eb70]/70">
          Target: −{challenge.co2Target}% energy
        </span>
      </div>

      {/* Footer meta */}
      <div className="flex items-center justify-between pt-1 border-t border-[#1e3a2a]">
        <div className="flex items-center gap-4 font-['Space_Mono',monospace] text-[10px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            {challenge._count.submissions.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}