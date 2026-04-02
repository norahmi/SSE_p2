"use client"

import { Badge } from '@/components/ui/badge'
import type { User } from '@/types'

interface UserCardProps {
  user: User
}

const STAT_ITEMS = (user: User) => [
  { value: `#${user.rank}`,                                   label: 'Global rank' },
  { value: user.totScore,                    label: 'Score'       },
  { value: String(user.challengesCompleted),                  label: 'Challenges'  },
]

export default function UserCard({ user }: UserCardProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--lc-border)' }}
    >
      {/* Gradient wash */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--lc-green)]/8 via-[var(--lc-green)]/2 to-transparent" />

      {/* Glow blob top-right */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[var(--lc-green)]/6" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6">

        {/* Left — identity */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center"
              style={{
                border: '2px solid color-mix(in srgb, var(--lc-green) 30%, transparent)',
                background: 'var(--lc-bg-card)',
              }}
            >
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full"
              style={{
                background: 'var(--lc-green)',
                border: '2px solid var(--lc-bg)',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="font-['Space_Mono',monospace] font-bold text-lg leading-none"
              style={{ color: 'var(--lc-text)' }}
            >
              {user.name}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] font-['Space_Mono',monospace] px-2 py-0 text-[var(--lc-green)]"
                style={{ borderColor: 'color-mix(in srgb, var(--lc-green) 25%, transparent)' }}
              >
                {user.topLanguage}
              </Badge>
              <span className="font-['Space_Mono',monospace] text-[10px] text-orange-400">
                🔥 {user.streak}d streak
              </span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full sm:w-auto sm:min-w-[220px]">
          {/* Card 1 - cell 1 */}
          {STAT_ITEMS(user)[0] && (
            <div
              className="rounded-lg px-3 py-2.5"
              style={{
                border: 'color-mix(in srgb, var(--lc-green) 10%, transparent) 1px solid',
                background: 'color-mix(in srgb, var(--lc-green) 5%, transparent)',
              }}
            >
              <p className="font-['Space_Mono',monospace] font-bold text-base leading-none text-[var(--lc-green)]">
                {STAT_ITEMS(user)[0].value}
              </p>
              <p className="font-['Space_Mono',monospace] text-[9px] uppercase tracking-wider mt-1.5"
                style={{ color: 'var(--lc-text-subtle)' }}
              >
                {STAT_ITEMS(user)[0].label}
              </p>
            </div>
          )}
          {/* Card 2 - cell 2 */}
          {STAT_ITEMS(user)[1] && (
            <div
              className="rounded-lg px-3 py-2.5"
              style={{
                border: 'color-mix(in srgb, var(--lc-green) 10%, transparent) 1px solid',
                background: 'color-mix(in srgb, var(--lc-green) 5%, transparent)',
              }}
            >
              <p className="font-['Space_Mono',monospace] font-bold text-base leading-none text-[var(--lc-green)]">
                {STAT_ITEMS(user)[1].value}
              </p>
              <p className="font-['Space_Mono',monospace] text-[9px] uppercase tracking-wider mt-1.5"
                style={{ color: 'var(--lc-text-subtle)' }}
              >
                {STAT_ITEMS(user)[1].label}
              </p>
            </div>
          )}
          {/* Empty cell - cell 3 */}
          <div className="hidden sm:block" />
          {/* Card 3 - cell 4 */}
          {STAT_ITEMS(user)[2] && (
            <div
              className="rounded-lg px-3 py-2.5"
              style={{
                border: 'color-mix(in srgb, var(--lc-green) 10%, transparent) 1px solid',
                background: 'color-mix(in srgb, var(--lc-green) 5%, transparent)',
              }}
            >
              <p className="font-['Space_Mono',monospace] font-bold text-base leading-none text-[var(--lc-green)]">
                {STAT_ITEMS(user)[2].value}
              </p>
              <p className="font-['Space_Mono',monospace] text-[9px] uppercase tracking-wider mt-1.5"
                style={{ color: 'var(--lc-text-subtle)' }}
              >
                {STAT_ITEMS(user)[2].label}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}