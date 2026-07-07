interface StreakBadgeProps {
  streak: number
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null

  const color = streak >= 8
    ? 'text-secondary border-secondary/30 bg-secondary/10'
    : streak >= 5
      ? 'text-accent border-accent/30 bg-accent/10'
      : streak >= 3
        ? 'text-primary border-primary/30 bg-primary/10'
        : 'text-muted-foreground border-border bg-muted'

  const glowClass = streak >= 5 ? 'animate-pulse-glow' : ''

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-sm font-bold ${color} ${glowClass}`}>
      <span className="text-base">{'\uD83D\uDD25'}</span>
      <span>x{streak}</span>
      {streak >= 5 && <span className="text-xs font-medium hidden sm:inline">{'\u00A1'}Racha</span>}
    </div>
  )
}
