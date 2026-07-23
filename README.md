# Clavis

> Piano sight-reading practice app. A note appears on the staff -- identify it and press the correct key on a MIDI keyboard or the on-screen piano.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Features

### Screens & Navigation
- **Inicio** -- Welcome screen with Google sign-in and guest entry
- **Dashboard** -- Main hub with quick lesson generator, progressive roadmap, weekly stats, and rotating Sensei quotes
- **Biblioteca** -- Lesson library showing all 18 lessons with mastery status and session history
- **Perfil** -- Profile with settings, stats, account management, and MIDI controller calibration
- **Practica** -- Practice screen with staff, keyboard, progress bar, and controls
- **Resultados** -- Session results with score, accuracy, streak, and next-lesson options

### Gameplay
- **18 progressive lessons** -- 9 treble clef + 9 bass clef, from simple line notes to the full chromatic range
- **Quick Lesson Generator** -- Custom practice sessions: choose clef, lines/spaces, ledger lines, sharps, timed mode, and note count (5/10/20). Config saves to Firestore and restores on login
- **Streak system** -- consecutive correct answers build a streak; milestone sound at every 5
- **Daily streak** -- consecutive practice days tracked via Firestore (guest) or cloud sync
- **Recovery window** -- after a wrong answer, hit the correct key for partial credit before auto-advance
- **Timed mode** -- countdown per note (5s or 8s depending on session length)
- **Ghost notes** -- trail of recent notes shown as translucent ghosts; last correct note shown faded after an error
- **Roadmap** -- Progressive lesson roadmap with locked/current/done states per clef, driven by mastery criteria
- **Sensei quotes** -- Rotating wisdom quotes from curated composers and musicians (Beethoven, Mozart, Bach, Chopin, etc.), synced via Firestore

### Input & Sound
- **MIDI input** -- connect any USB/MIDI keyboard via Web MIDI API; auto-detected
- **MIDI Calibration Modal** -- Hold-to-calibrate FSM (5 states: waiting-low, holding-low, waiting-high, holding-high, complete). Auto-triggers on first MIDI connect when no range is saved. User holds lowest note 2s, then highest note 2s. Range saved to Firestore
- **On-screen piano** -- 3D-styled interactive keyboard (ivory/ebony keys); reduced to C3--C5 on mobile
- **Octave bar** -- Toggleable manual octave shift for keyboards with limited range
- **Web Audio synthesis** -- each note played with layered oscillators (triangular + sinusoidal harmonics)
- **Sound effects** -- major arpeggio on correct, minor on wrong, fanfare on level complete

### Visuals
- **Claymorphism design system** -- warm clay-toned UI with neumorphic cards, buttons, progress bars, and icon bubbles (`clay-card`, `clay-btn-primary`, `clay-icon-raised`, `clay-progress-bar`, etc.)
- **Material Symbols Outlined** -- Google Material Symbols for all icons
- **Spanish UI** -- all interface text in Spanish (Lecciones, Practicar, Perfil, Biblioteca, etc.)
- **SVG staff** -- treble and bass clefs via Noto Music font, ghost notes, interval range dots, conductor's stand with wood texture
- **Note expressions** -- green/red indicator dot on notes after answer
- **Progress chart** -- weekly accuracy sparkline (Mon--Sun) on dashboard
- **Dark/light mode** -- respects `prefers-color-scheme`, toggle in toolbar
- **Mute mode** -- sleep emoji indicators on staff, sound off

### Notation
- **American/Latin toggle** -- C D E F G A B <-> Do Re Mi Fa Sol La Si
- **Note names on staff** -- configurable display on note heads

