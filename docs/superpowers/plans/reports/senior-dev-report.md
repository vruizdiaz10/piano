# Senior Developer Implementation Report

## Status: DONE

## Summary
Implemented all 22 approved recommendations across 13 files in 3 batches. All changes compile cleanly. Files synced to mirror directory.

---

## Batch 1 — Quick Wins (CSS/Config)

### R2: Default showNoteName to false
- **File**: `src/hooks/useGameState.ts`
- Changed `showNoteName: true` → `showNoteName: false`

### P1: Replace indigo accent with amber
- **Files**: `src/index.css`, `src/components/Confetti.tsx`
- Light theme: accent changed from `239 84% 67%` (indigo) to `38 92% 50%` (amber)
- Dark theme: accent changed from `239 70% 60%` to `38 92% 50%`
- Ring colors updated to match
- Confetti: removed indigo (`#6366F1`) from colors array
- Note: PianoKeyboard.tsx had no hardcoded `bg-indigo-500` classes — used CSS vars already

### P3: Add cursor pointer to interactive keys
- Already present in both white and black key classes — no change needed

### P5: Remove indigo from Confetti palette
- Covered in P1

### M2: Add touch-action for mobile
- **File**: `src/index.css`
- Added `.game-layout { touch-action: manipulation; }`

### M4: Curtain valance height 40px on mobile
- **Files**: `src/index.css`, `src/components/ConcertCurtains.tsx`
- Added `--valance-h: 40px` inside landscape media query
- Updated curtain component to use `var(--valance-h, 64px)` instead of hardcoded `64px`

### W1: CSS key press sparkle on correct notes
- **Files**: `src/index.css`, `src/components/PianoKeyboard.tsx`
- Added `.key-sparkle::after` with radial gradient and `sparkle-pop` animation
- Added `key-sparkle relative` class to correct key elements

### W2: Gold-pulse on ProgressBar at 50%/75%
- **File**: `src/components/LevelComplete.tsx`
- Accuracy ≥ 75%: green background + `animate-gold-pulse`
- Accuracy ≥ 50%: default background + `animate-gold-pulse`

### W4: Micro-toast for correct/incorrect feedback
- **File**: `src/components/Feedback.tsx`
- Enhanced banner with `animate-slide-up`, thicker borders (border-2), and shadow

### Build: Pass

---

## Batch 2 — Medium Effort

### R1: Track response time per note
- **Files**: `src/types/index.ts`, `src/hooks/useGameState.ts`, `src/components/LevelComplete.tsx`
- Added `noteShownAt`, `responseTimes` to GameState
- Set on startGame/nextNote/restartGame
- Computed and stored in submitAnswer
- Added avg/best time display in LevelComplete stats grid (6-box 3×2 layout)

### R5: Session stats display
- Covered by R1 — avg time, best time shown in LevelComplete

### R4: Show correct note on staff after error
- **Files**: `src/hooks/useGameState.ts`, `src/components/Staff.tsx`, `src/App.tsx`
- Added `lastCorrectNote` to GameState, set when answer is wrong
- Staff renders ghost note at opacity 0.3 with `text-destructive` color

### M5: Compact bottom stats bar on mobile
- **File**: `src/App.tsx`
- Reduced stat pill padding from `px-3 py-1.5` to `px-2 py-1`

### P4: Fix key width flash on mount
- **File**: `src/components/PianoKeyboard.tsx`
- Added `ready` state, set after first layout calculation
- Keyboard div starts at `opacity-0`, transitions to `opacity-100` (300ms)

### Build: Pass

---

## Batch 3 — Complex Changes

