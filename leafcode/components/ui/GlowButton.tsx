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
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        boxShadow: '0 0 32px #22c55e55, 0 0 64px #22c55e22, inset 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      {/* Hover shimmer sweep */}
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
        }}
      />

      <Zap className="h-5 w-5 text-[#0a1a10] fill-[#0a1a10] shrink-0 transition-transform group-hover:scale-110" />
      <span className="font-['Space_Mono',monospace] text-base font-bold text-[#0a1a10] relative z-10">
        {label}
      </span>

      {/* Outer glow pulse ring */}
      <span
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ boxShadow: '0 0 48px #22c55e88' }}
      />
    </Link>
  )
}