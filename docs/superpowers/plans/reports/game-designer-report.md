# Game Designer Report: Pedagogical Analysis

**Game**: Piano Sight-Reading Trainer (Concert Hall Theme)
**Analyzed**: 2026-07-08
**Scope**: `src/hooks/useGameState.ts`, `src/components/Staff.tsx`, `src/components/PianoKeyboard.tsx`, `src/components/LevelComplete.tsx`, `src/data/lessons.ts`, `src/utils/weakPool.ts`, `src/components/Feedback.tsx`, `src/types/index.ts`

---

## 1. Summary

Strong foundation — weak pool tracking, error classification, progressive lesson gating, and recovery mechanic are all solid pedagogical building blocks. However, the game teaches **note identification** rather than **sight-reading**. Sight-reading requires processing speed, rhythm, and forward-looking gaze — none of which exist yet. The `showNoteName` default defeats the core skill. Biggest single win: add response-time tracking and make it a progression gate.

---

## 2. Recommendations (Prioritized)

### P0 — Critical (blocks sight-reading transfer)

---

**R1: Track response time per note; surface in feedback + mastery**

- **What**: `src/hooks/useGameState.ts:55-93` — `submitAnswer()` doesn't measure elapsed time from note display to answer. `src/types/index.ts:22-27` — `MasteryCriteria` has no timing metric.
- **Why**: Sight-reading is **time-constrained** note recognition. Without speed pressure, player learns to identify notes at any pace — a skill that does not transfer to real sight-reading where the music keeps moving. A player passing "lines" at 15s/note has not mastered sight-reading.
- **How**:
  1. Add `noteShownAt: number` to `GameState`. Set on `selectNote`/`nextNote`. In `submitAnswer`, compute `responseTime = Date.now() - prev.noteShownAt`.
  2. Store `responseTimes: number[]` per session. Compute average in `LevelComplete`.
  3. Add `maxAvgTimeMs?: number` to `MasteryCriteria` (e.g., `maxAvgTimeMs: 3000` for 3 seconds).
  4. Level complete screen shows avg time + "best time" with motivational copy.
- **Effort**: Low (add 2 fields, one computation, one UI display)

---

**R2: Default `showNoteName` to `false`**

- **What**: `src/hooks/useGameState.ts:22` — `showNoteName: true`.
- **Why**: Showing the note name (`C4`, `F#5`) directly above the staff **bypasses** the entire sight-reading neural pathway. The player reads text instead of decoding staff position → finger location. This is the single most common mistake in note-learning apps. Novices should be weaned off note names immediately.
- **How**: Change to `showNoteName: false`. Keep toggle in `Toolbar` for quick reference when stuck — but opt-in, not default.
- **Effort**: Low (one boolean change)

---

**R3: Show correct note position on staff after error (not just piano key)**

- **What**: `src/components/Staff.tsx:78-127` — on wrong answer, staff still renders the correct note. But there is no **visual comparison** between what the player played and the correct note.
- **Why**: Error feedback currently shows "Era C4" (text) and highlights the correct piano key. The learner needs to see the **spatial relationship** on the staff — "I played this line, but C4 is on that space." This builds the visual-motor connection that sight-reading depends on.
- **How**: Add optional `ghostNote?: Note` prop to `Staff`. On wrong answer, render a ghost note (dimmed, dashed stem) at the position the player actually played. The correct note remains solid. Player can visually compare "I hit E4 (line) but correct was F4 (space)" on the staff itself.
- **Effort**: Medium (add ghost rendering, wire ghostNote from game state through App → Staff)

---

**R4: Add speed tier to mastery gating**

- **What**: `src/types/index.ts:22-27` — `MasteryCriteria` needs a `maxAvgTimeMs` field. `src/data/lessons.ts:13-31` — each lesson needs time targets.
- **Why**: Current mastery criteria (accuracy, streak, note count) can all be met at arbitrarily slow speeds. A player who identifies notes correctly but takes 8 seconds per note will fail at real sight-reading. Speed is not optional — it is the definition of the skill.
- **How**:
  ```
  // types/index.ts
  export interface MasteryCriteria {
    minAccuracy: number
    minStreak: number
    minNotes: number
    maxAvgTimeMs: number   // new
    unlockNext: boolean
  }
  ```
  Suggested defaults per stage:
  - Basic (lines, spaces): 5s
  - Combined (lines-spaces, staff-range): 4s
  - Extended range (ledger lines): 6s
  - Full range + accidentals: 3s
- **Effort**: Low (add field, update each lesson entry, gate check in `LevelComplete.tsx:44-49`)

