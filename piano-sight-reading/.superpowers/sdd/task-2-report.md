# Task 2 Report: Types and Utility Functions

## Files Created
- `src/types/index.ts` — NoteName, Note, Difficulty, GamePhase, GameState types
- `src/utils/midiToNote.ts` — midiToNote() helper
- `src/utils/noteToPosition.ts` — noteToPosition(), getNotePool() helpers

## Build Result
- `npm run build` passes (tsc + vite, 31 modules, 2.39s)

## Self-Review
- Types match brief exactly
- No unused imports/exports
- Functions are pure, well-typed
- `getNotePool` intermediate range: 48–84 (C2–C6) — correct per brief
- No lint warnings or errors
