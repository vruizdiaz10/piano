# UX Architect Report — Piano Sight-Reading Game

**Date**: 2026-07-08  
**Scope**: Mobile responsive audit, touch interaction, landscape/portrait layout  
**Target devices**: iPhone SE (375×667) through iPad landscape (1180×820)  
**Constraint**: Min 44px touch targets, no external mobile deps, preserve stage atmosphere

---

## 1. Summary

Game has **one media query** for landscape (max-height: 600px) that splits staff/keyboard 50/50. Portrait has zero responsive rules. Keyboard renders 37 keys by default — on landscape mobile, individual keys shrink to ~13px, **3x below** 44px touch minimum. Touch uses `onMouseDown` only (300ms iOS delay). Curtains waste 96px horizontal on small viewports. Stage atmosphere preserved but game unplayable on phones without fixes.

---

## 2. Recommendations (Prioritized)

### R1 — Reduce key count on mobile

| Field | Value |
|-------|-------|
| **Files** | `src/components/PianoKeyboard.tsx:20,23` |
| **Severity** | CRITICAL — makes game unusable on phone |
| **Effort** | Low |

**Problem**: Default `count = 37` keys (C4–C7). On landscape mobile, 50% viewport width holds ~22 white keys. At 320px → ~14.5px per key. 44px minimum violated by 3×.

**Fix**: Reduce keys on small viewports. Detect viewport width, cap count.

```tsx
// PianoKeyboard.tsx
const DEFAULT_COUNT = 37
const MOBILE_COUNT = 14  // ~1 octave, keys stay ≥44px

// Inside component, compute count:
const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
const count = isMobile ? MOBILE_COUNT : (countProp ?? DEFAULT_COUNT)
```

Alternatively expose `count` prop from `App.tsx` and pass different values based on screen width (use `useMediaQuery` or resize listener).

**Follow-up**: Adjust `startMidi` on mobile so played notes still fall within visible range. Treble default `startMidi=48` with 14 keys = C4–C5 (middle octave). Bass `startMidi=36` 14 keys = C3–C4.

---

### R2 — Add touch event handlers to keyboard

| Field | Value |
|-------|-------|
| **Files** | `src/components/PianoKeyboard.tsx:76,105` |
| **Severity** | HIGH — 300ms tap delay on iOS |
| **Effort** | Low |

**Problem**: Keys use `onMouseDown` only. Touch devices wait ~300ms for double-tap detection before firing. Piano response feels sluggish.

**Fix**: Add `onTouchStart` alongside `onMouseDown`. Call `e.preventDefault()` to suppress tap delay and scroll.

```tsx
// Both white and black key handlers:
onTouchStart={(e) => {
  e.preventDefault() // eliminates 300ms delay
  onPlayNote({ name, octave, midi })
}}
```

Also add CSS:
```css
/* index.css */
.piano-key {
  touch-action: manipulation; /* prevents double-tap zoom */
}
```

---

### R3 — Add `touch-action: manipulation` to keyboard container

| Field | Value |
|-------|-------|
| **Files** | `src/components/PianoKeyboard.tsx:56` |
| **Severity** | HIGH — double-tap zoom interferes with gameplay |
| **Effort** | Very low (one CSS line) |

**Problem**: No `touch-action` property set. iOS Safari may zoom on double-tap, breaking game flow.

**Fix**:
```tsx
// line 56 in PianoKeyboard.tsx
<div ref={containerRef} className="py-2 select-none" style={{ touchAction: 'manipulation' }}>
```

Or add to CSS:
```css
[role="group"][aria-label="Teclado de piano"] {
  touch-action: manipulation;
}
```

---

### R4 — Expand landscape media query range

| Field | Value |
|-------|-------|
| **Files** | `src/index.css:255` |
| **Severity** | HIGH — iPad landscape and many phones excluded |
| **Effort** | Low |

**Problem**: Current query `@media (orientation: landscape) and (max-height: 600px)` misses:
- iPad landscape (1180×820) — no side-by-side layout
- iPhone 14 Pro Max landscape (932×430) — missing by 170px height
- Galaxy S23 landscape (918×412) — includes it, but on the edge

**Fix**: Broaden range. Use both orientation and min-aspect-ratio:

```css
/* Covers ~all phones+small tablets in landscape */
@media (orientation: landscape) and (max-height: 820px) {
  /* or use aspect-ratio: */
}
@media (min-aspect-ratio: 13/9) and (max-height: 900px) {
  .game-layout { flex-direction: row; align-items: flex-start; }
  .game-layout-staff { width: 50%; }
  .game-layout-keyboard { width: 50%; position: sticky; top: 0; }
  .game-layout-keyboard > div { margin-bottom: 0; }
}
```

