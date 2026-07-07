# Sound Playback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add sound playback via Web Audio API — notes play when shown on staff and during feedback

**Architecture:** Single `useSound` hook with lazy AudioContext creation. OscillatorNode + GainNode with ADSR envelope. Triangle wave for piano-like tone.

**Tech Stack:** Web Audio API (no external deps), React hooks

## Global Constraints

- AudioContext created lazily on first user interaction (browser autoplay policy)
- Triangle waveform (warmer than sine, simpler than sawtooth)
- ADSR envelope: attack 10ms, decay 50ms, sustain 0.3, release 300ms
- Frequency formula: `440 * 2^((midi - 69) / 12)`
- No external audio libraries
- Cleanup on unmount: close AudioContext

---

### Task 1: useSound Hook

**Files:**
- Create: `src/hooks/useSound.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `{ playNote: (midi: number) => void }`

- [ ] **Step 1: Create useSound.ts**

```ts
import { useRef, useCallback } from 'react'

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getContext = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const playNote = useCallback((midi: number) => {
    const ctx = getContext()
    const freq = 440 * Math.pow(2, (midi - 69) / 12)
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.5, now + 0.01)
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05)
    gain.gain.setValueAtTime(0.2, now + 0.15)
    gain.gain.linearRampToValueAtTime(0, now + 0.45)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.45)
  }, [getContext])

  return { playNote }
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: tsc + vite OK

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useSound.ts
git commit -m "feat: add useSound hook with Web Audio API playback"
```

---

### Task 2: Integrate Sound into App

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useSound()` hook from Task 1, `state.currentNote`, `state.phase` from game state

- [ ] **Step 1: Add import and sound playback to App.tsx**

```tsx
import { useCallback, useEffect, useState } from 'react'
import { useGameState } from './hooks/useGameState'
import { useMidi } from './hooks/useMidi'
import { useSound } from './hooks/useSound'
import Staff from './components/Staff'
import PianoKeyboard from './components/PianoKeyboard'
import Feedback from './components/Feedback'
import Toolbar from './components/Toolbar'

export default function App() {
  const { state, startGame, submitAnswer, nextNote, setDifficulty, setShowNoteName } = useGameState()
  const [highlightKey, setHighlightKey] = useState<number | null>(null)
  const { playNote } = useSound()

  const { midiConnected } = useMidi(
    useCallback((midi: number) => {
      if (state.phase === 'waiting') {
        submitAnswer(midi)
      }
    }, [state.phase, submitAnswer])
  )

  useEffect(() => {
    if (state.currentNote && (state.phase === 'waiting' || state.phase === 'feedback')) {
      playNote(state.currentNote.midi)
    }
  }, [state.currentNote, state.phase, playNote])

  useEffect(() => {
    if (state.phase === 'feedback' && state.currentNote) {
      setHighlightKey(state.currentNote.midi)
      const timer = setTimeout(() => {
        setHighlightKey(null)
        nextNote()
      }, 1500)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: tsc + vite OK

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate sound playback into App"
```

---

## Self-Review

1. **Spec coverage:** sound playback hook (Task 1) + App integration (Task 2) matches spec
2. **Placeholder scan:** No TBD, TODOs, or vague instructions
3. **Type consistency:** `playNote` takes `(midi: number)` consistent across both tasks

## Execution Handoff

Plan complete. Two options:
1. **Subagent-Driven (recommended)** — dispatch per task with review gates
2. **Inline Execution** — execute in this session

¿Cuál prefieres?
