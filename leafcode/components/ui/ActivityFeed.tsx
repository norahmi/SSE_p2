"use client"

import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface ActivityEntry {
  id: string
  challengeName: string
  language: string
  submittedAt: string      // e.g. "2 hours ago"
  score: number
  co2Saved: number         // grams
  energyReduction: number  // percentage e.g. 74
  status: 'passed' | 'failed' | 'pending'
}

interface ActivityFeedProps {
  entries: ActivityEntry[]
}

const STATUS_ICON = {
  passed:  <CheckCircle className="h-3.5 w-3.5 text-[#28eb70]" />,
  failed:  <XCircle     className="h-3.5 w-3.5 text-red-400" />,
  pending: <Clock       className="h-3.5 w-3.5 text-amber-400" />,
}

const STATUS_COLOR = {
  passed:  'text-[#28eb70]',
  failed:  'text-red-400',
  pending: 'text-amber-400',
}

const LANG_COLORS: Record<string, string> = {
  Python:     'border-yellow-400/30 text-yellow-400',
  Rust:       'border-orange-400/30 text-orange-400',
  Go:         'border-cyan-400/30   text-cyan-400',
  TypeScript: 'border-blue-400/30   text-blue-400',
  'C++':      'border-red-400/30    text-red-400',
  Java:       'border-amber-400/30  text-amber-400',
  Kotlin:     'border-violet-400/30 text-violet-400',
}

export default function ActivityFeed({ entries }: ActivityFeedProps) {
  return (
    <div className="rounded-2xl border border-[#1e3a2a] bg-[#0a1a10]/40 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e3a2a]">
        <h2 className="font-['Space_Mono',monospace] text-xs uppercase tracking-widest text-[#28eb70]/70">
          Recent Activity
        </h2>
        <span className="font-['Space_Mono',monospace] text-[10px] text-slate-600">
          {entries.length} submissions
        </span>
      </div>

      {/* Entries */}
      <ul className="divide-y divide-[#1e3a2a]/60">
        {entries.map((entry) => {
          const langStyle = LANG_COLORS[entry.language] ?? 'border-slate-700 text-slate-400'
          const co2g = entry.co2Saved >= 1000
            ? `${(entry.co2Saved / 1000).toFixed(1)} kg`
            : `${entry.co2Saved} g`

          return (
            <li
              key={entry.id}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
            >
              {/* Status icon */}
              <div className="shrink-0">
                {STATUS_ICON[entry.status]}
              </div>

              {/* Main info */}
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
                <p className="font-['Space_Mono',monospace] text-[10px] text-slate-600 mt-1">
                  {entry.submittedAt}
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`font-['Space_Mono',monospace] text-xs font-bold ${STATUS_COLOR[entry.status]}`}>
                  {entry.status === 'passed'  ? `+${entry.score.toLocaleString()} pts` :
                   entry.status === 'pending' ? 'grading…' :
                   'no score'}
                </span>
                <div className="flex items-center gap-2 font-['Space_Mono',monospace] text-[9px] text-slate-600">
                  <span>−{entry.energyReduction}% energy</span>
                  <span className="text-[#28eb70]/50">{co2g} CO₂</span>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

    </div>
  )
}