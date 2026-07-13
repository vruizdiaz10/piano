import { useEffect, useState } from 'react'

interface ScoreFlyUpProps {
  active: boolean
  isCorrect: boolean
  streak: number
}

export default function ScoreFlyUp({ active, isCorrect, streak }: ScoreFlyUpProps) {
  const [items, setItems] = useState<Array<{ id: number; text: string; color: string; x: number }>>([])
  const idRef = { current: 0 }

  useEffect(() => {
    if (!active) return
    const id = ++idRef.current
    const points = isCorrect ? 10 + streak * 2 : 0
    const text = isCorrect ? `+${points}` : '✗'
    const color = isCorrect ? 'var(--neon-green)' : 'var(--neon-pink)'
    const x = 40 + Math.random() * 20
    setItems(prev => [...prev, { id, text, color, x }])
    const timer = setTimeout(() => setItems(prev => prev.filter(i => i.id !== id)), 1200)
    return () => clearTimeout(timer)
  }, [active, isCorrect, streak])

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
      {items.map(item => (
        <div
          key={item.id}
          className="absolute font-display font-black text-2xl"
          style={{
            left: `${item.x}%`,
            top: '40%',
            color: item.color,
            textShadow: `0 0 10px ${item.color}`,
            animation: 'score-fly-up 1.2s ease-out forwards',
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  )
}
