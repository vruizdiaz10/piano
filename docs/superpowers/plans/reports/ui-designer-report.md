# UI Designer Report — Piano Sight-Reading Game

**Auditor:** UI Designer Agent  
**Date:** 2026-07-08  
**Scope:** Visual design audit of React + TypeScript + Tailwind piano game  
**Theme:** Concert hall (gold, maroon, ivory, stage)

---

## 1. Summary

Strong concert hall atmosphere — curtain valance, gold ornate frame, spotlight, stage dust motes, warm brown/ivory/ebony palette. The gold+maroon stage theme is cohesive and evocative. **Primary weakness**: shadcn/ui default `--accent` (indigo blue, `hsl(239 84% 67%)`) conflicts with the warm palette and bleeds into keyboard highlights, streak badges, and feedback timers. Second concern: musical staff uses Unicode characters that render inconsistently across platforms. Overall ~70% toward polished, 3-4 focused passes from excellent.

---

## 2. Recommendations (Prioritized)

### P1 — Accent Color Clashes with Warm Palette
**What:** `src/index.css:19`, line 27  
`--accent: 239 84% 67%` (indigo) and `--ring: 239 84% 67%`

**Why:** Indigo blue fights gold+maroon+ivory concert hall theme. This color surfaces on: black key highlights (`PianoKeyboard.tsx:97`), recovery timer (`Feedback.tsx:45`), streak badge at 5+ (`StreakBadge.tsx:11`), focus rings on all inputs.

**How:** Replace indigo accent with amber/gold that matches the stage theme.

```css
/* Light */
--accent: 38 80% 50%;        /* warm amber */
--accent-foreground: 0 0% 100%;
--ring: 38 80% 50%;

/* Dark */
--accent: 38 70% 55%;
--accent-foreground: 0 0% 100%;
--ring: 38 70% 55%;
```

**Effort:** Low — 2 lines per theme, recompiles everywhere.

---

### P2 — Unicode Musical Symbols May Not Render
**What:** `src/components/Staff.tsx:59`  
`{clef === 'bass' ? '\u{1D122}' : '\u{1D11E}'}`  
U+1D11E (𝄞 treble clef) and U+1D122 (𝄢 bass clef).

**Why:** These characters require a font with Musical Symbols block (Noto Music, Bravura, etc.). On systems without one, they render as tofu (□) or fall back to unrelated glyphs. Current fonts (Inter, Baloo 2) do not include these.

**How (option A — SVG inline, best):** Replace unicode with inline SVG paths for clefs.

**How (option B — web font, faster):** Add to HTML:
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Music&display=swap" rel="stylesheet">
```
Then add to `index.css`:
```css
.music-font { font-family: 'Noto Music', serif; }
```

**Effort:** Medium — SVG replacement is heavier. Web font is low effort.

---

### P3 — `--gold-dim` Uses rgba Instead of Proper Token
**What:** `src/index.css:34`  
`--gold-dim: rgba(201, 146, 43, 0.3);`

**Why:** Can't use with `border-[var(--gold-dim)]` reliably. The `rgba` value is tied to light-mode gold. In dark mode, gold changes to `#D4A533` but `--gold-dim` is recalculated as a separate value anyway — but using `rgba` prevents future use with `color-mix()` or dynamic opacity.

**How:**
```css
/* Light */
--gold: #C9922B;
--gold-light: #E2B84D;
--gold-dim: rgba(201, 146, 43, 0.3);  /* keep for now, but... */

/* Better approach — keep raw color + use opacity separately */
--gold-rgb: 201, 146, 43;   /* add this */
/* Then use: rgba(var(--gold-rgb), 0.3) in inline styles, or add a gold-dim utility */
```

**Effort:** Low — add `--gold-rgb` token, update consumers.

---

### P4 — Keyboard Key Width Flash on Mount
**What:** `src/components/PianoKeyboard.tsx:29`  
`const [keyW, setKeyW] = useState(44)` then recalculates in `useLayoutEffect`.

**Why:** Initial render uses 44px width. After layout, recalculates to actual width. Causes visible key width jump.

**How:** Set initial state to `0` and hide the container until measured:
```tsx
const [keyW, setKeyW] = useState(0)
// ... in JSX:
{keyW === 0 ? <div ref={containerRef} className="py-2" /> : ( /* keyboard */ )}
```
Or use a CSS grid approach instead of JS measurement:
```css
.piano-keys { display: flex; }
.piano-white-key { flex: 1; min-width: 0; }
```

