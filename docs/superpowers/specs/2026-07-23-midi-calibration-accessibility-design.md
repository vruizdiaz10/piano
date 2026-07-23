# MIDI Calibration Accessibility — Design Spec

> Make MIDI calibration discoverable, visible, and easy to reach from anywhere in the app.

## Problem

MIDI calibration is too hidden. Users who connect a new controller don't know calibration exists, users who need to recalibrate can't find the button (buried in Perfil → Configuración), and there's no indication of calibration status from any main screen.

Today:
- **Auto-trigger**: Only fires on first MIDI connect when no `controllerRange` is saved — easy to dismiss and forget
- **Manual trigger**: Only in PerfilScreen → "Configuración" → "Controlador MIDI" section — requires 2 taps and knowing where to look
- **Status**: Only visible in PerfilScreen if you navigate there

## Solution

Three complementary changes that solve discovery, recalibration, and status visibility:

### 1. Calibration Suggestion Toast

**Trigger:** When `midiConnected` becomes `true` AND no `controllerRange` is persisted in Firestore config.

**Behavior:**
- Shows a non-blocking toast at the bottom of the screen
- Text: "🎮 Controlador MIDI detectado — calibrá para mejor precisión"
- Two buttons: **Calibrar** (opens CalibrationModal) and **Cerrar** (dismisses)
- Auto-dismisses after 8 seconds if no interaction
- Once dismissed, does not reappear until next session (persist flag in localStorage under key `calibrationToastDismissed`)

**Not shown when:**
- Controller is already calibrated (config.controllerRange exists)
- User dismissed the toast in the current session

### 2. MIDI Status Chip in TopNavBar

**Location:** TopNavBar, right side, next to existing controls (dark mode toggle, user menu).

**Three states:**

| State | Visual | Behavior |
|-------|--------|----------|
| No MIDI connected | Gray chip, MIDI icon struck through | Tooltip: "Sin controlador" — no action on tap |
| MIDI connected, not calibrated | Amber/orange chip, MIDI icon | Tap → opens CalibrationModal |
| MIDI connected, calibrated | Green chip, MIDI icon + range text (e.g. "C2-C6") | Tap → opens CalibrationModal for recalibration |

**Design:**
- Small, discrete chip — does not compete with navigation
- Uses existing claymorphism styling (clay-btn-secondary base)
- Icon: `piano` or `settings_input_hdmi` from Material Symbols
- Only renders when a MIDI device was connected in the current session (midiConnected was true at least once)

### 3. Existing PerfilScreen Button (unchanged)

The "Calibrar controlador" / "Recalibrar" button in PerfilScreen stays as-is. It's a valid secondary entry point for users who navigate to settings.

## Architecture

### Data Flow

```
App.tsx
├── midiConnected (from useMidi)
├── config?.controllerRange (from useConfigSync)
├── state.controllerRange (auto-detected from gameplay)
│
├── TopNavBar
│   ├── midiConnected prop
│   ├── controllerRange prop (config ?? state)
│   └── onCalibrate callback → setCalibModalOpen(true)
│
├── CalibrationToast (new)
│   ├── midiConnected prop
│   ├── hasCalibration prop
│   ├── onCalibrate callback → setCalibModalOpen(true)
│   └── localStorage flag for dismiss persistence
│
└── CalibrationModal (existing, unchanged)
    ├── isOpen={calibModalOpen}
    ├── onClose → setCalibModalOpen(false)
    └── onCalibrate → updateConfig({ controllerRange }) + setCalibModalOpen(false)
```

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add CalibrationToast, pass MIDI state to TopNavBar, manage toast dismiss flag |
| `src/components/TopNavBar.tsx` | Add MIDI status chip with 3 states, accept new props |
| `src/components/CalibrationModal.tsx` | No changes — existing FSM works correctly |
| `src/components/CalibrationToast.tsx` | **New file** — toast component with Calibrar/Cerrar buttons |
| `src/screens/PerfilScreen.tsx` | No changes — existing button preserved |
| `src/screens/PracticeNavBar.tsx` | No changes |

### Props Interface

```typescript
// TopNavBar additions
interface TopNavBarProps {
  // ... existing props
  midiConnected: boolean
  controllerRange: { min: number; max: number } | null
  onOpenCalibration: () => void
}

// CalibrationToast (new component)
interface CalibrationToastProps {
  isVisible: boolean
  onCalibrate: () => void
  onDismiss: () => void
}
```

### localStorage Key

- `calibrationToastDismissed`: `string` — stores session ID or timestamp. Toast is hidden if this key exists and matches the current session.

## UX Details

### Toast Styling
- Follows existing Toast.tsx pattern but with action buttons
- Background: clay-card style (warm white/cream)
- "Calibrar" button: clay-btn-primary (blue accent)
- "Cerrar" button: text-only, no background
- Slide-in animation from bottom, slide-out on dismiss

### Chip Styling
- Rounded pill shape, ~24px height
- Gray (#9CA3AF) when no MIDI
- Amber (#F59E0B) when MIDI connected, not calibrated
- Green (#10B981) when calibrated
- Transition animation between states (200ms)

### Accessibility
- Toast has `role="alert"` and `aria-live="polite"`
- Chip has `aria-label` describing current state
- CalibrationModal already handles Escape key and focus management

## Non-Goals

- No changes to the CalibrationModal FSM — it works well
- No changes to auto-detection logic in useGameState — it's orthogonal
- No mandatory calibration flow — always optional/suggested
- No changes to the Firestore schema — `controllerRange` field already exists
