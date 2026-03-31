"use client"

import { useEffect, useRef, useState } from 'react'
import { CheckCircle, XCircle, Loader2, ChevronDown, Zap, Leaf, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Language } from '@prisma/client'

// ── CodeMirror ────────────────────────────────────────────────────────────
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { EditorState }   from '@codemirror/state'
import { defaultKeymap } from '@codemirror/commands'
import { python }        from '@codemirror/lang-python'
import { javascript }    from '@codemirror/lang-javascript'
import { cpp }           from '@codemirror/lang-cpp'
import { oneDark }       from '@codemirror/theme-one-dark'

// ── Types ─────────────────────────────────────────────────────────────────

// Shape of a StartingCode row after being serialized from the server
export interface SerializedStartingCode {
  id: number
  language: Language
  code: string
  challengeId: number
}

// Shape of a leaderboard entry built server-side from UserChallenge + User
export interface ChallengeSubmission {
  id: string
  userId: string
  userName: string
  userAvatar: string
  language: Language
  score: number
  submittedAt: string      // ISO string
}

interface SubmitResult {
  passed: boolean
  score: number
  executionTime: number
  yourEnergy: number
  message: string
}

interface SubmissionReceievedResponse {
  submissionId: number
  status: 'PENDING' | 'PASSED' | 'FAILED'
}

interface ChallengeIDEProps {
  challengeId:   number
  allowedLanguages: Language[]        // challenge.languages from DB
  startingCodes: SerializedStartingCode[]  // challenge.startingCodes from DB
  leaderboard:   ChallengeSubmission[]
}

// ── Language display config ────────────────────────────────────────────────
// Matches your schema enum exactly: PYTHON | CPP | C | JAVASCRIPT
const LANG_META: Record<Language, { label: string; color: string }> = {
  PYTHON:     { label: 'Python',     color: 'border-yellow-400/30 text-yellow-400' },
  CPP:        { label: 'C++',        color: 'border-red-400/30    text-red-400'    },
  C:          { label: 'C',          color: 'border-amber-400/30  text-amber-400'  },
  JAVASCRIPT: { label: 'JavaScript', color: 'border-cyan-400/30   text-cyan-400'   },
}

// Fallback starter code if no StartingCode row exists for a language
const FALLBACK_CODE: Record<Language, string> = {
  PYTHON:     '# Write your optimized solution here\n\ndef solution():\n    pass\n',
  CPP:        '// Write your optimized solution here\n\n#include <iostream>\n\nint main() {\n\n    return 0;\n}\n',
  C:          '// Write your optimized solution here\n\n#include <stdio.h>\n\nint main() {\n\n    return 0;\n}\n',
  JAVASCRIPT: '// Write your optimized solution here\n\nfunction solution() {\n\n}\n',
}

// Map Language enum → CodeMirror language extension
function getLangExtension(lang: Language) {
  switch (lang) {
    case 'PYTHON':     return python()
    case 'CPP':        return cpp()
    case 'C':          return cpp()      // CodeMirror has no separate C extension; cpp() handles C fine
    case 'JAVASCRIPT': return javascript()
  }
}

// ── Editor theme ──────────────────────────────────────────────────────────
const leafTheme = EditorView.theme({
  '&': {
    backgroundColor: '#060f0a',
    color: '#e2e8f0',
    height: '100%',
    fontSize: '13px',
    fontFamily: "'Space Mono', monospace",
  },
  '.cm-content':          { padding: '12px 0' },
  '.cm-gutters':          { backgroundColor: '#0a1a10', borderRight: '1px solid #1e3a2a', color: '#334155' },
  '.cm-activeLine':       { backgroundColor: 'rgba(40,235,112,0.04)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(40,235,112,0.06)', color: '#28eb70' },
  '.cm-cursor':           { borderLeftColor: '#28eb70' },
  '.cm-selectionBackground': { backgroundColor: 'rgba(40,235,112,0.15) !important' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: 'rgba(40,235,112,0.15)' },
}, { dark: true })

