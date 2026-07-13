interface StreakOwlProps {
  streak: number
}

export default function StreakOwl({ streak }: StreakOwlProps) {
  const moodClass = streak >= 10
    ? 'animate-bounce-once'
    : streak >= 5
      ? 'animate-pulse-glow owl-bob'
      : streak >= 2
        ? 'owl-bob'
        : 'animate-sleepy-sway'

  const bodyFill = streak >= 10 ? '#FF2E97' : streak >= 5 ? '#FFB800' : '#B24BF3'
  const innerFill = streak >= 10 ? '#FF6BC1' : streak >= 5 ? '#FFD966' : '#D28EFF'

  const eyes = streak >= 10
    ? <><circle cx="16" cy="12" r="4.5" fill="#FFF" /><circle cx="16" cy="12" r="2.5" fill="#FF2E97" /><circle cx="17" cy="11" r="1" fill="#FFF" /><circle cx="32" cy="12" r="4.5" fill="#FFF" /><circle cx="32" cy="12" r="2.5" fill="#FF2E97" /><circle cx="33" cy="11" r="1" fill="#FFF" /></>
    : streak >= 5
      ? <><circle cx="16" cy="12" r="4" fill="#FFF" /><circle cx="16" cy="12" r="2" fill="#FFB800" /><circle cx="32" cy="12" r="4" fill="#FFF" /><circle cx="32" cy="12" r="2" fill="#FFB800" /></>
      : streak >= 2
        ? <><circle cx="16" cy="12" r="2.5" fill="#7B3FA0" /><circle cx="32" cy="12" r="2.5" fill="#7B3FA0" /></>
        : <><circle cx="16" cy="12" r="1.5" fill="#7B3FA0" /><circle cx="32" cy="12" r="1.5" fill="#7B3FA0" /><line x1="12" y1="15" x2="20" y2="9" stroke="#7B3FA0" strokeWidth="1.5" /><line x1="28" y1="15" x2="36" y2="9" stroke="#7B3FA0" strokeWidth="1.5" /></>

  const chest = streak >= 5
    ? <ellipse cx="24" cy="21" rx="5" ry="4" fill={innerFill} opacity="0.6" />
    : null

  return (
    <div className={`inline-flex items-center gap-1 text-xs font-bold ${streak >= 5 ? 'text-neon-amber' : 'text-neon-purple'} ${moodClass}`} aria-label={`Búho racha ${streak}`}>
      <svg width="48" height="36" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="24" cy="21" rx="16" ry="13" fill={bodyFill} />
        <ellipse cx="24" cy="16" rx="13" ry="9" fill={innerFill} />
        <circle cx="16" cy="17" r="5.5" fill="#2A1A4E" />
        <circle cx="32" cy="17" r="5.5" fill="#2A1A4E" />
        {eyes}
        {chest}
        <polygon points="19,7 16,1 13,7" fill={innerFill} />
        <polygon points="35,7 32,1 29,7" fill={innerFill} />
        <line x1="11" y1="28" x2="5" y2="34" stroke={bodyFill} strokeWidth="2" strokeLinecap="round" />
        <line x1="37" y1="28" x2="43" y2="34" stroke={bodyFill} strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span>
        {streak >= 10 ? '¡Búho furioso!' : streak >= 5 ? '¡Búho!' : streak >= 2 ? 'Búho' : '💤 Búho'}
      </span>
    </div>
  )
}
