import { useEffect, useRef } from 'react'

const COLORS = ['#00D4FF', '#FF2E97', '#39FF14', '#FFB800', '#B24BF3']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  life: number // 0-1, starts at 1, fades to 0
  born: number
}

interface Props {
  active: boolean
  streak?: number
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function createParticles(count: number, canvas: HTMLCanvasElement): Particle[] {
  const cx = canvas.width / 2
  const cy = canvas.height * 0.15 // burst from center-top
  const now = performance.now()

  return Array.from({ length: count }, () => {
    const angle = randomBetween(0, Math.PI * 2)
    const speed = randomBetween(2, 7)
    return {
      x: cx + randomBetween(-80, 80),
      y: cy + randomBetween(-20, 20),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - randomBetween(2, 5), // bias upward
      size: randomBetween(6, 10),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: randomBetween(0, 360),
      rotationSpeed: randomBetween(-300, 300),
      life: 1,
      born: now,
    }
  })
}

export default function ParticleCanvas({ active, streak }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Trigger burst on active change
  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Size canvas
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let base = 15
    if (streak && streak >= 10) base += 15
    else if (streak && streak >= 5) base += 10

    const burstDelay = streak && streak >= 10 ? 100 : streak && streak >= 5 ? 150 : 200

    // Wave 1
    particlesRef.current.push(...createParticles(base, canvas))

    // Wave 2
    const t = setTimeout(() => {
      particlesRef.current.push(...createParticles(base, canvas))
    }, burstDelay)
    timersRef.current.push(t)

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [active, streak])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const DURATION = 1500 // ms

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const now = performance.now()
      const alive: Particle[] = []

      for (const p of particlesRef.current) {
        const age = now - p.born
        if (age > DURATION) continue

        p.life = 1 - age / DURATION
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.12 // gravity
        p.rotation += p.rotationSpeed * 0.016

        const alpha = Math.max(0, p.life)
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()

        alive.push(p)
      }

      particlesRef.current = alive

      if (alive.length > 0) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(rafRef.current)
  }, [active]) // restart loop on each burst

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 50 }}
      aria-hidden="true"
    />
  )
}