// ── Leaderboard sub-component ─────────────────────────────────────────────
function ChallengeLeaderboard({
  entries,
  allowedLanguages,
  currentUserId,
}: {
  entries: ChallengeSubmission[]
  allowedLanguages: Language[]
  currentUserId?: string
}) {
  const [filter, setFilter] = useState<Language | 'ALL'>('ALL')
  const filtered = filter === 'ALL' ? entries : entries.filter(e => e.language === filter)

  return (
    <div className="rounded-xl border border-[#1e3a2a] bg-[#0a1a10]/40 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e3a2a] flex-wrap gap-2">
        <h3 className="font-['Space_Mono',monospace] text-xs uppercase tracking-widest text-[#28eb70]/70 flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5" /> Challenge Leaderboard
        </h3>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2 py-0.5 rounded text-[9px] font-bold font-['Space_Mono',monospace] border transition-colors
              ${filter === 'ALL'
                ? 'border-[#28eb70]/30 text-[#28eb70] bg-[#28eb70]/8'
                : 'border-[#1e3a2a] text-slate-600 hover:text-slate-400'}`}
          >
            All
          </button>
          {/* Only show filter buttons for languages this challenge supports */}
          {allowedLanguages.map(lang => (
            <button
              key={lang}
              onClick={() => setFilter(lang)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold font-['Space_Mono',monospace] border transition-colors
                ${filter === lang
                  ? LANG_META[lang].color
                  : 'border-[#1e3a2a] text-slate-600 hover:text-slate-400'}`}
            >
              {LANG_META[lang]?.label ?? lang}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="font-['Space_Mono',monospace] text-xs text-slate-700 text-center py-8">
          No submissions yet.
        </p>
      ) : (
        <ul className="divide-y divide-[#1e3a2a]/50">
          {filtered.map((entry, idx) => (
            <li
              key={entry.id}
              className={`flex items-center gap-3 px-5 py-3 ${
                entry.userId === currentUserId ? 'bg-[#28eb70]/5' : ''
              }`}
            >
              <span className="w-5 text-center font-['Space_Mono',monospace] text-xs text-slate-600 shrink-0">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
              </span>
              <img
                src={entry.userAvatar}
                alt={entry.userName}
                className="w-7 h-7 rounded-full border border-[#1e3a2a] bg-[#0a1a10] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className={`font-['Space_Mono',monospace] text-xs font-bold truncate
                  ${entry.userId === currentUserId ? 'text-[#28eb70]' : 'text-slate-200'}`}>
                  {entry.userName}
                  {entry.userId === currentUserId && (
                    <span className="ml-1.5 text-[9px] text-[#28eb70]/50">(you)</span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1 py-0 font-['Space_Mono',monospace] ${LANG_META[entry.language]?.color ?? ''}`}
                  >
                    {LANG_META[entry.language]?.label ?? entry.language}
                  </Badge>
                  <span className="font-['Space_Mono',monospace] text-[9px] text-slate-600">
                    {new Date(entry.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 gap-0.5">
                <span className="font-['Space_Mono',monospace] text-xs font-bold text-slate-100">
                  {entry.score.toLocaleString()}
                </span>
                <span className="font-['Space_Mono',monospace] text-[9px] text-[#28eb70]/60">
                  {/* −{entry.energyReduction}% */}
                  −0%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Main IDE component ────────────────────────────────────────────────────
export default function ChallengeIDE({
  challengeId,
  allowedLanguages,
  startingCodes,
  leaderboard,
}: ChallengeIDEProps) {
  // Default to the first language the challenge supports
  const [language, setLanguage]       = useState<Language>(allowedLanguages[0] ?? 'PYTHON')
  const [submitting, setSubmitting]   = useState(false)
  const [result, setResult]           = useState<SubmitResult | null>(null)
  const [langOpen, setLangOpen]       = useState(false)

  const editorRef  = useRef<HTMLDivElement>(null)
  const editorView = useRef<EditorView | null>(null)

  // Look up the starting code for the current language from the DB rows.
  // Falls back to a generic template if no StartingCode row exists.
  function getStartingCode(lang: Language): string {
    return startingCodes.find(s => s.language === lang)?.code
      ?? FALLBACK_CODE[lang]
      ?? '// No starting code available\n'
  }

  // Rebuild CodeMirror whenever the selected language changes
  useEffect(() => {
    if (!editorRef.current) return
    editorView.current?.destroy()

    const state = EditorState.create({
      doc: getStartingCode(language),
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        keymap.of(defaultKeymap),
        leafTheme,
        oneDark,
        getLangExtension(language),
        EditorView.lineWrapping,
      ],
    })

    editorView.current = new EditorView({ state, parent: editorRef.current })
    return () => editorView.current?.destroy()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  async function handleSubmit() {
    const code = editorView.current?.state.doc.toString() ?? ''
    if (!code.trim()) return

    setSubmitting(true)
    setResult(null)

    try {
      const res = await fetch(`/api/challenges/submit`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, code, language: language.toUpperCase() }),
      })
      const data: SubmitResult= await res.json()
      setResult(data)
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── IDE panel ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#1e3a2a] overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a1a10] border-b border-[#1e3a2a]">

          {/* Language selector — only shows languages this challenge allows */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1e3a2a]
                         bg-[#060f0a] hover:border-[#28eb70]/30 transition-colors"
            >
              <span className={`font-['Space_Mono',monospace] text-xs font-bold
                                ${LANG_META[language]?.color.split(' ')[1] ?? 'text-slate-400'}`}>
                {LANG_META[language]?.label ?? language}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-600" />
            </button>

            {langOpen && (
              <div className="absolute top-full left-0 mt-1 z-20 w-36 rounded-lg border
                              border-[#1e3a2a] bg-[#0a1a10] shadow-xl overflow-hidden">
                {allowedLanguages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setLangOpen(false) }}
                    className={`w-full text-left px-3 py-2 font-['Space_Mono',monospace] text-xs
                                transition-colors hover:bg-[#28eb70]/5
                                ${language === lang ? 'text-[#28eb70]' : 'text-slate-400'}`}
                  >
                    {LANG_META[lang]?.label ?? lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#28eb70] text-[#060f0a]
                       font-['Space_Mono',monospace] text-xs font-bold
                       disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#20d063] transition-colors"
          >
            {submitting
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Grading…</>
              : <><Zap     className="h-3.5 w-3.5" /> Submit</>
            }
          </button>
        </div>

        {/* CodeMirror mount point */}
        <div ref={editorRef} className="h-[420px] overflow-auto" style={{ background: '#060f0a' }} />
      </div>

      {/* ── Results panel ──────────────────────────────────────────── */}
      {result && (
        <div
          id="results-section"
          className="rounded-xl border overflow-hidden animate-in fade-in slide-in-from-bottom-4
                     duration-500 border-[#1e3a2a]"
        >
          <div className={`flex items-center gap-3 px-5 py-4 border-b border-[#1e3a2a]
            ${result.passed ? 'bg-[#28eb70]/6' : 'bg-red-400/5'}`}>
            {result.passed
              ? <CheckCircle className="h-5 w-5 text-[#28eb70] shrink-0" />
              : <XCircle className="h-5 w-5 text-red-400 shrink-0" />
            }
            <div>
              <p className={`font-['Space_Mono',monospace] text-sm font-bold
                ${result.passed ? 'text-[#28eb70]' : 'text-red-400'}`}>
                {result.passed ? 'Challenge Passed!' : 'Not quite - try again!'}
              </p>
              <p className="font-['Space_Mono',monospace] text-xs text-slate-500 mt-0.5">
                {result.message}
              </p>
            </div>
            {result.passed && (
              <span className="ml-auto font-['Space_Mono',monospace] text-2xl font-bold text-[#28eb70]">
                +{result.score.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-[#1e3a2a] bg-[#0a1a10]/40">
            {[
              // { icon: Zap,  label: 'Energy reduction', value: `${result.energyReduction}%`,  color: 'text-[#28eb70]'   },
              // { icon: Leaf, label: 'CO₂ saved',         value: `${result.co2Saved} g`,        color: 'text-emerald-400' },
              { icon: Zap,  label: 'Energy reduction', value: `0%`,  color: 'text-[#28eb70]'   },
              { icon: Leaf, label: 'CO₂ saved',         value: `0 g`,        color: 'text-emerald-400' },
              { icon: Zap,  label: 'Your energy',       value: `${result.yourEnergy} mWh`,    color: 'text-slate-300'   },
              { icon: Zap,  label: 'Exec time',         value: `${result.executionTime}s`,    color: 'text-slate-300'   },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex flex-col gap-1 px-5 py-4">
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-3 w-3 ${color}`} />
                  <span className="font-['Space_Mono',monospace] text-[9px] uppercase tracking-wider text-slate-600">
                    {label}
                  </span>
                </div>
                <span className={`font-['Space_Mono',monospace] text-lg font-bold ${color}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Energy bar comparison */}
          <div className="px-5 py-4 border-t border-[#1e3a2a] bg-[#0a1a10]/20">
            <p className="font-['Space_Mono',monospace] text-[10px] text-slate-600 uppercase tracking-wider mb-3">
              Energy comparison
            </p>
            <div className="flex flex-col gap-2">
              {[
                // { label: 'Baseline', width: '100%',                            color: 'bg-red-400/40',    val: `${result.baselineEnergy} mWh`, textColor: 'text-slate-500'   },
                // { label: 'Yours',    width: `${100 - result.energyReduction}%`, color: 'bg-[#28eb70]/70', val: `${result.yourEnergy} mWh`,    textColor: 'text-[#28eb70]'  },
                { label: 'Baseline', width: '100%',                            color: 'bg-red-400/40',    val: `0 mWh`, textColor: 'text-slate-500'   },
                { label: 'Yours',    width: `0%`, color: 'bg-[#28eb70]/70', val: `${result.yourEnergy} mWh`,    textColor: 'text-[#28eb70]'  },
              ].map(({ label, width, color, val, textColor }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="font-['Space_Mono',monospace] text-[10px] text-slate-500 w-16 shrink-0">{label}</span>
                  <div className="flex-1 h-3 rounded-full bg-[#1e3a2a] overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width }} />
                  </div>
                  <span className={`font-['Space_Mono',monospace] text-[10px] ${textColor} w-14 text-right shrink-0`}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Leaderboard ────────────────────────────────────────────── */}
      <ChallengeLeaderboard
        entries={leaderboard}
        allowedLanguages={allowedLanguages}
      />
    </div>
  )
}