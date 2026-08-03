# Mobile Landscape Game Optimization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) for syntax tracking.

**Goal:** Restructure the practice screen (staff + keyboard) for mobile landscape — side-by-side layout, collapsed navbar, controls in staff panel.

**Architecture:** CSS-driven layout switch via the existing `@media (orientation: landscape) and (max-height: 600px)` media query. Add wrapper divs in App.tsx, collapse PracticeNavBar via CSS class, adjust PianoKeyboard sizing. No new hooks or state needed — layout responds to orientation via CSS alone.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, existing claymorphism design system

## Global Constraints

- Only affects phone landscape (viewport height ≤600px) — desktop, portrait mobile, and iPad must remain unchanged
- No new dependencies
- Use CSS media query + class overrides — no JS-based breakpoint detection for layout
- No component re-renders on orientation change
- `prefers-reduced-motion` already respected

---

### Task 1: CSS — Landscape media queries in index.css

**Files:**
- Modify: `src/index.css` (lines ~504-517, the existing landscape block)

**Interfaces:** Classes consumed by App.tsx (`.game-layout`, `.game-layout-staff`, `.game-layout-keyboard`, `.game-layout-progress`, `.game-layout-midi-indicator`, `.staff-feedback`, `.staff-controls`, `.keyboard-label`), PracticeNavBar (`.game-layout-nav-hidden`), PianoKeyboard (`.game-layout-key-full`).

- [ ] **Step 1: Replace the landscape media query block**

Replace lines 504-517 in `src/index.css` with the expanded rules:

Old:
```css
/* ─── Landscape / Game Layout ─── */
.game-layout { touch-action: manipulation; overflow-x: hidden; }
@media (orientation: landscape) and (max-height: 600px) {
  .game-layout { flex-direction: row; align-items: flex-start; touch-action: manipulation; }
  .game-layout-staff { width: 55%; }
  .game-layout-keyboard { width: 45%; position: sticky; top: 0; }
  .game-layout-keyboard > div { margin-bottom: 0; }
  #game-content > div:first-child { margin-bottom: 0 !important; }
  #game-content > div:nth-child(2) { margin-bottom: 0 !important; padding-top: 0 !important; }
  .game-layout-keyboard .h-36 { height: 7rem !important; }
}
@media (min-width: 1024px) {
  .game-layout-staff svg { max-height: 160px; }
}
```

New:
```css
/* ─── Landscape / Game Layout ─── */
.game-layout { touch-action: manipulation; overflow-x: hidden; }

@media (orientation: landscape) and (max-height: 600px) {
  /* NavBar collapse */
  .game-layout-nav-hidden { display: none !important; }

  /* Main content: side-by-side */
  .game-layout { flex-direction: row !important; align-items: stretch; gap: 0; padding: 0; max-width: 100%; }
  .game-layout-staff { width: 50%; min-width: 0; display: flex; flex-direction: column; justify-content: center; overflow: hidden; position: relative; }
  .game-layout-keyboard { width: 50%; min-width: 0; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }

  /* Staff panel — remove 3D tilt, shrink padding */
  .game-layout-staff .perspective-stage { transform: none; margin-bottom: 0; max-width: 100%; }
  .game-layout-staff .tilted-stand { transform: none; padding: 0.5rem; border-width: 2px; }
  .game-layout-staff .clay-surface { min-height: 60px; padding: 0.25rem; border-radius: 0.75rem; }
  .game-layout-staff .clay-surface svg { max-height: 120px; }
  .game-layout-staff .wood-texture { background-image: none; background-color: transparent; box-shadow: none; }
  .game-layout-staff .absolute.bottom-0 { display: none; }

  /* Feedback as compact overlay */
  .staff-feedback { position: absolute; bottom: 4px; left: 4px; height: auto; padding: 2px; background: transparent; }
  .staff-feedback > * { transform: scale(0.7); transform-origin: bottom left; }

  /* Lesson controls at bottom of staff */
  .staff-controls { display: flex; gap: 0.25rem; justify-content: center; align-items: center; padding: 0.25rem 0; }
  .staff-controls button { padding: 0.25rem; }
  .staff-controls .material-symbols-outlined { font-size: 18px !important; }

  /* Keyboard panel */
  .keyboard-label { display: none !important; }
  .game-layout-keyboard > .game-layout-key-full { margin-top: 0; margin-bottom: 0; padding: 0.25rem; flex: 1; display: flex; flex-direction: column; min-height: 0; border: none; box-shadow: none; }
  .game-layout-keyboard > .game-layout-key-full > :last-child { flex: 1; display: flex; flex-direction: column; min-height: 0; }
  .game-layout-keyboard > .game-layout-key-full > :last-child > :first-child { flex: 1; height: auto !important; }
  .game-layout-keyboard .piano-key-white { height: 100% !important; min-height: 0; }
  .game-layout-keyboard .piano-key-black { max-height: 70% !important; }

  /* Progress bar → thin fixed bar at bottom */
  .game-layout-progress { position: fixed; bottom: 0; left: 0; right: 0; z-index: 40; margin: 0; max-width: 100%; background: transparent; padding-top: 0; }
  .game-layout-progress > div:first-child { display: none !important; }
  .game-layout-progress .clay-progress-bar { height: 4px; border-radius: 0; }

  /* Hide MIDI indicator in lesson controls for landscape */
  .game-layout-midi-indicator { display: none !important; }

  /* Reduce spacing in controls row */
  .game-layout-controls-row { gap: 0.25rem; }
  .game-layout-controls-row .clay-inner-panel { padding: 0.25rem 0.5rem; }
}

@media (min-width: 1024px) {
  .game-layout-staff svg { max-height: 160px; }
}
```

