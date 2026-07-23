# MIDI Calibration Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace passive MIDI range detection with an explicit hold-to-calibrate modal flow.

**Architecture:** New CalibrationModal component with 4-state FSM (waiting-low → holding-low → waiting-high → complete). Integrated into PerfilScreen via calibrate button. Auto-triggers on first MIDI connect when no range exists.

**Tech Stack:** React, TypeScript, Tailwind CSS (clay design tokens), useMidi hook

## Global Constraints

- Clay UI component system (clay-inner-panel, clay-button-secondary, clay-progress-fill, etc.)
- Tailwind CSS with custom Material Design 3 tokens (mahogany-dark, surface-bright, brass-highlight, etc.)
- Spanish UI text throughout
- useMidi hook provides `(midi: number) => void` callback pattern — note-on positive, note-off negative
- Must not break existing practice screen MIDI flow
- Modal must be dismissable (user can cancel calibration)

---

### Task 1: Create CalibrationModal component

**Files:**
- Create: `src/components/CalibrationModal.tsx`

**Interfaces:**
- Consumes: useMidi for note detection, NOTE_NAMES from utils
- Produces: `onCalibrate(range: { min: number; max: number })` callback

- [ ] **Step 1: Create CalibrationModal.tsx with 4-state FSM**

```tsx
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
    if (calibState === 'complete') return
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

      if (calibState === 'waiting-low' || calibState === 'holding-low') {
        setMinNote(midi)
        setCalibState('waiting-high')
      } else if (calibState === 'waiting-high' || calibState === 'holding-high') {
        setMaxNote(midi)
        setCalibState('complete')
        onCalibrate({ min: minNote ?? midi, max: midi })
      }
      heldNoteRef.current = null
    }, HOLD_DURATION_MS)

    setCalibState(prev => prev === 'waiting-low' ? 'holding-low' : 'holding-high')
  }, [calibState, minNote, onCalibrate])

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

  // Note-off handler
  const handleMidi = useCallback((midi: number) => {
    if (midi > 0) {
      // Note-on
      startHold(midi)
    } else {
      // Note-off (midi === -1 from timer, but real note-off comes as negative or we detect via heldNoteRef)
      cancelHold()
    }
  }, [startHold, cancelHold])

  const { midiConnected } = useMidi(handleMidi)

  // We need to detect note-off separately. useMidi passes note-on as positive, note-off as negative.
  // Actually, useMidi callback receives raw MIDI: positive = note-on, negative = note-off.
  // Let me re-check useMidi implementation.

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm gap-6"
      role="dialog"
      aria-modal="true"
      aria-label="Calibración de controlador MIDI"
    >
      {/* Cancel button */}
      <button
        onClick={onClose}
        className="absolute top-20 right-6 clay-button-secondary p-3 rounded-full"
        aria-label="Cancelar calibración"
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
      {!midiConnected && calibState !== 'complete' && (
        <p className="font-body-sm text-body-sm text-error">
          Conecta un teclado MIDI para calibrar
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
```

- [ ] **Step 2: Check useMidi for note-on/note-off behavior**

Run: grep for `useMidi` in `src/hooks/useMidi.ts` to understand callback signature — does it pass negative values for note-off, or only positive note-on values?

- [ ] **Step 3: Fix hold release detection based on useMidi behavior**

If useMidi only passes note-on (positive): track active notes via a Set ref, detect release by checking if previously held note is no longer in the active set. If useMidi passes negative for note-off: use `midi < 0` to cancel.

- [ ] **Step 4: Commit**

```bash
git add src/components/CalibrationModal.tsx
git commit -m "feat: create CalibrationModal component with hold-to-calibrate FSM"
```

---

### Task 2: Integrate CalibrationModal into PerfilScreen

**Files:**
- Modify: `src/screens/PerfilScreen.tsx`

**Interfaces:**
- Consumes: CalibrationModal component
- Produces: passes `onCalibrate` callback up to parent

- [ ] **Step 1: Add CalibrationModal import and state to PerfilScreen**

Add to PerfilScreenProps:
```typescript
onCalibrate: (range: { min: number; max: number }) => void
```

Add state:
```typescript
const [calibModalOpen, setCalibModalOpen] = useState(false)
```

Import CalibrationModal at top of file.

- [ ] **Step 2: Replace controller range section with calibrate button**

Replace the current "Controller Range" `<div>` in the settings section:

```tsx
{/* Controller Range */}
<div>
  <span className="font-title-md text-title-md text-primary block mb-3">Controlador MIDI</span>
  {controllerRange ? (
    <div className="clay-inner-panel rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-body-lg text-body-lg text-on-surface-variant">Rango:</span>
        <span className="font-body-lg text-body-lg text-on-surface font-medium">
          {formatMidiNote(controllerRange.min)} – {formatMidiNote(controllerRange.max)}
        </span>
      </div>
      <button
        onClick={() => setCalibModalOpen(true)}
        className="clay-button-secondary w-full py-2 rounded-xl font-title-sm text-title-sm"
      >
        Recalibrar
      </button>
    </div>
  ) : (
    <button
      onClick={() => setCalibModalOpen(true)}
      className="clay-btn-primary w-full py-3 rounded-xl font-title-md text-title-md"
    >
      Calibrar controlador
    </button>
  )}
</div>
```

- [ ] **Step 3: Render CalibrationModal at end of PerfilScreen return**

Before the closing `</div>` of the outermost wrapper:

```tsx
<CalibrationModal
  isOpen={calibModalOpen}
  onClose={() => setCalibModalOpen(false)}
  onCalibrate={(range) => {
    onCalibrate(range)
    setCalibModalOpen(false)
  }}
  currentRange={controllerRange}
/>
```

- [ ] **Step 4: Commit**

```bash
git add src/screens/PerfilScreen.tsx
git commit -m "feat: integrate CalibrationModal into PerfilScreen with calibrate button"
```

---

### Task 3: Wire App.tsx — auto-trigger + onCalibrate handler

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: PerfilScreen's new `onCalibrate` prop, `midiConnected` from useMidi
- Produces: persists calibration range to Firestore via updateConfig

- [ ] **Step 1: Add calibration modal state and handler**

After existing state declarations, add:
```typescript
const [calibModalOpen, setCalibModalOpen] = useState(false)
```

Add handler:
```typescript
const handleCalibrate = useCallback((range: { min: number; max: number }) => {
  updateConfig({ controllerRange: range })
}, [updateConfig])
```

- [ ] **Step 2: Add auto-trigger effect**

After the existing `useEffect` that syncs controllerRange to Firestore:

```typescript
// Auto-open calibration on first MIDI connect when no range exists
useEffect(() => {
  if (midiConnected && !config?.controllerRange) {
    setCalibModalOpen(true)
  }
}, [midiConnected, config?.controllerRange])
```

- [ ] **Step 3: Pass onCalibrate prop to PerfilScreen**

Find the PerfilScreen render in the `screen === 'perfil'` branch. Add:
```typescript
onCalibrate={handleCalibrate}
```

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add auto-trigger calibration on first MIDI connect + onCalibrate handler"
```

---

### Task 4: Build and deploy

**Files:**
- None (build + deploy only)

- [ ] **Step 1: Type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 2: Build**

```bash
npx vite build
```

- [ ] **Step 3: Deploy**

```bash
npx vercel --yes --prod
```

- [ ] **Step 4: Commit (if any fixes needed)**

```bash
git add -A && git commit -m "fix: calibration modal adjustments from build review"
```
