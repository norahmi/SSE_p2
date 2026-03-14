"use client"

import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function GlowButton({
  href = '/challenges',
  label = 'Start Coding',
}: {
  href?: string
  label?: string
}) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl px-8 py-4"
      style={{
        background: 'linear-gradient(135deg, var(--lc-green) 0%, var(--lc-green-hover) 100%)',
        boxShadow: '0 0 32px color-mix(in srgb, var(--lc-green) 30%, transparent), 0 0 64px color-mix(in srgb, var(--lc-green) 15%, transparent), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      {/* Shimmer sweep on hover */}
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
        }}
      />

      <Zap
        className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110"
        style={{ color: 'var(--lc-bg-card)', fill: 'var(--lc-bg-card)' }}
      />
      <span
        className="font-['Space_Mono',monospace] text-base font-bold relative z-10"
        style={{ color: 'var(--lc-bg-card)' }}
      >
        {label}
      </span>

      {/* Glow pulse ring on hover */}
      <span
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ boxShadow: '0 0 48px color-mix(in srgb, var(--lc-green) 80%, transparent)' }}
      />
    </Link>
  )
}