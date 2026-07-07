interface ScoreDisplayProps {
  accuracy: number
  totalAttempts: number
}

export default function ScoreDisplay({ accuracy, totalAttempts }: ScoreDisplayProps) {
  const color = accuracy >= 80
    ? 'text-emerald-600 dark:text-emerald-400'
    : accuracy >= 50
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400'

  const barColor = accuracy >= 80
    ? 'bg-emerald-500'
    : accuracy >= 50
      ? 'bg-amber-500'
      : 'bg-red-500'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`text-2xl font-bold tabular-nums ${color}`}>
        {totalAttempts > 0 ? `${Math.round(accuracy)}%` : '--'}
      </div>
      <div className="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(accuracy, 100)}%` }}
        />
      </div>
    </div>
  )
}
