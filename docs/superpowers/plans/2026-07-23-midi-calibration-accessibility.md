# MIDI Calibration Accessibility — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make MIDI calibration discoverable, visible, and easy to reach from anywhere in the app via a suggestion toast and a status chip in TopNavBar.

**Architecture:** A new CalibrationToast component suggests calibration when MIDI connects without a saved range. TopNavBar gains a MIDI status chip with 3 states (disconnected, connected-uncalibrated, calibrated). App.tsx orchestrates both, passing MIDI state down through screen components. CalibrationModal stays unchanged.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, claymorphism design system, Material Symbols icons

## Global Constraints

- Claymorphism design system — use `clay-card`, `clay-btn-primary`, `clay-btn-secondary`, `clay-icon-raised` classes
- Material Symbols Outlined for all icons
- Spanish UI text (all labels, tooltips, messages in Spanish)
- No changes to CalibrationModal.tsx or useGameState.ts
- No new npm dependencies
- localStorage key: `calibrationToastDismissed` (stores ISO timestamp)
- Firestore field: `controllerRange` already exists in UserDoc

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/CalibrationToast.tsx` | **Create** | Toast component with Calibrar/Cerrar buttons, auto-dismiss |
| `src/components/TopNavBar.tsx` | **Modify** | Add MIDI status chip with 3 states |
| `src/App.tsx` | **Modify** | Wire CalibrationToast, pass MIDI props to screens, manage dismiss flag |
| `src/screens/DashboardScreen.tsx` | **Modify** | Accept and forward MIDI props to TopNavBar |
| `src/screens/BibliotecaScreen.tsx` | **Modify** | Accept and forward MIDI props to TopNavBar |
| `src/screens/PerfilScreen.tsx` | **Modify** | Accept and forward MIDI props to TopNavBar |

---

### Task 1: Create CalibrationToast Component

**Files:**
- Create: `src/components/CalibrationToast.tsx`

**Interfaces:**
- Consumes: nothing (standalone)
- Produces: `<CalibrationToast isVisible onCalibrate onDismiss />`

- [ ] **Step 1: Create the component file**

```tsx
// src/components/CalibrationToast.tsx
import { useState, useEffect } from 'react'

interface CalibrationToastProps {
  isVisible: boolean
  onCalibrate: () => void
  onDismiss: () => void
}

const DISMISS_KEY = 'calibrationToastDismissed'
const AUTO_DISMISS_MS = 8000

export function CalibrationToast({ isVisible, onCalibrate, onDismiss }: CalibrationToastProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      // Check if already dismissed this session
      const dismissed = localStorage.getItem(DISMISS_KEY)
      if (dismissed) {
        onDismiss()
        return
      }
      // Fade in
      const t = setTimeout(() => setShow(true), 10)
      return () => clearTimeout(t)
    } else {
      setShow(false)
    }
  }, [isVisible])

  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => {
      handleDismiss()
    }, AUTO_DISMISS_MS)
    return () => clearTimeout(t)
  }, [show])

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
    setTimeout(() => onDismiss(), 300) // Wait for fade-out
  }

  const handleCalibrate = () => {
    setShow(false)
    setTimeout(() => onCalibrate(), 300)
  }

  if (!isVisible) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-300
        ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}
    >
      <div className="clay-card px-4 py-3 flex items-center gap-3 min-w-[320px] max-w-[420px]">
        <span className="material-symbols-outlined text-lg text-primary">
          settings_input_hdmi
        </span>
        <p className="text-sm font-body text-clay-text flex-1">
          Controlador MIDI detectado — calibrá para mejor precisión
        </p>
        <button
          onClick={handleCalibrate}
          className="clay-btn-primary px-3 py-1 text-xs font-label"
        >
          Calibrar
        </button>
        <button
          onClick={handleDismiss}
          className="text-xs text-outline hover:text-clay-text transition-colors px-1"
          aria-label="Cerrar"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: PASS (no errors in new file)