**Effort:** Medium (CSS approach is cleaner, removes `useLayoutEffect` entirely).

---

### P5 — Confetti Colors Include Indigo
**What:** `src/components/Confetti.tsx:7`  
`const COLORS = ['#B91C1C', '#D97706', '#10B981', '#6366F1', '#EAB308', '#F97316']`  
`#6366F1` is indigo blue.

**Why:** Clashes with warm palette.

**How:** Replace `#6366F1` with `#C9922B` (gold) or `#6B1A1A` (curtain red):
```tsx
const COLORS = ['#6B1A1A', '#D97706', '#10B981', '#C9922B', '#EAB308', '#F97316']
```

**Effort:** Low — one line.

---

### P6 — Staff Fixed Viewport Causes Overflow on Narrow Screens
**What:** `src/components/Staff.tsx:45`  
`viewBox="0 -${SVG_TOP_PAD} ${STAFF_LEFT + 400} ${height + SVG_TOP_PAD}"`  
Result: ~440px wide viewport.

**Why:** On screens narrower than 440px, the SVG overflows its container. The `max-w-[500px]` doesn't protect against this because the viewBox aspect ratio is preserved.

**How:** Make viewBox width dynamic or use `preserveAspectRatio="xMinYMid meet"` with a responsive container. Simpler fix: reduce `STAFF_LEFT + 340` to a smaller base and let the `w-full max-w-[500px]` clamp it:
```tsx
const STAFF_WIDTH = 320  // down from 340
// viewBox: `0 -${SVG_TOP_PAD} ${STAFF_LEFT + STAFF_WIDTH} ${...}`
```

**Effort:** Low — one constant change.

---

### P7 — LevelComplete Constellation Background Color
**What:** `src/components/LevelComplete.tsx:93`  
`fill="var(--constellation-bg, #0F172A)"` — falls back to slate-900.

**Why:** `#0F172A` is deep cool blue. In light mode with `opacity={0.15}` it looks like a murky dark patch. The `dark:opacity-30` makes it even darker in dark mode.

**How:** Change fallback to a warm color that matches theme:
```tsx
fill="var(--constellation-bg, #1A0E08)"  // matches dark stage-floor
```
Or remove the rect entirely and just use the constellation lines/stars on the transparent card background. The lines already use `currentColor` with `text-primary`.

**Effort:** Low.

---

### P8 — StreakBadge Uses Accent (Blue-Purple) for Gold-Level Streaks
**What:** `src/components/StreakBadge.tsx:11`  
`streak >= 5 ? 'text-accent border-accent/30 bg-accent/10'`

**Why:** Gold/amber would be more appropriate for "warm" streak achievements.

**How:** Map streak levels to warm colors instead:
```tsx
streak >= 8 ? 'text-secondary border-secondary/30 bg-secondary/10'
  : streak >= 5 ? 'text-amber-600 dark:text-amber-400 border-amber-300/30 dark:border-amber-600/30 bg-amber-50 dark:bg-amber-950/30'
  : streak >= 3 ? 'text-primary border-primary/30 bg-primary/10'
  : 'text-muted-foreground border-[var(--gold-dim)]/40 bg-[var(--gold-dim)]/10'
```

Or after fixing P1 (accent → amber), issue auto-resolves.

**Effort:** Low (follows P1 fix).

---

### P9 — Stat Pills and Buttons Lack Hover/Active States
**What:** `src/App.tsx:276-282`  
Stat pills (`ScoreDisplay`, attempt counter) use `bg-card border border-[var(--gold-dim)]/60 shadow-sm`.

**Why:** These appear interactive (inside button-like pills) but have no hover/active state. They look tappable but aren't (they're display-only). This creates false affordance.

**How:** Either:
- Remove `shadow-sm` and `border` to make them clearly static, OR
- Add `cursor-default` and reduce border prominence.

For the actual buttons (session target selectors at `:299-309`), ensure all have consistent `btn-3d` behavior — they currently only use `btn-3d` but lack the `.dark` hover variants.

**Effort:** Low.

---

### P10 — Button Border Radius Inconsistency
**What:** `src/App.tsx:300` vs `:312`  
Session target buttons: `rounded-xl`. Start game button: `rounded-2xl`.

