"use client"

import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface ActivityEntry {
  id: string
  challengeName: string
  language: string
  submittedAt: string
  totScore: number
  status: 'passed' | 'failed' | 'pending'
}

interface ActivityFeedProps {
  entries: ActivityEntry[]
}

const STATUS_ICON = {
  passed:  <CheckCircle className="h-3.5 w-3.5 text-[var(--lc-green)]" />,
  failed:  <XCircle     className="h-3.5 w-3.5 text-red-400" />,
  pending: <Clock       className="h-3.5 w-3.5 text-amber-400" />,
}

const STATUS_COLOR = {
  passed:  'text-[var(--lc-green)]',
  failed:  'text-red-400',
  pending: 'text-amber-400',
}

const LANG_COLORS: Record<string, string> = {
  PYTHON:     'border-yellow-400/30 text-yellow-400',
  RUST:       'border-orange-400/30 text-orange-400',
  GO:         'border-cyan-400/30   text-cyan-400',
  TYPESCRIPT: 'border-blue-400/30   text-blue-400',
  CPP:        'border-red-400/30    text-red-400',
  JAVA:       'border-amber-400/30  text-amber-400',
  KOTLIN:     'border-violet-400/30 text-violet-400',
  JAVASCRIPT: 'border-yellow-300/30 text-yellow-300',
}

export default function ActivityFeed({ entries }: ActivityFeedProps) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--lc-border)', background: 'color-mix(in srgb, var(--lc-bg-card) 40%, transparent)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
      >
        <h2 className="font-['Space_Mono',monospace] text-xs uppercase tracking-widest text-[var(--lc-green)]/70">
          Recent Activity
        </h2>
        <span className="font-['Space_Mono',monospace] text-[10px]"
          style={{ color: 'var(--lc-text-subtle)' }}
        >
          {entries.length} submissions
        </span>
      </div>

      {/* Entries */}
      <ul style={{ borderColor: 'color-mix(in srgb, var(--lc-border) 60%, transparent)', borderTop: '1px solid var(--lc-border)' }}
        className="divide-y divide-[var(--lc-border)]/60"
      >
        {entries.map((entry) => {
          const langStyle = LANG_COLORS[entry.language] ?? 'border-slate-700 text-slate-400'
          return (
            <li
              key={entry.id}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="shrink-0">
                {STATUS_ICON[entry.status]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-['Space_Mono',monospace] text-xs font-bold text-slate-200 truncate">
                    {entry.challengeName}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1.5 py-0 font-['Space_Mono',monospace] shrink-0 ${langStyle}`}
                  >
                    {entry.language}
                  </Badge>
                </div>
                <p className="font-['Space_Mono',monospace] text-[10px] mt-1"
                  style={{ color: 'var(--lc-text-subtle)' }}
                >
                  {entry.submittedAt}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`font-['Space_Mono',monospace] text-xs font-bold ${STATUS_COLOR[entry.status]}`}>
                  {entry.status === 'passed'  ? `+${entry.totScore.toLocaleString()} pts` :
                   entry.status === 'pending' ? 'grading…' :
                   'no score'}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}