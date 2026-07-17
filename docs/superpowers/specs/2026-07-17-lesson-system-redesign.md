# Lesson System Redesign — Sequential + Quick Lessons

## Context

Current system has 18 lessons in a flat list, a challenge selector ("Elige tu Desafío") with limited options, and a static/presentational BibliotecaScreen. Goal: split lessons into two types — sequential (main path, library) and quick (custom generator on dashboard).

## Two Lesson Types

### Sequential Lessons (Library/Path)

- Same 18 lessons currently in `LESSONS` array (9 treble + 9 bass)
- Timer always on, 20 notes fixed — no user config
- Appear in BibliotecaScreen as the main progression path
- One-tap start from library
- Mastery/unlock system unchanged

### Quick Lessons (Dashboard Generator)

- Replace "Elige tu Desafío" section on DashboardScreen
- Dynamic pool built from user selections at game start
- Not part of the path or library
- Results count toward stats (level, accuracy, streak)
- Mastery display skipped in LevelComplete for quick lessons

## Generator UI

Progressive disclosure design — 3 controls by default, advanced options behind expandable panel:

**Default (collapsed):**
```
GENERADOR RÁPIDO
─────────────────
Clave:  [Sol] [Fa] [Ambas]
Notas:  [5] [10] [20]
Cronómetro: [ON/OFF]

[ ¡A PRACTICAR! ]
```

**Advanced (expanded via "Personalizar" toggle):**
```
Líneas: [ON/OFF]    Espacios: [ON/OFF]
Adicionales arriba:  [-] 0 [+]    (stepper, not 4 buttons)
Adicionales abajo:   [-] 0 [+]
Sostenidos: [ON/OFF]
```

Defaults: Sol, lines=on, spaces=on, ledger=0/0, sharps=off, timed=on, notes=20.

Validation: at least one of lines/spaces must be on. Hint text if both off.

### Onboarding

First-use dismissible banner on dashboard:
> "Rápido = práctica personalizada. Camino = lecciones ordenadas en la biblioteca."

New users default to roadmap/path view. Generator is secondary until first sequential lesson completed.

## Types

```ts
interface QuickLessonConfig {
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

Extend `Clef` type:

```ts
export type Clef = 'treble' | 'bass' | 'both'
```

Add `clef` field to `GameState`:

```ts
// In GameState interface
clef: Clef  // defaults to currentLesson?.clef ?? 'treble'
```

`LESSONS` array unchanged.

## Pool Generation

New utility `buildCustomPool(config: QuickLessonConfig): number[]` in `src/utils/notePool.ts`.

### Algorithm

The pool is built from the existing lesson pools using position classification:

1. **Base pool by clef:**
   - `'treble'` → use `LESSONS` with `clef === 'treble'` pools
   - `'bass'` → use `LESSONS` with `clef === 'bass'` pools
   - `'both'` → merge treble and bass pools (remove MIDI overlap 60-64 from bass to avoid duplicates)

2. **Filter by lines/spaces:**
   - Classify each MIDI note as line or space using `midiToNote` + `noteToPosition`
   - A note is on a "line" if `position % 2 === 1` (positions 1,3,5,7,9 = lines)
   - A note is on a "space" if `position % 2 === 0` (positions 2,4,6,8 = spaces)
   - Keep only notes matching enabled toggles

3. **Add ledger lines:**
   - `ledgerAbove: N` → add N notes above staff (positions 11, 13, 15... for treble)
   - `ledgerBelow: N` → add N notes below staff (positions -1, -3, -5... for treble)
   - Use existing `getLessonPool('above-staff')` / `getLessonPool('below-staff')` data as reference

4. **Add sharps:**
   - If `sharps: true`, include notes from `LESSONS` accidentals pools
   - Filter by same lines/spaces/ledger criteria

5. **Deduplicate** final MIDI array.

### Implementation note

The position classification must be derived from the existing `LESSONS` pool data, not hardcoded. The function should:
- Import `LESSONS` from `src/data/lessons.ts`
- Import `midiToNote` from `src/utils/midiToNote.ts`
- Import `noteToPosition` from `src/utils/noteToPosition.ts`
- Filter and classify dynamically

## Game Flow — Pool Plumbing (Critical)

### Problem

`useGameState.selectNote()` calls `getLessonPool(lessonId)` which does `LESSONS.find()`. With `lessonId = 'custom'`, it silently falls back to the first lesson's pool (treble lines). Custom pool never reaches the game engine.

Additionally, `App.tsx` passes `lessonPool={getLessonPool(state.lessonId)}` to the Staff component independently.

### Solution

Add `customPool?: number[]` to `GameState`. Modify `startGame` to accept an optional pool parameter:

```ts
// In useGameState.ts
interface GameState {
  // ... existing fields
  customPool?: number[]  // for quick lessons
  clef: Clef
}

