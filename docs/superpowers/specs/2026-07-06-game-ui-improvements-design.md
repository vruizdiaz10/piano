# Game UI Improvements Design

## Objective
Transform the piano sight-reading app from a basic educational tool into an engaging game-like experience with animations, progress tracking, streak visuals, sound effects, and level completion.

## Current State
- Basic UI with amber/red palette, Baloo 2 headings
- Simple feedback (correct/wrong text)
- Basic stats (streak, score, total)
- No animations beyond basic transitions
- No progress tracking
- No level completion
- No dark mode

## Design Decisions

### 1. Animations (CSS Keyframes + React State)

**Correct Answer:**
- Green flash overlay on staff area (200ms)
- Bounce animation on feedback badge
- Confetti particles (CSS only, 8-12 particles)

**Wrong Answer:**
- Shake animation on staff area (400ms, 5px amplitude)
- Red flash overlay (200ms)
- Note name reveal with slide-in

**State Transitions:**
- Fade + slide between phases (300ms)
- Button hover: translateY(-2px) + shadow increase
- Button active: translateY(0) + shadow decrease

**Implementation:**
- CSS `@keyframes` in `index.css`
- React state for animation triggers
- `useEffect` for cleanup

### 2. Progress Indicator

**Session Progress:**
- Progress bar: `correctAttempts / totalAttempts` (or target)
- Visual: gradient fill from red → yellow → green
- Text: "3/10" or percentage

**Lesson Progress:**
- Text: "Lección 3 de 9"
- Visual: numbered dots/badges

**Implementation:**
- New `ProgressBar` component
- Props: `current`, `total`, `label`
- Animates width on update

### 3. Streak Visual

**Fire Icon:**
- 🔥 emoji + streak number
- Color escalation: yellow (1-4) → orange (5-9) → red (10+)
- Glow effect: `box-shadow` with color matching streak

**Combo Text:**
- "Combo x3" for streak ≥ 3
- "¡Combo x5!" for streak ≥ 5
- "¡Racha de fuego!" for streak ≥ 10

**Implementation:**
- StreakBadge component
- Dynamic classes based on streak value
- CSS `@keyframes pulse` for glow

### 4. Score Display

**Large Score Number:**
- Centered, large font (text-4xl)
- Animated counter (count up effect)
- Color: green (≥80%), yellow (≥50%), red (<50%)

**Accuracy Bar:**
- Thin bar below score
- Fill color matches score color
- Animated width

**Implementation:**
- ScoreDisplay component
- `useEffect` with interval for count-up animation
- CSS transitions for color changes

### 5. Sound Effects

**Correct Sound:**
- Major chord arpeggio (C-E-G, 100ms each)
- Bright, uplifting tone

**Wrong Sound:**
- Minor chord (C-Eb-G, 80ms each)
- Descending, muted tone

**Streak Milestone:**
- Ascending scale (C-D-E-F-G, 60ms each)
- Played at streak 5, 10, 15, etc.

**Level Complete:**
- Fanfare: C-E-G-C (octave), 100ms each
- Sustained final note

**Implementation:**
- Extend `useSound.ts` with new functions
- `playCorrect()`, `playWrong()`, `playStreakMilestone()`, `playLevelComplete()`
- Web Audio API oscillators with different frequencies

### 6. Level Completion

**Modal Overlay:**
- Backdrop blur + dark overlay
- Centered card with stats
- Slide-up animation

**Stats Summary:**
- Accuracy percentage (large)
- Best streak
- Total notes played
- Time elapsed

**Star Rating:**
- 1 star: < 50% accuracy
- 2 stars: 50-79% accuracy
- 3 stars: ≥ 80% accuracy
- Stars animate in sequence (0.3s delay each)

**Actions:**
- "Reintentar" button (same lesson)
- "Siguiente Lección" button (next lesson)
- "Cerrar" button (back to idle)

**Implementation:**
- `LevelComplete` component
- Props: `accuracy`, `bestStreak`, `totalNotes`, `timeElapsed`, `lessonId`
- Portal or fixed positioning for modal
- CSS animations for stars

### 7. Dark Mode

**Toggle:**
- Sun/moon icon in header
- Toggle state persisted in localStorage
- Smooth transition between themes

**Dark Theme Colors:**
- Background: slate-900 → slate-800 gradient
- Cards: slate-800 with slate-700 border
- Text: slate-100 (primary), slate-400 (secondary)
- Accent: same amber/red palette
- Staff: dark background with light lines

**Implementation:**
- Theme context in `useGameState` or separate `useTheme`
- CSS variables for light/dark
- Toggle button in header
- `prefers-color-scheme` media query for initial state

## File Changes

### New Files
- `src/components/ProgressBar.tsx` - Progress bar component
- `src/components/StreakBadge.tsx` - Streak visual with fire
- `src/components/ScoreDisplay.tsx` - Large score with animation
- `src/components/LevelComplete.tsx` - Level completion modal
- `src/components/Confetti.tsx` - Confetti particles
- `src/components/ThemeToggle.tsx` - Dark mode toggle

### Modified Files
- `src/App.tsx` - Integrate new components, add dark mode
- `src/hooks/useGameState.ts` - Add bestStreak, sessionTarget
- `src/hooks/useSound.ts` - Add new sound functions
- `src/components/Feedback.tsx` - Add animations
- `src/components/Staff.tsx` - Add flash overlay
- `src/index.css` - Add keyframes, dark mode variables
- `tailwind.config.js` - Add dark mode class strategy

## Non-Functional Requirements
- All animations respect `prefers-reduced-motion`
- Dark mode follows `prefers-color-scheme` as default
- Sound effects can be muted
- Performance: animations use `transform` and `opacity` only
- Accessibility: ARIA labels for all interactive elements

## Future (Phase 2+)
- Leaderboard
- Achievement badges
- Daily challenges
- Custom lesson creation
- Bass clef support
