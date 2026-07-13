import { Note, Clef } from '../types'
import { noteToPosition } from '../utils/noteToPosition'
import { midiToNote } from '../utils/midiToNote'
import { displayNoteName } from '../utils/notation'

const LINE_SPACING = 16
const STAFF_TOP = 60
const STAFF_LEFT = 40
const NOTE_RADIUS = 8
const LEDGER_EXTEND = NOTE_RADIUS * 3
const STEM_LENGTH = LINE_SPACING * 3.5

function intervalLabel(a: Note, b: Note): string | null {
  const diff = Math.abs(a.midi - b.midi)
  if (diff === 0) return null
  if (diff === 1) return '2ra'
  if (diff === 2) return '3ra'
  if (diff === 3) return '4ta'
  if (diff === 4) return '5ta'
  if (diff === 5) return '6ta'
  if (diff === 6) return '7ma'
  if (diff === 7) return '8va'
  if (diff <= 14) return `${diff}va`
  return null
}

interface StaffProps {
  note?: Note | null
  showNoteName: boolean
  lessonPool?: number[]
  trail?: Array<{ note: Note; id: number }>
  noteExpression?: 'happy' | 'sad' | null
  isMuted?: boolean
  clef?: Clef
  lastCorrectNote?: Note | null
  notation: 'american' | 'latino'
}

function getAccidental(name: string): string | null {
  if (name.includes('#')) return '\u266F'
  return null
}

