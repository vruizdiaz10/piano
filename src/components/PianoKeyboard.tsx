import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Note } from '../types'
import { cn } from '../lib/utils'

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false)
  useLayoutEffect(() => {
    const mq = window.matchMedia('(orientation: landscape) and (max-height: 600px)')
    setMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return mobile
}

interface PianoKeyboardProps {
  onPlayNote: (note: Note) => void
  highlightKey?: number | null
  correctKey?: number | null
  wrongKey?: number | null
  startMidi?: number
  count?: number
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function isBlack(midi: number): boolean {
  return NOTE_NAMES[midi % 12].includes('#')
}

const KEYBOARD_RANGE = { start: 48, count: 37 }

export default function PianoKeyboard({ onPlayNote, highlightKey, correctKey, wrongKey, startMidi, count: countProp }: PianoKeyboardProps) {
  const isMobile = useIsMobile()
  const start = startMidi ?? KEYBOARD_RANGE.start
  const count = countProp ?? KEYBOARD_RANGE.count
  const [actualStart, actualCount] = isMobile ? [48, 24] : [start, count]
  const keys = useMemo(() => Array.from({ length: actualCount }, (_, i) => actualStart + i), [actualStart, actualCount])
  const whiteKeys = useMemo(() => keys.filter(m => !isBlack(m)), [keys])

  const containerRef = useRef<HTMLDivElement>(null)
  const [keyW, setKeyW] = useState(44)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setKeyW(containerRef.current.clientWidth / whiteKeys.length)
        setReady(true)
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [whiteKeys.length])

  const blackKeyData = useMemo(() => {
    return keys.map((midi, i) => {
      if (!isBlack(midi)) return null
      const prevWhiteCount = keys.slice(0, i).filter(m => !isBlack(m)).length
      return { midi, offset: prevWhiteCount * keyW - keyW * 0.32 }
    })
  }, [keys, keyW])

  const blackKeyW = keyW * 0.6
  const blackKeyH = 160 * 0.6

  return (
    <div className="border border-[var(--gold-dim)]/50 rounded-lg shadow-inner shadow-[var(--ebony)]/10">
      <div ref={containerRef} className={`py-2 select-none transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex relative h-36 mx-auto" role="group" aria-label="Teclado de piano">
        {whiteKeys.map(midi => {
          const octave = Math.floor(midi / 12) - 1
          const name = NOTE_NAMES[midi % 12]
          const isHighlighted = highlightKey === midi
          const isCorrect = correctKey === midi
          const isWrong = wrongKey === midi
          return (
            <div
              key={midi}
              className={cn(
                'h-36 border border-[var(--gold-dim)] rounded-b-[4px] bg-gradient-to-b from-white to-[var(--ivory)] cursor-pointer flex flex-col justify-end items-center pb-1 text-xs text-muted-foreground transition-colors duration-100 hover:bg-gradient-to-b hover:from-white hover:to-[var(--gold-light)]/10 active:bg-primary/10 key-press',
                isHighlighted && '!bg-gradient-to-b !from-primary !to-primary/80 !text-white',
                isCorrect && '!bg-success animate-key-correct',
                isWrong && 'animate-pulse-glow',
                isCorrect && 'key-sparkle relative'
              )}
              style={{ width: keyW }}
              role="button"
              tabIndex={0}
              aria-label={`Nota ${name}${octave}`}
              onMouseDown={() => onPlayNote({ name: name as Note['name'], octave, midi })}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPlayNote({ name: name as Note['name'], octave, midi }) } }}
            />
          )
        })}
        {blackKeyData.map(k => {
          if (!k) return null
          const octave = Math.floor(k.midi / 12) - 1
          const name = NOTE_NAMES[k.midi % 12]
          const isHighlighted = highlightKey === k.midi
          const isCorrect = correctKey === k.midi
          const isWrong = wrongKey === k.midi
          return (
            <div
              key={k.midi}
              className="absolute z-10"
              style={{ left: k.offset }}
            >
              <div
                className={cn(
                  'border border-[var(--ebony)] rounded-b-[4px] bg-gradient-to-b from-[var(--ebony)] to-black cursor-pointer transition-colors duration-100 hover:bg-foreground/60 key-press-black',
                  isHighlighted && '!bg-accent',
                  isCorrect && '!bg-success animate-key-correct',
                  isWrong && 'animate-pulse-glow',
                  isCorrect && 'key-sparkle relative'
                )}
                style={{ width: blackKeyW, height: blackKeyH }}
                role="button"
                tabIndex={0}
                aria-label={`Nota ${name}${octave}`}
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
    </div>
  )
}
