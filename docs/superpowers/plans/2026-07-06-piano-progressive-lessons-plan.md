# Progressive Lessons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace difficulty selector with progressive lesson system — 9 lessons from lines-only to full treble range

**Architecture:** Lesson definitions in static data file. GameState holds `lessonId` instead of `difficulty`. Toolbar selects lesson, note pool filtered by lesson.

**Tech Stack:** React, TypeScript

## Global Constraints

- Lessons replace difficulty entirely (beginner/intermediate removed)
- Each lesson has a name, description, and MIDI note pool
- Lesson 1-3: natural notes only. Lesson 8-9: include accidentals
- Backward compatible: existing game loop unchanged, only note pool changes

---

### Task 1: Lesson Data

**Files:**
- Create: `src/data/lessons.ts`

**Interfaces:**
- Produces: `lessons: Lesson[]`, `Lesson { id: string, name: string, desc: string, pool: number[] }`

- [ ] **Step 1: Create src/data/lessons.ts**

```ts
export interface Lesson {
  id: string
  name: string
  desc: string
  pool: number[]
}

export const LESSONS: Lesson[] = [
  { id: 'lines', name: 'Lines', desc: 'Notes on staff lines', pool: [64, 67, 71, 74, 77] },
  { id: 'spaces', name: 'Spaces', desc: 'Notes in staff spaces', pool: [65, 69, 72, 76] },
  { id: 'lines-spaces', name: 'Lines+Spaces', desc: 'Lines and spaces combined', pool: [64, 65, 67, 69, 71, 72, 74, 76, 77, 79] },
  { id: 'staff-range', name: 'Staff Range', desc: 'Full staff (C4-E5)', pool: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76] },
  { id: 'below-staff', name: 'Below Staff', desc: 'Ledger lines below staff', pool: [60, 62] },
  { id: 'above-staff', name: 'Above Staff', desc: 'Ledger lines above staff', pool: [79, 81, 83, 84] },
  { id: 'full-naturals', name: 'Full Naturals', desc: 'All natural notes C4-C6', pool: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84] },
  { id: 'accidentals', name: 'Accidentals', desc: 'Introduce sharps', pool: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84] },
  { id: 'all-notes', name: 'All Notes', desc: 'Full treble clef C4-C6', pool: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84] },
]

export function getLessonPool(lessonId: string): number[] {
  const lesson = LESSONS.find(l => l.id === lessonId)
  return lesson ? lesson.pool : LESSONS[0].pool
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/data/lessons.ts
git commit -m "feat: add lesson data definitions"
```

---

### Task 2: Update useGameState

**Files:**
- Modify: `src/hooks/useGameState.ts`

**Interfaces:**
- Replaces `difficulty` with `lessonId` in state
- Changes: `INITIAL_STATE`, `setDifficulty` → `setLesson`, `randomNote` uses `getLessonPool`

- [ ] **Step 1: Update useGameState.ts**

Read the current file first. Replace `difficulty` with `lessonId` everywhere:

```ts
import { useState, useCallback } from 'react'
import { GameState, Note } from '../types'
import { midiToNote } from '../utils/midiToNote'
import { getLessonPool } from '../data/lessons'

const INITIAL_STATE: GameState = {
  phase: 'idle',
  currentNote: null,
  lastAnswerCorrect: null,
  streak: 0,
  totalAttempts: 0,
  correctAttempts: 0,
  lessonId: 'lines',
  showNoteName: true,
}

function randomNote(lessonId: string): Note {
  const pool = getLessonPool(lessonId)
  const midi = pool[Math.floor(Math.random() * pool.length)]
  return midiToNote(midi)
}

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE)

  const startGame = useCallback(() => {
    setState(prev => {
      const note = randomNote(prev.lessonId)
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
      const note = randomNote(prev.lessonId)
      return { ...prev, phase: 'waiting', currentNote: note }
    })
  }, [])

  const setLesson = useCallback((lessonId: string) => {
    setState(prev => ({ ...prev, lessonId }))
  }, [])

  const setShowNoteName = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showNoteName: show }))
  }, [])

  return { state, startGame, submitAnswer, nextNote, setLesson, setShowNoteName }
}
```

- [ ] **Step 2: Update GameState type**

Also update `src/types/index.ts` — replace `difficulty: Difficulty` with `lessonId: string` in `GameState` interface, and remove the `Difficulty` type import if it becomes unused.

```ts
export interface GameState {
  phase: GamePhase
  currentNote: Note | null
  lastAnswerCorrect: boolean | null
  streak: number
  totalAttempts: number
  correctAttempts: number
  lessonId: string
  showNoteName: boolean
}
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: tsc + vite OK

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useGameState.ts src/types/index.ts
git commit -m "feat: replace difficulty with lessonId in game state"
```

---

### Task 3: Update Toolbar + App

**Files:**
- Modify: `src/components/Toolbar.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Update Toolbar.tsx**

```tsx
import { LESSONS, Lesson } from '../data/lessons'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { Checkbox } from './ui/checkbox'

interface ToolbarProps {
  lessonId: string
  showNoteName: boolean
  onLessonChange: (id: string) => void
  onShowNoteNameChange: (v: boolean) => void
}

export default function Toolbar({
  lessonId, showNoteName,
  onLessonChange, onShowNoteNameChange,
}: ToolbarProps) {
  const current = LESSONS.find(l => l.id === lessonId)

  return (
    <div className="flex justify-center gap-3 mb-4 flex-wrap items-center">
      <div className="flex flex-col items-start gap-1">
        <Select value={lessonId} onValueChange={onLessonChange}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LESSONS.map(l => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {current && (
          <span className="text-xs text-gray-400 ml-1">{current.desc}</span>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <Checkbox checked={showNoteName} onCheckedChange={(v) => onShowNoteNameChange(!!v)} />
        Show note name
      </label>
    </div>
  )
}
```

- [ ] **Step 2: Update App.tsx**

Read the current file. Make these changes:
1. Replace `setDifficulty` with `setLesson` from destructured hook return
2. Change Toolbar props: `difficulty={state.difficulty}` → `lessonId={state.lessonId}`, `onDifficultyChange={setDifficulty}` → `onLessonChange={setLesson}`

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: tsc + vite OK

- [ ] **Step 4: Commit**

```bash
git add src/components/Toolbar.tsx src/App.tsx
git commit -m "feat: integrate lesson selector into Toolbar and App"
```

---

## Self-Review

1. **Spec coverage:** Lesson data (T1), game state (T2), UI (T3) matches design
2. **Placeholder scan:** No placeholders
3. **Type consistency:** `lessonId: string` consistent across all files
4. **Backward compat:** Old `Difficulty` type can be removed if no longer referenced anywhere

## Execution Handoff

Plan complete. Two options:
1. **Subagent-Driven (recommended)**
2. **Inline Execution**

¿Cuál prefieres?
