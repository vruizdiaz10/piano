import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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

function useIsPortraitMobile() {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsPortraitMobile(window.innerWidth < 480)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isPortraitMobile
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isDesktop
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
const PORTRAIT_KEY_COUNT = 14

function findNearestCToMidi(midi: number): number {
  const noteIndex = midi % 12
  return noteIndex === 0 ? midi : midi - noteIndex
}

export default function PianoKeyboard({ onPlayNote, highlightKey, correctKey, wrongKey, startMidi, count: countProp }: PianoKeyboardProps) {
  const isMobile = useIsMobile()
  const isPortraitMobile = useIsPortraitMobile()
  const isDesktop = useIsDesktop()

  const defaultStart = startMidi ?? KEYBOARD_RANGE.start
  const defaultCount = countProp ?? KEYBOARD_RANGE.count

  const [portraitStart, setPortraitStart] = useState(() => {
    const c = findNearestCToMidi(defaultStart)
    return Math.max(c, 24)
  })

  let actualStart: number
  let actualCount: number

  if (isPortraitMobile) {
    actualStart = portraitStart
    actualCount = PORTRAIT_KEY_COUNT
  } else if (isMobile) {
    actualStart = 48
    actualCount = 24
  } else {
    actualStart = defaultStart
    actualCount = defaultCount
  }

  const keys = useMemo(() => Array.from({ length: actualCount }, (_, i) => actualStart + i), [actualStart, actualCount])
  const whiteKeys = useMemo(() => keys.filter(m => !isBlack(m)), [keys])

  const containerRef = useRef<HTMLDivElement>(null)
  const [keyW, setKeyW] = useState(44)

  useLayoutEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setKeyW(containerRef.current.clientWidth / whiteKeys.length)
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
  const blackKeyH = isDesktop ? 100 * 0.6 : 160 * 0.6

  const containerWidth = whiteKeys.length * keyW

  const shiftOctave = (dir: number) => {
    setPortraitStart(prev => {
      const next = prev + dir * 12
      return Math.max(24, Math.min(next, 96 - PORTRAIT_KEY_COUNT))
    })
  }

  return (
    <div className="border border-[var(--gold-dim)]/50 rounded-lg shadow-inner shadow-[var(--ebony)]/10">
      {isPortraitMobile && (
        <div className="flex justify-center gap-2 py-1">
          <button
            type="button"
            className="px-3 py-1 text-sm rounded bg-[var(--gold-dim)]/30 text-foreground active:bg-[var(--gold-dim)]/50"
            onClick={() => shiftOctave(-1)}
          >
            &#9664;
          </button>
          <span className="text-xs text-muted-foreground self-center">
            C{Math.floor(portraitStart / 12) - 1} – C{Math.floor((portraitStart + PORTRAIT_KEY_COUNT) / 12) - 1}
          </span>
          <button
            type="button"
            className="px-3 py-1 text-sm rounded bg-[var(--gold-dim)]/30 text-foreground active:bg-[var(--gold-dim)]/50"
            onClick={() => shiftOctave(1)}
          >
            &#9654;
          </button>
        </div>
      )}
      <div ref={containerRef} className="py-1.5 select-none">
        <div className="flex relative h-36 lg:h-[100px] mx-auto" style={{ width: containerWidth }} role="group" aria-label="Teclado de piano">
        {whiteKeys.map(midi => {
          const octave = Math.floor(midi / 12) - 1
          const name = NOTE_NAMES[midi % 12]
          const isHighlighted = highlightKey === midi
          const isCorrect = correctKey === midi
          const isWrong = wrongKey === midi
          return (
            <button
              key={midi}
              type="button"
              className={cn(
                'h-36 lg:h-[100px] border border-[var(--gold-dim)] rounded-b-[4px] bg-gradient-to-b from-white to-[var(--ivory)] cursor-pointer flex flex-col justify-end items-center pb-1 text-xs text-muted-foreground transition-colors duration-100 hover:bg-gradient-to-b hover:from-white hover:to-[var(--gold-light)]/10 active:bg-primary/10 key-press',
                isHighlighted && '!bg-gradient-to-b !from-primary !to-primary/80 !text-white',
                isCorrect && '!bg-success animate-key-correct',
                isWrong && 'animate-pulse-glow',
                isCorrect && 'key-sparkle relative'
              )}
              style={{ width: keyW, touchAction: 'manipulation' }}
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
              <button
                type="button"
                className={cn(
                  'border border-[var(--ebony)] rounded-b-[4px] bg-gradient-to-b from-[var(--ebony)] to-black cursor-pointer transition-colors duration-100 hover:bg-foreground/60 key-press-black',
                  isHighlighted && '!bg-accent',
                  isCorrect && '!bg-success animate-key-correct',
                  isWrong && 'animate-pulse-glow',
                  isCorrect && 'key-sparkle relative'
                )}
                style={{ width: blackKeyW, height: blackKeyH, touchAction: 'manipulation' }}
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