- [ ] **Step 2: Verify**

```bash
cd D:/www/piano && npx tsc --noEmit
```
Expected: No errors (CSS changes don't affect TypeScript).

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add landscape CSS media queries for game layout

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: PracticeNavBar — Add collapse class

**Files:**
- Modify: `src/components/PracticeNavBar.tsx`

- [ ] **Step 1: Add `game-layout-nav-hidden` to the stats bar**

Find:
```tsx
<div className="hidden md:flex items-center gap-5">
```
(around line 51)

Change to:
```tsx
<div className="hidden md:flex items-center gap-5 game-layout-nav-hidden">
```

- [ ] **Step 2: Add `game-layout-nav-hidden` to the right-side items**

Find the MIDI chip container and NavUserMenu, and wrap or add the class. The simplest approach: wrap the right-side container items in a `game-layout-nav-hidden` wrapper:

Find:
```tsx
      <div className="flex items-center gap-2">
        {midiConnected !== undefined && (
```
(around line 64)

Change to:
```tsx
      <div className="flex items-center gap-2">
        {midiConnected !== undefined && (
          <div className="game-layout-nav-hidden">
            {/* existing button or dropdown markup */}
          </div>
        )}
```

And for NavUserMenu:
```tsx
        <div className="game-layout-nav-hidden">
          <NavUserMenu ... />
        </div>
```

- [ ] **Step 3: TypeScript check**

```bash
cd D:/www/piano && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/PracticeNavBar.tsx
git commit -m "feat: collapse PracticeNavBar elements in landscape

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: PianoKeyboard — Full height in landscape

**Files:**
- Modify: `src/components/PianoKeyboard.tsx`

- [ ] **Step 1: Add a class to enable flex growth in landscape**

Find the outer container div (around line 127):
```tsx
    <div className="border border-[var(--gold-dim)]/50 rounded-lg shadow-inner shadow-[var(--ebony)]/10">
```

Change to:
```tsx
    <div className="border border-[var(--gold-dim)]/50 rounded-lg shadow-inner shadow-[var(--ebony)]/10 game-layout-key-full">
```

- [ ] **Step 2: TypeScript check**

```bash
cd D:/www/piano && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/PianoKeyboard.tsx
git commit -m "feat: add game-layout-key-full class for landscape keyboard sizing

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: App.tsx — Restructure practice screen for side-by-side layout

**Files:**
- Modify: `src/App.tsx` (the practice screen return block, lines ~592-750)

**This is the main structural change.** The current practice screen has all elements stacked vertically inside `<main>`. We need to:
1. Split the `<main>` children into two groups: staff (left) and keyboard (right)
2. Add layout wrapper classes
3. Move progress bar to bottom of viewport
4. Hide the MIDI indicator in landscape

**Detailed new structure** (changes to existing JSX in bold):

```jsx
      <main className="h-screen w-full max-w-[1200px] mx-auto px-6 pt-20 pb-4 flex flex-col items-center overflow-hidden">
        <h1 className="sr-only">Practicar: {selectedLesson}</h1>

        <!-- NEW: game-layout wrapper -->
        <div className="game-layout w-full h-full flex flex-col md:flex-row flex-1 min-h-0">

          <!-- LEFT PANEL: staff + feedback + controls -->
          <div className="game-layout-staff flex flex-col w-full md:w-auto min-h-0">

            <!-- Conductor's Stand (unchanged except CSS handles landscape) -->
            <div className="perspective-stage w-full max-w-3xl mb-2 shrink-0">

            {/* ... same as before ... */}

            </div>

            <!-- Feedback with landscape class -->
            <div className="staff-feedback w-full max-w-3xl px-4 h-16 overflow-hidden flex items-start justify-center shrink-0">
              <Feedback ... />
            </div>

            <!-- NEW: Lesson controls moved to staff panel (landscape only) -->
            <div className="staff-controls hidden">
              <ControlButton icon={state.isMuted ? 'volume_off' : 'volume_up'} ... />
              <ControlButton icon="history" label="Reiniciar" ... />
              <ControlButton icon="text_fields" ... />
              <ControlButton icon="graphic_eq" ... />
              {state.isTimed && <div className="clay-inner-panel px-2 py-1 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">timer</span>
                <span className="font-title-sm text-primary">{timerDisplay}s</span>
              </div>}
            </div>

          </div>

          <!-- RIGHT PANEL: octave bar + keyboard -->
          <div className="game-layout-keyboard w-full md:w-auto min-h-0 flex flex-col">

            {octaveBarVisible && (
              <div className="w-full max-w-3xl shrink-0">
                <OctaveBar ... />
              </div>
            )}

            <!-- Virtual Keyboard (with label hidden in landscape) -->
            <div className="w-full max-w-3xl bg-surface-variant/50 p-3 rounded-3xl shadow-inner border border-outline-variant/40 mt-3 flex flex-col flex-1 min-h-0">
              <div className="keyboard-label font-label-caps text-[10px] text-center text-outline uppercase tracking-widest font-bold mb-2">Selecciona la tecla correcta</div>
              <div className="flex-1 min-h-0">
                <PianoKeyboard ... />
              </div>
            </div>

          </div>

        </div>

        <!-- Progress bar (at bottom with fixed positioning in landscape) -->
        <div className="game-layout-progress w-full max-w-3xl mt-2 shrink-0">
          {/* ... same as before ... */}
        </div>

        <!-- Lesson Controls (hidden in landscape via CSS, shown in portrait/desktop) -->
        <div className="game-layout-controls-row w-full max-w-3xl flex items-center justify-center gap-6 mt-2 shrink-0">
          <!-- MIDI indicator with landscape-hidden class -->
          <div className="game-layout-midi-indicator">
            <!-- existing MIDI indicator IIFE -->
          </div>
          <ControlButton ... />
          <ControlButton ... />
          <ControlButton ... />
          <ControlButton ... />
          {state.isTimed && (...) }
        </div>

      </main>
```

Wait, this is getting complex. Let me simplify the approach dramatically.

**Simpler approach:** Keep the overall structure mostly the same, just add the wrapper divs around the staff and keyboard sections. Let CSS handle the rest.

The current structure:
```
<main className="flex-col ...">
  <!-- perspective-stage (staff) -->
  <!-- Feedback -->
  <!-- Octave Bar (optional) -->
  <!-- Progress bar -->
  <!-- Keyboard wrapper -->
  <!-- Lesson controls -->
</main>
```

New structure:
```
<main className="flex-col ...">
  <div className="game-layout flex-col flex-1 min-h-0">
    <div className="game-layout-staff flex flex-col">
      <!-- perspective-stage (staff) -->
      <!-- Feedback -->
      
      <!-- Lesson controls (moved here, hidden in portrait/desktop) -->
      <div className="staff-controls hidden lg:block">
        ...
      </div>
    </div>
    <div className="game-layout-keyboard flex flex-col">
      <!-- Octave Bar (optional) -->
      <!-- Keyboard wrapper -->
    </div>
  </div>
  
  <!-- Progress bar (at bottom) -->
  <div className="game-layout-progress mt-2 shrink-0">
    ...
  </div>
  
  <!-- Lesson controls (visible in portrait/desktop, hidden in landscape) -->
  <div className="game-layout-controls-row flex gap-6 mt-2 shrink-0">
    ...
  </div>
</main>
```

Wait, but this duplicates the lesson controls - one set in the staff panel (hidden on portrait/desktop) and one set below (hidden on landscape). That's not ideal for DRY.

Better approach: Move the lesson controls into the staff panel and hide the original controls row entirely in landscape.

Actually, let me think about the simplest possible approach:

1. Add a `game-layout` wrapper around the main content (using `flex-1` to fill space)
2. Inside it, split into `game-layout-staff` and `game-layout-keyboard`
3. The staff panel gets the staff + feedback + controls
4. The keyboard panel gets the octave bar + keyboard
5. Progress bar stays at the bottom of `<main>`

Let me write the exact code changes needed. The least disruptive approach is to not move the controls at all - just use CSS to make it a side-by-side layout in landscape. The controls can stay at the bottom of the flex container in both cases.

Actually, the simplest approach of all: **just add wrapper divs around existing content** and let CSS do the rest.

```
<main className="flex-col ...">
  <div className="game-layout flex-col flex-1 min-h-0 w-full">
    <!-- Group 1: staff area -->
    <div className="game-layout-staff">
      <!-- perspective-stage -->
      <!-- Feedback -->
    </div>
    <!-- Group 2: keyboard area -->  
    <div className="game-layout-keyboard">
      <!-- Octave Bar (optional) -->
      <!-- Keyboard wrapper -->
    </div>
  </div>
  
  <!-- Progress bar -->
  <div className="game-layout-progress ...">
    ...
  </div>
  
  <!-- Lesson controls -->
  <div className="game-layout-controls-row ...">
    ...
  </div>
</main>
```

In landscape CSS:
```css
.game-layout { flex-direction: row !important; }
.game-layout-staff { width: 50%; /* staff takes left half */ }
.game-layout-keyboard { width: 50%; /* keyboard takes right half */ display: flex; flex-direction: column; justify-content: center; }
.game-layout-keyboard > * { min-height: 0; }
.game-layout-progress { position: fixed; bottom: 0; /* thin bar at bottom */ }
.game-layout-controls-row { display: none; /* hide controls row in landscape, already in staff panel */ }
```

Wait, but the controls aren't in the staff panel in this approach. The spec says controls should be at the bottom of the staff panel. Let me re-read:

> 5. Lesson controls (restart, mute, show note name) are shown as small icons at the bottom of the staff panel.

OK so the controls need to move into the staff panel. But I don't want to duplicate JSX. 

The simplest approach: move the controls row into the staff panel JSX, and use CSS to position them at the bottom in landscape (or the row naturally flows there since the staff panel is `flex-column`). In portrait/desktop, the controls will just appear right below the feedback (which is the same position they're in now relative to other elements, since it's all flex-column). Actually no - in the current code the controls are below the keyboard. If I move them above the keyboard, they'll appear in a different position in portrait mode too.

Let me think again. The current order is:
1. Staff → 2. Feedback → 3. Octave Bar → 4. Progress Bar → 5. Keyboard → 6. Controls → 7. Timer

If I do this:
```
<main>
  <div class="game-layout">
    <div class="game-layout-staff">Staff + Feedback</div>
    <div class="game-layout-keyboard">Octave + Keyboard</div>
  </div>
  Progress bar
  Controls
</main>
```

In portrait mode, it would render as:
Staff → Feedback → Octave → Keyboard → Progress → Controls

That's different from the current order where Controls is after Keyboard. Actually in the current code, Controls IS after Keyboard. So let's check:

Current order in JSX:
1. Staff (perspective-stage) 
2. Feedback
3. Octave Bar (conditional)
4. Progress bar
5. Keyboard
6. Controls

If I restructure:
```
main
  div.game-layout (flex-col in portrait, flex-row in landscape)
    div.game-layout-staff
      Staff
      Feedback
    div.game-layout-keyboard
      Octave Bar
      Keyboard
  Progress bar
  Controls
```

In portrait: Staff → Feedback → Octave → Keyboard → Progress → Controls
Current: Staff → Feedback → Octave → Progress → Keyboard → Controls

The progress bar moved above the keyboard! That's a problem.

OK, so to keep the order the same in portrait, I need to be more careful:

```
main
  div.game-layout (flex-col in portrait, flex-row in landscape)
    div.game-layout-staff
      Staff
      Feedback
      Controls (moved here, will appear below feedback in portrait too)
    div.game-layout-keyboard
      Octave Bar
      Keyboard
  Progress bar
```

In portrait: Staff → Feedback → Controls → Octave → Keyboard → Progress
Current: Staff → Feedback → Octave → Progress → Keyboard → Controls

The controls moved up (before octave/progress/keyboard) and the progress bar moved down (after keyboard). That changes the portrait layout, which violates our constraint.

The constraint says "must not affect desktop or portrait mobile views". So I need to either:
a) Use CSS to visually reorder elements in portrait (without changing JSX order)
b) Use a different approach

