"use client"

import { useEffect, useRef, useState } from 'react'

interface GaugeProps {
  value: number      // current value
  max: number        // max value for 100%
  label: string      // e.g. "Score"
  display: string    // formatted string to show in center e.g. "9,240"
  unit?: string      // optional unit label e.g. "kg CO₂"
  color?: string     // accent color, defaults to green
  size?: number      // diameter in px, defaults to 160
}

export default function CircularGauge({
  value,
  max,
  label,
  display,
  unit,
  color = '#22c55e',
  size = 160,
}: GaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number | null>(null)
  const DURATION = 1400 // ms

  const strokeWidth = size * 0.075
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  // Arc spans 270° (from 135° to 405°), leaving a 90° gap at the bottom
  const arcLength = circumference * 0.75
  const pct = Math.min(animatedValue / max, 1)
  const dashOffset = arcLength - pct * arcLength

  useEffect(() => {
    startTimeRef.current = null
    function step(ts: number) {
      if (!startTimeRef.current) startTimeRef.current = ts
      const elapsed = ts - startTimeRef.current
      const progress = Math.min(elapsed / DURATION, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedValue(eased * value)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value])

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
            stroke="#1e3a2a"
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
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            style={{ transition: 'none', filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center"

        >
          <span
            className="font-['Space_Mono',monospace] font-bold leading-none"
            style={{ fontSize: size * 0.155, color }}
          >
            {display}
          </span>
          {unit && (
            <span
              className="font-['Space_Mono',monospace] text-slate-500 mt-1"
              style={{ fontSize: size * 0.08 }}
            >
              {unit}
            </span>
          )}
        </div>
      </div>

      <span
        className="font-['Space_Mono',monospace] uppercase tracking-widest text-slate-500"
        style={{ fontSize: 11 }}
      >
        {label}
      </span>
    </div>
  )
}