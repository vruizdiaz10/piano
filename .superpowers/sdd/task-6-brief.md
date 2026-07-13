# Task 6: Senior Developer — Implement All 22 Approved Recommendations

## Context

React + TypeScript + Vite + Tailwind piano sight-reading game with concert hall theme. Codebase at `/mnt/d/www/piano/src/`. All changes must sync to both `src/` and `piano-sight-reading/src/`.

Build: `npm run build` (from repo root).

## Implementation Order (do not reorganize)

### Batch 1 — Quick Wins (CSS/Config only, 1-2 files each)

**R2: Default showNoteName to false**
- File: `src/hooks/useGameState.ts`
- Change: `showNoteName: true` → `showNoteName: false`

**P1: Replace indigo accent with amber**
- Files: `src/index.css`, `src/components/PianoKeyboard.tsx`, `src/components/Confetti.tsx`
- In `index.css`: Change `--accent: hsl(239 84% 67%)` to `--accent: hsl(38 92% 50%)` and `--accent-foreground: hsl(210 40% 98%)` to `--accent-foreground: hsl(0 0% 0%)` for both `.light` and `.dark` themes
- In `PianoKeyboard.tsx`: Replace `bg-indigo-500` with `bg-amber-500`, `hover:bg-indigo-600` with `hover:bg-amber-600`
- In `Confetti.tsx`: Remove `'#6366F1'` (indigo) from the colors array since it clashes with the gold/amber palette. Also remove `'#8B5CF6'` (violet) if present.

**P3: Add cursor pointer to interactive keys**
- File: `src/components/PianoKeyboard.tsx`
- Add `cursor-pointer` class to key buttons

**P5: Remove indigo from Confetti palette**
- Already covered in P1 (Confetti.tsx change above)

**M2: Add touch-action for mobile**
- File: `src/index.css`
- Add: `.game-layout { touch-action: manipulation; }`

**M4: Curtain valance height 40px on mobile**
- File: `src/index.css`
- Inside existing `@media (orientation: landscape) and (max-height: 600px)` block add: `--valance-h: 40px;`
- File: `src/components/ConcertCurtains.tsx` — use `var(--valance-h, 64px)` for valance height instead of hardcoded `h-16`

**W1: CSS key press sparkle on correct notes**
- File: `src/index.css`
- Add after `.key-press:active`:
```css
.key-sparkle::after {
  content: ''; position: absolute; inset: -2px; border-radius: 4px;
  background: radial-gradient(circle at center, var(--gold-light) 0%, transparent 70%);
  opacity: 0; pointer-events: none; animation: sparkle-pop 0.4s ease-out forwards;
}
@keyframes sparkle-pop { 0% { opacity: 0.8; transform: scale(1.1); } 100% { opacity: 0; transform: scale(1.3); } }
```
- File: `src/components/PianoKeyboard.tsx` — add `key-sparkle` class to key element when last answer was correct (check if the key matches the last correct answer)

**W2: Gold-pulse on ProgressBar at 50%/75%**
- File: `src/index.css`
- Add or ensure `.animate-gold-pulse` exists:
```css
.animate-gold-pulse { animation: gold-pulse 1s ease-in-out 3; }
@keyframes gold-pulse { 0%,100% { box-shadow: 0 0 0 0 var(--gold); } 50% { box-shadow: 0 0 12px 4px var(--gold); } }
```
- File: `src/components/LevelComplete.tsx` — find the progress bar or score display. When accuracy >= 50% add `animate-gold-pulse`, when >= 75% also add it for celebration. Use a `useEffect` or conditional className.

**W4: Micro-toast for correct/incorrect feedback**
- File: `src/components/Feedback.tsx` or `src/App.tsx` (where feedback is shown)
- Add a brief slide-in + fade-out toast: green border + checkmark for correct, red border + X for incorrect. Duration ~1.5s. Use existing `animate-slide-up` variant.
- Keep it minimal — just colored banner that auto-dismisses.

### Batch 2 — Medium Effort (logic changes, multi-file)

**R1: Track response time per note**
- Files: `src/hooks/useGameState.ts`, `src/types/index.ts`, `src/components/LevelComplete.tsx`
- Add `noteShownAt: number` to GameState, set on nextNote/selectNote
- Add `responseTimes: number[]` to track per-session times
- In submitAnswer: compute `responseTime = Date.now() - state.noteShownAt`, push to responseTimes
- In LevelComplete: show avg response time, best time (fastest)

**R5: Session stats display**
- File: `src/components/LevelComplete.tsx`
- Show avg time, best time, accuracy trend (from sessionHistory or computed per session)
- Already covered by R1 implementation, just ensure UI displays them

