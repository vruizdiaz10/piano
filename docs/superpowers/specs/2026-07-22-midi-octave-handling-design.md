# MIDI Octave Handling — Conditional Smart Detection + Octave Bar

## Problem

MIDI controllers with fewer octaves than the displayed notes cause false errors. If the target note is C5 but the controller only reaches C4, the user physically cannot play the correct note. Currently `submitAnswer` compares exact MIDI numbers (`midi === currentNote.midi`), so any octave mismatch is a wrong answer.

## Solution

Two mechanisms:

1. **Conditional smart octave detection** — accept notes by pitch class ONLY when the target note is outside the controller's detected range
2. **Octave bar** (toggleable UI) — manual octave range shift with +/- controls

---

## 1. Conditional Smart Octave Detection

### Why Conditional

Unconditional pitch-class matching breaks when the same note appears in different octaves (e.g., E4 and E5 in the same lesson). If the user presses E, the app can't know which E they meant. Smart detection must only activate when the target note is **physically unreachable** on the controller.

### Controller Range Detection (Hybrid)

**Auto-detect (default):**
- Track `controllerMin` and `controllerMax` — the lowest and highest MIDI notes received from the controller
- Start with no known range (smart detection disabled until we have data)
- Each new note expands the known range: `controllerMin = min(controllerMin, midi)`, `controllerMax = max(controllerMax, midi)`
- After receiving at least 2 distinct notes, we have a range to work with

**Manual override (settings):**
- A "Configurar controlador" option in PerfilScreen or PracticeNavBar
- User presses their lowest key → record as `controllerMin`
- User presses their highest key → record as `controllerMax`
- Manual range overrides auto-detect until session ends
- Saved to Firestore as `controllerRange?: { min: number, max: number }` in UserDoc

**Range stored in:** `useGameState` as `controllerRange: { min: number, max: number } | null`

### Matching Logic

When a MIDI note arrives in `submitAnswer`:

```
1. Exact match? → correct (existing behavior)
2. No exact match → is target outside controller range?
   a. Range known AND target.midi < range.min OR target.midi > range.max
      → pitch-class match? correct (with octave offset for display)
   b. Range unknown OR target within range
      → wrong answer (existing error analysis)
3. Wrong note → existing error analysis (step, skip, accidental, etc.)
```

### Implementation

**`src/hooks/useGameState.ts`**

Add state:
```typescript
controllerRange: { min: number, max: number } | null
```

Modify `submitAnswer(midi: number)`:
```typescript
const target = prev.currentNote
const exactMatch = midi === target.midi

if (exactMatch) {
  // existing correct logic
  return { ...prev, /* ... */ }
}

// Check if target is outside controller range
const range = prev.controllerRange
const targetOutsideRange = range && (target.midi < range.min || target.midi > range.max)

if (targetOutsideRange) {
  const targetPitchClass = target.midi % 12
  const pressedPitchClass = midi % 12
  if (targetPitchClass === pressedPitchClass) {
    // Correct by pitch class — target is unreachable, this is the right note
    const offset = target.midi - midi
    return { ...prev, /* correct logic, store offset for display */ }
  }
}

// Wrong answer — existing error analysis
```

Update controller range on each note received:
```typescript
// In the MIDI callback or at start of submitAnswer:
if (!prev.controllerRange) {
  controllerRange = { min: midi, max: midi }
} else {
  controllerRange = {
    min: Math.min(prev.controllerRange.min, midi),
    max: Math.max(prev.controllerRange.max, midi)
  }
}
```

**`src/firebase/firestore.ts`**

Add to `UserDoc`:
```typescript
controllerRange?: { min: number, max: number }
```

### Edge Cases

- **E4 and E5 in same lesson**: If controller range includes both (e.g., C3–C5), both are within range → no pitch-class fallback, must play exact note. Correct behavior.
- **E4 in lesson, controller only goes to C4**: E4 is outside range → pitch-class match accepted. Correct behavior.
- **No MIDI notes played yet**: range is null → no smart detection, all notes require exact match. Safe default.
- **Controller range starts small**: First few notes might not trigger smart detection. Range expands as user plays. Acceptable — the octave bar is the manual fallback.
- **Enharmonic equivalents**: C# and Db share MIDI number → pitch class comparison handles correctly.

