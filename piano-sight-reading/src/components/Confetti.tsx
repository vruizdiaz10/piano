import { useEffect, useState } from 'react'

interface ConfettiProps {
  active: boolean
}

const COLORS = ['#DC2626', '#D97706', '#22C55E', '#3B82F6', '#EAB308', '#F97316']

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export default function Confetti({ active }: ConfettiProps) {
  const [visible, setVisible] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; color: string; left: number; delay: number; size: number; rotation: number }>>([])

  useEffect(() => {
    if (!active) { setVisible(false); return }
    const p = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      left: randomBetween(5, 95),
      delay: randomBetween(0, 0.3),
      size: randomBetween(6, 10),
      rotation: randomBetween(0, 360),
    }))
    setParticles(p)
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 1500)
    return () => clearTimeout(timer)
  }, [active])

  if (!visible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-fall ${randomBetween(1, 1.5)}s ease-out ${p.delay}s forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
