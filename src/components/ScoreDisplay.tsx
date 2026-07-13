interface ScoreDisplayProps {
  accuracy: number
  totalAttempts: number
  timerDisplay?: number
  isTimed?: boolean
}

export default function ScoreDisplay({ accuracy, totalAttempts, timerDisplay, isTimed }: ScoreDisplayProps) {
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
      {isTimed && timerDisplay !== undefined && (
        <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
          <span className={`inline-block w-2 h-2 rounded-full ${timerDisplay <= 2 ? 'bg-red-400 animate-pulse' : 'bg-amber-400'}`} />
          {timerDisplay}s
        </div>
      )}
      <div className={`text-2xl font-bold tabular-nums ${color}`}>
        {totalAttempts > 0 ? `${Math.round(accuracy)}%` : '--'}
        {totalAttempts > 0 && (
          <span className="ml-1">
            {accuracy >= 90 ? '\u2713' : accuracy >= 70 ? '\u26A0' : '\u2717'}
          </span>
        )}
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
