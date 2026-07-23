import { useState, useCallback, useEffect, useRef } from 'react'
import { useMidi } from '../hooks/useMidi'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
const HOLD_DURATION_MS = 2000

function formatMidiNote(midi: number): string {
  const name = NOTE_NAMES[midi % 12]
  const octave = Math.floor(midi / 12) - 1
  return `${name}${octave}`
}

type CalibState = 'waiting-low' | 'holding-low' | 'waiting-high' | 'holding-high' | 'complete'

interface CalibrationModalProps {
  isOpen: boolean
  onClose: () => void
  onCalibrate: (range: { min: number; max: number }) => void
  currentRange?: { min: number; max: number } | null
}

export default function CalibrationModal({ isOpen, onClose, onCalibrate, currentRange }: CalibrationModalProps) {
  const [calibState, setCalibState] = useState<CalibState>('waiting-low')
  const [holdProgress, setHoldProgress] = useState(0)
  const [minNote, setMinNote] = useState<number | null>(null)
  const [maxNote, setMaxNote] = useState<number | null>(null)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const progressRef = useRef<ReturnType<typeof setInterval>>()
  const heldNoteRef = useRef<number | null>(null)
  const calibStateRef = useRef(calibState)
  const minNoteRef = useRef(minNote)

  // Keep refs in sync with state for use inside callbacks without stale closures
  calibStateRef.current = calibState
  minNoteRef.current = minNote

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCalibState('waiting-low')
      setHoldProgress(0)
      setMinNote(null)
      setMaxNote(null)
      heldNoteRef.current = null
    }
  }, [isOpen])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [])

  const startHold = useCallback((midi: number) => {
    if (calibStateRef.current === 'complete') return
    if (heldNoteRef.current !== null) return // already holding a note

    heldNoteRef.current = midi
    setHoldProgress(0)

    const startTime = Date.now()
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / HOLD_DURATION_MS, 1)
      setHoldProgress(progress)
      if (progress >= 1) {
        clearInterval(progressRef.current)
      }
    }, 50)

    holdTimerRef.current = setTimeout(() => {
      if (progressRef.current) clearInterval(progressRef.current)
      setHoldProgress(1)

      if (calibStateRef.current === 'waiting-low' || calibStateRef.current === 'holding-low') {
        setMinNote(midi)
        setCalibState('waiting-high')
      } else if (calibStateRef.current === 'waiting-high' || calibStateRef.current === 'holding-high') {
        setMaxNote(midi)
        setCalibState('complete')
        onCalibrate({ min: minNoteRef.current ?? midi, max: midi })
      }
      heldNoteRef.current = null
    }, HOLD_DURATION_MS)

    setCalibState(prev => prev === 'waiting-low' ? 'holding-low' : 'holding-high')
  }, [onCalibrate])

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    if (progressRef.current) clearInterval(progressRef.current)
    heldNoteRef.current = null
    setHoldProgress(0)
    setCalibState(prev => {
      if (prev === 'holding-low') return 'waiting-low'
      if (prev === 'holding-high') return 'waiting-high'
      return prev
    })
  }, [])

  useMidi(startHold, cancelHold)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm gap-6"
      role="dialog"
      aria-modal="true"
      aria-label="Calibracion de controlador MIDI"
    >
      {/* Cancel button */}
      <button
        onClick={onClose}
        className="absolute top-20 right-6 clay-button-secondary p-3 rounded-full"
        aria-label="Cancelar calibracion"
      >
        <span className="material-symbols-outlined text-primary">close</span>
      </button>

      {/* Icon */}
      <div className="clay-icon-raised w-20 h-20 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: 40 }}>piano</span>
      </div>

      {/* Prompt */}
      <div className="text-center px-6">
        {calibState === 'waiting-low' && (
          <>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2">Paso 1 de 2</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Toca y mantén la nota más grave de tu controlador
            </p>
          </>
        )}
        {calibState === 'holding-low' && (
          <>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2">Paso 1 de 2</h2>
            <p className="font-body-lg text-body-lg text-on-surface">
              Manteniendo... {heldNoteRef.current !== null ? formatMidiNote(heldNoteRef.current) : ''}
            </p>
          </>
        )}
        {calibState === 'waiting-high' && (
          <>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2">Paso 2 de 2</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Ahora toca y mantén la nota más aguda
            </p>
          </>
        )}
        {calibState === 'holding-high' && (
          <>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2">Paso 2 de 2</h2>
            <p className="font-body-lg text-body-lg text-on-surface">
              Manteniendo... {heldNoteRef.current !== null ? formatMidiNote(heldNoteRef.current) : ''}
            </p>
          </>
        )}
        {calibState === 'complete' && (
          <>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2">¡Calibrado!</h2>
            <p className="font-body-lg text-body-lg text-on-surface mb-1">
              Rango: {formatMidiNote(minNote ?? 0)} – {formatMidiNote(maxNote ?? 0)}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Las notas fuera de este rango se aceptan por nombre (pitch class).
            </p>
          </>
        )}
      </div>

      {/* Progress bar */}
      {(calibState === 'holding-low' || calibState === 'holding-high') && (
        <div className="w-64 h-2 rounded-full clay-progress-bar overflow-hidden">
          <div
            className="h-full rounded-full transition-none clay-progress-fill"
            style={{ width: `${holdProgress * 100}%` }}
          />
        </div>
      )}

      {/* Connection status */}
      {/* midiConnected removed — useMidi returns it but we don't block on it here;
          if no device is connected the user simply won't receive noteOn events */}
      {calibState !== 'complete' && calibState === 'waiting-low' && (
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Conecta un teclado MIDI y toca una nota para comenzar
        </p>
      )}

      {/* Done button */}
      {calibState === 'complete' && (
        <button
          onClick={onClose}
          className="clay-btn-primary px-8 py-3 rounded-xl font-title-md text-title-md"
        >
          Listo
        </button>
      )}
    </div>
  )
}
