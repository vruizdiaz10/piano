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