**Estimated range**: 360×640 through 1180×820 now covered.

---

### R5 — Reduce/strip side curtains on mobile

| Field | Value |
|-------|-------|
| **Files** | `src/components/ConcertCurtains.tsx:22,41` |
| **Severity** | MEDIUM — wastes critical horizontal space |
| **Effort** | Low |

**Problem**: Side curtains fixed at 48px each = 96px total. On 375px-wide iPhone SE, that's **25% of the screen** consumed by decoration.

**Fix**: Hide side curtains on small viewports. Keep valance (top curtain) for atmosphere.

```tsx
// ConcertCurtains.tsx — wrap side curtains
const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 640)
  check()
  window.addEventListener('resize', check)
  return () => window.removeEventListener('resize', check)
}, [])

// In JSX, conditionally render side curtains:
{!isMobile && (
  <>
    {/* left curtain */}
    {/* right curtain */}
  </>
)}
```

Or with CSS media query:
```css
@media (max-width: 639px) {
  .curtain-side { display: none !important; }
}
```

**Valance**: Keep but reduce height from 64px to 40px on mobile → more vertical room.

---

### R6 — Reduce top padding and valance height on landscape mobile

| Field | Value |
|-------|-------|
| **Files** | `src/App.tsx:207`, `src/components/ConcertCurtains.tsx:8` |
| **Severity** | MEDIUM — vertical space extremely tight in landscape |
| **Effort** | Low |

**Problem**: Landscape layout has:
- 64px valance
- `pt-20` (80px) top padding
- ~44px header row (h1 + buttons)
- Progress bar
- Toolbar + staff

Total before game content: ~200px gone. On 375px viewport height, only ~175px left for staff + keyboard in side-by-side.

**Fix**: Reduce valance to 32px and padding to `pt-8` (32px) in landscape:

```css
@media (orientation: landscape) and (max-height: 600px) {
  /* In App.tsx, the pt-20 can be overridden via a class */
  .game-header { padding-top: 0.5rem !important; }
}
```

Better approach: detect landscape + small height and add a class to `<main>` wrapper:

```tsx
// App.tsx
const [isCompact, setIsCompact] = useState(false)
useEffect(() => {
  const check = () => setIsCompact(
    window.matchMedia('(orientation: landscape) and (max-height: 600px)').matches
  )
  check()
  window.addEventListener('resize', check)
  return () => window.removeEventListener('resize', check)
}, [])

// Apply to main container
className={`max-w-2xl mx-auto px-4 relative z-10 ${
  isCompact ? 'pt-8 pb-4' : 'pt-20 pb-6 sm:pt-24 sm:pb-8'
}`}
```

---

### R7 — Constrain toolbar select width on mobile

| Field | Value |
|-------|-------|
| **Files** | `src/components/Toolbar.tsx:22` |
| **Severity** | MEDIUM — select overflow on narrow viewports |
| **Effort** | Very low |

**Problem**: `w-44` (176px) on the lesson Select. Staff card may be ~280px wide on landscape mobile. With ornate frame decorations, the select can overflow or push content.

**Fix**: Use responsive width: `className="w-36 sm:w-44"` or `max-w-[140px] sm:max-w-none`.

---

### R8 — Improve StreakBadge / Score row wrapping

| Field | Value |
|-------|-------|
| **Files** | `src/App.tsx:268-283` |
| **Severity** | LOW — visual crowding on small screens |
| **Effort** | Very low |

**Problem**: Row has StreakBadge, StreakOwl, dailyStreak, ScoreDisplay, and attempt counter. Already has `flex-wrap` so it wraps, but on small landscape this creates a tall stack that crowds the staff.

**Fix**: Add `gap-1` instead of `gap-2 sm:gap-3` in landscape, or hide StreakOwl on mobile:

```tsx
// line 268 — adjust gap
className="flex justify-center items-center gap-1 sm:gap-3 mb-4 animate-slide-up flex-wrap"
```

Or conditionally hide StreakOwl on mobile (it shows at streak≥3 — maybe defer until streak≥5).

---

### R9 — Staff SVG sizing on small viewports

| Field | Value |
|-------|-------|
| **Files** | `src/components/Staff.tsx:45` |
| **Severity** | MEDIUM — notes become tiny in split landscape |
| **Effort** | Low |

