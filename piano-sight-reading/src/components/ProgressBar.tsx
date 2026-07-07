interface ProgressBarProps {
  current: number
  total: number
  label?: string
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = Math.min((current / total) * 100, 100)

  return (
    <div className="mb-4 animate-slide-up">
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{label}</span>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-300">{current}/{total}</span>
        </div>
      )}
      <div className="relative h-3 rounded-full bg-amber-100 dark:bg-amber-900/40 overflow-visible">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: pct < 40
              ? 'linear-gradient(90deg, #DC2626, #F59E0B)'
              : pct < 80
                ? 'linear-gradient(90deg, #F59E0B, #EAB308)'
                : 'linear-gradient(90deg, #22C55E, #16A34A)',
          }}
        />
        {current > 0 && (
          <span
            className={`absolute -top-3 text-lg transition-all duration-500 ease-out pointer-events-none select-none ${pct >= 100 ? 'animate-bounce-once' : ''}`}
            style={{ left: `calc(${pct}% - 12px)` }}
            aria-hidden="true"
          >
            {'\uD83D\uDC24'}
          </span>
        )}
      </div>
    </div>
  )
}