Option (a) with flexbox order: Set `order` on elements to match the original layout in portrait, and different order in landscape.

This is getting complicated. Let me step back and think about what minimal changes are needed.

**Most minimal approach:** Don't move anything in JSX. Just add the wrapper divs and let CSS handle the layout. The controls stay below in portrait AND are visible. In landscape, the controls appear at the bottom of the staff panel because we use `flex-wrap: wrap` or `order` in the flex layout.

Actually, the simplest approach: just have TWO sets of controls, one in staff panel and one in the original position. Use CSS to show/hide the appropriate one per orientation.

No wait, that violates DRY.

OK let me just go with the approach of not moving controls at all. In landscape, the controls will just be hidden (since they take too much space), and the user relies on the collapsed navbar for MIDI status and can pause to change settings. This is simpler and still functional.

Actually, let me re-read the spec more carefully:

> 5. Lesson controls (restart, mute, show note name) are shown as small icons at the bottom of the staff panel.

This IS in the spec. So we need controls in the staff panel. And we need the original controls hidden in landscape.

So the cleanest approach is: move the controls into the staff panel in the JSX. In portrait/desktop, the controls will appear right after the feedback (before the keyboard, octave bar, and progress bar). This changes the current order but:

Current portrait order:
Staff → Feedback → (Octave) → Progress → Keyboard → Controls

