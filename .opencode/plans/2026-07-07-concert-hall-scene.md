# Concert Hall Scene — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform piano sight-reading game into immersive concert hall with curtains, spotlight, ornate frame, and ivory/ebony piano.

**Architecture:** CSS variables + 3 new components (ConcertCurtains, Spotlight, OrnateFrame). No external assets. All graphics via CSS gradients, SVG, pseudo-elements. PianoKeyboard color scheme replaced.

**Tech Stack:** React 18, Tailwind CSS, CSS custom properties, SVG inline

## Global Constraints

- Zero external image/asset files (all visuals via CSS/SVG)
- Respect `prefers-reduced-motion` — disable curtain animations
- All new components work in light AND dark mode
- Follow existing component patterns (functional components, no external state libs)
- PianoKeyboard must remain functional — visual changes only
- File `src/` (root) is deployment target; `piano-sight-reading/src/` is development source — sync both

---

### Task 1: CSS Variables + Keyframes for Concert Theme

**Files:**
- Modify: `src/index.css` + `piano-sight-reading/src/index.css`

- [ ] **Step 1: Add CSS variables to `:root`**

After `--staff-line` variable, add:
```css
--curtain-primary: #6B1A1A;
--curtain-fold: #4A0E0E;
--gold: #C9922B;
--gold-light: #E2B84D;
--gold-dim: rgba(201, 146, 43, 0.3);
--stage-floor: #3D1F1A;
--stage-bg: #2C1810;
--spotlight-color: rgba(255, 220, 150, 0.12);
--ebony: #2C1810;
--ivory: #F5F0E5;
```

- [ ] **Step 2: Add dark mode variables to `.dark`**

```css
--curtain-primary: #4A0E0E;
--curtain-fold: #2D0808;
--gold: #D4A533;
--gold-light: #E8C55A;
--gold-dim: rgba(212, 165, 51, 0.25);
--stage-floor: #1A0E08;
--stage-bg: #0D0704;
--spotlight-color: rgba(255, 220, 150, 0.08);
--ebony: #0D0704;
--ivory: #E8DDD0;
```

- [ ] **Step 3: Add keyframes**

```css
@keyframes curtain-slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(0); }
}
@keyframes curtain-slide-right {
  0% { transform: translateX(100%); }
  100% { transform: translateX(0); }
}
@keyframes curtain-open-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-40px); }
}
@keyframes curtain-open-right {
  0% { transform: translateX(0); }
  100% { transform: translateX(40px); }
}
@keyframes gold-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
```

- [ ] **Step 4: Add utility classes**

```css
.animate-curtain-slide { animation: curtain-slide 0.8s ease-out; }
.animate-curtain-slide-right { animation: curtain-slide-right 0.8s ease-out; }
.animate-curtain-open-left { animation: curtain-open-left 0.6s ease-out forwards; }
.animate-curtain-open-right { animation: curtain-open-right 0.6s ease-out forwards; }
.animate-gold-pulse { animation: gold-pulse 2s ease-in-out infinite; }
```

- [ ] **Step 5: Sync both files** (same changes in both `src/index.css` and `piano-sight-reading/src/index.css`)

- [ ] **Step 6: Verify build:** `npm run build` (root) — confirm no errors.

- [ ] **Step 7: Commit**

```bash
git add src/index.css piano-sight-reading/src/index.css
git commit -m "feat(styles): add concert hall CSS variables + curtain keyframes"
```

---

### Task 2: ConcertCurtains Component

**Files:**
- Create: `src/components/ConcertCurtains.tsx`
- Create: `piano-sight-reading/src/components/ConcertCurtains.tsx`

**Interfaces:**
- Props: `{ isOpen?: boolean }`
- Consumes: CSS variables `--curtain-primary`, `--curtain-fold`, `--gold`

- [ ] **Step 1: Write component**

