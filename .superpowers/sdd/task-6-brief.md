### Task 6: useGameState Hook

**Files:**
- Create: `src/hooks/useGameState.ts`

**Interfaces:**
- Consumes: `midiToNote`, `getNotePool` from Task 2
- Produces: `{ state: GameState, startGame: () => void, submitAnswer: (midi: number) => void, nextNote: () => void, setDifficulty, setShowNoteName }`

**Step 1: Create useGameState.ts**
```ts
import { useState, useCallback } from 'react'
import { GameState, Difficulty, Note } from '../types'
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

**Step 2: Commit**
```bash
git add src/hooks/useGameState.ts
git commit -m "feat: add useGameState hook"
```
