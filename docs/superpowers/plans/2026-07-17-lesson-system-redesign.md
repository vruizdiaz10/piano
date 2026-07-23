# Lesson System Redesign — Sequential + Quick Lessons

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split lessons into sequential (18 fixed lessons in library) and quick (custom generator on dashboard replacing "Elige tu Desafío").

**Architecture:** Extend types with `QuickLessonConfig` and `'both'` clef. Add `customPool` to `GameState` for pool injection. New `buildCustomPool()` utility with correct position classification (even=lines, odd=spaces). `computeMasteryStatus` exported from dashboardStats for BibliotecaScreen. DashboardScreen keeps backward-compat props, only adds `onQuickLesson`. Sessions variable lifted to AppContent top.

**Tech Stack:** TypeScript, React hooks, Tailwind CSS

## Global Constraints

- Spanish language only
- Light mode only
- No new npm dependencies
- `tsc --noEmit` must pass
- `vite build` must succeed

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/types/index.ts` | **MODIFY** | Add `QuickLessonConfig`, extend `Clef`, add `customPool`/`clef` to `GameState` |
| `src/hooks/useGameState.ts` | **MODIFY** | Accept pool param in `startGame`, use `customPool` in `selectNote`, clear pool when no pool passed |
| `src/utils/notePool.ts` | **CREATE** | `buildCustomPool(config)` — position-based MIDI pool builder |
| `src/utils/dashboardStats.ts` | **MODIFY** | Export `computeMasteryStatus()` wrapping existing `isMastered`/`bestAccuracyForLesson` |
| `src/screens/DashboardScreen.tsx` | **MODIFY** | Add generator (keep existing props), onboarding banner, use clay-switch/clay-input-key tokens |
| `src/screens/BibliotecaScreen.tsx` | **MODIFY** | Wire to real LESSONS, `lesson.desc`, completion counters, `gap-6` spacing |
| `src/App.tsx` | **MODIFY** | Custom pool plumbing, `lastSequentialLesson`, lift `sessions`, clear old Dashboard props, start button label |

---

### Task 1: Extend types + add computeMasteryStatus

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/hooks/useGameState.ts` (INITIAL_STATE only)
- Modify: `src/utils/dashboardStats.ts` (add export)

**Interfaces:**
- Produces: `QuickLessonConfig`, extended `Clef`, `customPool`/`clef` on `GameState`, `computeMasteryStatus()` — consumed by Tasks 2–7

- [ ] **Step 1: Add QuickLessonConfig interface to types**

Add after the existing type definitions (after the `ErrorType` type):

```ts
export interface QuickLessonConfig {
  clef: 'treble' | 'bass' | 'both'
  lines: boolean
  spaces: boolean
  ledgerAbove: number  // 0-3
  ledgerBelow: number  // 0-3
  sharps: boolean
  timed: boolean
  noteCount: 5 | 10 | 20
}
```

- [ ] **Step 2: Extend Clef type**

Change line 1 from:

```ts
export type Clef = 'treble' | 'bass'
```

to:

```ts
export type Clef = 'treble' | 'bass' | 'both'
```

- [ ] **Step 3: Add customPool and clef to GameState**

Add these two fields to the `GameState` interface, after `isTimed: boolean`:

```ts
  customPool?: number[]
  /** Display-only: used for staff rendering and clef switching. Note selection uses customPool. */
  clef: Clef
```

- [ ] **Step 4: Add clef to INITIAL_STATE in useGameState.ts**

In `src/hooks/useGameState.ts`, add `clef: 'treble'` to the `INITIAL_STATE` object (after `isTimed: false`):

```ts
  clef: 'treble',
```

- [ ] **Step 5: Export computeMasteryStatus from dashboardStats.ts**

Add at the end of `src/utils/dashboardStats.ts` (after `weeklyAccuracyPath`):

```ts
export interface MasteryStatus {
  mastered: boolean
  unlocked: boolean
  bestAccuracy: number
}

export function computeMasteryStatus(lessonId: string, sessions: SessionRecord[]): MasteryStatus {
  const lesson = LESSONS.find(l => l.id === lessonId)
  if (!lesson) return { mastered: false, unlocked: false, bestAccuracy: 0 }
  const mastered = isMastered(lesson, sessions)
  const clefLessons = LESSONS.filter(l => l.clef === lesson.clef)
  const lessonIdx = clefLessons.findIndex(l => l.id === lessonId)
  const unlocked = lessonIdx === 0 || clefLessons.slice(0, lessonIdx).every(l => isMastered(l, sessions))
  return { mastered, unlocked, bestAccuracy: bestAccuracyForLesson(lessonId, sessions) }
}
```