```tsx
interface ConcertCurtainsProps {
  isOpen?: boolean
}

export default function ConcertCurtains({ isOpen }: ConcertCurtainsProps) {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none" style={{ height: '64px' }}>
        <svg viewBox="0 0 1200 64" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="valance-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--curtain-primary)" />
              <stop offset="100%" stopColor="var(--curtain-fold)" />
            </linearGradient>
          </defs>
          <rect width="1200" height="56" fill="url(#valance-grad)" />
          <path d="M0,56 Q25,44 50,56 Q75,44 100,56 Q125,44 150,56 Q175,44 200,56 Q225,44 250,56 Q275,44 300,56 Q325,44 350,56 Q375,44 400,56 Q425,44 450,56 Q475,44 500,56 Q525,44 550,56 Q575,44 600,56 Q625,44 650,56 Q675,44 700,56 Q725,44 750,56 Q775,44 800,56 Q825,44 850,56 Q875,44 900,56 Q925,44 950,56 Q975,44 1000,56 Q1025,44 1050,56 Q1075,44 1100,56 Q1125,44 1150,56 Q1175,44 1200,56 L1200,64 L0,64 Z" fill="var(--curtain-fold)" />
          <line x1="0" y1="56" x2="1200" y2="56" stroke="var(--gold)" strokeWidth="1.5" />
          <line x1="0" y1="62" x2="1200" y2="62" stroke="var(--gold-dim)" strokeWidth="1" />
        </svg>
      </div>
      <div className={`fixed top-0 left-0 bottom-0 z-40 pointer-events-none ${isOpen ? 'animate-curtain-open-left' : 'animate-curtain-slide'}`} style={{ width: '48px' }}>
        <svg viewBox="0 0 48 800" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="left-curtain" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--curtain-primary)" />
              <stop offset="60%" stopColor="var(--curtain-fold)" />
              <stop offset="100%" stopColor="var(--curtain-primary)" />
            </linearGradient>
          </defs>
          <rect width="48" height="800" fill="url(#left-curtain)" />
          <line x1="16" y1="0" x2="16" y2="800" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
          <line x1="32" y1="0" x2="32" y2="800" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          <line x1="46" y1="0" x2="46" y2="800" stroke="var(--gold-dim)" strokeWidth="1" />
        </svg>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-0.5 h-6 bg-gradient-to-b from-[var(--gold)] to-[var(--gold-light)]" />
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] shadow-lg" />
        </div>
      </div>
      <div className={`fixed top-0 right-0 bottom-0 z-40 pointer-events-none ${isOpen ? 'animate-curtain-open-right' : 'animate-curtain-slide-right'}`} style={{ width: '48px' }}>
        <svg viewBox="0 0 48 800" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="right-curtain" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--curtain-primary)" />
              <stop offset="40%" stopColor="var(--curtain-fold)" />
              <stop offset="100%" stopColor="var(--curtain-primary)" />
            </linearGradient>
          </defs>
          <rect width="48" height="800" fill="url(#right-curtain)" />
          <line x1="16" y1="0" x2="16" y2="800" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          <line x1="32" y1="0" x2="32" y2="800" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
          <line x1="1" y1="0" x2="1" y2="800" stroke="var(--gold-dim)" strokeWidth="1" />
        </svg>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-0.5 h-6 bg-gradient-to-b from-[var(--gold)] to-[var(--gold-light)]" />
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] shadow-lg" />
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify build** — `npx tsc --noEit` + `npm run build`
- [ ] **Step 3: Commit** (stage and commit with `feat(ui): add ConcertCurtains`)

---

### Task 3: Spotlight Component

**Files:**
- Create: `src/components/Spotlight.tsx`
- Create: `piano-sight-reading/src/components/Spotlight.tsx`

- [ ] **Step 1: Write component**

```tsx
interface SpotlightProps {
  active?: boolean
}

export default function Spotlight({ active }: SpotlightProps) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-10 transition-opacity duration-700"
      style={{
        background: 'radial-gradient(ellipse at 50% 25%, var(--spotlight-color) 0%, transparent 60%)',
        opacity: active ? 0.9 : 0.4,
      }}
      aria-hidden="true"
    />
  )
}
```

- [ ] **Step 2: Verify build**
- [ ] **Step 3: Commit**

---

### Task 4: OrnateFrame Component

**Files:**
- Create: `src/components/OrnateFrame.tsx`
- Create: `piano-sight-reading/src/components/OrnateFrame.tsx`
- Modify: `src/App.tsx`, `piano-sight-reading/src/App.tsx`

- [ ] **Step 1: Write component**

```tsx
import { ReactNode } from 'react'

interface OrnateFrameProps {
  children: ReactNode
}