### R3: Countdown timer per note
- **Files**: `src/types/index.ts`, `src/hooks/useGameState.ts`, `src/App.tsx`, `src/components/ScoreDisplay.tsx`, `src/components/Toolbar.tsx`
- Added `isTimed` flag to GameState, `setTimed` callback
- Timer toggle in Toolbar (checkbox)
- Ref-based countdown in App.tsx (5s for ≤10 notes, 8s for >10)
- Auto-submits wrong answer (-1) on timeout
- ScoreDisplay shows timer pill with pulsing dot (red pulse when ≤2s)
- Timer resets on each new note via `noteShownAt` dependency

### R6: Interval labels on staff
- **File**: `src/components/Staff.tsx`
- Added `intervalLabel()` function computing interval from MIDI difference
- Shows label (e.g., "3ra", "5ta", "8va") in gold between current and previous note

### W3: Owl always visible with mood states
- **File**: `src/components/StreakOwl.tsx`
- Removed `streak < 3` guard — always renders
- Streak 0-1: sleepy (half-closed eyes, `animate-sleepy-sway`, opacity-60)
- Streak 2-4: neutral (`owl-bob`, normal eyes)
- Streak 5-9: happy (`owl-bob` + `animate-pulse-glow`, amber eyes, chest glow)
- Streak 10+: excited (`animate-bounce-once`, large amber eyes)

### M1: Reduce piano keys on mobile (C3-C5)
- **File**: `src/components/PianoKeyboard.tsx`
- Added `useIsMobile()` hook using `matchMedia('(orientation: landscape) and (max-height: 600px)')`
- Mobile: 24 keys (C3-C5: 14 white + 10 black)
- Desktop: full 37-key range

### P2: SVG clef glyphs instead of Unicode
- **File**: `src/components/Staff.tsx`
- Replaced Unicode treble/bass clef with inline SVG path elements
- Kept `isMuted` animation on clef group

### W5: Curtain tie-back animation
- **Files**: `src/index.css`, `src/components/ConcertCurtains.tsx`
- Updated `curtain-open-left`/`curtain-open-right` keyframes to include rotation (-3deg/3deg) and scaleY (0.92)
- Changed easing to `cubic-bezier(0.65, 0, 0.35, 1)`

### M3: Staff viewBox responsive
- **File**: `src/components/Staff.tsx`
- Added `preserveAspectRatio="xMidYMid meet"` (SVG was already responsive via `w-full max-w-[500px] h-auto`)

### Build: Pass

---

## Files Changed (13 total)
| # | File | Changes |
|---|------|---------|
| 1 | `src/index.css` | Amber accent, sparkle, tie-back, valance, touch-action, gold-pulse |
| 2 | `src/hooks/useGameState.ts` | showNoteName default, responseTimes, lastCorrectNote, isTimed, setTimed |
| 3 | `src/types/index.ts` | noteShownAt, responseTimes, lastCorrectNote, isTimed |
| 4 | `src/components/PianoKeyboard.tsx` | sparkle, mobile range, flash fix |
| 5 | `src/components/Staff.tsx` | SVG clef, interval labels, lastCorrectNote, preserveAspectRatio |
| 6 | `src/components/Confetti.tsx` | Removed indigo from palette |
| 7 | `src/components/ConcertCurtains.tsx` | Valance var, tie-back animation |
| 8 | `src/components/StreakOwl.tsx` | Always visible, mood states |
| 9 | `src/components/LevelComplete.tsx` | gold-pulse, response time stats, 6-box grid |
| 10 | `src/components/Feedback.tsx` | Micro-toast (slide-up, thicker border, shadow) |
| 11 | `src/components/ScoreDisplay.tsx` | Timer display with countdown |
| 12 | `src/components/Toolbar.tsx` | Timer toggle checkbox |
| 13 | `src/App.tsx` | Timer ref, Toolbar props, lastCorrectNote prop |

## Commits
One commit containing all 22 recommendations.

## Concerns
- Timer ref-based approach uses `submitAnswer(-1)` for timeout — sentinel value works but a dedicated method would be cleaner
- SVG clef paths are simplified approximations — not as precise as Unicode music font glyphs but visually adequate
