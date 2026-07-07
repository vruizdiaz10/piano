interface StreakBadgeProps {
  streak: number
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null

  const color = streak >= 8
    ? 'text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/30'
    : streak >= 5
      ? 'text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/30'
      : streak >= 3
        ? 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/30'
        : 'text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/30'

  const glowClass = streak >= 5 ? 'animate-pulse-glow' : ''

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-sm font-bold shadow-sm ${color} ${glowClass}`}>
      <span className="text-base">{'\uD83D\uDD25'}</span>
      <span>x{streak}</span>
      {streak >= 5 && <span className="text-xs font-medium hidden sm:inline">{'\u00A1'}Racha!</span>}
    </div>
  )
}
