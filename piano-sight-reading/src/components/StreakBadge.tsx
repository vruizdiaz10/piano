interface StreakBadgeProps {
  streak: number
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null

  const color = streak >= 8
    ? 'text-neon-pink border-neon-pink/40 bg-neon-pink/10'
    : streak >= 5
      ? 'text-neon-amber border-neon-amber/40 bg-neon-amber/10'
      : streak >= 3
        ? 'text-neon-cyan border-neon-cyan/40 bg-neon-cyan/10'
        : 'text-neon-blue/60 border-neon-blue/20 bg-neon-blue/5'

  const glowStyle = streak >= 5
    ? { boxShadow: `0 0 12px ${streak >= 8 ? 'rgba(255,46,151,0.3)' : 'rgba(255,184,0,0.3)'}` }
    : undefined

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-display font-bold ${color}`}
         style={glowStyle}>
      <span className="text-base">{'\uD83D\uDD25'}</span>
      <span>x{streak}</span>
      {streak >= 5 && <span className="text-xs font-medium hidden sm:inline">{'\u00A1'}Racha</span>}
    </div>
  )
}
