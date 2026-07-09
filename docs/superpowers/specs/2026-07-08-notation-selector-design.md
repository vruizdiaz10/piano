# Notation Selector — Design Spec

## Goal
Add dropdown next to mute button to switch notation system (American C D E / Latino Do Re Mi).

## Scope
- New `notation` field in GameState (`'american' | 'latino'`)
- Persisted to localStorage
- Affects note name display in Staff, error tips in Feedback

## Implementation
1. Add `Notation` type + `notation` field to GameState
2. Create `src/utils/notation.ts` — mapping + `displayNoteName(noteName, notation)` utility
3. Add `setNotation` to `useGameState`, init from localStorage
4. Add `<Select>` inline in App.tsx header next to mute button
5. Pass `notation` prop to Staff, pass to Feedback → getErrorTip
6. Display mapping: C→Do, C#→Do#, D→Re, D#→Re#, E→Mi, F→Fa, F#→Fa#, G→Sol, G#→Sol#, A→La, A#→La#, B→Si

## Files Changed
- `src/types/index.ts` — add Notation type
- `src/utils/notation.ts` — new, displayNoteName()
- `src/hooks/useGameState.ts` — notation state + setNotation
- `src/components/Staff.tsx` — use displayNoteName
- `src/utils/errorAnalysis.ts` — getErrorTip accepts notation
- `src/components/Feedback.tsx` — pass notation to getErrorTip
- `src/App.tsx` — NotationSelect + pass notation to children