**Why:** Different radii on sibling buttons in same section looks sloppy. The card uses `rounded-2xl`, pills use `rounded-full` / `rounded-xl`.

**How:** Standardize within view. Pick one:
- All action buttons: `rounded-xl` (fits card radius better), OR
- All action buttons: `rounded-2xl` (matches card).

The `--radius: 0.75rem` is shared, so `rounded-xl` = `0.75rem`, `rounded-2xl` = `1rem`. Recommend `rounded-xl` for consistency with the `--radius` token.

**Effort:** Low — one class change.

---

### P11 — ProgressChart Line Opacity Lowers Readability
**What:** `src/components/ProgressChart.tsx:22`  
`stroke="var(--gold)" strokeWidth="1.5" opacity={0.4}`

**Why:** Gold on ivory/stage background at 40% opacity is hard to read at 1.5px width, especially on mobile.

**How:** Bump to `opacity={0.6}` and `strokeWidth="2"`. Points already at `opacity={0.8}` with `r={4}` are fine.

**Effort:** Low.

---

### P12 — Headings Use Baloo 2 Which Loads After Inter
**What:** `index.html:11`  
Both fonts loaded in one Google Fonts URL. Baloo 2 (heading) is a display font, Inter (body) is a workhorse.

**Why:** Baloo 2 is playful and fits a music game but is relatively uncommon. Users without it loaded (e.g., slow network, font-blocking extensions) will see fallback system-ui which changes heading proportions.

**How:** Add `font-display: swap` (already present) and consider `preload` on Baloo 2:
```html
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&display=swap" />
```
Minor issue — not critical.

**Effort:** Low.

---

### P13 — Mute Button "Zzz" Animation Positioning Breaks at Small Sizes
**What:** `src/App.tsx:224-226`  
`absolute -top-2 -right-1`, `absolute -top-3 right-2`, `absolute -top-4 right-4`

**Why:** Positioned relative to button with hardcoded negative offsets. If button size changes (different padding, font-size), Z's may clip or misalign.

**How:** Use a flex column layout inside the button instead:
```tsx
<div className="relative">
  <svg ... />  {/* main icon */}
  <div className="absolute inset-0 flex items-start justify-end pt-0.5 pr-0.5">
    <span className="text-[10px] font-bold text-blue-300 animate-zzz-float">Z</span>
  </div>
</div>
```
Or — simplest — keep as-is and test on mobile. It's a decorative flourish, not critical.

**Effort:** Low (defensive) to Medium (rewrite).

---

## 3. Gaps (What's Missing)

### G1 — No Font Loading Strategy
Fonts are loaded via Google Fonts CSS with `display=swap`. No preload, no fallback test, no `font-family` with explicit loading behavior (e.g., `font-display: optional` for body). If network is slow, layout shifts (CLS) on font swap. **Recommendation:** Add `preconnect` for `fonts.gstatic.com` (already has `fonts.googleapis.com`), add `font-display: optional` or `swap` via the URL already used.

### G2 — No Skeleton / Loading States for Components
No component has a loading skeleton, placeholder, or shimmer. If MIDI initialization, audio loading, or note generation is slow, the UI shows nothing or stale state. **Recommendation:** Add `animate-pulse` skeleton for the Staff and PianoKeyboard during loading.

### G3 — No Empty States for ProgressChart
`ProgressChart.tsx:5` returns `null` if fewer than 2 sessions. The idle screen shows nothing below the "Iniciar Juego" button for first-time users. **Recommendation:** Show a brief instructional message or illustration encouraging the first session.

### G4 — No Error States for MIDI Connection
MIDI status pill shows red/green. If MIDI connection fails mid-game, there's no recovery UI beyond the static indicator. **Recommendation:** Add a toast or inline message when MIDI disconnects during active play.

### G5 — Color Token Silos
Some SVG colors hardcode hex values not using CSS vars:
- `StreakOwl.tsx` — `#A16207`, `#D97706`, `#FEF3C7`, `#FBBF24`, `#92400E` all hardcoded
- `Confetti.tsx` — all colors hardcoded
- `animate-pulse-glow` — uses `rgba(217, 119, 6, ...)` (amber baked into keyframes)

**Recommendation:** Move to CSS var references where theming matters. For decorative-only (confetti, owl), hardcoded is acceptable if they work in both modes (these ambers do).

