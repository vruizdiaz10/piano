import { useCallback, useEffect, useState } from 'react'
import { useGameState } from './hooks/useGameState'
import { useMidi } from './hooks/useMidi'
import { useSound } from './hooks/useSound'
import Staff from './components/Staff'
import PianoKeyboard from './components/PianoKeyboard'
import Feedback from './components/Feedback'
import Toolbar from './components/Toolbar'

export default function App() {
  const { state, startGame, submitAnswer, nextNote, setLesson, setShowNoteName } = useGameState()
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Piano Sight-Reading
          </h1>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 shadow-sm">
            <span className={`inline-block w-2 h-2 rounded-full ${midiConnected ? 'bg-emerald-500' : 'bg-red-400'}`} />
            <span className="text-slate-500">MIDI: {midiConnected ? 'Connected' : 'Offline'}</span>
          </div>
        </header>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-4">
          <Toolbar
            lessonId={state.lessonId}
            showNoteName={state.showNoteName}
            onLessonChange={setLesson}
            onShowNoteNameChange={setShowNoteName}
          />
          <div className="mt-4">
            <Staff note={state.currentNote} showNoteName={state.showNoteName} />
          </div>
        </div>

        {state.phase !== 'idle' && (
          <div className="flex justify-center gap-3 mb-4">
            <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-600 font-medium shadow-sm">
              Streak: <span className="text-amber-600">{state.streak}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-600 font-medium shadow-sm">
              Score: <span className="text-emerald-600">
                {state.totalAttempts > 0
                  ? `${Math.round(state.correctAttempts / state.totalAttempts * 100)}%`
                  : '-'}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-600 font-medium shadow-sm">
              Total: <span className="text-blue-600">{state.totalAttempts}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
          <PianoKeyboard onPlayNote={handleKeyboardPlay} highlightKey={highlightKey} />
        </div>

        {state.phase === 'idle' ? (
          <div className="text-center">
            <button
              className="px-10 py-3 text-base font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors cursor-pointer border-none shadow-sm"
              onClick={startGame}
            >
              Start Game
            </button>
          </div>
        ) : (
          <Feedback isCorrect={state.lastAnswerCorrect} note={state.currentNote} />
        )}

        {state.phase === 'feedback' && (
          <div className="text-center mt-3">
            <button
              className="px-6 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer shadow-sm"
              onClick={() => { setHighlightKey(null); nextNote() }}
            >
              Next Note &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
