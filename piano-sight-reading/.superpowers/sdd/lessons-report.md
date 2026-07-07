# Lessons Feature Report

**Status**: Complete

**Commit**: `3530e5f` - feat: add progressive lessons replacing difficulty

## Changes

| File | Action | Summary |
|------|--------|---------|
| `src/data/lessons.ts` | Created | 9 progressive lessons with MIDI note pools |
| `src/types/index.ts` | Modified | `difficulty: Difficulty` → `lessonId: string`; removed `Difficulty` type |
| `src/hooks/useGameState.ts` | Modified | Uses `lessonId` + `getLessonPool` instead of `difficulty` + `getNotePool` |
| `src/components/Toolbar.tsx` | Modified | Lesson selector dropdown with description; removed difficulty select |
| `src/components/PianoKeyboard.tsx` | Modified | Removed `difficulty` prop; fixed range C3-C7 (48, count 37) |
| `src/App.tsx` | Modified | `setDifficulty` → `setLesson`; updated props |
| `src/utils/noteToPosition.ts` | Modified | Removed `getNotePool` and `Difficulty` import (unused) |

**Build**: `npm run build` — passes clean (0 errors)

## Concerns

- `PianoKeyboard` now always shows full C3-C7 range (37 keys). Lesson defines which notes appear, not visible range.
- `noteToPosition.ts` still exports `noteToPosition` used by `Staff` — kept intact.