---

### P1 — High Impact

---

**R5: Add simple rhythm/timing mode**

- **What**: New component + game mode. Currently no temporal dimension.
- **Why**: Real sight-reading has a beat. Notes move forward at a fixed tempo. The player must process and play within the rhythmic window. Without this, the game is "pitch identification flashcards" not "sight-reading practice."
- **How** (minimum viable):
  1. Add a BPM selector (60/80/100/120) as an optional mode toggle.
  2. Notes auto-advance every `(60 / BPM) * beatsPerNote` seconds.
  3. If player hasn't answered when note advances, count as miss.
  4. Green/yellow/red timing indicator on answer (early/on-time/late).
- **Effort**: High (new game mode, timer system, BPM UI, miss-on-timeout logic). But this is the feature that transforms the app's pedagogical category.

---

**R6: Show interval between consecutive notes**

- **What**: `src/components/Staff.tsx` — no interval label or visual.
- **Why**: Expert sight-readers read by **interval**, not by naming each note. Training interval recognition (major 3rd up, perfect 5th down) is the highest-leverage skill for fluency. Even showing "M3↑" or "P5↓" between notes builds this mental model.
- **How**:
  1. Add `previousNote?: Note` to `StaffProps`.
  2. Compute `semitoneDiff = currentNote.midi - previousNote.midi`.
  3. Display small label between notes (e.g., "3ª M ↑") or use color coding (green for stepwise, yellow for skip, red for leap).
- **Effort**: Low (compute diff, look up interval name, render label)

---

**R7: Show "most common error type" on Level Complete**

- **What**: `src/components/LevelComplete.tsx:118-135` — stats grid shows only accuracy, streak, notes, time.
- **Why**: Learners benefit from meta-cognitive feedback. "You made 40% Line/Space errors" tells the player what to focus on. Currently error feedback is per-note and ephemeral — it disappears on next note.
- **How**:
  1. Pass error type history (or aggregate counts) from game state.
  2. Add a 5th stat tile: "Error más común: Línea/Espacio (40%)"
  3. Color-code the stat (red if >30% of errors are one type).
- **Effort**: Medium (track error type counts per session, pass to LevelComplete, render)

---

**R8: Add "look-ahead" preview ghost**

- **What**: `src/components/Staff.tsx` — current note is the only note visible.
- **Why**: A core sight-reading skill is looking ahead. Players should learn to process the current note while peripherally registering the next one. Without this, the game doesn't train gaze management.
- **How**: Optional mode that shows the upcoming note as a faint ghost (opacity 0.2) slightly to the right on the staff. Player can toggle via Toolbar: "Vista prevista."
- **Effort**: Medium (add `nextNote` prop to Staff, render ghost, wire from game state)

---

### P2 — Medium Impact

---

**R9: Cross-session weak note persistence with decay**

- **What**: `src/utils/weakPool.ts:1-19` — stores only last 10 wrong notes in localStorage, session-only scope.
- **Why**: Sight-reading difficulties persist across sessions. A note you got wrong 3 days ago should still be weighted higher today. Current pool resets or overwrites. Spaced repetition is proven for skill acquisition.
- **How**:
  ```
  // weakPool.ts — add versioned store with decay
  interface WeakEntry { midi: number; count: number; lastSeen: number }
  // load all, decay weight by days since lastSeen, keep top N
  // getWeakNotes() returns weighted list based on error count * recency
  ```
  Keep it simple: decrement count by 1 each day, minimum 0. Higher count = higher selection probability.
- **Effort**: Medium (storage migration, decay math, existing `addWeakNote` signature changes)

---

**R10: Timed auto-advance mode ("pressure mode")**

- **What**: `src/hooks/useGameState.ts:96-101` — `nextNote()` only fires on manual "Siguiente Nota" click or after a timer.
- **Why**: Players can stall indefinitely. Auto-advance creates urgency that mimics real reading. Even without rhythm/tempo, a simple "you have 5 seconds per note" mode forces processing speed.
- **How**: Add `pressureMode: boolean` to session options. In this mode, `nextNote()` fires automatically after `PRESSURE_TIMEOUT_MS` (configurable per lesson). If player hasn't answered, count as miss and move on.
- **Effort**: Medium (new state, timer logic, miss-on-timeout counting)

---

**R11: Session-end "one more note" option**

