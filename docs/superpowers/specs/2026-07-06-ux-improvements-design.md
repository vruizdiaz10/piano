# UX Improvements — Design Spec

## 1. Recovery Window (Ventana Recuperación)

**Goal:** After wrong answer, user gets 2.5s to retry correct key. Partial credit if recovered.

**Changes:**
- **`src/types/index.ts`**: Add `recovering: boolean` to `GameState`. Default `false`.
- **`src/hooks/useGameState.ts`**: 
  - `submitAnswer`: If phase is `'feedback'` and `lastAnswerCorrect === false` and `recovering === true`, accept correct answer as recovery. Set `lastAnswerCorrect = true`, `recovering = false`, increment `correctAttempts` by 0.5 (partial credit via half increment — store as integer, round down for display).
  - `nextNote`: Set `recovering = false`.
  - `startGame`/`restartGame`: Reset `recovering = false`.
- **`src/App.tsx`**: Modify feedback timeout to 2500ms. Add effect: on wrong answer, set `recovering = true` after a brief delay (500ms visual feedback first). Clear recovery flag on correct recovery or timeout.
- **`src/components/Feedback.tsx`**: Show "¡Intenta de nuevo!" text and pulsing ring when `recovering=true`.
- **`src/components/StreakBadge.tsx`**: Show partial credit indicator on recovery (e.g., "+0.5").

## 2. Timing Variation ±200ms

**Goal:** Natural-feeling auto-advance with small random jitter.

**Changes:**
- **`src/App.tsx`** line 95: `setTimeout(() => { ... }, 1500 + (Math.random() - 0.5) * 400)`

## 3. Range Indicator on Staff

**Goal:** Subtle visual markers showing highest/lowest notes in current lesson.

**Changes:**
- **`src/components/Staff.tsx`**: Accept optional `lessonPool?: number[]` prop. On mount, convert min/max of pool to staff y-positions via `noteToPosition`. Render small gray dots (r=4, opacity 0.3) at those y-positions on the left margin of the staff. Only render when `lessonPool` is provided and has at least 2 distinct notes.
- **`src/App.tsx`**: Pass `lessonPool` (from `getLessonPool(state.lessonId)`) to Staff.

## 4. Trail Post-Answer

**Goal:** Ghost notes of recent answers drifting away.

**Changes:**
- **`src/types/index.ts`**: Add `trail: Array<{ note: Note; correct: boolean }>` to `GameState`. Max 5 entries.
- **`src/hooks/useGameState.ts`**: In `submitAnswer`, push current note + correctness to trail. Trim to 5. In `nextNote`, clear trail (or just shift).
- **`src/components/Staff.tsx`**: Accept optional `trail` prop. Render ghost noteheads at their staff positions with opacity based on index (0.5 → 0.15). Each ghost note uses a CSS class `animate-ghost-drift` that translates upward 20px over 1.5s with fade-out.
- **`src/index.css`**: Add `@keyframes ghost-drift` and utility class.

## File Change Summary

| File | Changes |
|---|---|
| `src/types/index.ts` | +2 fields: `recovering`, `trail` |
| `src/hooks/useGameState.ts` | `submitAnswer` recovery logic, trail push in submitAnswer, trail clear in nextNote |
| `src/App.tsx` | Modified feedback timeout with jitter, recovery window setup, pass `lessonPool`+`trail` to components |
| `src/components/Staff.tsx` | Range indicator dots, ghost trail rendering |
| `src/components/Feedback.tsx` | Recovery text + pulsing ring |
| `src/index.css` | `@keyframes ghost-drift` |