### PWA & Sync
- **Installable** -- manifest.json + service worker for offline support (PWA name: "Clavis")
- **Firebase Auth** -- Google sign-in for cloud sync
- **Cloud sync** -- session history and settings sync to Firestore when logged in
- **Quote history** -- daily quote indices synced to Firestore to avoid repeats across devices
- **localStorage fallback** -- all core features work without Firebase

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [React 18](https://react.dev) | UI framework |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [Radix UI](https://www.radix-ui.com) | Accessible primitives (Select, Checkbox, Dialog, Dropdown) |
| [shadcn/ui](https://ui.shadcn.com) | Component patterns |
| [Firebase](https://firebase.google.com) | Auth + Firestore cloud sync |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Sound synthesis |
| [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API) | MIDI keyboard input |
| [Noto Music](https://fonts.google.com/noto/specimen/Noto+Music) | Musical symbols |
| [Material Symbols](https://fonts.google.com/icons) | UI icons |
| [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk) | Body font |
| [EB Garamond](https://fonts.google.com/specimen/EB+Garamond) | Headline font |
| [Ponytail](https://www.npmjs.com/package/@dietrichgebert/ponytail) | Additional font |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ (or yarn/pnpm)

### Install

```bash
git clone https://github.com/vruizdiaz10/piano.git
cd piano
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

> The app works without Firebase -- cloud sync and auth are optional. All core features use localStorage.

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
├── App.tsx                   # Root component: screen routing, game orchestration, state
├── index.css                 # Tailwind directives, claymorphism CSS, keyframes, wood texture
├── firebase/
│   ├── config.ts             # Firebase init (reads VITE_FIREBASE_* env vars)
│   ├── auth.ts               # Google sign-in helper
│   └── firestore.ts          # Firestore read/write helpers, UserDoc type, quote history
├── hooks/
│   ├── useGameState.ts       # Game state reducer (phase, score, streak, notation, timer, controllerRange)
│   ├── useMidi.ts            # Web MIDI API connection & event handling (dual callback: onNoteOn + optional onNoteOff)
│   ├── useSound.ts           # Web Audio oscillator synthesis & effects
│   ├── useDailyStreak.ts     # Persistent daily streak (localStorage)
│   ├── useAuthProvider.tsx   # Firebase Auth provider
│   ├── useAuth.ts            # Auth context hook
│   ├── useSessionSync.ts     # Cloud session sync with retry + merge
│   ├── useConfigSync.ts      # Cloud config sync (debounced write, notation/timed/quickLessonConfig/controllerRange)
│   └── useQuoteHistory.ts    # Daily quote rotation with Firestore sync
├── types/
│   └── index.ts              # Note, GameState, QuickLessonConfig, ErrorType, MasteryCriteria types
├── data/
│   ├── lessons.ts            # 18 lesson definitions (9 treble + 9 bass) with MIDI note pools
│   └── senseiQuotes.ts       # Curated wisdom quotes from composers and musicians
├── screens/
│   ├── InicioScreen.tsx      # Welcome/sign-in screen
│   ├── DashboardScreen.tsx   # Main hub: quick lesson generator, roadmap, stats, sensei quote
│   ├── BibliotecaScreen.tsx  # Lesson library with mastery status and session history
│   ├── PerfilScreen.tsx      # Profile: settings, stats, calibration, account management
│   └── ResultadosScreen.tsx  # Session results: score, accuracy, streak, next lesson
├── utils/
│   ├── midiToNote.ts         # MIDI number -> Note object
│   ├── noteToPosition.ts     # Note -> Y position on SVG staff (treble + bass maps)
│   ├── notation.ts           # American <-> Latin note name mapping
│   ├── errorAnalysis.ts      # Error classification (line-space, step, skip, octave, accidental, ledger-line, random) + tips
│   ├── sessionHistory.ts     # Session history (localStorage)
│   ├── notePool.ts           # Custom pool builder for quick lessons (lines/spaces/ledger/sharps filters)
│   ├── dashboardStats.ts     # Session aggregation, roadmap builder, weekly stats, rank system
│   └── weakPool.ts           # Weak note pool for focused practice
├── lib/
│   └── utils.ts              # cn() utility (clsx + tailwind-merge)
└── components/
    ├── Staff.tsx             # SVG staff with clefs, notes, ghosts, trail, note expressions
    ├── PianoKeyboard.tsx     # Interactive 3D piano keyboard
    ├── Feedback.tsx          # Correct/wrong banner + error tips
    ├── CalibrationModal.tsx  # MIDI controller calibration (5-state FSM, hold-to-calibrate)
    ├── OctaveBar.tsx         # Toggleable manual octave shift control
    ├── TopNavBar.tsx         # Dashboard/Biblioteca top navigation bar
    ├── PracticeNavBar.tsx    # Practice screen top bar (back, profile, streak, accuracy)
    ├── NavUserMenu.tsx       # User avatar dropdown menu
    ├── Toolbar.tsx           # Lesson selector, note name toggle, timer toggle
    ├── ProgressBar.tsx       # Progress bar with current/total display
    ├── StreakBadge.tsx       # Fire streak counter
    ├── ScoreDisplay.tsx      # Accuracy + timer display
    ├── ProgressChart.tsx     # Mini SVG weekly accuracy graph
    ├── LevelComplete.tsx     # Legacy score modal (replaced by ResultadosScreen)
    ├── Toast.tsx             # Toast notification component
    └── ui/                   # Radix-based primitives (select, checkbox, dialog, dropdown)
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Restart current game |
| `P` | Pause / unpause |
| `Space` | Skip to next note (during feedback) |
| `Escape` | Dismiss pause overlay / calibration modal |

Shortcuts are disabled when focus is on an input or select element.

---

## How to Play

1. Open the app and sign in with Google, or tap **Entrar como invitado** (guest mode).
2. From the **Dashboard**, choose a sequential lesson from the **Roadmap**, or tap **Leccion rapida** to configure a custom practice session (clef, lines/spaces, ledger lines, sharps, timed mode, note count).
3. A note appears on the staff and plays audibly.
4. Press the matching key on your MIDI keyboard or click the on-screen piano.
5. **Correct**: staff flashes green, major arpeggio plays.
6. **Incorrect**: staff flashes red, shows the correct answer + contextual error tip, 2.5s recovery window starts.
7. After completing the session target, the **Resultados** screen shows your score, accuracy, best streak, and star rating.
8. Choose **Reintentar** (same lesson), **Siguiente** (advance if mastery criteria met), or **Dashboard** to return.

### MIDI Calibration

On first MIDI connect (when no controller range is saved), the **Calibration Modal** opens automatically:
1. Hold your lowest note for 2 seconds.
2. Hold your highest note for 2 seconds.
3. Range is saved to Firestore. Notes outside the calibrated range are accepted by pitch class.

You can also re-calibrate from **Perfil > Calibrar controlador**.

---

## Lessons

### Treble Clef (Sol)

| # | Name | Notes | Description |
|---|------|-------|-------------|
| 1 | Lineas (Sol) | E4, G4, B4, D5, F5 | Notes on staff lines |
| 2 | Espacios (Sol) | F4, A4, C5, E5 | Notes in staff spaces |
| 3 | Lineas+Espacios (Sol) | E4--A5 | Combined lines and spaces |
| 4 | Rango pentagrama (Sol) | C4--E5 | Full staff range |
| 5 | Debajo pentagrama (Sol) | C4, D4 | Ledger lines below |
| 6 | Encima pentagrama (Sol) | G5, A5, B5, C6 | Ledger lines above |
| 7 | Naturales (Sol) | C4--C6 (naturals) | All natural notes in full range |
| 8 | Sostenidos (Sol) | C4--C6 (all) | Introduces sharps |
| 9 | Todas las notas (Sol) | C4--C6 (all) | Full chromatic range, treble clef |

### Bass Clef (Fa)

| # | Name | Notes | Description |
|---|------|-------|-------------|
| 10 | Lineas (Fa) | G2, B2, D3, F3, A3 | Notes on bass staff lines |
| 11 | Espacios (Fa) | A2, C3, E3, G3 | Notes in bass staff spaces |
| 12 | Lineas+Espacios (Fa) | G2--B3 | Combined lines and spaces |
| 13 | Rango pentagrama (Fa) | G2--D4 | Full bass staff range |
| 14 | Debajo pentagrama (Fa) | C2--F2 | Ledger lines below |
| 15 | Encima pentagrama (Fa) | C4--E4 | Ledger lines above |
| 16 | Naturales (Fa) | C2--D4 (naturals) | All natural notes in full range |
| 17 | Sostenidos (Fa) | C2--E4 (all) | Introduces sharps |
| 18 | Todas las notas (Fa) | C2--E4 (all) | Full chromatic range, bass clef |

---

## Contributing

1. Open an issue to discuss proposed changes before sending a PR.
2. Keep existing style (strict TypeScript, functional components, hooks).
3. If adding a feature, update or add the relevant component. Ensure state transitions in `useGameState` stay consistent.
4. Test MIDI input if modifying `useMidi` or the answer submission flow.
5. Run `npm run build` to verify TypeScript and production build.

---

## License

MIT (c) 2026