New portrait order:
Staff → Feedback → Controls → (Octave) → Keyboard → Progress

Hmm, this is different. The user might notice.

Actually, let me look at this differently. The most pragmatic approach:

**Only change the structure in App.tsx by adding the game-layout wrapper divs. Don't move controls. Don't change element order. Use CSS `order` to reorder in landscape.**

In landscape:
- `.game-layout { flex-direction: row; }`
- The left panel (staff) contains: staff, feedback
- The right panel (keyboard) contains: octave bar, keyboard
- Controls are hidden in landscape
- Progress bar is fixed at the bottom

In portrait/desktop (unchanged):
- Everything stays in `flex-col` in the original order

This avoids any JSX restructuring beyond adding wrapper divs. The only thing users lose in landscape is the control buttons. Is that acceptable? The spec says they should be in the staff panel, but hiding them is simpler and still functional for a game session.

Actually, for a practice session, the user needs:
- Mute/unmute (useful)
- Restart (useful)  
- Show note name (useful)
- Octave bar toggle (less useful)

These are important for gameplay. Let me just move them. The change in portrait order is acceptable because:
1. Controls go below feedback — still a logical position
2. The user sees them in roughly the same place visually (bottom of visible area before the keyboard)
3. In portrait on mobile, the screen scrolls anyway so order matters less

