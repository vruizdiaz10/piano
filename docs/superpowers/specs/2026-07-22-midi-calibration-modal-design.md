# MIDI Controller Calibration Modal — Design Spec

## Problem

Current controller range detection is passive — user plays notes, range populates silently, PerfilScreen shows a static message. Users don't know the feature exists or how it works.

## Solution

Explicit 2-step calibration flow: hold lowest key, hold highest key. Modal overlay in PerfilScreen with guided prompts. Auto-triggers on first MIDI connect when no range exists.

## Calibration Modal (`CalibrationModal.tsx`)

Full-screen overlay, 4 states:

1. **`waiting-low`**: Prompt "Toca y mantén la nota más grave de tu controlador". Pulsing piano icon. No timer.
2. **`holding-low`**: User pressed a key. Timer bar fills over ~2 seconds. If key released before 2s → reset to `waiting-low`. After 2s → lock note as `min`, transition to `waiting-high`.
3. **`waiting-high`**: Prompt "Ahora toca y mantén la nota más aguda". Same hold flow. Locks note as `max`.
4. **`complete`**: Shows "Rango calibrado: C3–C5". Explanation: "Las notas fuera de este rango se aceptan por nombre (pitch class)." "Listo" button closes modal.

### Hold detection

- useMidi callback captures note-on → start 2s countdown
- Note-off before 2s → reset state to waiting
- After 2s → lock the note, advance
- Only the first note-on counts (ignore additional keys held simultaneously)

### Props

```typescript
interface CalibrationModalProps {
  isOpen: boolean
  onClose: () => void
  onCalibrate: (range: { min: number; max: number }) => void
  currentRange?: { min: number; max: number } | null
}
```

### UI details

- Clay-style overlay: `bg-background/80 backdrop-blur-sm`
- Timer bar: `clay-progress-fill` style, animated width over 2s
- Hold indicator: circular progress ring or horizontal bar showing hold progress
- State transitions: smooth fade/slide between prompts
- "Cancelar" button always visible to dismiss

## PerfilScreen Integration

Replace current controller range section with:

- **No range**: Prominent "Calibrar controlador" button
- **Range exists**: Show detected range (e.g. "C3 – C5") + "Recalibrar" button
- Both open the calibration modal

## Auto-trigger on first MIDI connect

In App.tsx:
- When `midiConnected` becomes true AND `config?.controllerRange` is null → auto-open calibration modal
- Gated: only fires once per session (null check prevents re-trigger)
- User can dismiss — won't nag again

## Data flow

1. User calibrates → `onCalibrate({ min, max })` called
2. App.tsx handler: `updateConfig({ controllerRange: { min, max } })` → persists to Firestore
3. Also set `state.controllerRange` in GameState (already synced via existing useEffect)
4. Modal closes → PerfilScreen re-renders with new range

## Files

| File | Action |
|------|--------|
| `src/components/CalibrationModal.tsx` | Create — modal component |
| `src/screens/PerfilScreen.tsx` | Modify — replace static range with calibrate button + modal |
| `src/App.tsx` | Modify — auto-trigger logic, pass props |

## Out of scope

- Visual feedback of which key is being held (future enhancement)
- Calibration history / multiple presets
- Web MIDI API note name display during hold
