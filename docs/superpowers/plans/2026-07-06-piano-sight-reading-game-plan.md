# Piano Sight-Reading Game — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build MVP of web game that teaches sheet music reading (treble clef) with MIDI + visual piano keyboard input

**Architecture:** Single-page React + TypeScript + Vite app. SVG for staff rendering. Web MIDI API for hardware input. Tailwind CSS + shadcn/ui for styling and accessible components.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Web MIDI API

## Global Constraints

- UI system: Tailwind CSS + shadcn/ui (React 18 compatible)
- No music theory libraries — hand-rolled SVG staff + note math
- Web MIDI API only (Chrome/Edge) — Firefox/Safari get visual keyboard only
- Note naming in American cipher (C D E F G A B)
- Desktop-first layout (not mobile yet)
- MVP: treble clef only (bass clef post-MVP)
- Note name toggle ON by default in free practice

---

### Task 1: Project Scaffolding

**Files:**
- Create: `piano-sight-reading/package.json`
- Create: `piano-sight-reading/tsconfig.json`
- Create: `piano-sight-reading/tsconfig.app.json`
- Create: `piano-sight-reading/tsconfig.node.json`
- Create: `piano-sight-reading/vite.config.ts`
- Create: `piano-sight-reading/index.html`
- Create: `piano-sight-reading/src/main.tsx`
- Create: `piano-sight-reading/src/vite-env.d.ts`
- Create: `piano-sight-reading/tailwind.config.js`
- Create: `piano-sight-reading/postcss.config.js`
- Create: `piano-sight-reading/src/index.css`
- Create: `piano-sight-reading/src/lib/utils.ts`
- Create: `piano-sight-reading/components.json` (shadcn/ui config)

**Interfaces:**
- Consumes: nothing
- Produces: working Vite dev server at `localhost:5173` with React + TS

- [ ] **Step 1: Create project directory and package.json**

```json
{
  "name": "piano-sight-reading",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.400.0",
    "tailwind-merge": "^2.4.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

- [ ] **Step 2: Update tsconfig.app.json with path alias**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 4: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create vite.config.ts**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 6: Create tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

- [ ] **Step 7: Create postcss.config.js**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 8: Create src/index.css (Tailwind entry + CSS variables)**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83% 53.3%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 9: Create components.json (shadcn/ui config)**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 10: Create src/lib/utils.ts**

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 11: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Piano Sight-Reading</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 12: Create src/vite-env.d.ts**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 13: Update src/main.tsx (import Tailwind CSS)**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 14: Install dependencies**

Run: `cd piano-sight-reading && npm install`

- [ ] **Step 15: Verify dev server starts**

Run: `npm run dev`
Expected: Vite dev server starts on localhost:5173, no errors

- [ ] **Step 16: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TS + Tailwind/shadcn project"
```

---

### Task 2: Types and Utility Functions

**Files:**
- Create: `piano-sight-reading/src/types/index.ts`
- Create: `piano-sight-reading/src/utils/midiToNote.ts`
- Create: `piano-sight-reading/src/utils/noteToPosition.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `Note`, `NoteName`, `Difficulty`, `GamePhase`, `midiToNote(midi: number): Note`, `noteToPosition(note: Note): number`, `getNotePool(difficulty: Difficulty): number[]` for later tasks

- [ ] **Step 1: Create src/types/index.ts**

```ts
export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B'

export interface Note {
  name: NoteName
  octave: number
  midi: number
}

export type Difficulty = 'beginner' | 'intermediate'

export type GamePhase = 'idle' | 'waiting' | 'feedback'

export interface GameState {
  phase: GamePhase
  currentNote: Note | null
  lastAnswerCorrect: boolean | null
  streak: number
  totalAttempts: number
  correctAttempts: number
  difficulty: Difficulty
  showNoteName: boolean
}
```

- [ ] **Step 2: Write test and implementation for midiToNote**

Create `piano-sight-reading/src/utils/midiToNote.ts`:

```ts
import { Note, NoteName } from '../types'

