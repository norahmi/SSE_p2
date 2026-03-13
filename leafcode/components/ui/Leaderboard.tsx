"use client"

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Medal } from 'lucide-react'
import type { LeaderboardEntry } from '@/types'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

function DeltaIcon({ delta }: { delta: LeaderboardEntry['delta'] }) {
  if (delta === 'up') return <TrendingUp className="h-3 w-3 text-[#28eb70]" />
  if (delta === 'down') return <TrendingDown className="h-3 w-3 text-red-400" />
  return <Minus className="h-3 w-3 text-slate-600" />
}

function TopMedal({ rank }: { rank: number }) {
  const colors = ['text-yellow-400', 'text-slate-300', 'text-amber-600']
  if (rank <= 3)
    return <Medal className={`h-4 w-4 ${colors[rank - 1]}`} />
  return (
    <span className="w-4 text-center font-['Space_Mono',monospace] text-xs text-slate-600">
      {rank}
    </span>
  )
}

export default function Leaderboard({
  entries,
  currentUserId,
}: LeaderboardProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="flex h-full flex-col rounded-2xl p-4 border-shadow-sm">
      {/* Panel header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-['Space_Mono',monospace] font-style-bold text-sm uppercase tracking-widest text-[#28eb70]/70">
          Global Arena
        </h2>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1e3a2a]">
        {entries.map((entry) => {
          const isMe = entry.id === currentUserId
          const isHov = hovered === entry.id

          return (
            <div
              key={entry.id}
              onMouseEnter={() => setHovered(entry.id)}
              onMouseLeave={() => setHovered(null)}
              className={`
                relative flex items-center gap-3 rounded-lg px-3 py-2.5
                border transition-all duration-150 cursor-default
                ${isMe
                  ? 'border-[#28eb70]/40 bg-[#28eb70]/8'
                  : isHov
                  ? 'border-[#1e3a2a] bg-white/[0.03]'
                  : 'border-transparent'
                }
              `}
            >
              {/* Rank */}
              <div className="w-4 flex justify-center shrink-0">
                <TopMedal rank={entry.rank} />
              </div>

              {/* Avatar */}
              <img
                src={entry.avatar}
                alt={entry.name}
                className="h-7 w-7 rounded-full border border-[#1e3a2a] bg-[#0a1a10] shrink-0"
              />

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className={`font-['Space_Mono',monospace] text-xs font-bold truncate ${
                  isMe ? 'text-[#28eb70]' : 'text-slate-200'
                }`}>
                  {entry.name}
                  {isMe && (
                    <span className="ml-1 text-[9px] text-[#28eb70]/50">(you)</span>
                  )}
                </p>
              </div>

              {/* Score + delta */}
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <span className="font-['Space_Mono',monospace] text-xs font-bold text-slate-100">
                  {entry.score.toLocaleString()}
                </span>
                <DeltaIcon delta={entry.delta} />
              </div>

              {/* Left glow bar for current user */}
              {isMe && (
                <span className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-full bg-[#28eb70]" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}