- [ ] **Step 6: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/types/index.ts src/hooks/useGameState.ts src/utils/dashboardStats.ts
git commit -m "feat: extend types for lesson system redesign, add computeMasteryStatus"
```

---

### Task 2: Build custom pool utility

**Files:**
- Create: `src/utils/notePool.ts`

**Interfaces:**
- Consumes: `LESSONS` from `src/data/lessons.ts`, `midiToNote` from `src/utils/midiToNote.ts`, `noteToPosition` from `src/utils/noteToPosition.ts`
- Consumes: `QuickLessonConfig` from Task 1
- Produces: `buildCustomPool(config: QuickLessonConfig): number[]` — used by Task 6 (App.tsx)

**Key facts about existing data:**
- Lesson IDs for bass ledger: `'bass-above'`, `'bass-below'` (NOT `'bass-above-staff'`)
- Lesson IDs for accidentals: `'accidentals'`, `'bass-accidentals'` (no `'sharp'` substring exists)
- Position classification: even positions = lines (0,2,4,6,8), odd = spaces (1,3,5,7)

- [ ] **Step 1: Create the pool builder**

```ts
// src/utils/notePool.ts
import { QuickLessonConfig } from '../types'
import { LESSONS } from '../data/lessons'
import { midiToNote } from './midiToNote'
import { noteToPosition } from './noteToPosition'

function isLinePosition(midi: number, clef: 'treble' | 'bass'): boolean {
  try {
    const note = midiToNote(midi)
    const pos = noteToPosition(note, clef)
    return pos % 2 === 0 // even positions = lines (0,2,4,6,8)
  } catch {
    return false
  }
}

function isSpacePosition(midi: number, clef: 'treble' | 'bass'): boolean {
  try {
    const note = midiToNote(midi)
    const pos = noteToPosition(note, clef)
    return pos % 2 !== 0 // odd positions = spaces (1,3,5,7)
  } catch {
    return false
  }
}

function filterByPosition(
  midiPool: number[],
  clef: 'treble' | 'bass',
  lines: boolean,
  spaces: boolean,
): number[] {
  if (lines && spaces) return midiPool
  return midiPool.filter(midi => {
    if (lines && isLinePosition(midi, clef)) return true
    if (spaces && isSpacePosition(midi, clef)) return true
    return false
  })
}

/**
 * Build a MIDI note pool from a QuickLessonConfig.
 * Filters existing lesson pools by position classification (line/space),
 * adds ledger lines and sharps with the same filter applied.
 */
