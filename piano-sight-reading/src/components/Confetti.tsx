import { useEffect, useState } from 'react'

interface ConfettiProps {
  active: boolean
  streak?: number
}

const COLORS = ['#00D4FF', '#FF2E97', '#39FF14', '#FFB800', '#B24BF3']

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export default function Confetti({ active, streak }: ConfettiProps) {
  const [visible, setVisible] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; color: string; left: number; delay: number; size: number; rotation: number }>>([])
  const [secondWave, setSecondWave] = useState<Array<{ id: number; color: string; left: number; delay: number; size: number; rotation: number }>>([])

  function makeParticles(count: number, offset: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: i + offset,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      left: randomBetween(5, 95),
      delay: randomBetween(0, 0.3),
      size: randomBetween(6, 10),
      rotation: randomBetween(0, 360),
    }))
  }

  useEffect(() => {
    if (!active) { setVisible(false); return }
    let base = 15
    if (streak && streak >= 10) base += 15
    else if (streak && streak >= 5) base += 10

    const burstDelay = streak && streak >= 10 ? 100 : streak && streak >= 5 ? 150 : 200

    setParticles(makeParticles(base, 0))
    const secondTimer = setTimeout(() => {
      setSecondWave(makeParticles(base, base))
    }, burstDelay)
    setVisible(true)
    const hideTimer = setTimeout(() => setVisible(false), 1500)
    return () => { clearTimeout(secondTimer); clearTimeout(hideTimer) }
  }, [active, streak])

  if (!visible) return null

  const allParticles = [...particles, ...secondWave]

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {allParticles.map(p => (
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