Actually wait, let me look at the layout again. In portrait mode on mobile:
- The user scrolls to see everything (flex-col, overflow)
- Order is: NavBar → Staff → Feedback → Octave → Progress → Keyboard → Controls
- Controls being at the bottom is fine for thumb reach

If I move controls to after feedback, on portrait mobile:
- NavBar → Staff → Feedback → Controls → Octave → Progress → Keyboard
- Controls are now above the keyboard, which is fine
- The keyboard is now at the very bottom

I think this is fine. Let me go with it.

Actually, let me go with an even cleaner approach. I'll restructure the `<main>` content minimally:

```jsx
<main className="...">
  <div className="game-layout w-full flex-1 min-h-0 flex flex-col">
    
    <div className="game-layout-staff flex flex-col min-h-0">
      {/* Staff */}
      <div className="perspective-stage ...">...</div>
      
      {/* Feedback */}
      <div className="staff-feedback ...">...</div>
      
      {/* Controls (will show in landscape, also visible in portrait) */}
      <div className="staff-controls ...">...</div>
    </div>
    
    <div className="game-layout-keyboard flex flex-col min-h-0">
      {/* Octave Bar */}
      {octaveBarVisible && ...}
      
      {/* Keyboard */}
      <div className="... keyboard-wrapper">
        <div className="keyboard-label">Selecciona la tecla correcta</div>
        <div className="flex-1 min-h-0">
          <PianoKeyboard ... />
        </div>
      </div>
    </div>
    
    {/* Progress bar */}
    <div className="game-layout-progress ...">...</div>
    
    {/* MIDI indicator (standalone, hidden in landscape) */}
    <div className="game-layout-midi-indicator ...">...</div>
  </div>
</main>
```

Hmm, this is getting complex. Let me simplify for the plan. 

**Final approach:** Add the wrapper divs in JSX, keep all content in the same relative order. Use CSS to handle the landscape transformation. The key insight: `flex-col` with `order` CSS property for the desktop case, and `flex-row` with its own order for landscape.

Actually no, let me just do the simplest thing that works. Write the plan and let the implementer figure out the details. I'll provide the exact code to write.

Here's my final structure:

```
<main className="h-screen w-full max-w-[1200px] mx-auto px-6 pt-20 pb-4 flex flex-col items-center overflow-hidden">
  <h1 className="sr-only">...</h1>
  
  <div className="game-layout w-full flex-1 min-h-0 flex flex-col">
    
    <div className="game-layout-staff w-full min-h-0 flex flex-col">
      <!-- Staff area (same as current code) -->
      <div className="perspective-stage w-full max-w-3xl mb-2 shrink-0">...</div>
      
      <!-- Feedback -->
      <div className="w-full max-w-3xl px-4 h-16 overflow-hidden flex items-start justify-center shrink-0">...</div>
      
      <!-- Controls (moved here) -->
      <div className="w-full max-w-3xl flex items-center justify-center gap-6 shrink-0">
        <!-- same controls as before -->
      </div>
    </div>
    
    <div className="game-layout-keyboard w-full min-h-0 flex flex-col">
      <!-- Octave Bar -->
      {octaveBarVisible && (<div className="w-full max-w-3xl shrink-0">...</div>)}
      
      <!-- Keyboard -->
      <div className="w-full max-w-3xl bg-surface-variant/50 p-3 rounded-3xl shadow-inner border border-outline-variant/40 mt-3 flex flex-col flex-1 min-h-0">
        <div className="font-label-caps text-[10px] ...">Selecciona la tecla correcta</div>
        <PianoKeyboard ... />
      </div>
    </div>
    
    <!-- Progress bar -->
    <div className="w-full max-w-3xl mt-2 shrink-0">...</div>
    
  </div>
</main>
```

In portrait mode, the `flex-col` layout means everything stacks vertically:
1. Staff → 2. Feedback → 3. Controls → 4. Octave Bar → 5. Keyboard → 6. Progress

In landscape mode, `flex-row` splits into left/right:
- Left (50%): Staff + Feedback + Controls
- Right (50%): Octave Bar + Keyboard
- Progress bar: fixed at bottom

This changes the portrait order slightly (controls move up, progress moves down below keyboard). But I think the user will accept this since it's a minor visual change in portrait and makes the landscape layout work.

OK let me write the actual plan now. I'll keep it focused on the exact changes.<｜end▁of▁thinking｜>

<｜｜DSML｜｜tool_calls>
<｜｜DSML｜｜invoke name="Write">
<｜｜DSML｜｜parameter name="content" string="true"># Mobile Landscape Game Optimization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the practice screen for mobile landscape — side-by-side layout (staff left, keyboard right), collapsed navbar, controls in staff panel.