export default function OrnateFrame({ children }: OrnateFrameProps) {
  return (
    <div className="relative">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
        <svg width="120" height="12" viewBox="0 0 120 12" aria-hidden="true">
          <path d="M0,6 Q15,0 30,6 Q45,12 60,6 Q75,0 90,6 Q105,12 120,6" fill="none" stroke="var(--gold)" strokeWidth="1" />
          <circle cx="60" cy="6" r="2" fill="var(--gold)" />
        </svg>
      </div>
      {[0,1,2,3].map(i => (
        <div key={i} className={`absolute ${['-top-2 -left-2','-top-2 -right-2','-bottom-2 -left-2','-bottom-2 -right-2'][i]} z-20`}>
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d={[
              'M0,24 L0,0 L24,0',
              'M24,24 L24,0 L0,0',
              'M0,0 L0,24 L24,24',
              'M24,0 L24,24 L0,24',
            ][i]} fill="none" stroke="var(--gold)" strokeWidth="1.5" />
            <path d={[
              'M4,20 L4,4 L20,4',
              'M20,20 L20,4 L4,4',
              'M4,4 L4,20 L20,20',
              'M20,4 L20,20 L4,20',
            ][i]} fill="none" stroke="var(--gold-dim)" strokeWidth="0.5" />
            <circle cx={[4,20,4,20][i]} cy={[4,4,20,20][i]} r="1.5" fill="var(--gold)" />
          </svg>
        </div>
      ))}
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Modify App.tsx** — import OrnateFrame, wrap staff card `<div>` with `<OrnateFrame>...</OrnateFrame>`
- [ ] **Step 3: Verify build**
- [ ] **Step 4: Commit**

---

### Task 5: Concert Hall Background in App.tsx

**Files:**
- Modify: `src/App.tsx`, `piano-sight-reading/src/App.tsx`

- [ ] **Step 1: Replace background**

Change `className="min-h-screen bg-background ..."` to:
```tsx
className="min-h-screen transition-colors duration-300"
style={{
  background: 'radial-gradient(ellipse at 50% 30%, var(--stage-floor) 0%, var(--stage-bg) 100%)',
}}
```

- [ ] **Step 2: Add ConcertCurtains + Spotlight**

Import both. Add inside return before main container:
```tsx
<ConcertCurtains isOpen={state.phase !== 'idle'} />
<Spotlight active={state.phase === 'feedback' || state.phase === 'levelComplete'} />
```

- [ ] **Step 3: Add stage floor bar**

After main container div:
```tsx
<div className="fixed bottom-0 left-0 right-0 h-2 z-30 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent, var(--stage-floor))' }} aria-hidden="true" />
```

- [ ] **Step 4: Verify build + check both themes**
- [ ] **Step 5: Commit**

---

### Task 6: Piano Ivory/Ebony with Gold Accents

**Files:**
- Modify: `src/components/PianoKeyboard.tsx`, `piano-sight-reading/src/components/PianoKeyboard.tsx`

- [ ] **Step 1: White keys styling**

Replace `bg-white` with `bg-gradient-to-b from-white to-[var(--ivory)]`
Replace `border border-border` with `border border-[var(--gold-dim)]`

- [ ] **Step 2: Black keys styling**

Replace `bg-foreground/80` with `bg-gradient-to-b from-[var(--ebony)] to-black`
Replace `border border-border` with `border border-[var(--ebony)]`

- [ ] **Step 3: Add piano container frame**

Wrap the keyboard div with gold-tinted outer div:
```tsx
<div className="border border-[var(--gold-dim)]/50 rounded-lg shadow-inner shadow-[var(--ebony)]/10">
  <div ref={containerRef} className="py-2 select-none">...</div>
</div>
```

- [ ] **Step 4: Build verify + commit**

---

### Task 7: Gold-border Stats + Badges

**Files:**
- Modify: `src/App.tsx`, `piano-sight-reading/src/App.tsx`
- Modify: `src/components/StreakBadge.tsx`, `piano-sight-reading/src/components/StreakBadge.tsx`

- [ ] **Step 1: Stat pills** — replace `border-border` with `border-[var(--gold-dim)]/40`
- [ ] **Step 2: StreakBadge** — same border change
- [ ] **Step 3: Build verify + commit**

---

### Task 8: Final Sync + Deploy

- [ ] **Step 1: Build both** — root + piano-sight-reading
- [ ] **Step 2: Stage all changes**, commit, push
