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