**Architecture:** CSS-driven via the existing `@media (orientation: landscape) and (max-height: 600px)`. Add wrapper divs `.game-layout` / `.game-layout-staff` / `.game-layout-keyboard` in App.tsx. Collapse navbar via CSS class. Adjust keyboard sizing via CSS.

**Tech Stack:** React 18, TypeScript, Tailwind CSS

## Global Constraints

- Only phone landscape (viewport ≤600px height) — desktop, portrait mobile, iPad unchanged
- CSS media query + classes only — no JS breakpoint detection for layout
- No component re-renders on orientation change

---

### Task 1: CSS — Landscape media queries

**Files:**
- Modify: `src/index.css` (lines ~504-517)

- [ ] **Step 1: Replace the existing landscape CSS block**

Replace lines 504-517:

**Old:**
```css
/* ─── Landscape / Game Layout ─── */
.game-layout { touch-action: manipulation; overflow-x: hidden; }
@media (orientation: landscape) and (max-height: 600px) {
  .game-layout { flex-direction: row; align-items: flex-start; ... }
  .game-layout-staff { width: 55%; }
  .game-layout-keyboard { width: 45%; position: sticky; top: 0; }
  .game-layout-keyboard > div { margin-bottom: 0; }
  #game-content > div:first-child { margin-bottom: 0 !important; }
  ...
}
@media (min-width: 1024px) {
  .game-layout-staff svg { max-height: 160px; }
}
```

**New:**
```css
/* ─── Landscape / Game Layout ─── */
.game-layout { touch-action: manipulation; overflow-x: hidden; }

@media (orientation: landscape) and (max-height: 600px) {
  /* NavBar collapse */
  .game-layout-nav-hidden { display: none !important; }

  /* Main content: side-by-side */
  .game-layout { flex-direction: row !important; align-items: stretch; gap: 0; max-width: 100%; }
  .game-layout-staff { width: 50%; display: flex; flex-direction: column; justify-content: center; overflow: hidden; position: relative; }
  .game-layout-keyboard { width: 50%; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
  .game-layout-staff > *, .game-layout-keyboard > * { min-height: 0; }

  /* Staff panel — strip 3D tilt, shrink padding */
  .game-layout-staff .perspective-stage { transform: none; margin-bottom: 0; max-width: 100%; }
  .game-layout-staff .tilted-stand { transform: none; padding: 0.35rem; border-width: 2px; }
  .game-layout-staff .clay-surface { min-height: 40px; padding: 0.15rem; border-radius: 0.5rem; }
  .game-layout-staff .clay-surface svg { max-height: 100px; }
  .game-layout-staff .wood-texture { background-image: none; background-color: transparent; box-shadow: none; }
  .game-layout-staff .absolute.bottom-0 { display: none; }

  /* Feedback compact */
  .game-layout-staff .staff-feedback { height: auto; padding: 0; flex-shrink: 0; }

  /* Controls at bottom of staff panel */
  .game-layout-staff .staff-controls { gap: 0.25rem; flex-wrap: nowrap; }
  .game-layout-staff .staff-controls .material-symbols-outlined { font-size: 18px !important; }

  /* Keyboard panel */
  .keyboard-label { display: none !important; }
  .game-layout-keyboard .game-layout-key-full { flex: 1; display: flex; flex-direction: column; min-height: 0; border: none; box-shadow: none; padding: 0.15rem; margin-top: 0; }
  .game-layout-keyboard .game-layout-key-full > :last-child { flex: 1; display: flex; flex-direction: column; min-height: 0; }
  .game-layout-keyboard .game-layout-key-full > :last-child > :first-child { flex: 1; height: auto !important; min-height: 0; }
  .game-layout-keyboard .piano-key-white { height: 100% !important; min-height: 0; }
  .game-layout-keyboard .piano-key-black { max-height: 75% !important; }
  .game-layout-keyboard .border { flex: 1; display: flex; flex-direction: column; min-height: 0; }

  /* Progress bar → thin fixed bottom bar */
  .game-layout-progress { position: fixed; bottom: 0; left: 0; right: 0; z-index: 40; margin: 0; max-width: 100%; }
  .game-layout-progress > div:first-child { display: none !important; }
  .game-layout-progress .clay-progress-bar { height: 4px; border-radius: 0; }

  /* Hide MIDI indicator in controls row */
  .game-layout-midi-indicator { display: none !important; }
}

@media (min-width: 1024px) {
  .game-layout-staff svg { max-height: 160px; }
}
```

- [ ] **Step 2: Verify**

```bash
cd D:/www/piano && npx tsc --noEmit
```
Expected: No errors (CSS only).

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add landscape CSS layout classes

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: PracticeNavBar — Collapse classes

**Files:**
- Modify: `src/components/PracticeNavBar.tsx`

- [ ] **Step 1: Hide stats bar in landscape**

Find the stats bar:
```tsx
<div className="hidden md:flex items-center gap-5">
```
Add `game-layout-nav-hidden`:
```tsx
<div className="hidden md:flex items-center gap-5 game-layout-nav-hidden">
```

- [ ] **Step 2: Hide MIDI chip in landscape**

