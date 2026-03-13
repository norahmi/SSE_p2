"use client"

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  rotation: number
  rotationSpeed: number
  wobble: number
  wobbleSpeed: number
}

// Draws a simple leaf shape on a canvas context
function drawLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  opacity: number
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.globalAlpha = opacity
  ctx.fillStyle = '#22c55e'
  ctx.beginPath()
  // Leaf: two bezier curves forming a pointed oval
  ctx.moveTo(0, -size)
  ctx.bezierCurveTo(size * 0.8, -size * 0.5, size * 0.8, size * 0.5, 0, size)
  ctx.bezierCurveTo(-size * 0.8, size * 0.5, -size * 0.8, -size * 0.5, 0, -size)
  ctx.fill()
  // Midrib line
  ctx.strokeStyle = '#16a34a'
  ctx.lineWidth = 0.5
  ctx.globalAlpha = opacity * 0.6
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.lineTo(0, size)
  ctx.stroke()
  ctx.restore()
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const mouseRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const PARTICLE_COUNT = 55
    const GRAVITY_RADIUS = 160
    const GRAVITY_STRENGTH = 0.018

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Spawn particles spread across the full canvas
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.5 - 0.1, // gentle upward drift
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.35 + 0.08,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.005,
    }))

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (const p of particlesRef.current) {
        // Wobble horizontal drift
        p.wobble += p.wobbleSpeed
        p.x += p.vx + Math.sin(p.wobble) * 0.3
        p.y += p.vy

        // Gravitate toward mouse if close enough
        const dx = mx - p.x
        const dy = my - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < GRAVITY_RADIUS && dist > 1) {
          p.x += (dx / dist) * GRAVITY_STRENGTH * (GRAVITY_RADIUS - dist)
          p.y += (dy / dist) * GRAVITY_STRENGTH * (GRAVITY_RADIUS - dist)
        }

        p.rotation += p.rotationSpeed

        // Wrap around edges
        if (p.y < -20) p.y = canvas!.height + 20
        if (p.x < -20) p.x = canvas!.width + 20
        if (p.x > canvas!.width + 20) p.x = -20

        drawLeaf(ctx!, p.x, p.y, p.size, p.rotation, p.opacity)
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    animate()

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  )
}