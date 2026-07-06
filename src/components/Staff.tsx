import { Note } from '../types'
import { noteToPosition } from '../utils/noteToPosition'

const LINE_SPACING = 16
const STAFF_TOP = 60
const STAFF_LEFT = 40
const NOTE_RADIUS = 8
const LEDGER_EXTEND = NOTE_RADIUS * 3

interface StaffProps {
  note?: Note | null
  showNoteName: boolean
}

function getAccidental(name: string): string | null {
  if (name.includes('#')) return '\u266F'
  return null
}

export default function Staff({ note, showNoteName }: StaffProps) {
  const SVG_TOP_PAD = 20
  const height = STAFF_TOP + LINE_SPACING * 8 + 40

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 -${SVG_TOP_PAD} ${STAFF_LEFT + 400} ${height + SVG_TOP_PAD}`} className="w-full max-w-[500px] h-auto" role="img" aria-label={note ? `Pentagrama mostrando ${note.name}${note.octave}` : 'Pentagrama vacío'} xmlns="http://www.w3.org/2000/svg">
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={STAFF_LEFT}
            y1={STAFF_TOP + i * LINE_SPACING}
            x2={STAFF_LEFT + 340}
            y2={STAFF_TOP + i * LINE_SPACING}
            className="dark:stroke-slate-300"
            stroke="var(--staff-line, #4B3F2B)"
            strokeWidth={1.5}
          />
        ))}
        <text x={12} y={STAFF_TOP + LINE_SPACING * 3 + 6} fontSize={36} fill="var(--staff-line, #4B3F2B)">
          {'\u{1D11E}'}
        </text>
        {note && (() => {
          const pos = noteToPosition(note)
          const y = STAFF_TOP - pos * LINE_SPACING / 2 + LINE_SPACING * 4
          const x = STAFF_LEFT + 160
          const accidental = getAccidental(note.name)
          const ledgerLines: number[] = []
          if (pos < 0) {
            for (let p = -2; p >= pos; p -= 2) ledgerLines.push(p)
          } else if (pos > 8) {
            for (let p = 10; p <= pos; p += 2) ledgerLines.push(p)
          }

          return (
            <g className="animate-note-pop" key={`${note.midi}-${Date.now()}`}>
              {ledgerLines.map(lp => {
                const ly = STAFF_TOP - lp * LINE_SPACING / 2 + LINE_SPACING * 4
                return <line key={lp} x1={x - LEDGER_EXTEND} y1={ly} x2={x + LEDGER_EXTEND} y2={ly} stroke="var(--staff-line, #4B3F2B)" strokeWidth={1.5} />
              })}
              {accidental && (
                <text x={x - 22} y={y + 6} fontSize={20} fill="var(--staff-line, #4B3F2B)">{accidental}</text>
              )}
              <ellipse cx={x} cy={y} rx={NOTE_RADIUS} ry={NOTE_RADIUS * 0.65} fill="#DC2626" transform={`rotate(-18 ${x} ${y})`} />
              {showNoteName && (
                <text x={x} y={y - 24} textAnchor="middle" fontSize={14} fill="#666">
                  {note.name}{note.octave}
                </text>
              )}
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