Find the MIDI chip container (currently a `<div className="relative">` or `<button>`) and ensure it's wrapped so the class can be added. The simplest way: wrap the entire MIDI chip block in a `<div className="game-layout-nav-hidden">`:

```tsx
      <div className="flex items-center gap-2">
        <div className="game-layout-nav-hidden">
          {midiConnected !== undefined && (
            <div className="relative">
              {/* ...existing MIDI button + dropdown... */}
            </div>
          )}
        </div>
```

- [ ] **Step 3: Hide NavUserMenu in landscape**

Wrap NavUserMenu:
```tsx
        <div className="game-layout-nav-hidden">
          <NavUserMenu ... />
        </div>
```

- [ ] **Step 4: Verify and commit**

```bash
cd D:/www/piano && npx tsc --noEmit
git add src/components/PracticeNavBar.tsx
git commit -m "feat: collapse navbar elements in landscape via CSS classes

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: PianoKeyboard — Full height class

**Files:**
- Modify: `src/components/PianoKeyboard.tsx`

- [ ] **Step 1: Add `game-layout-key-full` class**

Find the outer container (around line 127):
```tsx
<div className="border border-[var(--gold-dim)]/50 rounded-lg shadow-inner shadow-[var(--ebony)]/10">
```

Change to:
```tsx
<div className="border border-[var(--gold-dim)]/50 rounded-lg shadow-inner shadow-[var(--ebony)]/10 game-layout-key-full">
```

- [ ] **Step 2: Verify and commit**

```bash
cd D:/www/piano && npx tsc --noEmit
git add src/components/PianoKeyboard.tsx
git commit -m "feat: add game-layout-key-full class for landscape keyboard

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: App.tsx — Side-by-side layout structure

**Files:**
- Modify: `src/App.tsx` (practice screen return block, lines ~592-750)

**This is the main structural change.** The practice screen `<main>` content needs wrapper divs for the CSS layout.

**Before** (simplified):
```jsx
<main className="h-screen w-full max-w-[1200px] mx-auto px-6 pt-20 pb-4 flex flex-col items-center overflow-hidden">
  <h1 className="sr-only">Practicar: {selectedLesson}</h1>

  {/* Conductor's Stand */}
  <div className="perspective-stage w-full max-w-3xl mb-2 shrink-0">...</div>

  {/* Feedback */}
  <div className="w-full max-w-3xl px-4 h-16 overflow-hidden flex items-start justify-center shrink-0">
    <Feedback ... />
  </div>

  {/* Octave Bar (optional) */}
  {octaveBarVisible && <div className="w-full max-w-3xl shrink-0">...</div>}

  {/* Progress bar */}
  <div className="w-full max-w-3xl mt-2 shrink-0">...</div>

  {/* Virtual Keyboard */}
  <div className="w-full max-w-3xl bg-surface-variant/50 p-3 rounded-3xl shadow-inner border border-outline-variant/40 mt-3">
    <div className="font-label-caps text-[10px] ...">Selecciona la tecla correcta</div>
    <PianoKeyboard ... />
  </div>

  {/* Lesson Controls */}
  <div className="w-full max-w-3xl flex items-center justify-center gap-6 mt-2 shrink-0">
    <MIDI indicator />  <ControlButton mute />  <ControlButton restart />
    <ControlButton note />  <ControlButton octave />  <Timer />
  </div>
</main>
```

