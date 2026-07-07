# Game UI Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- []`) syntax for tracking.

**Goal:** Transform piano sight-reading app into engaging game with animations, progress, streaks, sounds, level completion, and dark mode

**Architecture:** Component-based with CSS animations, Web Audio API for sounds, React context for theme

**Tech Stack:** React, TypeScript, Tailwind CSS, Web Audio API

---

## Phase 1: Foundation (CSS + State)

### Task 1: Add CSS Keyframes and Dark Mode Variables

**Files:**
- Modify: `src/index.css`

**Steps:**
- [ ] Add keyframes: shake, bounce, flash-green, flash-red, confetti-fall, pulse-glow, star-appear
- [ ] Add dark mode CSS variables under `.dark` class
- [ ] Add `prefers-reduced-motion` media query to disable animations
- [ ] Verify build passes

### Task 2: Update GameState for Game Features

**Files:**
- Modify: `src/hooks/useGameState.ts`
- Modify: `src/types/index.ts`

**Steps:**
- [ ] Add `bestStreak: number` to GameState
- [ ] Add `sessionTarget: number` (default 10)
- [ ] Add `startTime: number | null` to GameState
- [ ] Add `isMuted: boolean` to GameState
- [ ] Add `theme: 'light' | 'dark'` to GameState
- [ ] Update `startGame` to set `startTime`
- [ ] Update `submitAnswer` to track `bestStreak`
- [ ] Add `setTheme`, `setMuted` actions
- [ ] Verify build passes

### Task 3: Add Sound Effects

**Files:**
- Modify: `src/hooks/useSound.ts`

**Steps:**
- [ ] Add `playCorrect()` - major chord arpeggio (C5-E5-G5)
- [ ] Add `playWrong()` - minor chord (C5-Eb5-G5)
- [ ] Add `playStreakMilestone()` - ascending scale
- [ ] Add `playLevelComplete()` - fanfare
- [ ] Add `isMuted` parameter to all functions
- [ ] Verify build passes

---

## Phase 2: Game Components

### Task 4: Create ProgressBar Component

**Files:**
- Create: `src/components/ProgressBar.tsx`

**Steps:**
- [ ] Create component with `current`, `total`, `label` props
- [ ] Add gradient fill (red → yellow → green)
- [ ] Add animated width transition
- [ ] Add text display (e.g., "3/10")
- [ ] Verify build passes

### Task 5: Create StreakBadge Component

**Files:**
- Create: `src/components/StreakBadge.tsx`

**Steps:**
- [ ] Create component with `streak` prop
- [ ] Add fire emoji 🔥 + streak number
- [ ] Add color escalation (yellow → orange → red)
- [ ] Add glow effect for streak ≥ 5
- [ ] Add combo text ("Combo x3", "¡Racha de fuego!")
- [ ] Verify build passes

### Task 6: Create ScoreDisplay Component

**Files:**
- Create: `src/components/ScoreDisplay.tsx`

**Steps:**
- [ ] Create component with `accuracy`, `totalAttempts` props
- [ ] Add large score number (text-4xl)
- [ ] Add animated count-up effect
- [ ] Add color coding (green ≥80%, yellow ≥50%, red <50%)
- [ ] Add accuracy bar below score
- [ ] Verify build passes

### Task 7: Create Confetti Component

**Files:**
- Create: `src/components/Confetti.tsx`

**Steps:**
- [ ] Create component with `active` prop
- [ ] Add 8-12 CSS-only particles
- [ ] Add random colors (amber, red, green, blue)
- [ ] Add fall animation with rotation
- [ ] Auto-hide after 1.5s
- [ ] Verify build passes

### Task 8: Create LevelComplete Component

**Files:**
- Create: `src/components/LevelComplete.tsx`

**Steps:**
- [ ] Create modal with backdrop blur
- [ ] Add stats summary (accuracy, streak, notes, time)
- [ ] Add star rating (1-3 stars based on accuracy)
- [ ] Add "Reintentar" and "Siguiente Lección" buttons
- [ ] Add slide-up animation
- [ ] Verify build passes

### Task 9: Create ThemeToggle Component

**Files:**
- Create: `src/components/ThemeToggle.tsx`

**Steps:**
- [ ] Create toggle with sun/moon icons
- [ ] Add localStorage persistence
- [ ] Add `prefers-color-scheme` initial state
- [ ] Add smooth transition
- [ ] Verify build passes

---

## Phase 3: Integration

### Task 10: Integrate Components into App

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Feedback.tsx`
- Modify: `src/components/Staff.tsx`

**Steps:**
- [ ] Add ProgressBar below toolbar
- [ ] Add StreakBadge to stats section
- [ ] Add ScoreDisplay to stats section
- [ ] Add Confetti on correct answer
- [ ] Add LevelComplete modal on session end
- [ ] Add ThemeToggle to header
- [ ] Add flash overlay to Staff on answer
- [ ] Add shake animation to Staff on wrong
- [ ] Add dark mode classes to all components
- [ ] Verify build passes

### Task 11: Add Animations to Feedback

**Files:**
- Modify: `src/components/Feedback.tsx`

**Steps:**
- [ ] Add bounce animation on correct
- [ ] Add shake animation on wrong
- [ ] Add slide-in for note name reveal
- [ ] Add sound triggers (playCorrect/playWrong)
- [ ] Verify build passes

### Task 12: Final Integration and Testing

**Files:**
- All modified files

**Steps:**
- [ ] Test all animations work
- [ ] Test dark mode toggle
- [ ] Test sound effects (with mute option)
- [ ] Test level completion flow
- [ ] Test progress tracking
- [ ] Test streak visuals
- [ ] Verify build passes
- [ ] Verify no TypeScript errors

---

## Execution Handoff

After all tasks complete:
1. Run `npm run build` to verify
2. Commit with descriptive message
3. Push to GitHub

¿Ejecutamos?