- **What**: `src/hooks/useGameState.ts:64` — `sessionDone` jumps straight to `levelComplete`.
- **Why**: When a player hits the last note and gets it right, the dopamine hit of "one more" is a powerful retention mechanic. The session target is a floor, not a ceiling. Let the player extend.
- **How**: After `totalAttempts >= sessionTarget`, show a small "Continue" or "+5 notes" option before the level complete screen. Or show level complete with a "One more round!" button that adds 5 more notes.
- **Effort**: Low (modify session-end branching, add optional `extendSession` function)

---

**R12: Visual lesson preview / "what you'll learn" overlay**

- **What**: `src/data/lessons.ts` — each lesson has `desc` string but it's not shown prominently before starting.
- **Why**: Learners need to understand the **concept** before drilling it. "Lines (Treble)" should show a quick staff diagram highlighting which notes are on lines before the player starts. This reduces frustration and provides a mental model.
- **How**: Add a one-time lesson intro panel (dismissable) that shows the note pool on a mini staff with highlighted positions. Trigger on first start of each lesson.
- **Effort**: Medium (new component, staff mini-render, lesson start flow modification)

---

**R13: Add keyboard shortcut support (QWERTY → piano keys)**

- **What**: `src/components/PianoKeyboard.tsx` — mouse/touch only.
- **Why**: Clicking tiny piano keys with a mouse is slow and error-prone. For sight-reading speed practice, keyboard shortcuts (e.g., ZXCVBNM... mapped to C4-B4) allow much faster response. This also builds a different (but useful) motor pathway.
- **How**: Add `KeyboardShortcutProvider` that maps QWERTY rows to piano keys. Show key labels on piano keys when shortcuts are active. Toggle via Toolbar.
- **Effort**: Medium (key mapping, key label rendering, conflict avoidance with existing keyboard handlers)

---

## 3. Gaps (Missing Entirely)

| Gap | Why It Matters | Suggested Approach |
|-----|---------------|--------------------|
| **No rhythm/tempo system** | Sight-reading is inherently rhythmic. Without it, this is a flashcard app, not a sight-reading trainer. | `R5` — beat-synced auto-advance |
| **No speed requirement in progression** | Player can "master" a lesson at 15s/note. Real reading requires sub-2s recognition. | `R1` + `R4` — response time tracking + speed gating |
| **No interval training** | Expert readers recognize intervals, not individual notes. | `R6` — interval labels between consecutive notes |
| **No look-ahead training** | Gaze management is a core sight-reading skill. | `R8` — next-note preview ghost |
| **No error visualization on staff** | Spatial comparison is more effective than text labels for building staff fluency. | `R3` — ghost note of player's answer on staff |
| **No meta-cognitive error summary** | Learners don't know what they're bad at. | `R7` — error type breakdown on level complete |
| **No cross-session memory** | Weak pool resets. Spaced repetition is proven for long-term retention. | `R9` — persistent weak pool with decay |
| **No "hands-free" play mode** | Clicking keys is slow; real sight-reading uses a physical keyboard. | `R13` — QWERTY key mapping |
| **No lesson concept introduction** | Learners thrown into drill without context. | `R12` — visual "what you'll learn" preview |
| **No session extensions** | Fixed session length misses "one more" retention moments. | `R11` — extend session option |

---

## 4. Pedagogical Model Assessment

Current loop:
```
Show note → Player clicks piano → Feedback (correct/wrong + text tip) → Next note
```

What sight-reading pedagogy requires:
```
Show note (with context: clef, key signature optional) 
→ Player must process AND respond within time constraint 
→ Feedback shows spatial relationship on staff 
→ Interval to previous note highlighted 
→ Error types accumulate into meta-feedback 
→ Speed gates progression
```

The fundamental shift needed: **from accuracy-only to accuracy + speed**. Every recommendation above serves that shift.

---

## 5. Effort Summary

| Effort | Count | Items |
|--------|-------|-------|
| **Low** | 3 | R1 (time tracking), R2 (showNoteName default), R4 (mastery speed gate) |
| **Medium** | 8 | R3 (ghost note on staff), R6 (interval labels), R7 (error summary), R8 (look-ahead), R9 (cross-session weak pool), R10 (timed mode), R11 (one-more-note), R12 (lesson preview), R13 (keyboard shortcuts) |
| **High** | 1 | R5 (rhythm/tempo mode) |

**Total: 13 recommendations — 3 low, 9 medium, 1 high.**

---

## 6. Quick Wins (Do These First)

1. **R2**: Flip `showNoteName` default → instant pedagogical improvement, zero code complexity.
2. **R1 + R4**: Add response time tracking + speed gate → transforms progression to include speed.
3. **R6**: Add interval labels → immediate interval recognition training, ~20 lines of code.
4. **R11**: "One more note" → retention boost, ~10 lines of state logic.
