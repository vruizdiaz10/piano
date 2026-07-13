import { useEffect, useState } from 'react'

interface HitRippleProps {
  isCorrect: boolean | null
  noteTrigger: number
}

export default function HitRipple({ isCorrect, noteTrigger }: HitRippleProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; color: string }>>([])

  useEffect(() => {
    if (noteTrigger === 0 || isCorrect === null) return
    const id = noteTrigger
    const color = isCorrect ? 'var(--neon-green)' : 'var(--neon-pink)'
    setRipples(prev => [...prev, { id, color }])
    const timer = setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 1000)
    return () => clearTimeout(timer)
  }, [noteTrigger, isCorrect])

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden="true">
      {ripples.map(r => (
        <div
          key={r.id}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 0,
            height: 0,
            borderRadius: '50%',
            border: `2px solid ${r.color}`,
            boxShadow: `0 0 12px ${r.color}`,
            animation: 'hit-ripple-expand 1s ease-out forwards',
          }}
        />
      ))}
    </div>
  )
}
