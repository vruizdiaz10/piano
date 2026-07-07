# Piano Sight-Reading Game — Design Spec

## Overview

Web-based game to help people learn to read sheet music (pentagram) and identify notes on a piano keyboard. Built with React + TypeScript + Vite. Supports MIDI input (preferred) and on-screen visual keyboard.

## Tech Stack

- **Build:** Vite + TypeScript
- **UI:** React 18+ (no UI library — CSS modules)
- **Staff rendering:** SVG (mathematical drawing, no music library)
- **MIDI:** Web MIDI API (navigator.requestMIDIAccess)
- **No external MIDI polyfill** — requires Chrome/Edge for MIDI; Firefox/Safari get on-screen keyboard only

## Architecture

```
App
├── Toolbar
│   ├── ModeSelector (free practice / challenge)
│   ├── DifficultySelector (beginner / intermediate / advanced)
│   ├── ClefSelector (treble / bass)
│   ├── ShowNoteNameToggle (C D E F G A B — on by default in practice, off in challenge)
│   └── MidiStatusIndicator (connected / searching / no MIDI)
├── GameArea
│   ├── Staff (SVG) — 5 lines, note at correct position, clef symbol
│   ├── PianoKeyboard — 2 octaves (C4-B5), clickable, highlights correct key on fail
│   ├── Feedback — green (correct) / red (wrong) + note name
│   └── ScoreBoard — streak, score, stats (challenge mode)
└── MidiController — invisible, manages MIDI connection
```

## Game Flow

```
IDLE → SHOW_NOTE → WAITING_INPUT → FEEDBACK → SHOW_NEXT (loop)
```

1. **IDLE** — initial state, waits for start
2. **SHOW_NOTE** — generates random note per difficulty, renders on staff
3. **WAITING_INPUT** — waits for MIDI NoteOn or keyboard click
4. **FEEDBACK** — shows correct/wrong + note name (~1.5s), updates score
5. Loops to **SHOW_NEXT**

## Input Resolution

| Input | Resolution |
|-------|-----------|
| MIDI NoteOn | `midiToNote(number)` — e.g. 60 → "C4" |
| Visual keyboard click | key id → "C4" |
| Both | first input triggers feedback, second ignored |

## Difficulty Levels

| Level | Clef | Notes | Accidentals |
|-------|------|-------|-------------|
| Beginner | Treble | C4-G5 (~14 notes) | No |
| Intermediate | Treble + Bass | C3-C6 | Yes (up to 2) |
| Advanced | Both | C2-C7 | Yes + ledger lines |

## Note Name Toggle

- Option to show letter name in American cipher (C D E F G A B)
- Displayed next to the feedback or directly on the staff
- Default: ON in free practice, OFF in challenge mode
- User can toggle at any time via Toolbar

## MIDI Implementation

- `navigator.requestMIDIAccess()` on App mount
- Scans input ports, shows status in Toolbar
- Filters NoteOn (velocity > 0), ignores NoteOff
- Maps midi number to note: 60→C4, 61→C#4, 62→D4...
- Supports any USB class-compliant MIDI keyboard

## Visual Keyboard

- 2 octaves: C4 to B5 in beginner, expands to C3-C6 in intermediate (keyboard rendered dynamically based on difficulty)
- Click on key triggers same logic as MIDI
- On wrong answer, highlights correct key in blue
- Responsive width

## Hooks

- `useMidi` — scans ports, listens for NoteOn/NoteOff
- `useGameState` — current note, score, streak, mode
- `useStaff` — generates SVG staff based on note + difficulty

## MVP Scope (Phase 1)

- Single HTML page, desktop-first
- Free practice mode only
- Beginner + Intermediate difficulties
- Treble clef only
- MIDI + visual keyboard
- Note name toggle
- Correct/wrong feedback

## Phase 2 — Sound Playback (Web Audio API)

### Hook `useSound`
- `useSound()` → `{ playNote: (midi: number) => void }`
- Creates `AudioContext` lazily on first user interaction (browser policy)
- `playNote(midi)`:
  - 5 oscillators: fundamental (triangle) + harmonics 2x-5x (sine) for rich tone
  - Envelope: attack 5ms, decay 300ms to sustain 0.15, release to 0 at 1.6s
  - Auto-stops oscillator after release completes
- Cleanup: closes AudioContext on unmount

### Integration
- Plays note when it appears on staff (`phase === 'waiting'` with new `currentNote`)
- Plays note during feedback phase too (user choice: both)
- File: `src/hooks/useSound.ts`

## Phase 2 — Progressive Lessons

Replace difficulty selector (beginner/intermediate) with a lesson selector. Each lesson defines a filtered note pool.

### Lesson Table

| # | Lesson | Notes | Description |
|---|--------|-------|-------------|
| 1 | Lines | E4 G4 B4 D5 F5 | Notes on staff lines |
| 2 | Spaces | F4 A4 C5 E5 | Notes in spaces |
| 3 | Lines+Spaces | E4-G5 mix | Combined lines and spaces |
| 4 | Staff Range | C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 | Full staff range |
| 5 | Below Staff | C4 D4 | Ledger lines below |
| 6 | Above Staff | G5 A5 B5 C6 | Ledger lines above |
| 7 | Full Naturals | C4-C6 naturals | All natural notes |
| 8 | Accidentals | C4-C6 with # | Introduce sharps |
| 9 | All Notes | C4-C6 complete | Full treble clef range |

### Files
- Create: `src/data/lessons.ts` — lesson definitions with note pools
- Modify: `src/hooks/useGameState.ts` — add `lessonId` state, replace `difficulty`
- Modify: `src/components/Toolbar.tsx` — Select with lesson list
- Modify: `src/App.tsx` — pass `lessonId` through

## Future (Phase 2+)

- Challenge mode (timer, score, streak)
- Bass clef
- Advanced difficulty (ledger lines)
- Mobile layout