export default function Staff({ note, showNoteName, lessonPool, trail, noteExpression, isMuted, clef = 'treble', lastCorrectNote, notation }: StaffProps) {
  const SVG_TOP_PAD = 20
  const height = STAFF_TOP + LINE_SPACING * 8 + 40

  const rangeDots = lessonPool && lessonPool.length > 1
    ? (() => {
        const minMidi = Math.min(...lessonPool)
        const maxMidi = Math.max(...lessonPool)
        const minPos = noteToPosition(midiToNote(minMidi), clef)
        const maxPos = noteToPosition(midiToNote(maxMidi), clef)
        const minY = STAFF_TOP - minPos * LINE_SPACING / 2 + LINE_SPACING * 4
        const maxY = STAFF_TOP - maxPos * LINE_SPACING / 2 + LINE_SPACING * 4
        return <><circle cx={STAFF_LEFT - 12} cy={minY} r={4} fill="var(--neon-blue)" opacity={0.35} /><circle cx={STAFF_LEFT - 12} cy={maxY} r={4} fill="var(--neon-blue)" opacity={0.35} /></>
      })()
    : null

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 -${SVG_TOP_PAD} ${STAFF_LEFT + 400} ${height + SVG_TOP_PAD}`} className="w-full max-w-[500px] h-auto" preserveAspectRatio="xMidYMid meet" role="img" aria-label={note ? `Pentagrama mostrando ${note.name}${note.octave}` : 'Pentagrama vacío'} xmlns="http://www.w3.org/2000/svg">
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={STAFF_LEFT}
            y1={STAFF_TOP + i * LINE_SPACING}
            x2={STAFF_LEFT + 340}
            y2={STAFF_TOP + i * LINE_SPACING}
            className="dark:stroke-slate-300"
            stroke="var(--staff-line, var(--neon-purple))"
            strokeWidth={1.5}
          />
        ))}
        <g transform={`translate(8, ${STAFF_TOP + LINE_SPACING * 3 - 10})`} className={isMuted ? 'animate-sleepy-sway' : ''} style={{ transformOrigin: '24px 20px' }}>
          <text className="font-music" fill="var(--staff-line, var(--neon-purple))" aria-label={clef === 'bass' ? 'Clave de Fa' : 'Clave de Sol'} fontSize="44" y="16">
            {clef === 'bass' ? '\u{1D122}' : '\u{1D11E}'}
          </text>
        </g>
        {isMuted && (
          <text x={6} y={STAFF_TOP + LINE_SPACING * 5 + 8} fontSize={14} fill="var(--neon-blue)" opacity={0.6} aria-hidden="true">
            {'\uD83D\uDCA4'}
          </text>
        )}
        {rangeDots}
        {trail && trail.map((entry, idx) => {
          const pos = noteToPosition(entry.note, clef)
          const y = STAFF_TOP - pos * LINE_SPACING / 2 + LINE_SPACING * 4
          const x = STAFF_LEFT + 160
          const opacity = 0.15 + (idx / (trail.length || 1)) * 0.35
          return (
            <g key={entry.id} opacity={opacity} className="animate-ghost-drift text-primary">
              <ellipse cx={x} cy={y} rx={NOTE_RADIUS * 0.6} ry={NOTE_RADIUS * 0.6 * 0.65} fill="currentColor" opacity={0.5} />
            </g>
          )
        })}
        {note && trail && trail.length > 0 && (() => {
          const prev = trail[trail.length - 1].note
          const label = intervalLabel(prev, note)
          if (!label) return null
          return (
            <text x={STAFF_LEFT + 260} y={STAFF_TOP + LINE_SPACING * 2.5} textAnchor="middle" fontSize={14} fill="var(--gold)" opacity={0.7} className="animate-slide-up">
              {label}
            </text>
          )
        })()}
        {note && (() => {
          const pos = noteToPosition(note, clef)
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
            <g key={note.midi} className="note-enter">
              {ledgerLines.map(lp => {
                const ly = STAFF_TOP - lp * LINE_SPACING / 2 + LINE_SPACING * 4
                return <line key={lp} x1={x - LEDGER_EXTEND} y1={ly} x2={x + LEDGER_EXTEND} y2={ly} stroke="var(--staff-line, var(--neon-purple))" strokeWidth={1.5} />
              })}
              {accidental && (
                <text x={x - 22} y={y + 6} fontSize={20} fill="var(--staff-line, var(--neon-purple))">{accidental}</text>
              )}
              <g className="text-primary">
                {(() => {
                  const stemUp = pos < 4
                  const stemX = stemUp ? x + NOTE_RADIUS * 0.55 : x - NOTE_RADIUS * 0.55
                  const yAttach = stemUp ? y - NOTE_RADIUS * 0.35 : y + NOTE_RADIUS * 0.35
                  const yEnd = stemUp ? yAttach - STEM_LENGTH : yAttach + STEM_LENGTH
                  return (
                    <>
                      <ellipse cx={x} cy={y} rx={NOTE_RADIUS} ry={NOTE_RADIUS * 0.65} fill="currentColor" transform={`rotate(-18 ${x} ${y})`} />
                      <line x1={stemX} y1={yAttach} x2={stemX} y2={yEnd} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
                    </>
                  )
                })()}
              </g>
              {showNoteName && (
                <text x={x} y={y - 24} textAnchor="middle" fontSize={14} className="fill-muted-foreground">
                  {displayNoteName(note.name, notation)}{note.octave}
                </text>
              )}
              {noteExpression && (() => {
                const ey = noteExpression === 'happy' ? y - NOTE_RADIUS * 1.2 : y - NOTE_RADIUS * 0.8
                return (
                  <text x={x + NOTE_RADIUS + 18} y={ey + 4} fontSize={18} textAnchor="middle" className="animate-face-pop">
                    {noteExpression === 'happy' ? '\u263A' : '\u2639'}
                  </text>
                )
              })()}
            </g>
          )
        })()}

        {lastCorrectNote && note && lastCorrectNote.midi !== note.midi && (() => {
          const pos = noteToPosition(lastCorrectNote, clef)
          const y = STAFF_TOP - pos * LINE_SPACING / 2 + LINE_SPACING * 4
          const x = STAFF_LEFT + 160
          const accidental = getAccidental(lastCorrectNote.name)
          const ledgerLines: number[] = []
          if (pos < 0) {
            for (let p = -2; p >= pos; p -= 2) ledgerLines.push(p)
          } else if (pos > 8) {
            for (let p = 10; p <= pos; p += 2) ledgerLines.push(p)
          }
          return (
            <g key="last-correct" opacity={0.3}>
              {ledgerLines.map(lp => {
                const ly = STAFF_TOP - lp * LINE_SPACING / 2 + LINE_SPACING * 4
                return <line key={lp} x1={x - LEDGER_EXTEND} y1={ly} x2={x + LEDGER_EXTEND} y2={ly} stroke="var(--staff-line)" strokeWidth={1.5} />
              })}
              {accidental && (
                <text x={x - 22} y={y + 6} fontSize={20} fill="var(--staff-line)">{accidental}</text>
              )}
              <g className="text-destructive">
                <ellipse cx={x} cy={y} rx={NOTE_RADIUS} ry={NOTE_RADIUS * 0.65} fill="currentColor" transform={`rotate(-18 ${x} ${y})`} />
              </g>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