const NOTE_NAMES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function midiToNote(midi: number): Note {
  const octave = Math.floor(midi / 12) - 1
  const name = NOTE_NAMES[midi % 12]
  return { name, octave, midi }
}
```

- [ ] **Step 3: Write test and implementation for noteToPosition**

Create `piano-sight-reading/src/utils/noteToPosition.ts`:

```ts
import { Note } from '../types'

// Staff Y positions relative to 5-line treble staff
// Treble clef: E4 (bottom line) = position 0, lines at 0,2,4,6,8

const NOTE_POSITIONS: Record<string, number> = {
  'C4': -2, 'D4': -1, 'E4': 0, 'F4': 1, 'G4': 2, 'A4': 3, 'B4': 4,
  'C5': 5, 'D5': 6, 'E5': 7, 'F5': 8, 'G5': 9, 'A5': 10, 'B5': 11,
  'C6': 12,
}

export function noteToPosition(note: Note): number {
  const key = `${note.name}${note.octave}`
  const pos = NOTE_POSITIONS[key]
  if (pos === undefined) throw new Error(`Note ${key} not in treble clef range`)
  return pos
}

export function getNotePool(difficulty: Difficulty): number[] {
  if (difficulty === 'beginner') {
    return [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79] // C4-G5 natural only
  }
  return Array.from({ length: 37 }, (_, i) => 48 + i) // C3-C6 with accidentals (MIDI 48-84)
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/utils/midiToNote.ts src/utils/noteToPosition.ts
git commit -m "feat: add types and utility functions"
```

---

### Task 3: Staff SVG Component

**Files:**
- Create: `piano-sight-reading/src/components/Staff.tsx`

**Interfaces:**
- Consumes: `Note`, `noteToPosition(note): number` from Task 2
- Produces: `<Staff note?: Note | null, showNoteName: boolean />` — renders SVG treble staff with note

- [ ] **Step 1: Create Staff.tsx**

```tsx
import { Note } from '../types'
import { noteToPosition } from '../utils/noteToPosition'

const LINE_SPACING = 16
const STAFF_TOP = 60
const STAFF_LEFT = 40
const NOTE_RADIUS = 8

interface StaffProps {
  note?: Note | null
  showNoteName: boolean
}

function getAccidental(name: string): string | null {
  if (name.includes('#')) return '\u266F'
  return null
}

export default function Staff({ note, showNoteName }: StaffProps) {
  const height = STAFF_TOP + LINE_SPACING * 8 + 40

  return (
    <div className="flex justify-center py-6">
      <svg viewBox={`0 0 ${STAFF_LEFT + 400} ${height}`} className="w-full max-w-[500px] h-auto" role="img" aria-label={note ? `Staff showing ${note.name}${note.octave}` : 'Empty musical staff'} xmlns="http://www.w3.org/2000/svg">
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={STAFF_LEFT}
            y1={STAFF_TOP + i * LINE_SPACING}
            x2={STAFF_LEFT + 340}
            y2={STAFF_TOP + i * LINE_SPACING}
            stroke="#333"
            strokeWidth={1}
          />
        ))}
        <text x={12} y={STAFF_TOP + LINE_SPACING * 3 + 6} fontSize={36} fill="#333">
          {'\u{1D11E}'}
        </text>
        {note && (() => {
          const pos = noteToPosition(note)
          const y = STAFF_TOP - pos * LINE_SPACING / 2 + LINE_SPACING * 2
          const x = STAFF_LEFT + 160
          const accidental = getAccidental(note.name)

          return (
            <g>
              {accidental && (
                <text x={x - 22} y={y + 6} fontSize={20} fill="#333">{accidental}</text>
              )}
              <ellipse cx={x} cy={y} rx={NOTE_RADIUS} ry={NOTE_RADIUS * 0.7} fill="#333" />
              {showNoteName && (
                <text x={x} y={y - 24} textAnchor="middle" fontSize={14} fill="#666">
                  {note.name}{note.octave}
                </text>
              )}
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Staff.tsx
git commit -m "feat: add SVG staff component"
```

---

### Task 4: PianoKeyboard Component

**Files:**
- Create: `piano-sight-reading/src/components/PianoKeyboard.tsx`

**Interfaces:**
- Consumes: `onPlayNote(note: Note): void` — callback when key is clicked

- [ ] **Step 1: Create PianoKeyboard.tsx**

```tsx
import { useMemo } from 'react'
import { Note, Difficulty } from '../types'
import { cn } from '../lib/utils'

interface PianoKeyboardProps {
  onPlayNote: (note: Note) => void
  highlightKey?: number | null
  difficulty: Difficulty
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function isBlack(midi: number): boolean {
  return NOTE_NAMES[midi % 12].includes('#')
}

function getKeyboardRange(difficulty: Difficulty): { start: number; count: number } {
  if (difficulty === 'beginner') return { start: 60, count: 25 }
  return { start: 48, count: 37 }
}

export default function PianoKeyboard({ onPlayNote, highlightKey, difficulty }: PianoKeyboardProps) {
  const { start, count } = useMemo(() => getKeyboardRange(difficulty), [difficulty])
  const keys = useMemo(() => Array.from({ length: count }, (_, i) => start + i), [start, count])
  const whiteKeys = keys.filter(m => !isBlack(m))
  const blackKeyPositions = keys.map((midi, i) => {
    if (!isBlack(midi)) return null
    const prevWhiteCount = keys.slice(0, i).filter(m => !isBlack(m)).length
    return { midi, offset: prevWhiteCount * 44 - 14 }
  })

  return (
    <div className="flex justify-center py-4 select-none">
      <div className="flex relative h-40">
        {whiteKeys.map(midi => {
          const octave = Math.floor(midi / 12) - 1
          const name = NOTE_NAMES[midi % 12]
          const isHighlighted = highlightKey === midi
          return (
            <div
              key={midi}
              className={cn(
                'w-11 h-40 border border-gray-400 rounded-b-md bg-white cursor-pointer flex flex-col justify-end items-center pb-2 text-xs text-gray-400 transition-colors duration-100 hover:bg-gray-100 active:bg-blue-200',
                isHighlighted && '!bg-blue-500'
              )}
              role="button"
              tabIndex={0}
              aria-label={`Note ${name}${octave}`}
              onMouseDown={() => onPlayNote({ name: name as Note['name'], octave, midi })}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPlayNote({ name: name as Note['name'], octave, midi }) } }}
            />
          )
        })}
        {blackKeyPositions.map(k => {
          if (!k) return null
          const octave = Math.floor(k.midi / 12) - 1
          const name = NOTE_NAMES[k.midi % 12]
          const isHighlighted = highlightKey === k.midi
          return (
            <div
              key={k.midi}
              className="absolute w-0 z-10"
              style={{ left: k.offset + 44 }}
            >
              <div
                className={cn(
                  'w-7 h-24 border border-gray-600 rounded-b-md bg-gray-800 cursor-pointer transition-colors duration-100 hover:bg-gray-600',
                  isHighlighted && '!bg-blue-500'
                )}
                role="button"
                tabIndex={0}
                aria-label={`Note ${name}${octave}`}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  onPlayNote({ name: name as Note['name'], octave, midi: k.midi })
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onPlayNote({ name: name as Note['name'], octave, midi: k.midi }) } }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PianoKeyboard.tsx
git commit -m "feat: add piano keyboard component"
```

---

### Task 5: useMidi Hook

**Files:**
- Create: `piano-sight-reading/src/hooks/useMidi.ts`

**Interfaces:**
- Consumes: nothing (uses browser's `navigator.requestMIDIAccess`)
- Produces: `{ midiConnected: boolean, onNoteOn: ((midi: number) => void) | null }`

- [ ] **Step 1: Create useMidi.ts**

```ts
import { useState, useEffect, useRef, useCallback } from 'react'

interface MidiState {
  midiConnected: boolean
  onNoteOn: ((midi: number) => void) | null
}

export function useMidi(): MidiState {
  const [midiConnected, setMidiConnected] = useState(false)
  const onNoteOnRef = useRef<((midi: number) => void) | null>(null)

  useEffect(() => {
    let midiAccess: MIDIAccess | null = null
    let inputs: MIDIInput[] = []

    function onMidiMessage(event: MIDIMessageEvent) {
      if (!event.data) return
      const [status, note, velocity] = event.data
      if ((status & 0xf0) === 0x90 && velocity > 0) {
        onNoteOnRef.current?.(note)
      }
    }

    function connectInputs(access: MIDIAccess) {
      inputs.forEach(inp => inp.onmidimessage = null)
      inputs = []
      for (const input of access.inputs.values()) {
        input.onmidimessage = onMidiMessage
        inputs.push(input)
      }
      setMidiConnected(inputs.length > 0)
    }

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then((access) => {
          midiAccess = access
          connectInputs(access)
          access.onstatechange = () => connectInputs(access)
        })
        .catch(() => setMidiConnected(false))
    }

    return () => {
      inputs.forEach(inp => inp.onmidimessage = null)
      midiAccess.onstatechange = null
    }
  }, [])

  const setOnNoteOn = useCallback((handler: ((midi: number) => void) | null) => {
    onNoteOnRef.current = handler
  }, [])

  return { midiConnected, onNoteOn: null }
}
```

Wait, I realize the `onNoteOn` is a setter pattern, not a callback. Let me redesign this to be cleaner.

- [ ] **Step 2: Refactor useMidi with listener pattern**

```ts
import { useState, useEffect, useRef, useCallback } from 'react'

export function useMidi(onNoteOn: (midi: number) => void) {
  const [midiConnected, setMidiConnected] = useState(false)
  const handlerRef = useRef(onNoteOn)
  handlerRef.current = onNoteOn

  useEffect(() => {
    let midiAccess: MIDIAccess | null = null
    let inputs: MIDIInput[] = []

    function onMidiMessage(event: MIDIMessageEvent) {
      if (!event.data) return
      const [status, note, velocity] = event.data
      if ((status & 0xf0) === 0x90 && velocity > 0) {
        handlerRef.current?.(note)
      }
    }

    function connectInputs(access: MIDIAccess) {
      inputs.forEach(inp => { inp.onmidimessage = null })
      inputs = []
      for (const input of access.inputs.values()) {
        input.onmidimessage = onMidiMessage
        inputs.push(input)
      }
      setMidiConnected(inputs.length > 0)
    }

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then((access) => {
          midiAccess = access
          connectInputs(access)
          access.onstatechange = () => connectInputs(access)
        })
        .catch(() => setMidiConnected(false))
    }

    return () => {
      inputs.forEach(inp => { inp.onmidimessage = null })
      if (midiAccess) midiAccess.onstatechange = null
    }
  }, [])

  return { midiConnected }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useMidi.ts
git commit -m "feat: add useMidi hook for Web MIDI API"
```

---

### Task 6: useGameState Hook

**Files:**
- Create: `piano-sight-reading/src/hooks/useGameState.ts`

**Interfaces:**
- Consumes: `midiToNote`, `getNotePool` from Task 2
- Produces: `{ state: GameState, startGame: () => void, submitAnswer: (midi: number) => void, setDifficulty, setShowNoteName }`

- [ ] **Step 1: Create useGameState.ts**

```ts
import { useState, useCallback } from 'react'
import { GameState, GamePhase, Difficulty, Note } from '../types'
import { midiToNote } from '../utils/midiToNote'
import { getNotePool } from '../utils/noteToPosition'

const INITIAL_STATE: GameState = {
  phase: 'idle',
  currentNote: null,
  lastAnswerCorrect: null,
  streak: 0,
  totalAttempts: 0,
  correctAttempts: 0,
  difficulty: 'beginner',
  showNoteName: true,
}

function randomNote(difficulty: Difficulty): Note {
  const pool = getNotePool(difficulty)
  const midi = pool[Math.floor(Math.random() * pool.length)]
  return midiToNote(midi)
}

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE)

  const startGame = useCallback(() => {
    setState(prev => {
      const note = randomNote(prev.difficulty)
      return { ...prev, phase: 'waiting', currentNote: note, streak: 0, totalAttempts: 0, correctAttempts: 0 }
    })
  }, [])

  const submitAnswer = useCallback((midi: number) => {
    setState(prev => {
      if (prev.phase !== 'waiting' || !prev.currentNote) return prev
      const isCorrect = midi === prev.currentNote.midi
      return {
        ...prev,
        phase: 'feedback',
        lastAnswerCorrect: isCorrect,
        streak: isCorrect ? prev.streak + 1 : 0,
        totalAttempts: prev.totalAttempts + 1,
        correctAttempts: prev.correctAttempts + (isCorrect ? 1 : 0),
      }
    })
  }, [])

  const nextNote = useCallback(() => {
    setState(prev => {
      const note = randomNote(prev.difficulty)
      return { ...prev, phase: 'waiting', currentNote: note }
    })
  }, [])

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    setState(prev => ({ ...prev, difficulty }))
  }, [])

  const setShowNoteName = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showNoteName: show }))
  }, [])

  return { state, startGame, submitAnswer, nextNote, setDifficulty, setShowNoteName }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useGameState.ts
