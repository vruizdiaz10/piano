# Note Dojo

> Piano sight-reading practice app. A note appears on the staff — identify it and press the correct key on a MIDI keyboard or the on-screen piano.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Features

### Gameplay
- **18 progressive lessons** — 9 treble clef + 9 bass clef, from simple line notes to the full chromatic range
- **Streak system** — consecutive correct answers build a streak; milestone sound at every 5
- **Daily streak** — consecutive practice days tracked via localStorage
- **Recovery window** — after a wrong answer, hit the correct key for partial credit before auto-advance
- **Timed mode** — countdown per note (toggle in toolbar)
- **Ghost notes** — trail of recent notes shown as translucent ghosts; last correct note shown faded after an error
- **Level complete screen** — accuracy %, best streak, average/best response time, star rating (1–3), constellation SVG, mastery check

### Input & Sound
- **MIDI input** — connect any USB/MIDI keyboard via Web MIDI API; auto-detected
- **On-screen piano** — 3D-styled interactive keyboard (ivory/ebony keys); reduced to C3–C5 on mobile
- **Web Audio synthesis** — each note played with layered oscillators (triangular + sinusoidal harmonics)
- **Sound effects** — major arpeggio on correct, minor on wrong, fanfare on level complete

### Visuals
- **Clean card-based UI** — minimal design with blue accent palette, rounded cards, subtle borders
- **SVG staff** — treble and bass clefs via Noto Music font, ghost notes, interval range dots
- **Note expressions** — green/red indicator dot on notes after answer
- **Progress chart** — mini SVG graph of session history
- **Dark/light mode** — respects `prefers-color-scheme`, toggle in toolbar
- **Mute mode** — sleep emoji indicators on staff, sound off

### Notation
- **American/Latin toggle** — C D E F G A B ↔ Do Re Mi Fa Sol La Si
- **Note names on staff** — configurable display on note heads

