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
