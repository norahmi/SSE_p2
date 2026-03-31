"use client"

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Medal, ChevronDown } from 'lucide-react'
import type { LeaderboardEntry } from '@/types'
import { Language } from '@prisma/client'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

const LANGUAGES = [
  { value: 'ALL', label: 'All languages' },
  ...Object.values(Language).map((lang) => ({
    value: lang,
    label: lang.charAt(0) + lang.slice(1).toLowerCase().replace('cpp', 'C++')
  })),
]

function DeltaIcon({ delta }: { delta: LeaderboardEntry['delta'] }) {
  if (delta === 'up')   return <TrendingUp   className="h-3 w-3 text-[var(--lc-green)]" />
  if (delta === 'down') return <TrendingDown className="h-3 w-3 text-red-400" />
  return <Minus className="h-3 w-3 text-slate-600" />
}

function TopMedal({ rank }: { rank: number }) {
  const colors = ['text-yellow-400', 'text-slate-300', 'text-amber-600']
  if (rank <= 3)
    return <Medal className={`h-4 w-4 ${colors[rank - 1]}`} />
  return (
    <span className="w-4 text-center font-['Space_Mono',monospace] text-xs"
      style={{ color: 'var(--lc-text-subtle)' }}>
      {rank}
    </span>
  )
}

export default function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  const [hovered,  setHovered]  = useState<string | null>(null)
  const [filter,   setFilter]   = useState('ALL')
  const [dropOpen, setDropOpen] = useState(false)

  const filtered = filter === 'ALL'
    ? entries
    : entries.filter(e => e.topLanguage === filter)

  const ranked = filtered.map((e, i) => ({ ...e, displayRank: i + 1 }))

  const activeLabel = LANGUAGES.find(l => l.value === filter)?.label ?? 'All languages'

  return (
    <div className="flex h-full flex-col rounded-2xl p-4">

      {/* Header row */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-['Space_Mono',monospace] font-bold text-sm uppercase tracking-widest text-[var(--lc-green)]/70 shrink-0">
          Global Arena
        </h2>

        {/* Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropOpen(o => !o)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 font-['Space_Mono',monospace] text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
            style={{
              border:     '1px solid var(--lc-border)',
              color:      'var(--lc-text-muted)',
              background: 'transparent',
            }}
          >
            {activeLabel}
            <ChevronDown
              className="h-3 w-3 transition-transform"
              style={{ transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {dropOpen && (
            <ul
              className="absolute right-0 top-full mt-1.5 z-20 w-40 rounded-xl overflow-hidden py-1"
              style={{
                border:     '1px solid var(--lc-border)',
                background: 'var(--lc-bg-overlay)',
                boxShadow:  '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              {LANGUAGES.map(lang => (
                <li key={lang.value}>
                  <button
                    onClick={() => { setFilter(lang.value); setDropOpen(false) }}
                    className="w-full text-left px-3 py-2 font-['Space_Mono',monospace] text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                    style={{
                      color:      filter === lang.value ? 'var(--lc-green)' : 'var(--lc-text-muted)',
                      background: filter === lang.value
                        ? 'color-mix(in srgb, var(--lc-green) 8%, transparent)'
                        : 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (filter !== lang.value)
                        e.currentTarget.style.background = 'color-mix(in srgb, var(--lc-green) 4%, transparent)'
                    }}
                    onMouseLeave={e => {
                      if (filter !== lang.value)
                        e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    {lang.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Empty state */}
      {ranked.length === 0 ? (
        <p className="text-center py-10 font-['Space_Mono',monospace] text-xs"
          style={{ color: 'var(--lc-text-subtle)' }}>
          No entries for this language yet.
        </p>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 no-scrollbar">
          {ranked.map((entry) => {
            const isMe  = entry.id === currentUserId
            const isHov = hovered === entry.id

            return (
              <div
                key={entry.id}
                onMouseEnter={() => setHovered(entry.id)}
                onMouseLeave={() => setHovered(null)}
                className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 border transition-all duration-150 cursor-default"
                style={{
                  borderColor: isMe
                    ? 'color-mix(in srgb, var(--lc-green) 40%, transparent)'
                    : isHov
                    ? 'var(--lc-border)'
                    : 'transparent',
                  background: isMe
                    ? 'color-mix(in srgb, var(--lc-green) 6%, transparent)'
                    : isHov
                    ? 'rgba(255,255,255,0.02)'
                    : 'transparent',
                }}
              >
                <div className="w-4 flex justify-center shrink-0">
                  <TopMedal rank={entry.displayRank} />
                </div>

                <img
                  src={entry.avatar}
                  alt={entry.name}
                  className="h-7 w-7 rounded-full shrink-0"
                  style={{ border: '1px solid var(--lc-border)', background: 'var(--lc-bg-card)' }}
                />

                <div className="flex-1 min-w-0">
                  <p className={`font-['Space_Mono',monospace] text-xs font-bold truncate`}
                    style={{ color: isMe ? 'var(--lc-green)' : 'var(--lc-text)' }}
                  >
                    {entry.name}
                    {isMe && (
                      <span className="ml-1 text-[9px]"
                        style={{ color: 'color-mix(in srgb, var(--lc-green) 50%, transparent)' }}>
                        (you)
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span className="font-['Space_Mono',monospace] text-xs font-bold"
                    style={{ color: 'var(--lc-text)' }}>
                    {entry.totScore.toLocaleString()}
                  </span>
                </div>

                {isMe && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-full"
                    style={{ background: 'var(--lc-green)' }} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}