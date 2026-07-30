# Mobile Landscape Game View Optimization

> **Goal:** Optimize the practice session screen (staff + keyboard + controls) for mobile landscape orientation so the user can play comfortably on phones in landscape mode.

**Architecture:** Minimal structural changes — reuse existing layout hooks (`useIsMobile()`) and CSS media queries, add a `flex-row` side-by-side layout for landscape, collapse the NavBar, and relocate controls into the staff panel.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, existing claymorphism design system

---

## Requirements

1. In landscape mode on mobile (viewport height ≤ 600px), the staff and keyboard must be visible simultaneously without scrolling.
2. Keyboard keys must be large enough to tap accurately (minimum ~8mm / ~30px per white key).
3. The NavBar must collapse to minimal height (~40px) showing only back button and logo.
4. Session stats (streak, accuracy, notes) and user menu are hidden in landscape.
5. Lesson controls (restart, mute, show note name) are shown as small icons at the bottom of the staff panel.
6. Progress bar is a thin visual bar at the very bottom of the screen — no text.
7. Feedback text is shown as a compact icon-only indicator overlaying the staff.
8. MIDI indicator in the lesson controls area is hidden in landscape (MIDI status is already visible in the collapsed NavBar).
9. The side-by-side layout must not affect desktop or portrait mobile views — only landscape phones.

---

## Design

### Layout Structure (Landscape only)

```
┌────────── NavBar collapsed (~40px) ──────────┐
│  ← ● Clavis                                  │
├─────────────────────┬────────────────────────┤
│                     │                        │
│   ┌───────────┐    │    ┌────────────┐      │
│   │  Staff    │    │    │  Keyboard  │      │
│   │  (SVG)   │    │    │  (18 keys) │      │
│   │           │    │    │            │      │
│   │[feedback] │    │    │            │      │
│   │[controls] │    │    │            │      │
│   └───────────┘    │    └────────────┘      │
│                     │                        │
├─────────────────────┴────────────────────────┤
│ ██████████████████████████████████████████░░ │ ← progress bar (4px)
└──────────────────────────────────────────────┘
```

### Left Panel — Staff (50-55% width)
- Staff SVG centered vertically and horizontally — the existing SVG is responsive and scales naturally with `preserveAspectRatio="xMidYMid meet"`.
- Feedback: compact overlay at bottom-left of staff area — shows checkmark or X icon only, no text.
- Lesson controls (restart, mute, show note): row of small icon buttons at bottom of panel.

### Right Panel — Keyboard (45-50% width)
- PianoKeyboard rendered with 18 keys (already handled by `useIsMobile()` in `PianoKeyboard.tsx`).
- Keys fill the full height of the panel (taller than current `h-36` / 144px).
- Keyboard container has `overflow-hidden` and no extra padding.

### NavBar — Collapsed
- Height reduced from `h-20` (80px) to `h-10` (40px).
- Only: back arrow + logo text ("Clavis") visible.
- Hidden: session stats (streak, accuracy, notes), user menu, MIDI chip.
- The NavBar still renders the full component above the fold — just visually collapsed via CSS.

### Progress Bar — Minimal
- Thin 4px bar spanning full width at the bottom of the screen.
- No percentage label, no "X/Y" text.
- Same clay-progress classes, just smaller.

### Pause Overlay — Unchanged
- Full-screen overlay with backdrop blur — same as current desktop behavior.

### Level Complete → Results — Unchanged
- The Results screen appears as an overlay and is unaffected by this layout change.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Wrap main content in a conditional `flex-row` container for landscape. Add `<div className="game-layout">` structure around staff + keyboard areas. |
| `src/index.css` | Update the existing `@media (orientation: landscape) and (max-height: 600px)` block with new layout rules for `.game-layout`, `.game-layout-staff`, `.game-layout-keyboard`. |
| `src/components/PracticeNavBar.tsx` | Add landscape mode: reduce height, hide stats, hide user menu. |
| `src/components/PianoKeyboard.tsx` | Increase key height in landscape mode (use full panel height). |

---

## Edge Cases

- **Orientation change mid-game:** The layout switches smoothly via CSS media query — no state change needed.
- **iPad landscape:** iPads have > 600px height, so they keep the desktop layout. Correct.
- **Very small phones (iPhone SE):** 568×320 — keys at ~8mm width are still tappable.
- **MIDI controller connected:** The collapsed NavBar hides the MIDI chip, but MIDI still works for input. The MIDI indicator dot is not critical since the user is playing, not checking connection.
- **Keyboard with MIDI only (no virtual keyboard):** The virtual keyboard still renders in landscape. If MIDI is connected, the user can ignore it.
- **Timer mode:** The timer countdown is not shown in the collapsed layout. The time-per-note still applies server-side. This is acceptable — the timer is secondary feedback.
- **Accessibility:** Reduced motion is respected (`prefers-reduced-motion` media query already exists). Touch targets remain ≥ 44px in landscape whenever possible.