- [ ] **Step 3: Commit**

```bash
git add src/components/CalibrationToast.tsx
git commit -m "feat: add CalibrationToast component for MIDI calibration suggestion"
```

---

### Task 2: Add MIDI Status Chip to TopNavBar

**Files:**
- Modify: `src/components/TopNavBar.tsx`

**Interfaces:**
- Consumes: `midiConnected`, `controllerRange`, `onOpenCalibration` props
- Produces: visual chip in the right-side nav group

- [ ] **Step 1: Add new props to TopNavBarProps**

Add to the existing interface in `src/components/TopNavBar.tsx`:

```typescript
interface TopNavBarProps {
  // ... existing props ...
  midiConnected?: boolean
  controllerRange?: { min: number; max: number } | null
  onOpenCalibration?: () => void
}
```

- [ ] **Step 2: Add MIDI chip JSX**

In the right-side `flex items-center gap-4` div (after the existing toggle buttons, before `NavUserMenu`), add:

```tsx
{/* MIDI Status Chip */}
{midiConnected !== undefined && (
  <button
    onClick={onOpenCalibration}
    disabled={!midiConnected}
    aria-label={
      !midiConnected
        ? 'Sin controlador MIDI'
        : controllerRange
          ? `MIDI calibrado: ${midiToNoteName(controllerRange.min)} - ${midiToNoteName(controllerRange.max)}. Tocá para recalibrar`
          : 'MIDI conectado sin calibrar. Tocá para calibrar'
    }
    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-label
      transition-all duration-200 border
      ${!midiConnected
        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default'
        : controllerRange
          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
          : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 cursor-pointer animate-pulse'
      }`}
  >
    <span className="material-symbols-outlined text-[16px]">
      {!midiConnected ? 'settings_input_hdmi' : 'piano'}
    </span>
    <span>
      {!midiConnected
        ? 'Sin MIDI'
        : controllerRange
          ? `${midiToNoteName(controllerRange.min)}–${midiToNoteName(controllerRange.max)}`
          : 'Sin calibrar'
      }
    </span>
  </button>
)}
```

- [ ] **Step 3: Import existing midiToNote helper**

At the top of `TopNavBar.tsx`, add import (the helper already exists in `src/utils/midiToNote.ts`):

```typescript
import { midiToNote } from '../utils/midiToNote'
```

Then replace all `midiToNoteName(...)` calls in the chip JSX with:
```typescript
const note = midiToNote(range.min)
`${note.name}${note.octave}`
```

No new helper needed — reuse the existing one.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: PASS (existing callers don't pass new optional props — no breakage)

- [ ] **Step 5: Commit**

```bash
git add src/components/TopNavBar.tsx
git commit -m "feat: add MIDI status chip to TopNavBar with 3 states"
```

---

### Task 3: Wire Everything in App.tsx and Screens

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/screens/DashboardScreen.tsx`
- Modify: `src/screens/BibliotecaScreen.tsx`
- Modify: `src/screens/PerfilScreen.tsx`

**Interfaces:**
- Consumes: `midiConnected` (from useMidi), `config?.controllerRange` (from useConfigSync), `calibModalOpen` state
- Produces: rendered CalibrationToast, MIDI props forwarded to TopNavBar via screens

- [ ] **Step 1: Add CalibrationToast to App.tsx**

Import and render `CalibrationToast` in `App.tsx`:

```tsx
import { CalibrationToast } from './components/CalibrationToast'
```

Add state for toast visibility:

```tsx
const [calibToastVisible, setCalibToastVisible] = useState(false)
```

Add effect to show toast when MIDI connects without calibration:

```tsx
useEffect(() => {
  if (midiConnected && !config?.controllerRange) {
    setCalibToastVisible(true)
  } else {
    setCalibToastVisible(false)
  }
}, [midiConnected, config?.controllerRange])
```