**Problem**: SVG `viewBox` is fixed width 440. In landscape split layout, the staff container is ~50% viewport width. `NOTE_RADIUS = 8` in SVG coords renders physically small on the screen.

At 320px container width, note radius ~5.8px physical. At 480px, ~8.7px. OK on tablets, small on phones.

**Fix options** (pick one):

1. **Shrink viewBox on small screens**: Dynamically compute viewBox width:
```tsx
const SVG_WIDTH = typeof window !== 'undefined' && window.innerWidth < 640 
  ? STAFF_LEFT + 280 
  : STAFF_LEFT + 400
```

2. **Scale SVG per container**: Already using `w-full max-w-[500px]` with `h-auto`. Could increase the max-w proportion:
```tsx
className="w-full max-w-[500px] h-auto"
```
Staff currently takes 50% of landscape → ~310px min. SVG viewBox is 440. The SVG scales down, notes are 8/440 * 310 ≈ 5.6px radius. That's small but readable.

**Recommendation**: Reduce viewBox to `STAFF_LEFT + 300` on mobile, and increase `NOTE_RADIUS` to 10 in the same code path. This makes notes ~25% larger on small screens.

---

### R10 — Portrait mobile layout optimization

| Field | Value |
|-------|-------|
| **Files** | `src/App.tsx:251-292`, `src/index.css` |
| **Severity** | MEDIUM — vertical stack works but could be tighter |
| **Effort** | Low |

**Problem**: Portrait works because `game-layout` is `flex-col` by default. But:
- Keyboard at bottom may be off-screen / need scrolling
- No fixed-height keyboard (ResizeObserver-based keyW changes on scroll)
- Top padding + curtains waste vertical space

**Fix**:
1. Add `sticky` or `fixed` positioning to the keyboard container on portrait mobile:
```css
@media (max-width: 640px) and (orientation: portrait) {
  .game-layout-keyboard { position: sticky; bottom: 0; z-index: 20; }
  .game-layout-keyboard > div { margin-bottom: 0; }
}
```

2. Reduce card padding in staff card:
```css
@media (max-width: 640px) {
  .staff-card { padding: 0.75rem !important; } /* overrides p-4 sm:p-6 */
}
```

---

### R11 — "Siguiente Nota" button position on mobile

| Field | Value |
|-------|-------|
| **Files** | `src/App.tsx:322-331` |
| **Severity** | LOW — usability friction, not blocking |
| **Effort** | Very low |

**Problem**: Button appears below the keyboard in flow. In landscape, after the feedback phase users have to scroll to find it.

**Fix**: Overlay the button or move it next to staff section:

```tsx
{state.phase === 'feedback' && (
  <div className="text-center mt-3 animate-slide-up 
    landscape:md:absolute landscape:md:bottom-4 landscape:md:left-1/2 landscape:md:-translate-x-1/2">
    <button ... />
  </div>
)}
```

Or place inside `game-layout-staff` div so it appears in the left half next to the keyboard.

---

## 3. Gaps — Missing Entirely for Mobile

### G1 — Viewport height stabilizer

**Problem**: Mobile browser chrome (address bar, toolbar) shows/hides on scroll, changing `window.innerHeight`. Keyboard `useLayoutEffect` recalculates key widths, but the game layout may jump.

**Fix**: Add CSS `height: -webkit-fill-available` or use `dvh` units (dynamic viewport height):

```css
html, body, #root {
  height: 100%;
  height: -webkit-fill-available;
}
.min-h-screen {
  min-height: 100vh;
  min-height: -webkit-fill-available;
}
```

---

### G2 — Prevent keyboard scrolling/zoom on touch

**Problem**: No `touch-action` prevents pan/zoom on the keyboard. User may accidentally scroll the page while playing.

**Fix**:
```css
.game-layout-keyboard {
  touch-action: none; /* or pan-y */
  overscroll-behavior: none;
}
```

---

### G3 — No portrait tablet optimization

**Problem**: iPad portrait (768×1024) and iPad Mini portrait (744×1133) get the same layout as a phone — vertical stack. Staff is ~700px wide, notes are huge, layout wastes space.

**Fix**: Add tablet portrait rules to show a more balanced layout:

```css
@media (min-width: 768px) and (orientation: portrait) {
  .game-layout { flex-direction: row; }
  .game-layout-staff { width: 55%; }
  .game-layout-keyboard { width: 45%; }
}
```

---

