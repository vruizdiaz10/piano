# Lectura Musical al Piano

> A sight-reading training game for piano. A musical note appears on a treble clef staff, and the player presses the correct key -- either on a connected MIDI keyboard or the on-screen piano.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Screenshot](screenshot.png)
<!-- Replace screenshot.png with a screenshot of the game in action. Consider including the staff, on-screen keyboard, and toolbar for an at-a-glance preview. -->

---

## Features

- **MIDI keyboard input** -- Plug in any USB/MIDI keyboard via the Web MIDI API. The game detects connected devices automatically and shows connection status.
- **On-screen piano fallback** -- A 37-key interactive piano (MIDI range 48-84) renders on screen for touch, mouse, or keyboard input. No MIDI device required.
- **SVG staff rendering** -- The treble clef, notehead, stem, ledger lines, and accidentals are drawn in SVG. Note position follows standard music notation conventions.
- **9 progressive lessons** -- From single lines to full chromatic range (C4-C6). Each lesson targets a specific note region or concept. See the [Lessons table](#lessons).
- **Sound synthesis** -- Built with the Web Audio API. Each note plays with layered harmonics (triangle + sine oscillators). Correct answers trigger a major chord arpeggio, wrong answers a minor chord, and level completion a fanfare.
- **Recovery window** -- After a wrong answer, the game enters a 2.5-second recovery window with a visual countdown timer. Answering correctly within the window grants partial credit.
- **Streak system** -- Consecutive correct answers build a streak. A "búho" (owl) badge appears at 3+ streak, intensifying visually at 5, 8, and 10 streaks. Streak milestones play a celebratory ascending scale.
- **Note trail ghosts** -- The last three answered notes drift upward on the staff as translucent ghost noteheads.
- **Progress bar with duckling swimmer** -- A duckling emoji slides along a gradient progress bar showing the current note count toward the 10-note session target.
- **Level complete overlay** -- After 10 correct answers, a modal shows accuracy percentage, best streak, total notes, elapsed time, star rating (1-3), and an SVG constellation drawing lines between answered note MIDI values.
- **Confetti burst** -- Brief confetti particle effect on correct answers.
- **Dark mode / Light mode** -- Theme toggle with a sun/moon icon. Transitioning triggers a "twilight theater" animation -- a large glowing sun or moon fades in and out. Respects `prefers-color-scheme` on initial load.
- **Mute / Sleep theater** -- Muting audio dims the UI, shows floating "Zzz" indicators, and triggers a subtle sway animation on the treble clef. The staff dims to 70% opacity.
- **Accessibility** -- ARIA live regions announce correct/incorrect and streak milestones. Keyboard-navigable on-screen piano. Staff SVG has descriptive `aria-label`. Respects `prefers-reduced-motion`.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [React 18](https://react.dev) | UI framework |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Vite](https://vitejs.dev) | Build tool and dev server |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | Radix-based Select and Checkbox primitives |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Sound synthesis and playback |
| [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API) | MIDI keyboard input |
| SVG | Staff and notation rendering |

---

## Project Structure

```
piano-sight-reading/
├── index.html                  # Entry HTML
├── vite.config.ts              # Vite config with @/ alias
├── tailwind.config.js          # Tailwind theme (fonts, colors, animations)
├── postcss.config.js           # PostCSS + Tailwind pipeline
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Root component: game orchestration, state wiring, effects
│   ├── index.css               # Tailwind directives, CSS variables (light/dark), keyframes
│   ├── types/
│   │   └── index.ts            # Note, GameState, GamePhase type definitions
│   ├── data/
│   │   └── lessons.ts          # Lesson definitions (9 lessons, MIDI note pools)
│   ├── hooks/
│   │   ├── useGameState.ts     # Game state reducer (phase, scoring, recovery, streak)
│   │   ├── useSound.ts         # Web Audio oscillator synthesis (notes, effects, fanfare)
│   │   └── useMidi.ts          # Web MIDI API connection and event handling
│   ├── utils/
│   │   ├── midiToNote.ts       # MIDI number to Note object conversion
│   │   └── noteToPosition.ts   # Note to SVG y-position mapping (treble clef)
│   ├── lib/
│   │   └── utils.ts            # cn() utility (clsx + tailwind-merge)
│   └── components/
│       ├── Staff.tsx           # SVG treble clef staff, notehead, ledger lines, accidentals, trail ghosts
│       ├── PianoKeyboard.tsx   # 37-key interactive on-screen piano
│       ├── Feedback.tsx        # Correct/incorrect banner with recovery timer
│       ├── LevelComplete.tsx   # Score modal with constellation visualization
│       ├── Toolbar.tsx         # Lesson selector dropdown and "show note name" checkbox
│       ├── ProgressBar.tsx     # Session progress bar with duckling indicator
│       ├── ScoreDisplay.tsx    # Accuracy percentage with color-coded bar
│       ├── StreakBadge.tsx     # Streak count badge (fire emoji + multiplier)
│       ├── StreakOwl.tsx       # Owl SVG badge that appears at 3+ streak
│       ├── ThemeToggle.tsx     # Sun/moon dark mode toggle
│       ├── Confetti.tsx        # Particle burst on correct answers
│       └── ui/
│           ├── select.tsx      # shadcn/ui Select primitive (Radix)
│           └── checkbox.tsx    # shadcn/ui Checkbox primitive (Radix)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ (or yarn, or pnpm)

### Install

```bash
git clone https://github.com/yourusername/piano-sight-reading.git
cd piano-sight-reading
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`. Hot module replacement is enabled.

### Production Build

```bash
npm run build
npm run preview
```

Build output goes to `dist/`. Serve with any static file server.

---

## Usage

### Connecting a MIDI Keyboard

1. Plug in your USB MIDI keyboard.
2. Open the app in a browser that supports the Web MIDI API (Chrome, Edge, Opera).
3. The badge in the top-right corner shows **MIDI: Conectado** (green) or **MIDI: Sin conexion** (red).
4. Press any key on the MIDI keyboard during a round. The game registers the note automatically.

No MIDI device? Use the on-screen piano keyboard by clicking or tapping keys.

### How to Play

1. Click **Iniciar Juego** to start a session.
2. A note appears on the treble clef staff.
3. Identify the note and press the corresponding key on your MIDI keyboard or the on-screen piano.
4. **Correct**: The staff flashes green, "¡Correcto!" appears, and a major chord arpeggio plays. A brief confetti burst fires.
5. **Wrong**: The staff flashes red and shakes. "Incorrecto" appears along with the correct answer. A 2.5-second recovery window begins -- answer correctly within the window for partial credit.
6. After feedback, the game auto-advances to the next note (with randomized timing jitter of +/-200ms).
7. After 10 correct answers, the **Level Complete** modal appears with your score and a constellation of answered notes.
8. Choose **Reintentar** to replay the same lesson or **Siguiente Leccion** to advance.

### Lessons

Use the dropdown in the toolbar to switch lessons at any time. The range indicator dots on the far left of the staff show the lowest and highest notes in the current lesson pool.

---

## Lessons

| # | ID | Name | Notes | Description |
|---|----|------|-------|-------------|
| 1 | `lines` | Lineas | E4, G4, B4, D5, F5 | Notes on staff lines |
| 2 | `spaces` | Espacios | F4, A4, C5, E5 | Notes on staff spaces |
| 3 | `lines-spaces` | Lineas+Espacios | E4-A5 | Lines and spaces combined |
| 4 | `staff-range` | Rango del pentagrama | C4-E5 | Full staff range (C4 to E5) |
| 5 | `below-staff` | Debajo del pentagrama | C4, D4 | Below-staff ledger lines (middle C region) |
| 6 | `above-staff` | Encima del pentagrama | G5, A5, B5, C6 | Above-staff ledger lines |
| 7 | `full-naturals` | Naturales completas | C4-C6 (naturals only) | All natural notes across full range |
| 8 | `accidentals` | Sostenidos | C4-C6 (all) | Introduces sharps |
| 9 | `all-notes` | Todas las notas | C4-C6 (all) | Full chromatic range, treble clef |

---

## Game Rules

- **Session target**: 10 correct answers complete a level.
- **Scoring**: Accuracy is tracked as `correctAttempts / totalAttempts * 100`.
- **Star rating**: 3 stars for 90%+ accuracy, 2 stars for 70%+, 1 star for 50%+, 0 stars below 50%.
- **Streaks**: Consecutive correct answers increment the streak counter. A wrong answer resets it to 0. The best streak for the session is recorded.
- **Recovery**: After a wrong answer, the game stays in feedback mode for 2.5 seconds. A timer bar visually counts down. Pressing the correct key during this window marks the answer as correct (recovery success) and grants credit.
- **Skip**: The "Siguiente Nota" button lets you advance past the feedback screen at any time.
- **Auto-advance**: The game automatically moves to the next note after the feedback window. Timing includes a random jitter of +/-200ms to prevent rhythmic dependency.
- **Note selection**: Random within the lesson pool. Consecutive repeats are avoided when the pool has more than one note.

---

## Architecture

### Game State Machine

The game uses a reducer pattern via `useGameState` hook. The state machine has four phases:

```
idle -> waiting -> feedback -> levelComplete
                -> waiting (auto-advance)
```

- **idle**: Initial state. Only the "Iniciar Juego" button is shown.
- **waiting**: A note is displayed on the staff. The player must press the correct key. MIDI and on-screen keyboard input are accepted.
- **feedback**: Shows the result (correct/incorrect). If wrong, `recovering` is set to `true` for 2.5 seconds, during which the correct key can be pressed for recovery credit. Auto-advances after a timeout with jitter.
- **levelComplete**: After 10 correct answers. Displays score, stars, stats, and constellation overlay.

State is managed via `useState` with an immutable `GameState` object. All state transitions happen through named functions (`startGame`, `submitAnswer`, `nextNote`, `restartGame`).

### Component Hierarchy

```
<App>
  <Confetti />
  <LevelComplete />          (overlay, shown when phase === 'levelComplete')
  <Toolbar />                (lesson selector + show note name toggle)
  <Staff />                  (SVG treble clef, note, trail ghosts, range dots)
  <ProgressBar />            (duckling swimmer, session progress)
  <StreakBadge />            (fire streak counter)
  <StreakOwl />              (owl SVG, shown at 3+ streak)
  <ScoreDisplay />           (accuracy percentage)
  <PianoKeyboard />          (37-key interactive keyboard)
  <Feedback />               (correct/incorrect banner + recovery timer)
```

### Sound System

The `useSound` hook creates a single `AudioContext` (lazily initialized on first user interaction to comply with browser autoplay policies). Each note is synthesized with five oscillators:

- **Fundamental** (triangle wave, gain 1.0)
- **Harmonics 2-5** (sine waves, diminishing gain)

This produces a warm piano-like timbre. Sound effects use chord arpeggios:

| Effect | Notes | Description |
|--------|-------|-------------|
| Note playback | The note itself | Played when a note appears on staff |
| Correct | C5-E5-G5 | Major chord, staggered arpeggio |
| Wrong | C5-Eb5-G5 | Minor chord, staggered arpeggio |
| Streak milestone | C5-D5-E5-G5-C6 | Ascending scale fragment on streak multiples of 5 |
| Level complete | C5-E5-G5-C6 | Fanfare with fundamental + octave harmonic |

### MIDI Input

The `useMidi` hook requests `MIDIAccess` via the Web MIDI API. It iterates over all connected inputs, attaches `onmidiessage` handlers, and filters for note-on events (`0x90` status byte with velocity > 0). The `onstatechange` event re-connects inputs when devices are plugged or unplugged. The hook returns a `midiConnected` boolean for the status indicator.

---

## Theming

The app supports light and dark themes via a CSS class-based approach:

- A `.dark` class on `<html>` toggles the theme.
- CSS custom properties (HSL values) define all colors in `:root` (light) and `.dark` (dark).
- Tailwind's `dark:` variant applies theme-specific styles.
- The `Staff` component uses a `--staff-line` CSS variable for ink color (brown in light, slate in dark).
- Theme preference persists in the `GameState.theme` field and initializes from `prefers-color-scheme`.
- Transitioning between themes triggers a 1.5-second "twilight theater" animation with a large glowing sun (light) or moon (dark) that fades in and out. The background smoothly crossfades via `transition-colors duration-300`.

### CSS Variables

| Variable | Light | Dark |
|----------|-------|------|
| `--background` | Warm amber-50 (#FFF7ED) | Gray-900 (#111827) |
| `--primary` | Red-600 (#DC2626) | Red-600 (#DC2626) |
| `--staff-line` | Brown (#4B3F2B) | Slate-300 (#CBD5E1) |
| `--card` | White (#FFFFFF) | Gray-800 (#1F2937) |

---

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Open an issue to discuss proposed changes before submitting a PR.
2. Maintain the existing code style (TypeScript strict mode, functional components, hooks).
3. If adding a feature, update or add the relevant component. Ensure state transitions in `useGameState` are consistent.
4. Test MIDI input if changing the `useMidi` hook or the answer submission flow.
5. Run `npm run build` to verify TypeScript compilation and production build.

---

## License

MIT

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