**R4: Show correct note on staff after error**
- Files: `src/components/Staff.tsx`, `src/hooks/useGameState.ts`
- Add `lastCorrectNote?: Note` to GameState
- When answer is wrong, set `lastCorrectNote` to the note that should have been played
- In Staff.tsx, if `lastCorrectNote` is set, render it with reduced opacity (opacity-30) alongside the current note for ~1.5s, then clear

**M5: Compact bottom stats bar on mobile**
- File: `src/App.tsx`
- Inside the `@media (orientation: landscape) and (max-height: 600px)` block in CSS or using Tailwind responsive classes: reduce stat pill padding, use icons instead of text labels, smaller font
- If there's a hidden stats bar or compact mode, wire it up

**P4: Fix key width flash on mount**
- File: `src/components/PianoKeyboard.tsx`
- The key width recalculation causes a visible flash. Set initial key width before render or use a CSS transition that makes the resize invisible (start at 0 opacity, fade in after calculation)

### Batch 3 — Complex Changes

**R3: Countdown timer per note**
- Files: `src/hooks/useGameState.ts`, `src/App.tsx`, `src/components/ScoreDisplay.tsx`
- Add `timeRemaining: number` to GameState, default 5s
- Start countdown on each note select
- If time runs out, auto-submit as wrong
- Visual: circular progress ring or shrinking bar in ScoreDisplay
- Respect `sessionTarget`: timer duration could be adaptive (5s for 5-note, 8s for 20-note)
- Add `isTimed: boolean` to GameState, toggleable from toolbar

**R6: Interval labels on staff (3ra, 5ta)**
- File: `src/components/Staff.tsx`
- When 2+ notes visible (or comparing current to previous note), show interval label between them: "3ra", "5ta", "8va", etc.
- Small text above/between the notes, gold colored

**W3: Owl always visible with mood states**
- File: `src/components/StreakOwl.tsx`
- Remove the `if (streak < 3) return null` guard — always render
- Add mood expressions based on streak:
  - streak 0-1: sleepy (half-closed eyes, slow bob)
  - streak 2-4: neutral (current idle bob)
  - streak 5-9: happy (faster bob, slight glow)
  - streak 10+: excited (current bounce + glow)
- Use CSS classes or inline styles, no image assets

**M1: Reduce piano keys on mobile (37 → 14, range C3-C5)**
- Files: `src/components/PianoKeyboard.tsx`
- On mobile landscape: limit visible keys to C3-C5 (14 white keys + 10 black = 24 total, vs current 37 white keys)
- Keep full keyboard on desktop
- Use the existing media query or a `useMediaQuery` to detect mobile
- Ensure note-to-key mapping still works (notes outside range get a visual hint they're off-screen)

**P2: SVG clef glyphs instead of Unicode**
- File: `src/components/Staff.tsx`
- Replace Unicode treble clef `𝄞` and bass clef `𝄢` with inline SVG paths
- SVG treble clef path: `M 20,180 C 20,140 35,100 55,80 C 75,60 85,45 85,30 C 85,15 75,5 65,5 C 55,5 45,15 45,30 C 45,50 60,60 75,60 C 85,60 95,50 95,40 ...` (use a standard music font SVG path)
- SVG bass clef: simpler path
- Keep SVG viewBox consistent with staff rendering

**W5: Curtain tie-back animation**
- File: `src/components/ConcertCurtains.tsx`
- Instead of curtain sliding open with linear animation, add a "tie-back" effect: curtain edges pull to sides with slight rotation, like theater curtains gathering
- Use CSS transform + transition with cubic-bezier easing
- Subtle — small rotation (2-3deg) and slight scale at the edges
- Keep the 0.4s delay for dramatic effect

**M3: Staff viewBox responsive (percentage-based)**
- File: `src/components/Staff.tsx`
- Change staff SVG viewBox from fixed pixel width to percentage/scaling approach
- Use `viewBox="0 0 100 100"` and calculate note positions proportionally
- Or: keep current viewBox but add `preserveAspectRatio="xMidYMid meet"` and `width="100%"`

## Critical Rules

1. Build must pass after each batch: run `npm run build` from repo root
2. After ALL batches complete, sync all changed files: `cp src/* piano-sight-reading/src/ -r`
3. Then commit and push

## Files This Touches (comprehensive list)
- src/index.css
- src/hooks/useGameState.ts
- src/types/index.ts
- src/components/PianoKeyboard.tsx
- src/components/Staff.tsx
- src/components/Confetti.tsx
- src/components/ConcertCurtains.tsx
- src/components/StreakOwl.tsx
- src/components/LevelComplete.tsx
- src/components/Feedback.tsx (if exists)
- src/components/ScoreDisplay.tsx
- src/App.tsx