// Modified startGame signature
startGame(pool?: number[]): void
```

Modify `selectNote` to check `customPool` first:

```ts
function selectNote(state: GameState, excludeMidi?: number): Note {
  const pool = state.customPool ?? getLessonPool(state.lessonId)
  // ... rest unchanged
}
```

Modify `App.tsx` Staff rendering:

```tsx
// Before
lessonPool={getLessonPool(state.lessonId)}

// After
lessonPool={state.customPool ?? getLessonPool(state.lessonId)}
```

### Flow

- **Sequential**: `startGame()` called with no pool. `customPool` undefined. `selectNote` uses `getLessonPool(lessonId)`.
- **Quick**: `startGame(buildCustomPool(config))` called with generated pool. `customPool` set. `selectNote` uses it.

## Clef Handling for 'both' Mode

When `clef: 'both'` is selected:

- **Pool**: Merge treble + bass pools, remove overlap zone (MIDI 60-64) from bass to avoid duplicates
- **Staff**: Show treble clef by default. When a bass-clef note is selected (MIDI < 60), dynamically switch Staff to bass clef for that note, then back to treble for the next note
- **PianoKeyboard**: Set `startMidi = 36` (full range from C2)
- **Note position**: `noteToPosition(note, currentClef)` — use the dynamically switched clef

This is the simplest rendering approach. Dual-staff is out of scope.

## LevelComplete Behavior

```ts
// In LevelComplete component
const lesson = LESSONS.find(l => l.id === lessonId)
// If lessonId === 'custom', skip mastery display
// Mastery section only renders when lesson is found
```

No mastery feedback for quick lessons. Stats (score, accuracy, streak) still shown.

## Roadmap Behavior

Roadmap uses the last sequential lesson practiced, not the current `lessonId`:

```ts
// In App.tsx, track separately
const [lastSequentialLesson, setLastSequentialLesson] = useState<string>('lines')

// When starting a sequential lesson:
setLastSequentialLesson(lessonId)

// Roadmap computation uses lastSequentialLesson
buildRoadmap(lastSequentialLesson, sessions)
```

Quick lessons don't update the roadmap. Dashboard shows roadmap based on last sequential progress.

## BibliotecaScreen

Rewired to use real `LESSONS` array. Two sections:

1. **Sol (Treble)** — 9 lessons in order
2. **Fa (Bass)** — 9 lessons in order

Each card shows: name, description, accuracy bar (from best session), lock/unlock status. Section header includes completion counter: "5/9 completadas".

Lesson tap → starts with timer=on, 20 notes. One-tap, no config.

## DashboardScreen

"Elige tu Desafío" replaced with compact generator. Layout:

- Top: Roadmap section (3-step window)
- Middle: Generator card (collapsed by default, 3 controls)
- Bottom: Stats (weekly chart, streak, rank)

Start button label changed from "INICIAR SESIÓN" to "PRACTICAR" (avoids login confusion in Spanish).

## Session History

Quick lessons stored with `lessonId: 'custom'`. Known limitation: all quick lessons share stats. Future enhancement could encode config hash.

## Timer Behavior

Timer duration unchanged: 5s for ≤10 notes, 8s for >10 notes. Works for both lesson types. Custom lessons with harder pools (ledger lines, sharps) may need more time — noted as future consideration.

## Files

| File | Action |
|------|--------|
| `src/types/index.ts` | **MODIFY** — add `QuickLessonConfig`, extend `Clef` to include `'both'` |
| `src/hooks/useGameState.ts` | **MODIFY** — add `customPool`, `clef` to GameState; modify `startGame`, `selectNote` |
| `src/utils/notePool.ts` | **CREATE** — `buildCustomPool()` with position classification |
| `src/screens/DashboardScreen.tsx` | **MODIFY** — replace session config with generator, add onboarding banner |
| `src/screens/BibliotecaScreen.tsx` | **MODIFY** — wire to real LESSONS, add completion counters |
| `src/App.tsx` | **MODIFY** — handle custom pool, route quick vs sequential, track lastSequentialLesson |
| `src/components/LevelComplete.tsx` | **MODIFY** — skip mastery for custom lessons |

## Out of Scope

- Changing the 18 sequential lessons themselves
- Lesson categories/groups within sequential path
- Quick lesson presets or saved configurations
- Dual-staff rendering for 'both' clef
- Social/competitive features for quick lessons
- Per-config stats for quick lessons (all share 'custom' lessonId)
- Timer difficulty scaling based on pool complexity
