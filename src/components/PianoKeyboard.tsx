import { useMemo } from 'react'
import { Note } from '../types'
import { cn } from '../lib/utils'

interface PianoKeyboardProps {
  onPlayNote: (note: Note) => void
  highlightKey?: number | null
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function isBlack(midi: number): boolean {
  return NOTE_NAMES[midi % 12].includes('#')
}

const KEYBOARD_RANGE = { start: 48, count: 37 }

export default function PianoKeyboard({ onPlayNote, highlightKey }: PianoKeyboardProps) {
  const { start, count } = KEYBOARD_RANGE
  const keys = useMemo(() => Array.from({ length: count }, (_, i) => start + i), [start, count])
  const whiteKeys = keys.filter(m => !isBlack(m))
  const blackKeyPositions = keys.map((midi, i) => {
    if (!isBlack(midi)) return null
    const prevWhiteCount = keys.slice(0, i).filter(m => !isBlack(m)).length
    return { midi, offset: prevWhiteCount * 44 - 14 }
  })

  return (
    <div className="flex justify-center py-4 select-none">
      <div className="flex relative h-40" role="group" aria-label="Piano keyboard">
        {whiteKeys.map(midi => {
          const octave = Math.floor(midi / 12) - 1
          const name = NOTE_NAMES[midi % 12]
          const isHighlighted = highlightKey === midi
          return (
            <div
              key={midi}
              className={cn(
                'w-11 h-40 border border-gray-400 rounded-b-md bg-white cursor-pointer flex flex-col justify-end items-center pb-2 text-xs text-gray-400 transition-colors duration-100 hover:bg-amber-50 active:bg-red-100',
                isHighlighted && '!bg-red-500'
              )}
              role="button"
              tabIndex={0}
              aria-label={`Note ${name}${octave}`}
              onMouseDown={() => onPlayNote({ name: name as Note['name'], octave, midi })}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPlayNote({ name: name as Note['name'], octave, midi }) } }}
            />
          )
        })}
        {blackKeyPositions.map(k => {
          if (!k) return null
          const octave = Math.floor(k.midi / 12) - 1
          const name = NOTE_NAMES[k.midi % 12]
          const isHighlighted = highlightKey === k.midi
          return (
            <div
              key={k.midi}
              className="absolute w-0 z-10"
              style={{ left: k.offset }}
            >
              <div
                className={cn(
                  'w-7 h-24 border border-gray-600 rounded-b-md bg-gray-800 cursor-pointer transition-colors duration-100 hover:bg-gray-600',
                  isHighlighted && '!bg-blue-500'
                )}
                role="button"
                tabIndex={0}
                aria-label={`Note ${name}${octave}`}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  onPlayNote({ name: name as Note['name'], octave, midi: k.midi })
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onPlayNote({ name: name as Note['name'], octave, midi: k.midi }) } }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
