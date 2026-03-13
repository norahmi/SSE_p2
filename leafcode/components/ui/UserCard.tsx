"use client"

import { Badge } from '@/components/ui/badge'
import type { User } from '@/types'

interface UserCardProps {
  user: User
}

const STAT_ITEMS = (user: User) => [
  { value: `#${user.rank}`,                             label: 'Global rank' },
  { value: user.score.toLocaleString(),                 label: 'Score'       },
  { value: `${(user.totalCO2Saved / 1000).toFixed(1)}`, label: 'kg CO₂'     },
  { value: String(user.challengesCompleted),            label: 'Challenges'  },
]

export default function UserCard({ user }: UserCardProps) {
  return (
    <div className="relative rounded-2xl border border-[#1e3a2a] overflow-hidden">

      {/* Gradient wash */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#28eb70]/8 via-[#28eb70]/2 to-transparent" />

      {/* Glow blob top-right */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#28eb70]/6" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6">

        {/* Left — identity */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-xl border-2 border-[#28eb70]/30 bg-[#0a1a10] flex items-center justify-center overflow-hidden">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#28eb70] border-2 border-[#060f0a]" />
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="font-['Space_Mono',monospace] font-bold text-lg text-slate-100 leading-none">
              {user.name}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="border-[#28eb70]/25 text-[#28eb70] text-[10px] font-['Space_Mono',monospace] px-2 py-0"
              >
                {user.topLanguage}
              </Badge>
              <span className="font-['Space_Mono',monospace] text-[10px] text-orange-400">
                🔥 {user.streak}d streak
              </span>
            </div>
          </div>
        </div>

        {/* Right — 2×2 stat grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full sm:w-auto sm:min-w-[220px]">
          {STAT_ITEMS(user).map(({ value, label }) => (
            <div
              key={label}
              className="rounded-lg border border-[#28eb70]/10 bg-[#28eb70]/5 px-3 py-2.5"
            >
              <p className="font-['Space_Mono',monospace] font-bold text-base text-[#28eb70] leading-none">
                {value}
              </p>
              <p className="font-['Space_Mono',monospace] text-[9px] uppercase tracking-wider text-slate-600 mt-1.5">
                {label}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}