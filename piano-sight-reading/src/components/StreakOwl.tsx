interface StreakOwlProps {
  streak: number
}

export default function StreakOwl({ streak }: StreakOwlProps) {
  if (streak < 3) return null

  const stateClass = streak >= 10
    ? 'animate-bounce-once'
    : streak >= 8
      ? 'animate-pulse-glow'
      : 'owl-bob'

  const eyes = streak >= 8
    ? <><circle cx="12" cy="9" r="3" fill="#D97706" /><circle cx="24" cy="9" r="3" fill="#D97706" /></>
    : <><circle cx="12" cy="9" r="2.5" fill="#92400E" /><circle cx="24" cy="9" r="2.5" fill="#92400E" /></>

  const chest = streak >= 5
    ? <ellipse cx="18" cy="16" rx="5" ry="4" fill="#FBBF24" opacity="0.6" />
    : null

  return (
    <div className={`inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 ${stateClass}`} aria-label={`Búho racha ${streak}`}>
      <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="18" cy="16" rx="12" ry="10" fill="#A16207" />
        <ellipse cx="18" cy="12" rx="10" ry="7" fill="#D97706" />
        <circle cx="12" cy="13" r="4" fill="#FEF3C7" />
        <circle cx="24" cy="13" r="4" fill="#FEF3C7" />
        {eyes}
        {chest}
        <polygon points="14,5 12,1 10,5" fill="#D97706" />
        <polygon points="26,5 24,1 22,5" fill="#D97706" />
        <line x1="8" y1="22" x2="4" y2="26" stroke="#A16207" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="28" y1="22" x2="32" y2="26" stroke="#A16207" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="hidden sm:inline">
        {streak >= 10 ? '\u00A1B\u00FAho furioso!' : streak >= 8 ? '\u00A1B\u00FAho!' : 'B\u00FAho'}
      </span>
    </div>
  )
}
