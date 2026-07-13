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
          <span className="text-xs font-semibold text-neon-blue/60">{label}</span>
          <span className="text-xs font-bold text-neon-cyan">{current}/{total}</span>
        </div>
      )}
      <div className="relative h-2 rounded-full overflow-hidden"
           style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--neon-blue), var(--neon-cyan))', boxShadow: '0 0 8px rgba(0,212,255,0.4)' }}
        />
      </div>
    </div>
  )
}
