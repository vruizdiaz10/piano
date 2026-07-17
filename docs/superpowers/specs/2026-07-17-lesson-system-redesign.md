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

## Generator Config

```
GENERADOR RÁPIDO
─────────────────
Clave:  [Sol] [Fa] [Ambas]
Líneas: [ON/OFF]    Espacios: [ON/OFF]
Adicionales arriba:  [0] [1] [2] [3]
Adicionales abajo:   [0] [1] [2] [3]
Sostenidos: [ON/OFF]
Cronómetro: [ON/OFF]
Notas: [5] [10] [20]

[ ¡A PRACTICAR! ]
```

Defaults: Sol, lines=on, spaces=on, ledger=0/0, sharps=off, timed=on, notes=20.

Validation: at least one of lines/spaces must be on.

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

`LESSONS` array unchanged. New constant:

```ts
export const SEQUENTIAL_CONFIG = { timed: true, noteCount: 20 } as const
```

## Pool Generation

New utility `buildCustomPool(config: QuickLessonConfig): number[]` in `src/utils/notePool.ts`:

1. Start with existing lesson pools for selected clef(s)
2. Filter by lines/spaces toggles (exclude notes not on toggled positions)
3. Add ledger line notes based on `ledgerAbove`/`ledgerBelow`
4. Optionally include sharps (accidentals) from the existing accidentals pools

For `clef: 'both'`, merge treble and bass pools.

## Game Flow

Both types use the same `useGameState` engine:

- **Sequential**: `lessonId` = real lesson ID. Pool from `getLessonPool()`. Timer on, 20 notes.
- **Quick**: `lessonId` = `'custom'`. Pool from `buildCustomPool(config)`. Timer and note count from config.

`App.tsx` routing:
- From library → set real `lessonId`, lock timer/notes to sequential defaults
- From generator → build custom pool, pass to game state

## BibliotecaScreen

Rewired to use real `LESSONS` array instead of hardcoded data. Two sections:

1. **Sol (Treble)** — 9 lessons in order, real mastery status from session history
2. **Fa (Bass)** — 9 lessons in order, real mastery status from session history

Each card: name, description, mastery progress, lock/unlock status.

## DashboardScreen

"Elige tu Desafío" replaced with generator form. Roadmap continues to work (3-step window for current clef).

## Session History

Quick lessons stored with `lessonId: 'custom'`. Stats count for both types.

## Files

| File | Action |
|------|--------|
| `src/types/index.ts` | **MODIFY** — add `QuickLessonConfig` |
| `src/utils/notePool.ts` | **CREATE** — `buildCustomPool()` |
| `src/data/lessons.ts` | **MODIFY** — add `SEQUENTIAL_CONFIG` |
| `src/screens/DashboardScreen.tsx` | **MODIFY** — replace session config with generator |
| `src/screens/BibliotecaScreen.tsx` | **MODIFY** — wire to real LESSONS |
| `src/App.tsx` | **MODIFY** — handle custom pool, route quick vs sequential |

## Out of Scope

- Changing the 18 sequential lessons themselves
- Lesson categories/groups within sequential path
- Quick lesson presets or saved configurations
- Social/competitive features for quick lessons
