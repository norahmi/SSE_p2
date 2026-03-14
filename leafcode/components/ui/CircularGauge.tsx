"use client"

import { useEffect, useRef, useState } from 'react'

interface GaugeProps {
  value: number
  max: number
  label: string
  display: string
  unit?: string
  color?: string
  size?: number
}

export default function CircularGauge({
  value,
  max,
  label,
  display,
  unit,
  color,
  size = 160,
}: GaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const [resolvedColor, setResolvedColor] = useState(color ?? '#28eb70')
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number | null>(null)
  const DURATION = 1400

  useEffect(() => {
    if (!color) {
      const green = getComputedStyle(document.documentElement)
        .getPropertyValue('--lc-green')
        .trim()
      if (green) setResolvedColor(green)
    } else {
      setResolvedColor(color)
    }
  }, [color])

  useEffect(() => {
    startTimeRef.current = null
    function step(ts: number) {
      if (!startTimeRef.current) startTimeRef.current = ts
      const elapsed = ts - startTimeRef.current
      const progress = Math.min(elapsed / DURATION, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedValue(eased * value)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value])

  const strokeWidth = size * 0.075
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const arcLength = circumference * 0.75
  const pct = Math.min(animatedValue / max, 1)
  const dashOffset = arcLength - pct * arcLength
  const cx = size / 2
  const cy = size / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: size, height: size }} className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[135deg]"
        >
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--lc-border)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
          />
          {/* Filled arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'none',
              filter: `drop-shadow(0 0 6px ${resolvedColor}60)`,
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: 'rotate(-135deg)' }}
        >
          <span
            className="font-['Space_Mono',monospace] font-bold leading-none"
            style={{ fontSize: size * 0.155, color: resolvedColor }}
          >
            {display}
          </span>
          {unit && (
            <span
              className="font-['Space_Mono',monospace] mt-1"
              style={{ fontSize: size * 0.08, color: 'var(--lc-text-subtle)' }}
            >
              {unit}
            </span>
          )}
        </div>
      </div>

      <span
        className="font-['Space_Mono',monospace] uppercase tracking-widest"
        style={{ fontSize: 11, color: 'var(--lc-text-subtle)' }}
      >
        {label}
      </span>
    </div>
  )
}