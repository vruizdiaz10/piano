# MIDI Octave Handling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make MIDI controllers with fewer octaves work correctly via conditional smart pitch-class detection + a toggleable octave bar UI.

**Architecture:** Two mechanisms: (1) auto-detect controller range by tracking min/max MIDI notes received, then accept pitch-class matches only when target note is outside that range; (2) a toggleable octave bar that shifts the virtual keyboard range and MIDI input offset. Both are session-state only (no Firestore persistence for range detection, octave bar shift is transient). Manual controller setup saved to Firestore via `useConfigSync`.

**Tech Stack:** React, TypeScript, Tailwind CSS (Material Design 3 tokens), Firebase/Firestore

## Global Constraints

- Follow existing clay UI component patterns (`clay-inner-panel`, `clay-button-secondary`, `clay-card`)
- Use existing Material Symbols icon set (no new icon libraries)
- Tailwind custom colors: mahogany-dark, surface-bright, brass-highlight, primary, on-surface-variant
- Fonts: EB Garamond (headlines), Hanken Grotesk (body/labels)
- Custom spacing: stack-lg (48px), stack-md (24px), container-padding (24px)
- Spanish language for all UI text
- No new npm dependencies

---

### Task 1: Add `controllerRange` to GameState type

**Files:**
- Modify: `src/types/index.ts`

**Interfaces:**
- Produces: `GameState.controllerRange: { min: number; max: number } | null`

- [ ] **Step 1: Add field to GameState**

```typescript
// src/types/index.ts — add to GameState interface, after the `clef` field:
/** Auto-detected MIDI range from controller input. null = no data yet. */
controllerRange: { min: number; max: number } | null
```

- [ ] **Step 2: Add to INITIAL_STATE in useGameState**

```typescript
// src/hooks/useGameState.ts — add to INITIAL_STATE object:
controllerRange: null,
```

- [ ] **Step 3: Verify type compiles**

