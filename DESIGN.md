# Piano Redesign — Design Doc

## Goal
Transform theater-themed app into minimalist modern design optimized for smartphone landscape on piano stand.

## Visual System

### Palette (replacing theater colors)
- Background: `#FAFAFA` / dark: `#0A0A0A`
- Card: `#FFFFFF` / dark: `#141414`
- Foreground: `#1A1A1A` / dark: `#F5F5F5`
- Muted: `#F5F5F5` / dark: `#1F1F1F`
- Muted-fg: `#6B6B6B` / dark: `#A3A3A3`
- Border: `#E5E5E5` / dark: `#2A2A2A`
- Primary: `#2563EB` / dark: `#3B82F6`
- Success: `#059669`
- Destructive: `#DC2626`
- Accent (blue): `#2563EB`

### Typography (unchanged - already clean)
- `Inter` body, `Outfit` headings, `system-ui` fallback. Native. No new fonts.

### Delete (theater remnants)
- Components: `ConcertCurtains.tsx`, `OrnateFrame.tsx`, `Spotlight.tsx`, `StreakOwl.tsx`, `LoginModal.tsx` (dead code)
- CSS: all `--curtain-*`, `--gold*`, `--stage-*`, `--spotlight-*`, `--ebony`, `--ivory`, `--neon-*`, `--text-game*`, `--color-wrong`, `--color-correct` vars
- Animations: curtain/constellation/zzz/sleepy/theatre/twilight/gold/mote/owl/avatar-glow
- Tailwind: `stage`, `neon-*`, `game-text`, `correct`, `wrong` colors
- JSX: `<ConcertCurtains>`, `<OrnateFrame>`, `<Spotlight>`, stage-mote divs, themeTransition animation, sleepyClass

### Layout: mobile landscape
- Order: staff (top, ~35%) → keyboard (bottom, ~45%) → feedback overlay (compact)
- Controls bar: compact row at top, no padding waste
- `max-w-2xl` removed — full width on landscape
- `px-4 pt-20` → tighter padding in landscape media query

## Features

### Restart button
- Visible during `waiting`/`feedback` phases
- Icon button in top controls bar (RotateCcw from lucide-react)
- Calls `restartGame()` — resets session

### Pause button
- Only visible when `isTimed && phase !== 'idle'`
- Pauses/resumes countdown timer
- Need: `paused` state + skip interval when paused

### Fix sound on retry
- After wrong answer (recovering phase), auto-play the correct note so user hears what to play
- Add `useEffect` that fires `playNote(currentNote.midi)` when `recovering` transitions to true

### Fix caritas (note expression)
- Replace emoji faces (☺/☹) on Staff with simple color indicator:
  - Green dot below note on correct
  - Red dot below note on wrong
- Cleaner, more minimal

### Login prompt banner
- After 3 anonymous sessions in a row, show subtle banner: "Save your progress — Sign in"
- Track anonymous session count in localStorage
- Banner is dismissable, shows at top below controls

### Keyboard shortcuts
- `R` — restart game (when playing)
- `P` — pause/resume timer (when timed)
- `Space` — trigger "next note" / advance (when in feedback)
- `Escape` — close modals/overlays
- `?` — show keyboard shortcuts help overlay

### Onboarding
- First-time user (no localStorage session history detected): show tooltip-style overlay
- 3 steps: "Press keys to guess the note" → "Green = correct, Red = wrong" → "Try to get 10 right!"
- Dismissable, stored in localStorage

## Implementation Order
1. CSS/new palette + delete theater components + deps
2. Mobile landscape layout (CSS tweaks in App.tsx + index.css)
3. Restart + pause buttons
4. Fix sound on retry
5. Fix caritas (Staff.tsx)
6. Login prompt banner
7. Keyboard shortcuts
8. Onboarding
9. Build test + deploy

## Files Changed
- `src/index.css` (major rewrite of CSS vars)
- `tailwind.config.js` (remove theater colors)
- `src/App.tsx` (major: remove imports, update layout, add buttons/effects)
- `src/components/Staff.tsx` (fix caritas)
- `src/hooks/useGameState.ts` (add `paused` state)
- `src/components/Feedback.tsx` (minor: remove `animate-slide-up` ref)

## Files Deleted
- `ConcertCurtains.tsx`
- `OrnateFrame.tsx`
- `Spotlight.tsx`
- `StreakOwl.tsx`
- `LoginModal.tsx`

## Files Unchanged
- PianoKeyboard, ProgressBar, ScoreDisplay, StreakBadge, ThemeToggle, Toast, UserMenu
- useSound, useMidi, useAuth, useSessionSync, useConfigSync, useDailyStreak
- All game logic in useGameState, lessons, noteToPosition, etc.