git commit -m "feat: add useGameState hook"
```

---

### Task 7: App Integration + Feedback + Toolbar

**Files:**
- Create: `piano-sight-reading/src/App.tsx`
- Create: `piano-sight-reading/src/components/Feedback.tsx`
- Create: `piano-sight-reading/src/components/Toolbar.tsx`
- Create: `piano-sight-reading/src/components/ui/select.tsx` (shadcn/ui select primitive)
- Create: `piano-sight-reading/src/components/ui/checkbox.tsx` (shadcn/ui checkbox primitive)

**Interfaces:**
- Consumes: all previous tasks
- Produces: working MVP game

- [ ] **Step 1: Create shadcn/ui primitives (select, checkbox)**

```tsx
// src/components/ui/select.tsx
import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export const Select = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        position === 'popper' && 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn('p-1', position === 'popper' && 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]')}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName
```

```tsx
// src/components/ui/checkbox.tsx
import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cn } from '../../lib/utils'

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName
```

- [ ] **Step 2: Create Feedback.tsx**

```tsx
import { Note } from '../types'
import { cn } from '../lib/utils'

interface FeedbackProps {
  isCorrect: boolean | null
  note: Note | null
}

export default function Feedback({ isCorrect, note }: FeedbackProps) {
  if (isCorrect === null || !note) return <div className="min-h-12" />

  return (
    <div className="min-h-12 flex flex-col items-center justify-center mt-2">
      <span className={cn('text-lg font-bold', isCorrect ? 'text-green-600' : 'text-red-500')}>
        {isCorrect ? '\u2713 Correct!' : '\u2717 Wrong'}
      </span>
      {!isCorrect && (
        <span className="text-sm text-gray-500 mt-1">
          That was {note.name}{note.octave}
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create Toolbar.tsx**

```tsx
import { Difficulty } from '../types'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { Checkbox } from './ui/checkbox'

const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate']

interface ToolbarProps {
  difficulty: Difficulty
  showNoteName: boolean
  onDifficultyChange: (d: Difficulty) => void
  onShowNoteNameChange: (v: boolean) => void
}

export default function Toolbar({
  difficulty, showNoteName,
  onDifficultyChange, onShowNoteNameChange,
}: ToolbarProps) {
  return (
    <div className="flex justify-center gap-3 mb-4 flex-wrap items-center">
      <Select value={difficulty} onValueChange={(val) => {
        if (DIFFICULTIES.includes(val as Difficulty)) onDifficultyChange(val as Difficulty)
      }}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
        </SelectContent>
      </Select>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <Checkbox checked={showNoteName} onCheckedChange={(v) => onShowNoteNameChange(!!v)} />
        Show note name
      </label>
    </div>
  )
}
```

- [ ] **Step 4: Wire App.tsx**

```tsx
import { useCallback, useEffect, useState } from 'react'
import { useGameState } from './hooks/useGameState'
import { useMidi } from './hooks/useMidi'
import Staff from './components/Staff'
import PianoKeyboard from './components/PianoKeyboard'
import Feedback from './components/Feedback'
import Toolbar from './components/Toolbar'

export default function App() {
  const { state, startGame, submitAnswer, nextNote, setDifficulty, setShowNoteName } = useGameState()
  const [highlightKey, setHighlightKey] = useState<number | null>(null)

  const { midiConnected } = useMidi(
    useCallback((midi: number) => {
      if (state.phase === 'waiting') {
        submitAnswer(midi)
      }
    }, [state.phase, submitAnswer])
  )

  useEffect(() => {
    if (state.phase === 'feedback' && state.currentNote) {
      setHighlightKey(state.currentNote.midi)
      const timer = setTimeout(() => {
        setHighlightKey(null)
        nextNote()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [state.phase])

  const handleKeyboardPlay = useCallback((note: { name: string; octave: number; midi: number }) => {
    if (state.phase === 'waiting') {
      submitAnswer(note.midi)
    }
  }, [state.phase, submitAnswer])

  return (
    <div className="max-w-3xl mx-auto p-6 text-center font-sans">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Piano Sight-Reading</h1>
      <div className="flex justify-center gap-4 mb-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <span className={`inline-block w-2 h-2 rounded-full ${midiConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          MIDI: {midiConnected ? 'Connected' : 'Disconnected'}
        </span>
        {state.phase !== 'idle' && (
          <>
            <span>Streak: {state.streak}</span>
            <span>Score: {state.totalAttempts > 0
              ? `${Math.round(state.correctAttempts / state.totalAttempts * 100)}%`
              : '-'}
            </span>
          </>
        )}
      </div>
      <Toolbar
        difficulty={state.difficulty}
        showNoteName={state.showNoteName}
        onDifficultyChange={setDifficulty}
        onShowNoteNameChange={setShowNoteName}
      />
      <Staff note={state.currentNote} showNoteName={state.showNoteName} />
      <PianoKeyboard onPlayNote={handleKeyboardPlay} highlightKey={highlightKey} difficulty={state.difficulty} />
      {state.phase === 'idle' ? (
        <button
          className="mt-6 px-8 py-3 text-base rounded-lg bg-green-600 text-white hover:bg-green-700 cursor-pointer border-none"
          onClick={startGame}
        >
          Start Game
        </button>
      ) : state.phase === 'feedback' ? (
        <Feedback isCorrect={state.lastAnswerCorrect} note={state.currentNote} />
      ) : null}
      {state.phase === 'feedback' && (
        <button
          className="mt-2 px-6 py-2 text-sm rounded-md border border-gray-400 bg-white hover:bg-gray-100 cursor-pointer"
          onClick={() => { setHighlightKey(null); nextNote() }}
        >
          Next Note
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Update package.json with radix-ui dependencies**

Add to `dependencies`:
```json
"@radix-ui/react-checkbox": "^1.1.0",
"@radix-ui/react-select": "^2.1.0"
```

- [ ] **Step 6: Verify app works**

Run: `npm run dev`
Expected: App loads at localhost:5173. Toolbar, staff, piano keyboard visible. "Start Game" button works. Clicking keyboard keys triggers game flow.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: integrate game with App, Feedback, and Toolbar"
```

---

## Self-Review

After writing, review against spec:

1. **Spec coverage:** Each section in the spec maps to a task — scaffolding (T1), types/utils (T2), staff (T3), keyboard (T4), MIDI (T5), game state (T6), integration (T7).
2. **Placeholder scan:** No TBD, TODOs, or vague instructions.
3. **Type consistency:** Same `Note`, `Difficulty`, `GamePhase` types used across all tasks.

## Execution Handoff

Plan complete and saved. Two options:

1. **Subagent-Driven (recommended)** — dispatch fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** — execute tasks in this session with checkpoints

¿Cuál prefieres?