### G6 — Reduced Motion Not Fully Respected
`index.css:262-268` sets `animation-duration: 0.01ms !important` for `prefers-reduced-motion: reduce`. This covers CSS animations but not:

- **Confetti** (`setTimeout` toggles): Still renders particles even if invisible. Would still cause layout/composite work.
- **Theme transition** (`animate-theatre-glow`, `animate-twilight-theater`): Not gated by reduced motion check.
- **Staff ghost trail** (`animate-ghost-drift`): Still animates.

**Recommendation:** Add `window.matchMedia('(prefers-reduced-motion: reduce)')` checks in JS-driven animations (Confetti, theme transition).

---

## 4. Design Token Summary

| Token | Light | Dark | Assessment |
|-------|-------|------|------------|
| `--gold` | `#C9922B` | `#D4A533` | ✅ Works both modes |
| `--gold-light` | `#E2B84D` | `#E8C55A` | ✅ Works |
| `--gold-dim` | `rgba(201,146,43,0.3)` | `rgba(212,165,51,0.25)` | ⚠️ rgba is fine but prefer spectral token |
| `--stage-bg` | `#E8DDCF` | `#0D0704` | ✅ Extreme shift, works |
| `--stage-floor` | `#D4C5AD` | `#1A0E08` | ✅ Works |
| `--ivory` | `#F5F0E5` | `#E8DDD0` | ✅ Works (ivory stays warm) |
| `--ebony` | `#2C1810` | `#0D0704` | ✅ Works |
| `--curtain-primary` | `#6B1A1A` | `#4A0E0E` | ✅ Deep maroon, works |
| `--curtain-fold` | `#4A0E0E` | `#2D0808` | ✅ |
| `--accent` | `hsl(239 84% 67%)` | `hsl(239 70% 60%)` | ❌ Blue-purple clashes |
| `--primary` | `hsl(0 60% 35%)` | `hsl(0 60% 55%)` | ✅ Rich maroon, works |

---

## 5. Accessibility Notes

- **Color contrast:** Gold on ivory (light mode) passes at larger sizes. Gold on stage-bg (`#E8DDCF` → `#C9922B`) is approximately 2.5:1 — fails WCAG AA for small text. Gold is used for decorative borders only, so this is acceptable.
- **Focus indicators:** Uses `focus-visible:outline-2 focus-visible:outline-ring` via Tailwind base + btn classes. Ring was indigo (P1). Will resolve when ring color matches theme.
- **Touch targets:** Keyboard keys are dynamically sized — may fall below 44px on very narrow screens (threshold issue, not systematic).
- **Reduced motion:** Partially implemented (G6).
- **Screen reader:** `aria-live="polite"` for feedback, `sr-only` for announcements, `aria-label` on interactive elements — good baseline.

---

## 6. Visual Hierarchy Audit

| Element | Font | Size | Weight | Color | Assessment |
|---------|------|------|--------|-------|------------|
| App title | Baloo 2 | 1.25rem / 1.5rem | 700 | foreground | ✅ Good |
| Stat pills | Inter | 0.75rem / 0.875rem | 600 | muted-foreground | ✅ Good |
| Accuracy % | Inter | 1.5rem | 700 | success/accent/destructive | ✅ Good |
| Feedback | Inter | 1rem | 700 | success/destructive | ✅ Good |
| Button labels | Inter | 0.875rem | 600 | foreground/muted | ✅ Good |
| Lesson desc | Inter | 0.75rem | 400 | muted-foreground | ✅ Good |
| Progress label | Inter | 0.75rem | 600 | muted-foreground | ✅ Good |

Hierarchy is well-considered. Only concern: all text uses Inter (body) except headings (Baloo 2). The body-weight range (400-700) is narrow but sufficient for a game.

---

## 7. Conclusion

The concert hall theme is well-executed. Gold corner frames, curtain valance with tassels, floating stage motes, spotlight overlay, and warm ivory/ebony piano keys create a cohesive theatrical atmosphere. The project uses design tokens effectively with light/dark mode support.

**Key fixes (90% of visual impact):**
1. Replace indigo accent with amber/gold (P1) — resolves ~6 surface-level color conflicts
2. Fix staff clef rendering (P2) — prevents tofu glyphs
3. Standardize button radii (P10) — tightens polish
4. Add reduced-motion JS checks (G6) — accessibility completeness

**Effort summary:** 4 low-effort changes, 1 medium (P2 if SVG), ~2 hours total for a polished result.