export function buildCustomPool(config: QuickLessonConfig): number[] {
  const { clef, lines, spaces, ledgerAbove, ledgerBelow, sharps } = config

  // 1. Base pool by clef
  let allMidi: number[]
  if (clef === 'both') {
    const treblePool = LESSONS.filter(l => l.clef === 'treble').flatMap(l => l.pool)
    const bassPool = LESSONS.filter(l => l.clef === 'bass')
      .flatMap(l => l.pool)
      .filter(m => m < 60 || m > 64) // remove overlap zone (C4-E4)
    allMidi = [...new Set([...treblePool, ...bassPool])]
  } else {
    allMidi = [...new Set(LESSONS.filter(l => l.clef === clef).flatMap(l => l.pool))]
  }

  // 2. Filter by lines/spaces
  const targetClef = clef === 'both' ? 'treble' : clef
  let filtered = filterByPosition(allMidi, targetClef, lines, spaces)

  // For 'both' clef, also filter bass notes using bass clef classification
  if (clef === 'both') {
    const bassMidi = allMidi.filter(m => m < 60)
    const trebleMidi = allMidi.filter(m => m >= 60)
    const filteredBass = filterByPosition(bassMidi, 'bass', lines, spaces)
    const filteredTreble = filterByPosition(trebleMidi, 'treble', lines, spaces)
    filtered = [...new Set([...filteredTreble, ...filteredBass])]
  }

  // 3. Add ledger lines above (with same line/space filter)
  if (ledgerAbove > 0) {
    const addLedger = (lessonId: string, ledgerClef: 'treble' | 'bass') => {
      const lesson = LESSONS.find(l => l.id === lessonId)
      if (!lesson) return
      const filteredNotes = filterByPosition(lesson.pool, ledgerClef, lines, spaces)
      const count = Math.min(ledgerAbove, filteredNotes.length)
      for (let i = 0; i < count; i++) filtered.push(filteredNotes[i])
    }
    if (clef === 'treble' || clef === 'both') addLedger('above-staff', 'treble')
    if (clef === 'bass' || clef === 'both') addLedger('bass-above', 'bass')
  }

  // 4. Add ledger lines below (with same line/space filter)
  if (ledgerBelow > 0) {
    const addLedger = (lessonId: string, ledgerClef: 'treble' | 'bass') => {
      const lesson = LESSONS.find(l => l.id === lessonId)
      if (!lesson) return
      const filteredNotes = filterByPosition(lesson.pool, ledgerClef, lines, spaces)
      const count = Math.min(ledgerBelow, filteredNotes.length)
      for (let i = 0; i < count; i++) filtered.push(filteredNotes[i])
    }
    if (clef === 'treble' || clef === 'both') addLedger('below-staff', 'treble')
    if (clef === 'bass' || clef === 'both') addLedger('bass-below', 'bass')
  }

  // 5. Add sharps (with same line/space filter)
  if (sharps) {
    const accidentalIds = clef === 'bass' || clef === 'both'
      ? ['accidentals', 'bass-accidentals']
      : ['accidentals']
    const sharpMidi = accidentalIds
      .flatMap(id => LESSONS.find(l => l.id === id)?.pool ?? [])
      .filter(m => !filtered.includes(m))
    const filteredSharps = clef === 'both'
      ? [
          ...filterByPosition(sharpMidi.filter(m => m >= 60), 'treble', lines, spaces),
          ...filterByPosition(sharpMidi.filter(m => m < 60), 'bass', lines, spaces),
        ]
      : filterByPosition(sharpMidi, targetClef, lines, spaces)
    filtered.push(...filteredSharps)
  }

  // 6. Deduplicate
  const unique = [...new Set(filtered)]
  return unique.length > 0 ? unique : allMidi
}
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/utils/notePool.ts
git commit -m "feat: add buildCustomPool utility for quick lesson pool generation"
```

---

### Task 3: Wire customPool into useGameState

**Files:**
- Modify: `src/hooks/useGameState.ts`

**Interfaces:**
- Consumes: `customPool`, `clef` from GameState (Task 1)
- Produces: modified `startGame(target?, pool?)` — clears customPool when no pool; `selectNote` uses `customPool`; `restartGame` uses `customPool`

- [ ] **Step 1: Add Clef to imports**

Change line 2 from:

```ts
import { GameState, Note, ErrorType, Notation } from '../types'
```

to:

```ts
import { GameState, Note, ErrorType, Notation, Clef } from '../types'
```

- [ ] **Step 2: Replace selectNote function**

Replace the `selectNote` function (lines 38-46) with:

```ts
function selectNote(state: GameState, excludeMidi?: number): Note {
  const pool = state.customPool ?? getLessonPool(state.lessonId)
  const filtered = pool.length > 1 ? pool.filter(m => m !== excludeMidi) : pool
  const weak = getWeakNotes().filter(m => filtered.includes(m))
  // ponytail: 2:1 bias for weak notes, simple random switch
  const src = weak.length > 0 && Math.random() < 0.66 ? weak : filtered
  const midi = src[Math.floor(Math.random() * src.length)]
  return midiToNote(midi)
}
```

- [ ] **Step 3: Replace startGame — clears customPool when no pool**

Replace `startGame` (lines 51-63) with:

```ts
  const startGame = useCallback((target?: number, pool?: number[]) => {
    setState(prev => {
      const note = selectNote({ ...prev, customPool: pool !== undefined ? pool : undefined })
      return {
        ...prev, phase: 'waiting', currentNote: note,
        customPool: pool !== undefined ? pool : undefined,
        streak: 0, bestStreak: 0, totalAttempts: 0, correctAttempts: 0,
        lastAnswerCorrect: null, lastAnswerMidi: null, lastErrorType: null,
        startTime: Date.now(), recovering: false,
        sessionTarget: target ?? SESSION_TARGET,
        noteShownAt: Date.now(), responseTimes: [], lastCorrectNote: null,
      }
    })
  }, [])
```

- [ ] **Step 4: Replace nextNote — pass state to selectNote**

Replace `nextNote` (lines 112-117) with:

```ts
  const nextNote = useCallback(() => {
    setState(prev => {
      const note = selectNote(prev, prev.currentNote?.midi)
      return { ...prev, phase: 'waiting', currentNote: note, lastAnswerCorrect: null, lastAnswerMidi: null, lastErrorType: null, recovering: false, noteShownAt: Date.now(), lastCorrectNote: null }
    })
  }, [])
```

- [ ] **Step 5: Replace restartGame — pass state to selectNote**

Replace `restartGame` (lines 144-155) with:

```ts
  const restartGame = useCallback(() => {
    setState(prev => {
      const note = selectNote(prev)
      return {
        ...prev, phase: 'waiting', currentNote: note,
        streak: 0, bestStreak: 0, totalAttempts: 0, correctAttempts: 0,
        lastAnswerCorrect: null, lastAnswerMidi: null, lastErrorType: null,
        startTime: Date.now(), recovering: false,
        noteShownAt: Date.now(), responseTimes: [], lastCorrectNote: null,
      }
    })
  }, [])
```

- [ ] **Step 6: Replace setLesson — also clear customPool**

Replace `setLesson` (lines 119-121) with:

```ts
  const setLesson = useCallback((lessonId: string) => {
    setState(prev => ({ ...prev, lessonId, customPool: undefined }))
  }, [])
```

- [ ] **Step 7: Add setCustomPool and setClef setters**

Add after the `setNotation` callback (before `restartGame`):

```ts
  const setCustomPool = useCallback((pool: number[] | undefined) => {
    setState(prev => ({ ...prev, customPool: pool }))
  }, [])

  const setClef = useCallback((clef: Clef) => {
    setState(prev => ({ ...prev, clef }))
  }, [])