**After:**
```jsx
<main className="h-screen w-full max-w-[1200px] mx-auto px-6 pt-20 pb-4 flex flex-col items-center overflow-hidden">
  <h1 className="sr-only">Practicar: {selectedLesson}</h1>

  <div className="game-layout w-full flex-1 min-h-0 flex flex-col">

    {/* ── LEFT PANEL: Staff + Feedback + Controls ── */}
    <div className="game-layout-staff w-full min-h-0 flex flex-col">

      {/* Conductor's Stand (unchanged content) */}
      <div className="perspective-stage w-full max-w-3xl mb-2 shrink-0">
        <div className="tilted-stand wood-texture rounded-t-3xl rounded-b-xl p-4 md:p-6 border-t-8 border-r-4 border-l-4 border-b-8 border-mahogany-dark/80 relative">
          <div className={...} style={...} />
          <div className={`clay-surface rounded-xl p-3 sm:p-4 relative mx-auto w-full max-w-xl flex flex-col items-center justify-center min-h-[140px] transition-colors duration-300 ${staffClass}`}>
            <div className="w-full">
              <Staff ... />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-4 bg-mahogany-dark/90 rounded-b-xl border-t border-brass-highlight/20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]" />
        </div>
      </div>

      {/* Feedback — with class for landscape compact */}
      <div className="staff-feedback w-full max-w-3xl px-4 h-16 overflow-hidden flex items-start justify-center shrink-0">
        <Feedback ... />
      </div>

      {/* Lesson Controls — moved here from bottom */}
      <div className="staff-controls w-full max-w-3xl flex items-center justify-center gap-6 shrink-0">
        {/* MIDI indicator with landscape-hide class */}
        <div className="game-layout-midi-indicator">
          {(() => {
            const ctrlRange = config?.controllerRange ?? state.controllerRange
            return (
              <div className="flex items-center gap-2 clay-inner-panel px-3 py-2 rounded-full" ...>
                <span className={`w-2.5 h-2.5 rounded-full ${midiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                <span className="material-symbols-outlined text-sm text-primary">piano</span>
                <span className="font-label-caps text-[9px] uppercase tracking-widest text-primary">
                  {midiConnected
                    ? ctrlRange
                      ? `${midiToNote(ctrlRange.min).name}${midiToNote(ctrlRange.min).octave}–${midiToNote(ctrlRange.max).name}${midiToNote(ctrlRange.max).octave}`
                      : 'MIDI'
                    : 'Sin MIDI'}
                </span>
              </div>
            )
          })()}
        </div>
        <ControlButton icon={state.isMuted ? 'volume_off' : 'volume_up'} label={state.isMuted ? 'Sonido' : 'Silenciar'} onClick={() => setMuted(!state.isMuted)} active={state.isMuted} />
        <ControlButton icon="history" label="Reiniciar" onClick={() => restartGame()} />
        <ControlButton icon="text_fields" label={state.showNoteName ? 'Ocultar nota' : 'Mostrar nota'} onClick={() => setShowNoteName(!state.showNoteName)} active={state.showNoteName} />
        <ControlButton icon="graphic_eq" label={octaveBarVisible ? 'Ocultar octava' : 'Octava'} onClick={() => setOctaveBarVisible(!octaveBarVisible)} active={octaveBarVisible} />
        {state.isTimed && (
          <div className="flex items-center gap-2 clay-inner-panel px-3 py-2 rounded-full">
            <span className="material-symbols-outlined text-sm text-primary">timer</span>
            <span className="font-title-sm text-primary">{timerDisplay}s</span>
          </div>
        )}
      </div>

    </div>

    {/* ── RIGHT PANEL: Octave Bar + Keyboard ── */}
    <div className="game-layout-keyboard w-full min-h-0 flex flex-col">

      {/* Octave Bar (unchanged) */}
      {octaveBarVisible && (
        <div className="w-full max-w-3xl shrink-0">
          <OctaveBar shift={octaveShift} onShiftChange={setOctaveShift} baseStart={baseKeyboardStart} />
        </div>
      )}

      {/* Virtual Keyboard — with keyboard-label for landscape hide */}
      <div className="w-full max-w-3xl bg-surface-variant/50 p-3 rounded-3xl shadow-inner border border-outline-variant/40 mt-3 flex flex-col flex-1 min-h-0">
        <div className="keyboard-label font-label-caps text-[10px] text-center text-outline uppercase tracking-widest font-bold mb-2">Selecciona la tecla correcta</div>
        <PianoKeyboard onPlayNote={handleKeyboardPlay} highlightKey={highlightKey} correctKey={correctKey} wrongKey={wrongKey} startMidi={keyboardStart} />
      </div>

    </div>

    {/* ── PROGRESS BAR — with class for landscape fixed-bottom ── */}
    <div className="game-layout-progress w-full max-w-3xl mt-2 shrink-0">
      <div className="flex justify-between items-center mb-1 px-2">
        <span className="font-label-caps text-[10px] uppercase tracking-widest text-outline font-bold">Progreso</span>
        <span className="font-label-caps text-[10px] text-outline">{state.totalAttempts}/{state.sessionTarget}</span>
      </div>
      <div
        className="h-2 rounded-full clay-progress-bar overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round((state.totalAttempts / state.sessionTarget) * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progreso: ${state.totalAttempts} de ${state.sessionTarget} notas`}
      >
        <div className="h-full rounded-full transition-all duration-500 ease-out clay-progress-fill" style={{ width: `${Math.min((state.totalAttempts / state.sessionTarget) * 100, 100)}%` }} />
      </div>
    </div>

  </div>
</main>
```

- [ ] **Step 1: Restructure the `<main>` content**

Open `src/App.tsx`, locate the practice screen return block (starts around line 592). Replace the `<main>` children with the new structure above.

Key changes:
1. Add `<div className="game-layout ...">` wrapping all content inside `<main>` (after the `<h1>`)
2. Split into `.game-layout-staff` and `.game-layout-keyboard` panels
3. Move lesson controls into `.game-layout-staff`
4. Remove the original bottom controls (now in staff panel)
5. Add `.staff-controls` class to the controls row
6. Add `.staff-feedback` class to feedback div
7. Add `.keyboard-label` class to "Selecciona la tecla correcta" label
8. Add `.game-layout-progress` class to progress bar div
9. Add `.game-layout-midi-indicator` class to MIDI indicator wrapper in controls

- [ ] **Step 2: Verify**

```bash
cd D:/www/piano && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: restructure practice screen for side-by-side landscape layout

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Build, verify, deploy

- [ ] **Step 1: Full build**

```bash
cd D:/www/piano && npx tsc --noEmit && npm run build
```
Expected: Build successful.

- [ ] **Step 2: Deploy to Vercel**

```bash
npx vercel --yes --prod
```

- [ ] **Step 3: Push to git**

```bash
git push origin main
```
