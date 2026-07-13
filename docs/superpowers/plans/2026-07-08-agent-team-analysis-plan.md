# Agent Team Analysis + Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run 4 analyst agents (Game Designer, UI Designer, Whimsy Injector, UX Architect) to analyze the piano sight-reading game, collect recommendations, get user approval, then dispatch Senior Developer to implement.

**Architecture:** Parallel agent dispatch for analysis, sequential for implementation. Each analyst agent receives a detailed brief covering codebase state, existing work, and analysis focus. Reports follow uniform format. User gates implementation.

**Tech Stack:** opencode subagent tasks (`task` tool), React + TypeScript + Vite + Tailwind

## Global Constraints

- All changes must work in light AND dark mode
- Zero external asset files — all visuals via CSS/SVG
- Mobile landscape: `(orientation: landscape) and (max-height: 600px)`
- All changes synced to `src/` AND `piano-sight-reading/src/`
- Build must pass after each implementation batch: `npm run build`
- No new dependencies unless explicitly approved

---

### Task 1: Launch Game Designer — Pedagogical Analysis

**Files:**
- Output: `docs/superpowers/plans/reports/game-designer-report.md`

**Brief for agent:**
Analyze `/mnt/d/www/piano/src/` — a React piano sight-reading game. Examine:
1. `src/hooks/useGameState.ts` — game state machine, scoring, streak logic
2. `src/components/Staff.tsx` — note rendering, clef display, StaffNote interaction
3. `src/components/PianoKeyboard.tsx` — key interaction, highlight
4. `src/components/LevelComplete.tsx` — feedback screen
5. `src/data/lessons.ts` — lesson structure, note pools
6. `src/utils/weakPool.ts` — wrong-note tracking

Evaluate pedagogical effectiveness for sight-reading:
- Error feedback clarity (wrong note vs right note, what to improve)
- Progression design (do lessons build on each other?)
- Difficulty curve (too steep? too shallow?)
- Motivation mechanics (streaks, scores, level-up feel)
- Sight-reading specific pedagogy (note recognition speed, hand-eye coordination)
- Gaps: what's missing that would actually improve sight-reading ability?

Recommendations must be specific (file:line), actionable, with effort estimate.

- [ ] **Step 1: Write the Game Designer brief and dispatch agent**
- [ ] **Step 2: Collect report into docs/supervisors/plans/reports/game-designer-report.md**

---

### Task 2: Launch UI Designer — Visual Design Audit

**Files:**
- Output: `docs/superpowers/plans/reports/ui-designer-report.md`

**Brief for agent:**
Analyze visual design of React piano game at `/mnt/d/www/piano/src/`. Examine:
1. `src/index.css` — CSS variables, color system, typography, animations
2. `src/App.tsx` — layout, containers, stat pills
3. All components in `src/components/`:
   - `ConcertCurtains.tsx` — SVG valance, tassels
   - `OrnateFrame.tsx` — gold corner decorations
   - `Spotlight.tsx` — radial gradient overlay
   - `PianoKeyboard.tsx` — ivory/ebony keys with gold
   - `Staff.tsx` — musical staff rendering
   - `StreakOwl.tsx`, `StreakBadge.tsx` — gamification visuals
   - `ScoreDisplay.tsx`, `LevelComplete.tsx` — feedback
   - `ThemeToggle.tsx` — dark/light mode
   - `Confetti.tsx` — celebration effect
   - `ProgressChart.tsx` — session history SVG
4. Current CSS vars: `--gold`, `--gold-dim`, `--gold-light`, `--stage-bg`, `--stage-floor`, `--ivory`, `--ebony`, `--curtain`, `--curtain-fold`

Evaluate:
- Color harmony (gold + maroon + ivory palette, does it work?)
- Typography (font choices, hierarchy, readability)
- Component polish (shadows, borders, radius, spacing consistency)
- Light/dark mode (do all colors work in both?)
- Overall visual coherence (concert hall theme, does it deliver?)
- Specific improvement recommendations with file:line, effort estimate

- [ ] **Step 1: Write the UI Designer brief and dispatch agent**
- [ ] **Step 2: Collect report**

---

### Task 3: Launch Whimsy Injector — Delight & Animation Audit

**Files:**
- Output: `docs/superpowers/plans/reports/whimsy-injector-report.md`

**Brief for agent:**
Analyze animation, feedback, and personality in piano game at `/mnt/d/www/piano/src/`. Examine:
1. `src/index.css` — keyframes (curtain-open, mote-float, owl-bob, pulse-glow, bounce-once, slide-up, confetti)
2. `src/components/ConcertCurtains.tsx` — curtain animation (open/close timing, delay)
3. `src/components/Spotlight.tsx` — opacity transition
4. `src/components/Confetti.tsx` — celebration particles
5. `src/components/StreakOwl.tsx` — owl idle bob, streak animations
6. `src/components/PianoKeyboard.tsx` — key press:active effects (scale + shadow)
7. Stage-mote particles in CSS (floating dots)
8. `src/App.tsx` — phase transitions (idle → playing → levelComplete)

Evaluate:
- Moment-to-moment feedback (key press, correct/wrong answer, level complete)
- Transitions between states (idle → game, game → results)
- Personality (does the game feel alive? characters? surprises?)
- Animation principles applied (easing, delay, overlap, anticipation)
- Gaps: what moments feel flat? where could delight be added?
- Specific recommendations with file:line, effort estimate

- [ ] **Step 1: Write the Whimsy Injector brief and dispatch agent**
- [ ] **Step 2: Collect report**

---

### Task 4: Launch UX Architect — Mobile Responsive Audit

**Files:**
- Output: `docs/superpowers/plans/reports/ux-architect-report.md`

**Brief for agent:**
Analyze mobile landscape support for piano game at `/mnt/d/www/piano/src/`. Examine:
1. `src/App.tsx` — main layout structure
2. `src/index.css` — mobile landscape media queries, existing responsive rules
3. `src/components/PianoKeyboard.tsx` — keyboard sizing, key count on mobile
4. `src/components/Staff.tsx` — note/clef sizing on small screens
5. `src/components/ConcertCurtains.tsx` — curtain size in viewport
6. `src/components/ScoreDisplay.tsx` — stat readability on mobile
7. `src/hooks/useGameState.ts` — touch event handling, interaction model

Current mobile state:
- Media query: `@media (orientation: landscape) and (max-height: 600px)`
- Staff + keyboard side-by-side in landscape
- Existing CSS vars for sizing

Evaluate:
- Touch target sizes (minimum 44px for fingers)
- Layout reflow (does the game work in landscape 360x640 to 932x430?)
- Readability (text size, note size at smallest viewport)
- Interaction (touch events, accidental taps, key spacing)
- What breaks or feels bad on mobile currently
- Specific recommendations with file:line, effort estimate

- [ ] **Step 1: Write the UX Architect brief and dispatch agent**
- [ ] **Step 2: Collect report**

---

### Task 5: User Review — Approve Recommendations

- [ ] **Step 1: Display all 4 reports to user**
- [ ] **Step 2: Let user approve/reject each recommendation**
- [ ] **Step 3: Compile approved list for Senior Developer**

---

### Task 6: Senior Developer — Implement Approved Changes

**Files:**
- Modify: per approved recommendations (varies)
- Test: `npm run build`

- [ ] **Step 1: For each approved recommendation, implement the change**
- [ ] **Step 2: Sync changes to both `src/` and `piano-sight-reading/src/`**
- [ ] **Step 3: Run `npm run build` and verify success**
- [ ] **Step 4: Commit and push**
