# MIDI Octave Handling — Smart Detection + Octave Bar

## Problem

MIDI controllers with fewer octaves than the displayed notes cause false errors. If the target note is C5 but the controller only reaches C4, the user physically cannot play the correct note. Currently `submitAnswer` compares exact MIDI numbers (`midi === currentNote.midi`), so any octave mismatch is a wrong answer.

## Solution

Two mechanisms:

1. **Smart octave detection** (always on, default) — accept notes by pitch class, ignoring octave
2. **Octave bar** (toggleable UI) — manual octave range shift with +/- controls

---

## 1. Smart Octave Detection

### Behavior

When a MIDI note arrives:
- Extract pitch class (C, C#, D, ..., B) from both the pressed note and the target note
- If pitch classes match → accept as correct, regardless of octave
- Apply an `octaveOffset` so the feedback displays the correct target octave (not the pressed one)
- If pitch classes do NOT match → proceed with existing error analysis (step, skip, accidental, etc.)

### Implementation

**`src/hooks/useGameState.ts`**

Add state: `octaveOffset: number` (default 0)

Modify `submitAnswer(midi: number)`:
```typescript
// Inside submitAnswer, before the existing comparison:
const targetPitchClass = prev.currentNote.midi % 12
const pressedPitchClass = midi % 12
const isCorrectPitchClass = targetPitchClass === pressedPitchClass

// If same pitch class but different octave, treat as correct
const isCorrect = isCorrectPitchClass || midi === prev.currentNote.midi
```

When `isCorrectPitchClass` is true but `midi !== prev.currentNote.midi`:
- The note is correct (pitch class matches)
- The `octaveOffset` is calculated: `prev.currentNote.midi - midi` (difference in semitones)
- Store this offset so feedback displays the right octave name
- The note's displayed name uses the TARGET octave, not the pressed octave

**`src/utils/errorAnalysis.ts`**

No changes needed — error analysis runs only when the answer is wrong. If pitch class matches, it's already marked correct before analysis runs.

**`src/utils/notation.ts` / `displayNoteName`**

No changes — the note object already carries the correct name/octave from the lesson data.

### Edge Cases

- **Enharmonic equivalents**: C# and Db share the same MIDI number, so pitch class comparison (`midi % 12`) handles this correctly
- **Sharps/flats in lessons**: If the target is C#4 and user plays C#3, pitch classes match (both are pitch class 1) → correct
- **Wrong note entirely**: Pitch class doesn't match → existing error analysis applies

---

## 2. Octave Bar (Toggleable)

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
  minShift?: number
  maxShift?: number
}
```

- Renders the +/- arrows and range label
- Computes range from `keyboardStart` (base + shift*12) to `keyboardStart + 24` (2 octaves)
- Uses `clay-inner-panel` styling
- Arrow buttons use `clay-button-secondary` styling

**`src/components/TopNavBar.tsx` or `src/components/PracticeNavBar.tsx`**

Add a toggle button (keyboard icon or "OCT" label) that shows/hides the octave bar. Only visible during practice phase.

### Shift Limits

- Min shift: -2 (range down to C0)
- Max shift: +2 (range up to C8)
- Default: 0 (no shift)

---

## Files

| File | Action |
|------|--------|
| `src/hooks/useGameState.ts` | Add `octaveOffset` state, modify `submitAnswer` for pitch-class matching |
| `src/App.tsx` | Add `octaveBarVisible`, `octaveShift` state; modify `keyboardStart` and MIDI input; render `OctaveBar` |
| `src/components/OctaveBar.tsx` | **Create** — octave range display with +/- controls |
| `src/components/PracticeNavBar.tsx` | Add octave toggle button |

## Testing

- Play a note in the correct octave → should be correct (existing behavior)
- Play a note in the wrong octave but same pitch class → should be correct (new behavior)
- Play a completely wrong note → should be wrong with existing error analysis
- Toggle octave bar on/off → bar appears/disappears
- Shift octave up → keyboard range shifts, MIDI input adjusts
- Shift octave down → same
- Shift to limits → buttons disable at min/max
