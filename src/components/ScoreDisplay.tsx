interface ScoreDisplayProps {
  accuracy: number
  totalAttempts: number
}

export default function ScoreDisplay({ accuracy, totalAttempts }: ScoreDisplayProps) {
  const color = accuracy >= 80
    ? 'text-success'
    : accuracy >= 50
      ? 'text-accent'
      : 'text-destructive'

  const barColor = accuracy >= 80
    ? 'bg-success'
    : accuracy >= 50
      ? 'bg-accent'
      : 'bg-destructive'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`text-2xl font-bold tabular-nums ${color}`}>
        {totalAttempts > 0 ? `${Math.round(accuracy)}%` : '--'}
      </div>
      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(accuracy, 100)}%` }}
        />
      </div>
    </div>
  )
}