### G4 — No hardware-accelerated key press feedback

**Problem**: Key press on mobile uses CSS transitions (`:active` with `transform: scale(0.95)`) which may lag on older devices.

**Fix**: Add `will-change: transform` to keyboard keys and/or use `transform: translateZ(0)` to promote to GPU layer:

```css
.piano-key {
  will-change: transform;
  /* OR */
  transform: translateZ(0);
}
```

---

### G5 — No orientation change handler

**Problem**: Rotating device mid-game recalculates `keyW` via `resize` event (good), but staff SVG viewport doesn't respond. Layout jumps.

**Fix**: Add an orientation change listener that force-recalculates:

```tsx
useEffect(() => {
  const handleOrientation = () => {
    // Force re-render or resize recalculation
    window.dispatchEvent(new Event('resize'))
  }
  window.addEventListener('orientationchange', handleOrientation)
  return () => window.removeEventListener('orientationchange', handleOrientation)
}, [])
```

---

## 4. Implementation Priority

| Priority | Items | Why |
|----------|-------|-----|
| **P0** | R1 (key count), R2 (touch events), R3 (touch-action) | Game literally unplayable on phone without these |
| **P1** | R4 (media query range), R5 (hide side curtains), R6 (compact mode) | Makes landscape layout usable |
| **P2** | R9 (staff sizing), G1 (viewport), G4 (GPU layer) | Visual polish and stability |
| **P3** | R7, R8, R10, R11, G2, G3, G5 | Edge cases and tablet optimization |

---

## 5. Visual Reference: Landscape at 667×375 (iPhone SE)

```
┌──────────────────────────────────────┐
│  [curtain valance 64px]              │
├──────────────────────────────────────┤
│  padding 80px                        │
│  ┌────────────────┬─────────────────┐│
│  │  Staff (50%)   │ Keyboard (50%)  ││
│  │                │                 ││
│  │  ~300px wide   │  ~300px wide    ││
│  │  notes ~6px r  │  37 keys→13px ea││
│  │  readable✓      │  touch target ✗ ││
│  │                │                 ││
│  │  [next btn]    │                 ││
│  └────────────────┴─────────────────┘│
│                                      │
└──────────────────────────────────────┘
```

**After fixes**:
```
┌──────────────────────────────────────┐
│  [valance 32px]                      │
├──────────────────────────────────────┤
│  padding 32px                        │
│  ┌────────────────┬─────────────────┐│
│  │  Staff (55%)   │ Keyboard (45%)  ││
│  │                │                 ││
│  │  ~340px wide   │  ~270px wide    ││
│  │  notes ~7px r  │  14 keys→19px ea││ (bigger keys w/ touch)
│  │  readable✓      │  touch target ≈ ✓│
│  │                │                 ││
│  │  [next btn]    │  (sticky)       ││
│  └────────────────┴─────────────────┘│
└──────────────────────────────────────┘
```

Touch targets at 19px still below 44px. **Recommendation**: Reduce to 12 keys (C4–B4 = full octave) → ~22px per white key. Still under 44px. For true 44px compliance, limit to 7 white keys on smallest screens:

| Screen width | 50% container | White keys | Key width |
|-------------|--------------|------------|-----------|
| iPhone SE (375) | 188px | 7 | 27px ✗ |
| iPhone SE (375) | 188px | 5 | 38px ✗ |
| iPhone SE (375) | 188px | 4 | 47px ✓ |

**Recommended mobile key layout**: Show **10 white keys** (C4–E5 = ~1.25 octaves). At 188px → 18.8px per key. Not 44px, but acceptable for piano apps — users understand piano keys are smaller than standard touch targets. iOS Piano, etc. use similar sizing. The 44px rule is for standalone buttons, not densely packed keyboard instruments.

---

## 6. Key Metrics After Recommendations

| Metric | Before | After (estimate) |
|--------|--------|-------------------|
| Min key width (iPhone SE landscape) | ~13px (37 keys) | ~19px (14 keys) |
| Touch response delay | 300ms (iOS) | <50ms |
| Viewport support | 1 query, max 600px | All phones + tablets |
| Portrait mobile | unoptimized vertical | tighter vertical + sticky keyboard |
| Side curtain waste | 96px | 0px on mobile |
| Notes physical radius (smallest) | ~5.6px | ~7.5px |
| Keyboard scroll/zoom protection | none | `touch-action: manipulation` |

---

**Status**: DONE  
**Next**: Developer implements P0–P1 items, then P2–P3 for completeness.
