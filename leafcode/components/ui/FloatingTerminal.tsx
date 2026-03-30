"use client"

import { useEffect, useRef } from 'react'

type LineType = 'cmd' | 'out' | 'dim' | 'warn' | 'ok'

interface Step {
  t: LineType
  txt: string
  delay?: number
}

const SEQUENCES: Step[][] = [
  [
    { t: 'cmd', txt: '$ leafcode analyze ./matrix_multiply.py' },
    { t: 'out', txt: '  scanning 847 lines...', delay: 600 },
    { t: 'out', txt: '  detected: O(n³) loop nesting', delay: 500 },
    { t: 'warn', txt: '  ⚠ CPU cycles: 2.4M  (+340% baseline)', delay: 500 },
    { t: 'out', txt: '  energy estimate: 18.4 mWh', delay: 400 },
    { t: 'dim', txt: '  suggest: numpy.dot() · -82% cycles', delay: 600 },
    { t: 'ok', txt: '  ✓ patch ready → submit to arena', delay: 500 },
  ],
  [
    { t: 'cmd', txt: '$ leafcode bench --run sort_challenge' },
    { t: 'out', txt: '  baseline:  bubble_sort()  → 9.2 mWh', delay: 600 },
    { t: 'out', txt: '  yours:     timsort_opt()  → 1.1 mWh', delay: 500 },
    { t: 'ok', txt: '  ✓ -88.0% energy   score +1,240 pts', delay: 500 },
    { t: 'out', txt: '  rank delta: #12 → #7  ↑', delay: 400 },
    { t: 'dim', txt: '  CO₂ saved this run: 0.8 g', delay: 500 },
  ],
  [
    { t: 'cmd', txt: '$ leafcode profile ./api_handler.js' },
    { t: 'out', txt: '  tracing 23 async calls...', delay: 600 },
    { t: 'warn', txt: '  ⚠ redundant await chains: 8 found', delay: 500 },
    { t: 'out', txt: '  idle CPU time: 340ms / request', delay: 400 },
    { t: 'dim', txt: '  suggest: Promise.all() batching', delay: 500 },
    { t: 'out', txt: '  potential savings: -67% wall time', delay: 500 },
    { t: 'ok', txt: '  ✓ challenge target achievable', delay: 400 },
  ],
  [
    { t: 'cmd', txt: '$ leafcode leaderboard --top 3' },
    { t: 'out', txt: '  #1  Yuki Tanaka     128.4 kg CO₂', delay: 500 },
    { t: 'out', txt: '  #2  Fatima Hassan   109.7 kg CO₂', delay: 300 },
    { t: 'out', txt: '  #3  Marcus Oliveira  98.1 kg CO₂', delay: 300 },
    { t: 'dim', txt: '  ──────────────────────────────', delay: 200 },
    { t: 'warn', txt: '  #7  you             48.3 kg CO₂', delay: 400 },
    { t: 'ok', txt: '  ✓ +2 ranks this week', delay: 400 },
  ],
]

const LINE_COLORS: Record<LineType, string> = {
  cmd:  'text-[var(--lc-green)]',
  out:  'text-[var(--lc-green)]/55',
  dim:  'text-[var(--lc-green)]/28',
  warn: 'text-amber-400',
  ok:   'text-emerald-400',
}

const MAX_LINES = 10
const TYPEWRITER_SPEED = 42 // ms per char for cmd lines

export default function FloatingTerminal() {
  const bodyRef = useRef<HTMLDivElement>(null)
  const seqIdxRef = useRef(0)
  const cancelRef = useRef(false)

  useEffect(() => {
    cancelRef.current = false

    function getBody() {
      return bodyRef.current
    }

    function trimLines() {
      const body = getBody()
      if (!body) return
      while (body.children.length >= MAX_LINES) body.removeChild(body.firstChild!)
    }

    function addLine(type: LineType, text: string) {
      const body = getBody()
      if (!body) return
      trimLines()
      const el = document.createElement('div')
      el.className = `text-[10.5px] leading-relaxed whitespace-pre font-['Space_Mono',monospace] ${LINE_COLORS[type]}`
      el.textContent = text
      body.appendChild(el)
    }

    function typewriterLine(type: LineType, text: string, done: () => void) {
      const body = getBody()
      if (!body) return
      trimLines()
      const el = document.createElement('div')
      el.className = `text-[10.5px] leading-relaxed whitespace-pre font-['Space_Mono',monospace] ${LINE_COLORS[type]}`
      body.appendChild(el)

      const cursor = document.createElement('span')
      cursor.className = 'inline-block w-[7px] h-[13px] bg-[var(--lc-green)] ml-px align-middle animate-pulse'
      el.appendChild(cursor)

      let i = 0
      function tick() {
        if (cancelRef.current) return
        if (i < text.length) {
          el.textContent = text.slice(0, ++i)
          el.appendChild(cursor)
          setTimeout(tick, TYPEWRITER_SPEED + Math.random() * 18)
        } else {
          el.textContent = text
          cursor.remove()
          setTimeout(done, 80)
        }
      }
      tick()
    }

    function runSequence(seq: Step[], onDone: () => void) {
      let i = 0
      function next() {
        if (cancelRef.current) return
        if (i >= seq.length) { setTimeout(onDone, 1800); return }
        const step = seq[i++]
        const delay = step.delay ?? 300
        if (step.t === 'cmd') {
          setTimeout(() => typewriterLine('cmd', step.txt, () => setTimeout(next, delay)), 200)
        } else {
          setTimeout(() => { addLine(step.t, step.txt); next() }, delay)
        }
      }
      next()
    }

    function loop() {
      if (cancelRef.current) return
      // blank gap
      addLine('dim', '')
      runSequence(SEQUENCES[seqIdxRef.current % SEQUENCES.length], () => {
        seqIdxRef.current++
        loop()
      })
    }

    const t = setTimeout(loop, 500)
    return () => { cancelRef.current = true; clearTimeout(t) }
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[340px] rounded-xl border border-[var(--lc-green)]/20 bg-[#060a08]/92 backdrop-blur-xl shadow-2xl overflow-hidden">

      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--lc-green)]/5 border-b border-[var(--lc-green)]/10">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="flex-1 text-center text-[10px] uppercase tracking-widest text-[var(--lc-green)]/40">
          leafcode · analyzer
        </span>
      </div>

      {/* Output body */}
      <div
        ref={bodyRef}
        className="h-[200px] overflow-hidden flex flex-col gap-0.5 px-3.5 py-3"
      />

      {/* Footer */}
      <div className="flex items-center gap-2 px-3.5 py-2 border-t border-[var(--lc-green)]/8">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--lc-green)] animate-pulse" />
        <span className="text-[9px] text-[var(--lc-green)]/30 font-['Space_Mono',monospace] uppercase tracking-wider">
          leafcode v2.4.1 · carbon-aware runtime
        </span>
      </div>
    </div>
  )
}