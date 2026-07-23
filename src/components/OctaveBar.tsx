const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
const MIN_SHIFT = -2
const MAX_SHIFT = 2

interface OctaveBarProps {
  shift: number
  onShiftChange: (shift: number) => void
  baseStart: number
}

function midiToNoteName(midi: number): string {
  const name = NOTE_NAMES[midi % 12]
  const octave = Math.floor(midi / 12) - 1
  return `${name}${octave}`
}

export default function OctaveBar({ shift, onShiftChange, baseStart }: OctaveBarProps) {
  const low = baseStart + shift * 12
  const high = low + 24

  return (
    <div className="clay-inner-panel flex items-center justify-center gap-4 px-4 py-2 rounded-full mx-auto max-w-xs">
      <button
        onClick={() => onShiftChange(Math.max(shift - 1, MIN_SHIFT))}
        disabled={shift <= MIN_SHIFT}
        className="clay-button-secondary w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Octava abajo"
      >
        <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>chevron_left</span>
      </button>
      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest min-w-[100px] text-center">
        {midiToNoteName(low)} – {midiToNoteName(high)}
      </span>
      <button
        onClick={() => onShiftChange(Math.min(shift + 1, MAX_SHIFT))}
        disabled={shift >= MAX_SHIFT}
        className="clay-button-secondary w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Octava arriba"
      >
        <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>chevron_right</span>
      </button>
    </div>
  )
}
