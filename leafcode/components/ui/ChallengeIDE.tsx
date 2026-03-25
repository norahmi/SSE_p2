"use client"

import { useEffect, useRef, useState } from 'react'
import { CheckCircle, XCircle, Loader2, ChevronDown, Zap, Leaf, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ChallengeDetail, ChallengeSubmission, Language } from '@/lib/mock-challenges'

// ── CodeMirror imports ───────────────────────────────────────────────────
// Run: npm install @codemirror/view @codemirror/state @codemirror/lang-python
//      @codemirror/lang-javascript @codemirror/lang-rust @codemirror/lang-java
//      @codemirror/lang-cpp @codemirror/lang-go @codemirror/theme-one-dark
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { EditorState }           from '@codemirror/state'
import { defaultKeymap }         from '@codemirror/commands'
import { python }                from '@codemirror/lang-python'
import { javascript }            from '@codemirror/lang-javascript'
import { rust }                  from '@codemirror/lang-rust'
import { java }                  from '@codemirror/lang-java'
import { cpp }                   from '@codemirror/lang-cpp'
import { go }                    from '@codemirror/lang-go'
import { oneDark }               from '@codemirror/theme-one-dark'

// ── Types ────────────────────────────────────────────────────────────────
interface SubmitResult {
  passed: boolean
  score: number
  energyReduction: number
  co2Saved: number
  executionTime: number
  baselineEnergy: number
  yourEnergy: number
  message: string
}

interface ChallengeIDEProps {
  challenge: ChallengeDetail
  leaderboard: ChallengeSubmission[]
  challengeId: number
}

// ── Language config ───────────────────────────────────────────────────────
const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'python',     label: 'Python'     },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'go',         label: 'Go'         },
  { value: 'rust',       label: 'Rust'       },
  { value: 'java',       label: 'Java'       },
  { value: 'cpp',        label: 'C++'        },
]

const LANG_EXTENSIONS: Record<Language, () => unknown> = {
  python:     python,
  typescript: () => javascript({ typescript: true }),
  javascript: javascript,
  go:         go,
  rust:       rust,
  java:       java,
  cpp:        cpp,
}

const LANG_COLORS: Record<Language, string> = {
  python:     'border-yellow-400/30 text-yellow-400',
  typescript: 'border-blue-400/30   text-blue-400',
  javascript: 'border-yellow-300/30 text-yellow-300',
  go:         'border-cyan-400/30   text-cyan-400',
  rust:       'border-orange-400/30 text-orange-400',
  java:       'border-amber-400/30  text-amber-400',
  cpp:        'border-red-400/30    text-red-400',
}

// ── Custom dark theme that matches LeafCode palette ───────────────────────
const leafTheme = EditorView.theme({
  '&': {
    backgroundColor: '#060f0a',
    color: '#e2e8f0',
    height: '100%',
    fontSize: '13px',
    fontFamily: "'Space Mono', monospace",
  },
  '.cm-content': { padding: '12px 0' },
  '.cm-gutters': { backgroundColor: '#0a1a10', borderRight: '1px solid #1e3a2a', color: '#334155' },
  '.cm-activeLine': { backgroundColor: 'rgba(40,235,112,0.04)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(40,235,112,0.06)', color: '#28eb70' },
  '.cm-cursor': { borderLeftColor: '#28eb70' },
  '.cm-selectionBackground': { backgroundColor: 'rgba(40,235,112,0.15) !important' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: 'rgba(40,235,112,0.15)' },
}, { dark: true })

