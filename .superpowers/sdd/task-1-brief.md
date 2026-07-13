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