Replace the existing auto-open modal effect (lines 211-215) — the toast now handles the suggestion, so remove the auto-modal-open:

```tsx
// REMOVE this effect:
// useEffect(() => {
//   if (midiConnected && !config?.controllerRange) {
//     setCalibModalOpen(true)
//   }
// }, [midiConnected, config?.controllerRange])
```

Render CalibrationToast at the same level as the existing Toast (in each screen branch, or once at the top if possible):

```tsx
<CalibrationToast
  isVisible={calibToastVisible}
  onCalibrate={() => {
    setCalibToastVisible(false)
    setCalibModalOpen(true)
  }}
  onDismiss={() => setCalibToastVisible(false)}
/>
```

- [ ] **Step 2: Add onOpenCalibrate callback to App.tsx**

Create a stable callback:

```tsx
const handleOpenCalibration = useCallback(() => {
  setCalibModalOpen(true)
}, [])
```

- [ ] **Step 3: Pass MIDI props to DashboardScreen**

In App.tsx, where `<DashboardScreen>` is rendered, add props:

```tsx
<DashboardScreen
  // ... existing props ...
  midiConnected={midiConnected}
  controllerRange={config?.controllerRange ?? state.controllerRange}
  onOpenCalibration={handleOpenCalibration}
/>
```

- [ ] **Step 4: Update DashboardScreen to accept and forward props**

In `src/screens/DashboardScreen.tsx`:

1. Add to props interface:

```typescript
midiConnected?: boolean
controllerRange?: { min: number; max: number } | null
onOpenCalibration?: () => void
```

2. Destructure from props

3. Pass to `<TopNavBar>`:

```tsx
<TopNavBar
  // ... existing props ...
  midiConnected={midiConnected}
  controllerRange={controllerRange}
  onOpenCalibration={onOpenCalibration}
/>
```

- [ ] **Step 5: Repeat for BibliotecaScreen**

Same pattern as DashboardScreen — add the 3 props to the interface, destructure, forward to TopNavBar.

- [ ] **Step 6: Repeat for PerfilScreen**

Same pattern. PerfilScreen also has its own calibration modal rendering — ensure the new `onOpenCalibration` doesn't conflict with the existing `calibModalOpenProp` / `setCalibModalOpenLocal` pattern. The new prop is only for TopNavBar; PerfilScreen's own buttons continue to use the existing local/modal state.

- [ ] **Step 7: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 8: Verify build**

Run: `npx vite build`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/App.tsx src/screens/DashboardScreen.tsx src/screens/BibliotecaScreen.tsx src/screens/PerfilScreen.tsx
git commit -m "feat: wire CalibrationToast and MIDI chip into App and screens"
```

---

### Task 4: Integration Test and Polish

**Files:**
- Review all modified files for consistency

- [ ] **Step 1: Manual smoke test**

Run `npx vite dev` and verify:
1. Without MIDI: TopNavBar shows "Sin MIDI" gray chip (or no chip if midiConnected never true)
2. Connect MIDI (or simulate): Toast appears at bottom with "Calibrar" and "Cerrar"
3. Click "Calibrar" → CalibrationModal opens
4. Complete calibration → toast gone, chip shows green with range (e.g. "C2–C6")
5. Click green chip → CalibrationModal opens for recalibration
6. Dismiss toast → doesn't reappear in same session
7. Refresh page → toast reappears if MIDI connected and no calibration

- [ ] **Step 2: Verify existing PerfilScreen calibration still works**

Navigate to Perfil → "Calibrar controlador" button → modal opens → calibrate → saves to Firestore.

- [ ] **Step 3: Verify auto-detect still works**

Play a game without calibrating → play notes → controllerRange auto-detects → chip updates.

- [ ] **Step 4: Final build**

Run: `npx vite build`
Expected: PASS

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: polish MIDI calibration accessibility integration"
```
