### Task 2: Types and Utility Functions

**Files:**
- Create: `src/types/index.ts`
- Create: `src/utils/midiToNote.ts`
- Create: `src/utils/noteToPosition.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `Note`, `NoteName`, `Difficulty`, `GamePhase`, `midiToNote(midi: number): Note`, `noteToPosition(note: Note): number`, `getNotePool(difficulty: Difficulty): number[]` for later tasks

**Step 1: Create src/types/index.ts**
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

**Step 2: Create src/utils/midiToNote.ts**
```ts
import { Note, NoteName } from '../types'

const NOTE_NAMES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function midiToNote(midi: number): Note {
  const octave = Math.floor(midi / 12) - 1
  const name = NOTE_NAMES[midi % 12]
  return { name, octave, midi }
}
```

**Step 3: Create src/utils/noteToPosition.ts**
```ts
import { Note } from '../types'
import { Difficulty } from '../types'

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
    return [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79]
  }
  return Array.from({ length: 37 }, (_, i) => 48 + i)
}
```

**Step 4: Commit**
```bash
git add src/types/index.ts src/utils/midiToNote.ts src/utils/noteToPosition.ts
git commit -m "feat: add types and utility functions"
```