Run: `npx tsc --noEmit`
Expected: PASS (no errors related to missing field — INITIAL_STATE must match)

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/hooks/useGameState.ts
git commit -m "feat: add controllerRange to GameState type"
```

---

### Task 2: Implement conditional smart detection in `submitAnswer`

**Files:**
- Modify: `src/hooks/useGameState.ts:67-112` (submitAnswer function)

**Interfaces:**
- Consumes: `GameState.controllerRange` (from Task 1)
- Produces: Modified `submitAnswer` that accepts pitch-class matches when target is outside controller range

- [ ] **Step 1: Update controller range on each MIDI input**

At the top of `submitAnswer`, after the `if (prev.phase === 'waiting' && prev.currentNote)` check, update the range:

```typescript
const submitAnswer = useCallback((midi: number) => {
  setState(prev => {
    if (prev.phase === 'waiting' && prev.currentNote) {
      // Update controller range (skip timer-expired -1 values)
      let controllerRange = prev.controllerRange
      if (midi > 0) {
        if (!controllerRange) {
          controllerRange = { min: midi, max: midi }
        } else {
          controllerRange = {
            min: Math.min(controllerRange.min, midi),
            max: Math.max(controllerRange.max, midi),
          }
        }
      }

      // Conditional smart detection: pitch-class match when target outside range
      const target = prev.currentNote
      const exactMatch = midi === target.midi

      let isCorrect = exactMatch
      if (!exactMatch && midi > 0 && controllerRange) {
        const targetOutsideRange = target.midi < controllerRange.min || target.midi > controllerRange.max
        if (targetOutsideRange) {
          isCorrect = (target.midi % 12) === (midi % 12)
        }
      }

      // Track the target note that was missed (not the wrong key pressed)
      if (!isCorrect) addWeakNote(prev.currentNote.midi)
      const newStreak = isCorrect ? prev.streak + 1 : 0
      const newTotal = prev.totalAttempts + 1
      const newCorrect = prev.correctAttempts + (isCorrect ? 1 : 0)
      const newBestStreak = Math.max(prev.bestStreak, newStreak)
      const sessionDone = newTotal >= prev.sessionTarget

      const errorType: ErrorType | null = (isCorrect || midi === -1) ? null : analyzeError(prev.currentNote, midi)
      const responseTime = Date.now() - prev.noteShownAt

      return {
        ...prev,
        controllerRange,
        phase: sessionDone ? 'levelComplete' : 'feedback',
        lastAnswerCorrect: isCorrect,
        lastAnswerMidi: midi,
        lastErrorType: errorType,
        recovering: !isCorrect && !sessionDone,
        streak: newStreak,
        bestStreak: newBestStreak,
        totalAttempts: newTotal,
        correctAttempts: newCorrect,
        responseTimes: [...prev.responseTimes, responseTime],
        lastCorrectNote: isCorrect ? null : prev.currentNote,
      }
    }
    // ... rest of submitAnswer (feedback/recovering phase) unchanged
```

- [ ] **Step 2: Also update range in the recovering phase**

In the `if (prev.phase === 'feedback' && prev.recovering)` branch, also update controllerRange when midi > 0, same pattern as above. Add `controllerRange` to the returned state.

- [ ] **Step 3: Reset controllerRange on startGame and restartGame**

In `startGame` and `restartGame` callbacks, add `controllerRange: null` to the returned state so range resets each session.

- [ ] **Step 4: Verify type compiles**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useGameState.ts
git commit -m "feat: conditional smart pitch-class detection for out-of-range MIDI notes"
```

---

### Task 3: Add `controllerRange` to Firestore UserDoc + useConfigSync

**Files:**
- Modify: `src/firebase/firestore.ts:12-39` (UserDoc interface)
- Modify: `src/hooks/useConfigSync.ts:5` (ConfigField type)

**Interfaces:**
- Produces: `UserDoc.controllerRange?: { min: number; max: number }` — persisted manual controller setup

- [ ] **Step 1: Add to UserDoc**

```typescript
// src/firebase/firestore.ts — add to UserDoc interface:
controllerRange?: { min: number; max: number }
```

- [ ] **Step 2: Add to ConfigField and load function**

```typescript
// src/hooks/useConfigSync.ts — update ConfigField type:
type ConfigField = 'notation' | 'theme' | 'timed' | 'showNoteName' | 'sessionTarget' | 'dailyStreak' | 'lastPlayDate' | 'level' | 'quickLessonConfig' | 'controllerRange'

// In the load function's setConfig call, add:
controllerRange: doc.controllerRange,
```

- [ ] **Step 3: Verify type compiles**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/firebase/firestore.ts src/hooks/useConfigSync.ts
git commit -m "feat: add controllerRange to Firestore UserDoc and useConfigSync"
```

---

### Task 4: Create OctaveBar component

**Files:**
- Create: `src/components/OctaveBar.tsx`

**Interfaces:**
- Consumes: `shift: number`, `onShiftChange: (shift: number) => void`, `baseStart: number`
- Produces: Rendered octave bar with +/- arrows and range label

- [ ] **Step 1: Create OctaveBar.tsx**

```tsx
// src/components/OctaveBar.tsx
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
  const high = low + 24 // 2-octave range

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
```

- [ ] **Step 2: Verify type compiles**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/OctaveBar.tsx
git commit -m "feat: create OctaveBar component for manual octave shifting"
```

---

### Task 5: Wire OctaveBar into App.tsx

**Files:**
- Modify: `src/App.tsx` (state, MIDI handling, render)

**Interfaces:**
- Consumes: `OctaveBar` component (from Task 4), `GameState.controllerRange` (from Task 1-2)
- Produces: Octave bar visible when toggled, MIDI input offset applied, keyboardStart shifted

- [ ] **Step 1: Add state variables**

```typescript
// src/App.tsx — add after existing state declarations (around line 65):
const [octaveBarVisible, setOctaveBarVisible] = useState(false)
const [octaveShift, setOctaveShift] = useState(0)
```

- [ ] **Step 2: Modify keyboardStart to include shift**

```typescript
// src/App.tsx line 179 — replace:
const keyboardStart = state.clef === 'both' ? 36 : (currentLesson?.clef === 'bass' ? 36 : 48)
// With:
const baseKeyboardStart = state.clef === 'both' ? 36 : (currentLesson?.clef === 'bass' ? 36 : 48)
const keyboardStart = baseKeyboardStart + (octaveShift * 12)
```

- [ ] **Step 3: Apply MIDI input offset**

```typescript
// src/App.tsx — in the useMidi callback (line 184-189), apply offset:
const { midiConnected } = useMidi(
  useCallback((midi: number) => {
    if (isPaused) return
    if (state.phase === 'waiting' || (state.phase === 'feedback' && state.recovering)) {
      const adjustedMidi = midi - (octaveShift * 12)
      submitAnswer(adjustedMidi)
    }
  }, [state.phase, state.recovering, submitAnswer, isPaused, octaveShift])
)
```

- [ ] **Step 4: Render OctaveBar + toggle button**

In the practice screen render, add the octave bar between feedback and progress bar, and a toggle button in the controls row:

```tsx
{/* After the Feedback div (line 541), before progress bar */}

{/* Octave Bar — toggleable */}
{octaveBarVisible && (
  <div className="w-full max-w-3xl px-4 mb-2 shrink-0">
    <OctaveBar shift={octaveShift} onShiftChange={setOctaveShift} baseStart={baseKeyboardStart} />
  </div>
)}
```

Add toggle button in the controls row (after the MIDI indicator, before the sound button):

```tsx
<ControlButton
  icon="piano"
  label={octaveBarVisible ? 'Cerrar octava' : 'Octavas'}
  onClick={() => setOctaveBarVisible(!octaveBarVisible)}
  active={octaveBarVisible}
/>
```

- [ ] **Step 5: Import OctaveBar**

```typescript
import OctaveBar from './components/OctaveBar'
```

- [ ] **Step 6: Verify type compiles**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/components/OctaveBar.tsx
git commit -m "feat: wire OctaveBar into practice screen with MIDI offset"
```

---

### Task 6: Add manual controller setup to PerfilScreen

**Files:**
- Modify: `src/screens/PerfilScreen.tsx`
- Modify: `src/App.tsx` (pass props)

**Interfaces:**
- Consumes: `config.controllerRange` (from Task 3), `updateConfig` from useConfigSync
- Produces: "Configurar controlador" section in PerfilScreen, saves manual range to Firestore

- [ ] **Step 1: Add props to PerfilScreen**

```typescript
// src/screens/PerfilScreen.tsx — add to PerfilScreenProps:
controllerRange?: { min: number; max: number }
onControllerRangeChange?: (range: { min: number; max: number }) => void
```

Add to the destructured props:
```typescript
controllerRange,
onControllerRangeChange,
```

- [ ] **Step 2: Add controller setup UI**

After the difficulty settings section (line 138), before "Mi Perfil":

```tsx
{/* Controller Setup */}
{onControllerRangeChange && (
  <div>
    <span className="font-title-md text-title-md text-primary block mb-3">Controlador MIDI</span>
    {controllerRange ? (
      <div className="flex items-center gap-3">
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          Rango detectado: {formatMidiNote(controllerRange.min)} – {formatMidiNote(controllerRange.max)}
        </span>
        <button
          onClick={() => onControllerRangeChange({ min: 0, max: 127 })}
          className="clay-button-secondary py-2 px-3 rounded-xl font-body-sm text-body-sm"
        >
          Restablecer
        </button>
      </div>
    ) : (
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Conecta un controlador MIDI para auto-detectar el rango.
      </p>
    )}
  </div>
)}
```

Add a local helper at the top of PerfilScreen (after imports):

```typescript
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
function formatMidiNote(midi: number): string {
  return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`
}
```

- [ ] **Step 3: Wire in App.tsx**

```typescript
// src/App.tsx — in the perfil screen render, add props:
<PerfilScreen
  // ... existing props
  controllerRange={config?.controllerRange}
  onControllerRangeChange={(range) => updateConfig({ controllerRange: range })}
/>
```

- [ ] **Step 4: Verify type compiles**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/screens/PerfilScreen.tsx src/App.tsx
git commit -m "feat: add manual controller range display in PerfilScreen"
```

---

### Task 7: Build and deploy

**Files:** None (verification only)

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 2: Build**

Run: `npx vite build`
Expected: PASS

- [ ] **Step 3: Deploy**

Run: `npx vercel --yes --prod`
Expected: Deployment URL returned

- [ ] **Step 4: Commit any fixups**

```bash
git add -A
git commit -m "fix: type-check and build fixes for MIDI octave handling"
```
