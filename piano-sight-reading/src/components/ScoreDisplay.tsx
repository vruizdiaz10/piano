interface ScoreDisplayProps {
  accuracy: number
  totalAttempts: number
  timerDisplay?: number
  isTimed?: boolean
}

export default function ScoreDisplay({ accuracy, totalAttempts, timerDisplay, isTimed }: ScoreDisplayProps) {
  const color = accuracy >= 80
    ? 'text-neon-green'
    : accuracy >= 50
      ? 'text-neon-amber'
      : 'text-neon-pink'

  const barColor = accuracy >= 80
    ? 'var(--neon-green)'
    : accuracy >= 50
      ? 'var(--neon-amber)'
      : 'var(--neon-pink)'

  return (
    <div className="flex flex-col items-center gap-1">
      {isTimed && timerDisplay !== undefined && (
        <div className="flex items-center gap-1 text-xs font-mono text-neon-amber">
          <span className={`inline-block w-2 h-2 rounded-full ${timerDisplay <= 2 ? 'bg-neon-pink animate-pulse' : 'bg-neon-amber'}`} />
          {timerDisplay}s
        </div>
      )}
      <div className={`text-2xl font-display font-bold tabular-nums ${color}`}
           style={{ textShadow: accuracy >= 80 ? `0 0 10px ${barColor}` : undefined }}>
        {totalAttempts > 0 ? `${Math.round(accuracy)}%` : '--'}
        {totalAttempts > 0 && (
          <span className="ml-1">
            {accuracy >= 90 ? '\u2713' : accuracy >= 70 ? '\u26A0' : '\u2717'}
          </span>
        )}
      </div>
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(accuracy, 100)}%`, background: barColor }}
        />
      </div>
    </div>
  )
}