// ── Leaderboard with language filter ─────────────────────────────────────
function ChallengeLeaderboard({
  entries,
  highlightUserId,
}: {
  entries: ChallengeSubmission[]
  highlightUserId?: string
}) {
  const [langFilter, setLangFilter] = useState<Language | 'all'>('all')

  const filtered = langFilter === 'all'
    ? entries
    : entries.filter(e => e.language === langFilter)

  const usedLangs = Array.from(new Set(entries.map(e => e.language)))

  return (
    <div className="rounded-xl border border-[#1e3a2a] bg-[#0a1a10]/40 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e3a2a]">
        <h3 className="font-['Space_Mono',monospace] text-xs uppercase tracking-widest text-[#28eb70]/70 flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5" />
          Challenge Leaderboard
        </h3>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setLangFilter('all')}
            className={`px-2 py-0.5 rounded text-[9px] font-bold font-['Space_Mono',monospace] border transition-colors
              ${langFilter === 'all'
                ? 'border-[#28eb70]/30 text-[#28eb70] bg-[#28eb70]/8'
                : 'border-[#1e3a2a] text-slate-600 hover:text-slate-400'
              }`}
          >
            All
          </button>
          {usedLangs.map(lang => (
            <button
              key={lang}
              onClick={() => setLangFilter(lang)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold font-['Space_Mono',monospace] border transition-colors
                ${langFilter === lang
                  ? `${LANG_COLORS[lang]} bg-current/8`
                  : 'border-[#1e3a2a] text-slate-600 hover:text-slate-400'
                }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-[#1e3a2a]/50">
        {filtered.map((entry, idx) => (
          <li
            key={entry.id}
            className={`flex items-center gap-3 px-5 py-3 ${
              entry.userId === highlightUserId ? 'bg-[#28eb70]/5' : ''
            }`}
          >
            <span className="w-5 text-center font-['Space_Mono',monospace] text-xs text-slate-600 shrink-0">
              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
            </span>
            <img src={entry.userAvatar} alt={entry.userName}
              className="w-7 h-7 rounded-full border border-[#1e3a2a] bg-[#0a1a10] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className={`font-['Space_Mono',monospace] text-xs font-bold truncate
                ${entry.userId === highlightUserId ? 'text-[#28eb70]' : 'text-slate-200'}`}>
                {entry.userName}
                {entry.userId === highlightUserId && (
                  <span className="ml-1.5 text-[9px] text-[#28eb70]/50">(you)</span>
                )}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline"
                  className={`text-[9px] px-1 py-0 font-['Space_Mono',monospace] ${LANG_COLORS[entry.language]}`}>
                  {entry.language}
                </Badge>
                <span className="font-['Space_Mono',monospace] text-[9px] text-slate-600">
                  {entry.submittedAt}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 gap-0.5">
              <span className="font-['Space_Mono',monospace] text-xs font-bold text-slate-100">
                {entry.score.toLocaleString()}
              </span>
              <span className="font-['Space_Mono',monospace] text-[9px] text-[#28eb70]/60">
                −{entry.energyReduction}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Main IDE component ────────────────────────────────────────────────────
export default function ChallengeIDE({
  challenge,
  leaderboard,
  challengeId,
}: ChallengeIDEProps) {
  const [language, setLanguage]   = useState<Language>('python')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]       = useState<SubmitResult | null>(null)
  const [langOpen, setLangOpen]   = useState(false)

  const editorRef  = useRef<HTMLDivElement>(null)
  const editorView = useRef<EditorView | null>(null)

  // Build or rebuild the CodeMirror editor when language changes
  useEffect(() => {
    if (!editorRef.current) return

    editorView.current?.destroy()

    const langExt = LANG_EXTENSIONS[language]
    const state = EditorState.create({
      doc: challenge.starterCode[language],
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        keymap.of(defaultKeymap),
        leafTheme,
        oneDark,
        (langExt as () => ReturnType<typeof python>)(),
        EditorView.lineWrapping,
      ],
    })

    editorView.current = new EditorView({
      state,
      parent: editorRef.current,
    })

    return () => editorView.current?.destroy()
  }, [language, challenge.starterCode])

  async function handleSubmit() {
    const code = editorView.current?.state.doc.toString() ?? ''
    if (!code.trim()) return

    setSubmitting(true)
    setResult(null)

    try {
      const res = await fetch(`/api/challenges/${challengeId}/submit`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code, language }),
      })
      const data: SubmitResult = await res.json()
      setResult(data)
      // Scroll results into view
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── IDE panel ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#1e3a2a] overflow-hidden">

        {/* IDE toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5
                        bg-[#0a1a10] border-b border-[#1e3a2a]">

          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1e3a2a]
                         bg-[#060f0a] hover:border-[#28eb70]/30 transition-colors"
            >
              <span className={`font-['Space_Mono',monospace] text-xs font-bold ${LANG_COLORS[language].split(' ')[1]}`}>
                {LANGUAGES.find(l => l.value === language)?.label}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-600" />
            </button>

            {langOpen && (
              <div className="absolute top-full left-0 mt-1 z-20 w-36
                              rounded-lg border border-[#1e3a2a] bg-[#0a1a10]
                              shadow-xl overflow-hidden">
                {LANGUAGES.map(l => (
                  <button
                    key={l.value}
                    onClick={() => { setLanguage(l.value); setLangOpen(false) }}
                    className={`w-full text-left px-3 py-2 font-['Space_Mono',monospace] text-xs
                                transition-colors hover:bg-[#28eb70]/5
                                ${language === l.value ? 'text-[#28eb70]' : 'text-slate-400'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg
                       bg-[#28eb70] text-[#060f0a] font-['Space_Mono',monospace]
                       text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed
                       hover:bg-[#20d063] transition-colors"
          >
            {submitting ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Grading…</>
            ) : (
              <><Zap className="h-3.5 w-3.5" /> Submit</>
            )}
          </button>
        </div>

        {/* CodeMirror mount point */}
        <div
          ref={editorRef}
          className="h-[420px] overflow-auto"
          style={{ background: '#060f0a' }}
        />
      </div>

      {/* ── Results panel (slides in after submit) ─────────────────── */}
      {result && (
        <div
          id="results-section"
          className="rounded-xl border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500
                     border-[#1e3a2a]"
        >
          {/* Result header */}
          <div className={`flex items-center gap-3 px-5 py-4 border-b border-[#1e3a2a]
            ${result.passed ? 'bg-[#28eb70]/6' : 'bg-red-400/5'}`}>
            {result.passed
              ? <CheckCircle className="h-5 w-5 text-[#28eb70] shrink-0" />
              : <XCircle     className="h-5 w-5 text-red-400 shrink-0"   />
            }
            <div>
              <p className={`font-['Space_Mono',monospace] text-sm font-bold
                ${result.passed ? 'text-[#28eb70]' : 'text-red-400'}`}>
                {result.passed ? 'Challenge Passed!' : 'Not quite — try again'}
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
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-[#1e3a2a]
                          bg-[#0a1a10]/40">
            {[
              { icon: Zap,  label: 'Energy reduction', value: `${result.energyReduction}%`,            color: 'text-[#28eb70]' },
              { icon: Leaf, label: 'CO₂ saved',         value: `${result.co2Saved} g`,                 color: 'text-emerald-400' },
              { icon: Zap,  label: 'Your energy',       value: `${result.yourEnergy} mWh`,              color: 'text-slate-300' },
              { icon: Zap,  label: 'Exec time',         value: `${result.executionTime}s`,              color: 'text-slate-300' },
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
              <div className="flex items-center gap-3">
                <span className="font-['Space_Mono',monospace] text-[10px] text-slate-500 w-16 shrink-0">Baseline</span>
                <div className="flex-1 h-3 rounded-full bg-[#1e3a2a] overflow-hidden">
                  <div className="h-full w-full bg-red-400/40 rounded-full" />
                </div>
                <span className="font-['Space_Mono',monospace] text-[10px] text-slate-500 w-14 text-right shrink-0">
                  {result.baselineEnergy} mWh
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-['Space_Mono',monospace] text-[10px] text-slate-500 w-16 shrink-0">Yours</span>
                <div className="flex-1 h-3 rounded-full bg-[#1e3a2a] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#28eb70]/70 transition-all duration-1000"
                    style={{ width: `${100 - result.energyReduction}%` }}
                  />
                </div>
                <span className="font-['Space_Mono',monospace] text-[10px] text-[#28eb70] w-14 text-right shrink-0">
                  {result.yourEnergy} mWh
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Challenge leaderboard ──────────────────────────────────── */}
      <ChallengeLeaderboard entries={leaderboard} />

    </div>
  )
}