```

- [ ] **Step 8: Update return value**

Add `setCustomPool` and `setClef` to the return object:

```ts
  return {
    state, startGame, submitAnswer, nextNote,
    setLesson, setSessionTarget, setShowNoteName, setMuted, setTimed, setNotation, restartGame,
    setCustomPool, setClef,
  }
```

- [ ] **Step 9: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 10: Commit**

```bash
git add src/hooks/useGameState.ts
git commit -m "feat: wire customPool into useGameState (startGame clears pool when no pool, selectNote uses customPool)"
```

---

### Task 4: DashboardScreen — add generator, onboarding banner, fix button label

**Files:**
- Modify: `src/screens/DashboardScreen.tsx`

**Interfaces:**
- Consumes: `QuickLessonConfig` from Task 1
- Produces: generator UI with compact controls, passes config to App.tsx via `onQuickLesson` callback

- [ ] **Step 1: Add QuickLessonConfig import**

Add to the imports:

```ts
import type { QuickLessonConfig } from '../types'
```

- [ ] **Step 2: Add onQuickLesson to props**

Add to the existing `DashboardScreenProps` interface (do NOT remove any existing props):

```ts
  onQuickLesson?: (config: QuickLessonConfig) => void;
```

- [ ] **Step 3: Add generator state inside the component**

After the existing state declarations (after `isMenuOpen`), add:

```ts
  const [config, setConfig] = useState<QuickLessonConfig>({
    clef: 'treble',
    lines: true,
    spaces: true,
    ledgerAbove: 0,
    ledgerBelow: 0,
    sharps: false,
    timed: true,
    noteCount: 20,
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('piano-onboarding-seen')
  })