### PWA & Sync
- **Installable** — manifest + service worker for offline support
- **Firebase Auth** — Google sign-in for cloud sync
- **Cloud sync** — session history and settings sync to Firestore when logged in

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [React 18](https://react.dev) | UI framework |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [Radix UI](https://www.radix-ui.com) | Accessible primitives (Select, Checkbox, Dialog) |
| [shadcn/ui](https://ui.shadcn.com) | Component patterns |
| [Firebase](https://firebase.google.com) | Auth + Firestore cloud sync |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Sound synthesis |
| [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API) | MIDI keyboard input |
| [Noto Music](https://fonts.google.com/noto/specimen/Noto+Music) | Musical symbols (𝄞 𝄢) |
| [lucide-react](https://lucide.dev) | Icons |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ (or yarn/pnpm)

### Install

```bash
git clone https://github.com/vruizdiaz10/piano.git
cd piano-sight-reading
npm install
```

### Environment Variables

Create a `.env` file with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> The app works without Firebase — cloud sync and auth are optional. All core features use localStorage.

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`. Hot module replacement enabled.

### Build

```bash
npm run build
npm run preview
```

Output goes to `dist/`. Serve with any static file server.

---

## Project Structure

```
src/
├── main.tsx                  # React entry point
├── App.tsx                   # Root component: game orchestration, state, effects
├── index.css                 # Tailwind directives, CSS variables, keyframes
├── firebase/
│   ├── config.ts             # Firebase init (reads VITE_FIREBASE_* env vars)
│   └── firestore.ts          # Firestore read/write helpers
├── hooks/
│   ├── useGameState.ts       # Game state reducer (phase, score, streak, notation, timer)
│   ├── useMidi.ts            # Web MIDI API connection & event handling
│   ├── useSound.ts           # Web Audio oscillator synthesis & effects
│   ├── useDailyStreak.ts     # Persistent daily streak (localStorage)
│   ├── useAuthProvider.tsx   # Firebase Auth provider
│   ├── useAuth.ts            # Auth context hook
│   ├── useSessionSync.ts     # Cloud session sync
│   └── useConfigSync.ts      # Cloud config sync
├── types/
│   └── index.ts              # Note, GameState, GamePhase, Notation types
├── data/
│   └── lessons.ts            # 18 lesson definitions (9 treble + 9 bass) with MIDI note pools
├── utils/
│   ├── midiToNote.ts         # MIDI number → Note object
│   ├── noteToPosition.ts     # Note → Y position on SVG staff
│   ├── notation.ts           # American ↔ Latin note name mapping
│   ├── errorAnalysis.ts      # Error analysis & tips
│   ├── sessionHistory.ts     # Session history (localStorage)
│   └── weakPool.ts           # Weak note pool for focused practice
├── lib/
│   └── utils.ts              # cn() utility (clsx + tailwind-merge)
└── components/
    ├── Staff.tsx             # SVG staff with clefs, notes, ghosts, intervals
    ├── PianoKeyboard.tsx     # Interactive 3D piano keyboard
    ├── Feedback.tsx          # Correct/wrong banner + toast
    ├── LevelComplete.tsx     # Score modal + constellation + stats
    ├── Toolbar.tsx           # Lesson selector, note name toggle, timer toggle
    ├── ProgressBar.tsx       # Progress bar with current/total display
    ├── StreakBadge.tsx       # Fire streak counter
    ├── ScoreDisplay.tsx      # Accuracy + timer display
    ├── ProgressChart.tsx     # Mini SVG historical progress graph
    ├── ThemeToggle.tsx       # Dark/light mode switch
    ├── UserMenu.tsx          # User menu (signed-in state)
    ├── Toast.tsx             # Toast notification component
    └── ui/                   # Radix-based primitives (select, checkbox)
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Restart current game |
| `P` | Pause / unpause |
| `Space` | Skip to next note (during feedback) |

Shortcuts are disabled when focus is on an input or select element.

---

## How to Play

1. Click **Start Game** (or choose a session length: 5, 10, or 20 notes).
2. A note appears on the staff and plays audibly.
3. Press the matching key on your MIDI keyboard or click the on-screen piano.
4. **Correct**: staff flashes green, major arpeggio plays.
5. **Incorrect**: staff flashes red, shows the correct answer + tip, 2.5s recovery window starts.
6. After completing the session target (5, 10, or 20 notes), the **Level Complete** modal shows your stats.
7. Choose **Retry** (same lesson) or **Next Lesson** to advance (next lesson requires meeting mastery criteria: accuracy, streak, and minimum notes).

---

## Lessons

### Treble Clef (Sol)

| # | Name | Notes | Description |
|---|------|-------|-------------|
| 1 | Líneas (Sol) | E4, G4, B4, D5, F5 | Notes on staff lines |
| 2 | Espacios (Sol) | F4, A4, C5, E5 | Notes in staff spaces |
| 3 | Líneas+Espacios (Sol) | E4–A5 | Combined lines and spaces |
| 4 | Rango pentagrama (Sol) | C4–E5 | Full staff range |
| 5 | Debajo pentagrama (Sol) | C4, D4 | Ledger lines below |
| 6 | Encima pentagrama (Sol) | G5, A5, B5, C6 | Ledger lines above |
| 7 | Naturales (Sol) | C4–C6 (naturals) | All natural notes in full range |
| 8 | Sostenidos (Sol) | C4–C6 (all) | Introduces sharps |
| 9 | Todas las notas (Sol) | C4–C6 (all) | Full chromatic range, treble clef |

### Bass Clef (Fa)

| # | Name | Notes | Description |
|---|------|-------|-------------|
| 10 | Líneas (Fa) | G2, B2, D3, F3, A3 | Notes on bass staff lines |
| 11 | Espacios (Fa) | A2, C3, E3, G3 | Notes in bass staff spaces |
| 12 | Líneas+Espacios (Fa) | G2–B3 | Combined lines and spaces |
| 13 | Rango pentagrama (Fa) | G2–D4 | Full bass staff range |
| 14 | Debajo pentagrama (Fa) | C2–F2 | Ledger lines below |
| 15 | Encima pentagrama (Fa) | C4–E4 | Ledger lines above |
| 16 | Naturales (Fa) | C2–D4 (naturals) | All natural notes in full range |
| 17 | Sostenidos (Fa) | C2–E4 (all) | Introduces sharps |
| 18 | Todas las notas (Fa) | C2–E4 (all) | Full chromatic range, bass clef |

---

## Contributing

1. Open an issue to discuss proposed changes before sending a PR.
2. Keep existing style (strict TypeScript, functional components, hooks).
3. If adding a feature, update or add the relevant component. Ensure state transitions in `useGameState` stay consistent.
4. Test MIDI input if modifying `useMidi` or the answer submission flow.
5. Run `npm run build` to verify TypeScript and production build.

---

## License

MIT © 2026
