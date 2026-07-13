interface ProgressBarProps {
  current: number
  total: number
  label?: string
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = Math.min((current / total) * 100, 100)

  return (
    <div className="mb-2">
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold text-muted-foreground">{label}</span>
          <span className="text-xs font-bold text-muted-foreground">{current}/{total}</span>
        </div>
      )}
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