```

- [ ] **Step 4: Replace the "Elige tu Desafío" section**

Find the `<section>` containing the challenge selector (with `id="challenge-selector"` or the session config section). Replace the entire section with:

```tsx
          {/* Onboarding Banner */}
          {showOnboarding && (
            <div className="clay-card p-4 flex items-center justify-between gap-4 border border-brass-highlight/30">
              <p className="text-body-sm text-on-surface-variant">
                <strong>Rápido</strong> = práctica personalizada. <strong>Camino</strong> = lecciones ordenadas en la biblioteca.
              </p>
              <button
                onClick={() => { localStorage.setItem('piano-onboarding-seen', '1'); setShowOnboarding(false); }}
                className="shrink-0 clay-input-key px-3 py-1 text-label-caps font-label-caps uppercase text-primary"
                aria-label="Cerrar aviso"
              >
                Entendido
              </button>
            </div>
          )}

          {/* Generador Rápido */}
          <section className="clay-card p-6 sm:p-8">
            <h3 className="font-headline-lg-mobile md:font-headline-lg text-foreground mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">bolt</span>
              Generador Rápido
            </h3>

            {/* Default controls */}
            <div className="space-y-4">
              {/* Clef selector */}
              <div>
                <label className="text-body-sm font-medium text-on-surface-variant mb-2 block">Clave</label>
                <div className="flex gap-2">
                  {(['treble', 'bass', 'both'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setConfig(prev => ({ ...prev, clef: c }))}
                      aria-pressed={config.clef === c}
                      aria-label={`Clave ${c === 'treble' ? 'Sol' : c === 'bass' ? 'Fa' : 'Ambas'}`}
                      className={`flex-1 py-2 rounded-xl text-title-md font-medium transition-all clay-input-key ${
                        config.clef === c ? 'bg-primary-container text-on-primary-container' : ''
                      }`}
                    >
                      {c === 'treble' ? 'Sol' : c === 'bass' ? 'Fa' : 'Ambas'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note count */}
              <div>
                <label className="text-body-sm font-medium text-on-surface-variant mb-2 block">Notas</label>
                <div className="flex gap-2">
                  {([5, 10, 20] as const).map(n => (
                    <button
                      key={n}
                      onClick={() => setConfig(prev => ({ ...prev, noteCount: n }))}
                      aria-pressed={config.noteCount === n}
                      aria-label={`${n} notas`}
                      className={`flex-1 py-2 rounded-xl text-title-md font-medium transition-all clay-input-key ${
                        config.noteCount === n ? 'bg-primary-container text-on-primary-container' : ''
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer toggle — using existing clay-switch */}
              <div className="flex items-center justify-between">
                <span className="text-body-md font-medium text-on-surface-variant">Cronómetro</span>
                <button
                  role="switch"
                  aria-checked={config.timed}
                  aria-label="Modo Cronometrado"
                  onClick={() => setConfig(prev => ({ ...prev, timed: !prev.timed }))}
                  className={`clay-switch ${config.timed ? 'on' : ''}`}
                >
                  <span className="clay-switch-knob" />
                </button>
              </div>
            </div>

            {/* Advanced toggle — using clay-input-key */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              aria-expanded={showAdvanced}
              className="w-full mt-4 py-2 clay-input-key flex items-center justify-center gap-1 text-primary"
            >
              <span className="font-label-caps text-label-caps uppercase">{showAdvanced ? 'Ocultar opciones' : 'Personalizar'}</span>
              <span className={`material-symbols-outlined text-sm transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {/* Advanced controls */}
            {showAdvanced && (
              <div className="mt-4 space-y-4 border-t border-outline-variant/30 pt-4">
                {/* Lines/Spaces — using clay-switch */}
                <div className="flex gap-4">
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-body-md font-medium text-on-surface-variant">Líneas</span>
                    <button
                      role="switch"
                      aria-checked={config.lines}
                      aria-label="Líneas"
                      onClick={() => setConfig(prev => ({ ...prev, lines: !prev.lines }))}
                      className={`clay-switch ${config.lines ? 'on' : ''}`}
                    >
                      <span className="clay-switch-knob" />
                    </button>
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-body-md font-medium text-on-surface-variant">Espacios</span>
                    <button
                      role="switch"
                      aria-checked={config.spaces}
                      aria-label="Espacios"
                      onClick={() => setConfig(prev => ({ ...prev, spaces: !prev.spaces }))}
                      className={`clay-switch ${config.spaces ? 'on' : ''}`}
                    >
                      <span className="clay-switch-knob" />
                    </button>
                  </div>
                </div>

                {(!config.lines && !config.spaces) && (
                  <p className="text-body-sm text-velvet-red text-center">Selecciona al menos líneas o espacios</p>
                )}

                {/* Ledger lines — w-12 h-12 steppers */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-body-sm font-medium text-on-surface-variant mb-2 block">Adic. arriba</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, ledgerAbove: Math.max(0, prev.ledgerAbove - 1) }))}
                        aria-label="Reducir adicionales arriba"
                        className="w-12 h-12 rounded-xl clay-input-key flex items-center justify-center text-lg"
                      >-</button>
                      <span className="flex-1 text-center text-title-md font-bold" aria-live="polite">{config.ledgerAbove}</span>
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, ledgerAbove: Math.min(3, prev.ledgerAbove + 1) }))}
                        aria-label="Aumentar adicionales arriba"
                        className="w-12 h-12 rounded-xl clay-input-key flex items-center justify-center text-lg"
                      >+</button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-body-sm font-medium text-on-surface-variant mb-2 block">Adic. abajo</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, ledgerBelow: Math.max(0, prev.ledgerBelow - 1) }))}
                        aria-label="Reducir adicionales abajo"
                        className="w-12 h-12 rounded-xl clay-input-key flex items-center justify-center text-lg"
                      >-</button>
                      <span className="flex-1 text-center text-title-md font-bold" aria-live="polite">{config.ledgerBelow}</span>
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, ledgerBelow: Math.min(3, prev.ledgerBelow + 1) }))}
                        aria-label="Aumentar adicionales abajo"
                        className="w-12 h-12 rounded-xl clay-input-key flex items-center justify-center text-lg"
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* Sharps — using clay-switch */}
                <div className="flex items-center justify-between">
                  <span className="text-body-md font-medium text-on-surface-variant">Sostenidos</span>
                  <button
                    role="switch"
                    aria-checked={config.sharps}
                    aria-label="Sostenidos"
                    onClick={() => setConfig(prev => ({ ...prev, sharps: !prev.sharps }))}
                    className={`clay-switch ${config.sharps ? 'on' : ''}`}
                  >
                    <span className="clay-switch-knob" />
                  </button>
                </div>
              </div>
            )}

            {/* Start button — using existing clay-btn-primary CTA */}
            <button
              onClick={() => onQuickLesson?.(config)}
              disabled={!config.lines && !config.spaces}
              className={`w-full mt-6 py-6 flex items-center justify-center gap-3 font-title-md text-title-md uppercase tracking-widest transition-all ${
                (!config.lines && !config.spaces)
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'clay-btn-primary text-brass-highlight'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              ¡A Practicar!
            </button>
          </section>
```

- [ ] **Step 5: Add pb-20 to main content + fix bottom nav touch targets**

Find the `<main>` element's className and replace the exact string `pb-stack-md md:pb-stack-lg` with `pb-20 md:pb-stack-lg`:

```tsx
// BEFORE: pb-stack-md md:pb-stack-lg
// AFTER:
<main className="flex-grow w-full max-w-7xl mx-auto px-container-padding pt-28 pb-20 md:pb-stack-lg flex flex-col items-center">
```

- [ ] **Step 5b: Fix bottom nav touch targets**

In the bottom `<nav>`, find `px-4 py-1` on each nav button and replace with `px-4 py-2` (minimum 48px touch target per WCAG 2.5.8). Apply to all 3 nav buttons:

```tsx
// BEFORE: px-4 py-1
// AFTER:
className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl ...
```

- [ ] **Step 6: Change start button label**

Find the existing sequential start button (with text `"Iniciar Sesión"` — note the accent on the ó) and change to:

```tsx
                Practicar
```

- [ ] **Step 7: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add src/screens/DashboardScreen.tsx
git commit -m "feat: add quick lesson generator, onboarding banner, and design token fixes to dashboard"
```

---

### Task 5: BibliotecaScreen — wire to real LESSONS

**Files:**
- Modify: `src/screens/BibliotecaScreen.tsx`

**Interfaces:**
- Consumes: `LESSONS` from `src/data/lessons.ts`, `computeMasteryStatus` from `src/utils/dashboardStats.ts` (Task 1)
- Consumes: `SessionRecord` from `src/utils/sessionHistory.ts`
- Produces: real lesson cards with completion status

- [ ] **Step 1: Add imports**

Replace the existing imports with:

```ts
import TopNavBar from '../components/TopNavBar'
import { LESSONS } from '../data/lessons'
import { computeMasteryStatus, type MasteryStatus } from '../utils/dashboardStats'
import type { SessionRecord } from '../utils/sessionHistory'
```

- [ ] **Step 2: Update props interface**

Add `sessions` prop:

```ts
interface BibliotecaScreenProps {
  onNavigate: (target: string) => void;
  onLogout: () => void;
  onSelectLesson: (lessonId: string) => void;
  onStartGame: () => void;
  userName?: string;
  userLevel?: number;
  userAvatar?: string;
  sessions?: SessionRecord[];
}
```

Update the destructured props to include `sessions = []`.

- [ ] **Step 3: Remove hardcoded FUNDAMENTOS and INTERMEDIA**

Delete lines 14-33: the `LessonNode` interface (lines 14-22), the `FUNDAMENTOS` array, and the `INTERMEDIA` array.

- [ ] **Step 4: Add computed lesson data after props**

Add after the props destructuring:

```ts
  const trebleLessons = LESSONS.filter(l => l.clef === 'treble')
  const bassLessons = LESSONS.filter(l => l.clef === 'bass')

  function getStatus(lessonId: string): { status: 'completed' | 'active' | 'locked'; accuracy: number } {
    const ms = computeMasteryStatus(lessonId, sessions)
    return { status: ms.mastered ? 'completed' : ms.unlocked ? 'active' : 'locked', accuracy: ms.bestAccuracy }
  }

  function getActiveIndex(lessons: typeof LESSONS): number {
    const idx = lessons.findIndex(l => !computeMasteryStatus(l.id, sessions).mastered)
    return idx === -1 ? lessons.length - 1 : idx
  }

  const trebleActiveIdx = getActiveIndex(trebleLessons)
  const bassActiveIdx = getActiveIndex(bassLessons)
  // ponytail: O(n*m) fine for 18 lessons, batch-compute if lesson count grows
  const trebleCompleted = trebleLessons.filter(l => computeMasteryStatus(l.id, sessions).mastered).length
  const bassCompleted = bassLessons.filter(l => computeMasteryStatus(l.id, sessions).mastered).length
```

- [ ] **Step 5: Replace the Learning Path section**

Replace the entire `<div className="relative w-full max-w-3xl...">` section. Use `gap-6` between cards and `gap-12` around section headers:

```tsx
        {/* Learning Path */}
        <div className="relative w-full max-w-3xl flex flex-col items-center gap-6 py-8">
          <div className="path-line" />

          {/* Treble Section */}
          <div className="w-full text-center z-10 mb-4 bg-background/90 py-2 rounded-xl border border-brass-highlight/30 clay-card max-w-sm mx-auto">
            <h2 className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">
              Clave de Sol
            </h2>
            <span className="text-body-sm text-on-surface-variant">{trebleCompleted}/{trebleLessons.length} completadas</span>
          </div>

          {trebleLessons.map((lesson, i) => {
            const { status, accuracy } = getStatus(lesson.id)
            const isActive = i === trebleActiveIdx && status !== 'completed'
            return (
              <LessonNodeCard
                key={lesson.id}
                node={{
                  id: lesson.id,
                  title: lesson.name,
                  description: lesson.desc,
                  status: isActive ? 'active' : status,
                  accuracy,
                  icon: status === 'completed' ? 'check_circle' : isActive ? 'music_note' : 'lock',
                }}
                index={i}
                onSelect={onSelectLesson}
                onStartGame={onStartGame}
              />
            )
          })}

          {/* Bass Section — extra top margin for visual break */}
          <div className="w-full text-center z-10 mt-12 mb-4 bg-background/90 py-2 rounded-xl border border-outline-variant/30 clay-card max-w-sm mx-auto">
            <h2 className="font-label-caps text-label-caps text-outline uppercase tracking-widest">
              Clave de Fa
            </h2>
            <span className="text-body-sm text-on-surface-variant">{bassCompleted}/{bassLessons.length} completadas</span>
          </div>

          {bassLessons.map((lesson, i) => {
            const { status, accuracy } = getStatus(lesson.id)
            const isActive = i === bassActiveIdx && status !== 'completed'
            return (
              <LessonNodeCard
                key={lesson.id}
                node={{
                  id: lesson.id,
                  title: lesson.name,
                  description: lesson.desc,
                  status: isActive ? 'active' : status,
                  accuracy,
                  icon: status === 'completed' ? 'check_circle' : isActive ? 'music_note' : 'lock',
                }}
                index={i + trebleLessons.length}
                onSelect={onSelectLesson}
                onStartGame={onStartGame}
              />
            )
          })}
        </div>
```

- [ ] **Step 6: Update LessonNodeCard interface and progress bar**

Update the `LessonNode` interface at the top (after imports):

```ts
interface LessonNode {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'locked';
  accuracy?: number;
  icon: string;
  offset?: 'left' | 'right' | 'center';
}
```

Replace the progress bar section in `LessonNodeCard` (the `{isActive && node.progress !== undefined && (...)}` block) with:

```tsx
          {isActive && node.accuracy !== undefined && node.accuracy > 0 && (
            <div className="w-full mb-6">
              <div className="flex justify-between text-body-sm text-on-surface-variant mb-2">
                <span>Precisión</span>
                <span className="font-bold">{Math.round(node.accuracy)}%</span>
              </div>
              <div className="h-4 clay-progress-bar w-full">
                <div className="h-full clay-progress-fill" style={{ width: `${node.accuracy}%` }} />
              </div>
            </div>
          )}
```

- [ ] **Step 7: Fix bottom nav touch targets**

In the bottom `<nav>`, find `px-4 py-1` on each nav button and replace with `px-4 py-2` (minimum 48px touch target per WCAG 2.5.8).

- [ ] **Step 8: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 9: Commit**

```bash
git add src/screens/BibliotecaScreen.tsx
git commit -m "feat: wire BibliotecaScreen to real LESSONS with treble/bass sections and completion counters"
```

---

### Task 6: App.tsx — custom pool plumbing and routing

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `buildCustomPool` from Task 2, `QuickLessonConfig` from Task 1
- Consumes: `setCustomPool`, `setClef` from Task 3
- Produces: custom pool passed to `startGame`, `lastSequentialLesson` tracking, `'both'` clef Staff handling, sessions lifted

- [ ] **Step 1: Add imports**

Add to the imports:

```ts
import { buildCustomPool } from './utils/notePool'
import type { QuickLessonConfig } from './types'
```

- [ ] **Step 2: Add lastSequentialLesson state**

After the existing state declarations in `AppContent`, add:

```ts
  const [lastSequentialLesson, setLastSequentialLesson] = useState<string>('lines')
```

- [ ] **Step 3: Lift sessions to AppContent top**

Move `const sessions = getSessions()` to the top of `AppContent` (before screen routing). Currently it's only inside the `if (screen === 'perfil')` block.

```ts
  const sessions = getSessions()
```

- [ ] **Step 4: Add handleQuickLesson callback + saved settings**

Add after the existing handler functions:

```ts
  // Save/restore user prefs around quick lessons (prevent Firestore overwrite)
  const [savedSettings, setSavedSettings] = useState<{ target: number; timed: boolean } | null>(null)

  const handleQuickLesson = useCallback((config: QuickLessonConfig) => {
    setSavedSettings({ target: state.sessionTarget, timed: state.isTimed })
    state.setLesson('custom')
    state.setClef(config.clef)
    state.setTimed(config.timed)
    const pool = buildCustomPool(config)
    state.startGame(config.noteCount, pool)
    setScreen('practice')
  }, [state])
```

Note: `setLesson('custom')` clears customPool, then `startGame(noteCount, pool)` sets it. No redundant setters needed since `startGame` handles sessionTarget and isTimed. The `savedSettings` will be restored when returning to dashboard (Step 4b).

- [ ] **Step 4b: Restore settings when returning to dashboard**

Add a `useEffect` to restore the user's saved preferences:

```ts
  useEffect(() => {
    if (screen === 'dashboard' && savedSettings) {
      state.setSessionTarget(savedSettings.target)
      state.setTimed(savedSettings.timed)
      state.setClef('treble') // reset to default for sequential
      setSavedSettings(null)
    }
  }, [screen, savedSettings, state])
```

This prevents quick lesson settings (noteCount, timed) from leaking into Firestore config sync.

- [ ] **Step 5: Track lastSequentialLesson in handleSelectLesson**

In the existing `handleSelectLesson` callback, add tracking:

```ts
  const handleSelectLesson = useCallback((lessonId: string) => {
    state.setLesson(lessonId)
    const lesson = LESSONS.find(l => l.id === lessonId)
    if (lesson) {
      state.setClef(lesson.clef)
      setLastSequentialLesson(lessonId)
    }
  }, [state])
```

Also update the sequential start (handleStartGame) to restore lessonId and clef from lastSequentialLesson:

```ts
  const handleStartGame = useCallback((target?: string) => {
    const lessonId = target ?? lastSequentialLesson
    const lesson = LESSONS.find(l => l.id === lessonId)
    if (lesson) {
      state.setLesson(lessonId)
      state.setClef(lesson.clef)
    }
    markToday()
    state.startGame()
    setScreen('practice')
  }, [markToday, state, lastSequentialLesson])
```

This ensures sequential starts always reset to the proper lesson/clef (prevents 'custom' lessonId or 'both' clef leaking from quick lessons).

- [ ] **Step 5b: Guard Firestore push effect during quick lessons**

Find the existing Firestore push effect (the `useEffect` that calls `updateConfig` with `timed`, `sessionTarget`, etc). Add a guard at the top:

```ts
  // Push local config changes to Firestore when logged in
  useEffect(() => {
    if (!user || !config) return
    if (state.lessonId === 'custom') return  // skip during quick lessons
    updateConfig({
      notation: state.notation,
      showNoteName: state.showNoteName,
      timed: state.isTimed,
      sessionTarget: state.sessionTarget,
    })
  }, [state.notation, state.showNoteName, state.isTimed, state.sessionTarget, !!user])
```

- [ ] **Step 5c: Wire BibliotecaScreen onSelectLesson to handleSelectLesson**

Find the BibliotecaScreen rendering and change:

```tsx
onSelectLesson={(id) => setLesson(id)}
```

to:

```tsx
onSelectLesson={handleSelectLesson}
```

- [ ] **Step 6: Update Staff lessonPool prop**

Find the Staff component rendering and change the `lessonPool` prop from:

```tsx
lessonPool={getLessonPool(state.lessonId)}
```

to:

```tsx
lessonPool={state.customPool ?? getLessonPool(state.lessonId)}
```

- [ ] **Step 7: Handle 'both' clef in Staff**

Find where Staff receives the `clef` prop and replace:

```tsx
clef={currentLesson?.clef ?? 'treble'}
```

with:

```tsx
clef={
  state.clef === 'both'
    ? (state.currentNote && state.currentNote.midi <= 60 ? 'bass' : 'treble')
    : (currentLesson?.clef ?? state.clef ?? 'treble')
}
```

- [ ] **Step 8: Set startMidi for PianoKeyboard when clef is 'both'**

Find the PianoKeyboard component and update its `startMidi` prop:

```tsx
startMidi={state.clef === 'both' ? 36 : (currentLesson?.clef === 'bass' ? 36 : 48)}
```

- [ ] **Step 9: Pass handleQuickLesson and sessions to DashboardScreen**

Find the DashboardScreen rendering and add:

```tsx
onQuickLesson={handleQuickLesson}
```

- [ ] **Step 10: Pass sessions and update computeDashboardStats**

Replace the `computeDashboardStats` call:

```ts
computeDashboardStats(lastSequentialLesson, state.notation)
```

Pass `sessions` to BibliotecaScreen:

```tsx
sessions={sessions}
```

- [ ] **Step 11: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 12: Verify build**

Run: `npx vite build`
Expected: Build succeeds

- [ ] **Step 13: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire custom pool, lastSequentialLesson, and both-clef handling in App"
```

---

### Task 7: Final verification + deploy

- [ ] **Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Production build**

Run: `npx vite build`
Expected: Build succeeds

- [ ] **Step 3: Manual verification**

1. Dashboard shows onboarding banner (first visit only)
2. Dashboard shows compact generator with 3 default controls
3. "Personalizar" expands to show lines/spaces/ledger/sharps
4. Starting a quick lesson plays with the custom pool
5. BibliotecaScreen shows 18 lessons in two sections (Sol/Fa) with completion counters
6. Sequential lessons start with timer and 20 notes
7. customPool cleared when switching between quick/sequential
8. 'Both' clef → dynamic staff switching based on MIDI <= 60
9. Roadmap doesn't change when doing quick lessons

- [ ] **Step 4: Deploy**

```bash
npx vercel --yes --prod
```

---

## Verification Checklist

1. Dashboard → onboarding banner shows once
2. Dashboard → generator with Sol/Fa/Ambas, note count, timer (clay-switch)
3. "Personalizar" → lines/spaces (clay-switch), ledger stepper (w-12 h-12), sharps
4. Quick lesson → correct pool plays, stats update, customPool cleared after
5. Biblioteca → 9 treble + 9 bass lessons with `desc`, real statuses, `gap-6`
6. Sequential lesson → timer on, 20 notes, customPool cleared
7. 'Both' clef → dynamic staff switching at MIDI <= 60
8. Roadmap → only updates on sequential lessons
9. Start button → "Practicar" not "Iniciar Sesión"
10. `tsc --noEmit` passes
11. `vite build` succeeds
