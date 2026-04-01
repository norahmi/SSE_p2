"use client"

import { useRouter, useSearchParams } from 'next/navigation'
// import type { Difficulty } from '@/lib/mock-challenges'

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

const OPTIONS: { label: string; value: Difficulty | 'ALL' }[] = [
  { label: 'All',    value: 'ALL'    },
  { label: 'Easy',   value: 'EASY'   },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Hard',   value: 'HARD'   },
]

const COLORS: Record<string, string> = {
  ALL:    'border-[#28eb70]/30 text-[#28eb70]    bg-[#28eb70]/8',
  EASY:   'border-emerald-400/30 text-emerald-400 bg-emerald-400/8',
  MEDIUM: 'border-amber-400/30  text-amber-400   bg-amber-400/8',
  HARD:   'border-red-400/30    text-red-400      bg-red-400/8',
}

const INACTIVE = 'border-[#1e3a2a] text-slate-500 hover:text-slate-300 hover:border-slate-600'

export default function DifficultyFilter() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const active       = (searchParams.get('difficulty') ?? 'ALL') as Difficulty | 'ALL'

  function select(value: Difficulty | 'ALL') {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'ALL') params.delete('difficulty')
    else params.set('difficulty', value)
    router.push(`/challenges?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-['Space_Mono',monospace] text-xs text-slate-600 uppercase tracking-wider mr-1">
        Difficulty
      </span>
      {OPTIONS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => select(value)}
          className={`
            px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer
            font-['Space_Mono',monospace] transition-all duration-150
            ${active === value ? COLORS[value] : INACTIVE}
          `}
        >
          {label}
        </button>
      ))}
    </div>
  )
}