---

## 2. Octave Bar (Toggleable)

The octave bar provides manual octave shifting. Works independently of smart detection — the user can shift their controller's range to align with the displayed notes.

### Behavior

- A toggle button in the practice nav bar (next to the MIDI indicator)
- When activated, a bar appears below the staff showing:
  - Current octave range label (e.g., "Octavas: C3 – C5")
  - Left arrow button (shift down 1 octave)
  - Right arrow button (shift up 1 octave)
- Shifting changes the `keyboardStart` offset AND applies a MIDI input offset
- The offset persists for the session (not saved to Firestore)
- Toggle state is remembered for the session

### UI Layout

```
[Staff]
[Octave Bar:  ◀  C3 – C5  ▶ ]    ← only when toggle is active
[Feedback]
[Virtual Keyboard]
```

The octave bar sits between the staff and the feedback area. Compact design:
- Height: ~40px
- Centered horizontally
- Arrows are large touch targets (min 44px)
- Label uses `font-label-caps` for consistency
- Background: `clay-inner-panel` style to match existing UI

### Implementation

**`src/App.tsx`**

Add state:
```typescript
const [octaveBarVisible, setOctaveBarVisible] = useState(false)
const [octaveShift, setOctaveShift] = useState(0) // -2 to +2
```

Modify `keyboardStart`:
```typescript
const keyboardStart = (state.clef === 'both' ? 36 : (currentLesson?.clef === 'bass' ? 36 : 48)) + (octaveShift * 12)
```

Modify MIDI input handling — apply offset to received MIDI note:
```typescript
// In the useMidi callback:
const adjustedMidi = midi - (octaveShift * 12)
submitAnswer(adjustedMidi)
```

**New component: `src/components/OctaveBar.tsx`**

```tsx
interface OctaveBarProps {
  shift: number
  onShiftChange: (shift: number) => void
  baseStart: number
  minShift?: number
  maxShift?: number
}
```

- Renders the +/- arrows and range label
- Computes range from `baseStart + shift*12` to `baseStart + shift*12 + 24` (2 octaves)
- Uses `clay-inner-panel` styling
- Arrow buttons use `clay-button-secondary` styling
- Displays note names: e.g. "C3 – C5"

**`src/components/PracticeNavBar.tsx`**

Add a toggle button (keyboard icon or "OCT" label) that shows/hides the octave bar. Only visible during practice phase.

### Shift Limits

- Min shift: -2 (range down to C0)
- Max shift: +2 (range up to C8)
- Default: 0 (no shift)

---

## Files

| File | Action |
|------|--------|
| `src/hooks/useGameState.ts` | Add `controllerRange` state, modify `submitAnswer` for conditional pitch-class matching |
| `src/App.tsx` | Add `octaveBarVisible`, `octaveShift` state; modify `keyboardStart` and MIDI input; render `OctaveBar` |
| `src/components/OctaveBar.tsx` | **Create** — octave range display with +/- controls |
| `src/components/PracticeNavBar.tsx` | Add octave toggle button |
| `src/firebase/firestore.ts` | Add `controllerRange?` to `UserDoc` |
| `src/screens/PerfilScreen.tsx` | Add "Configurar controlador" option for manual range setup |
| `src/hooks/useConfigSync.ts` | Sync `controllerRange` to Firestore |

## Testing

- Play a note in the correct octave → correct (existing behavior)
- Target within controller range, wrong octave → wrong (no smart detection)
- Target outside controller range, same pitch class → correct (smart detection activates)
- Target outside controller range, wrong pitch class → wrong (error analysis)
- E4 and E5 in lesson, controller covers both → must play exact note (no ambiguity)
- E4 in lesson, controller max is C4 → E4 outside range, pitch E accepted
- Toggle octave bar → bar appears/disappears
- Shift octave up → keyboard range shifts, MIDI input adjusts
- Shift octave down → same
- Shift to limits → buttons disable at min/max
- Manual controller setup → range saved to Firestore, restored on login
- Auto-detect range → expands as notes are played
