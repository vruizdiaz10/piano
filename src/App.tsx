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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-700 tracking-tight">
            Lectura Musical al Piano
          </h1>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
            midiConnected
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            <span className={`inline-block w-2 h-2 rounded-full ${midiConnected ? 'bg-emerald-500' : 'bg-red-400'}`} />
            MIDI: {midiConnected ? 'Conectado' : 'Sin conexión'}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 shadow-lg shadow-amber-100/50 p-5 sm:p-6 mb-4 animate-slide-up">
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
          <div className="flex justify-center gap-3 mb-4 animate-slide-up">
            <div className="px-4 py-2 rounded-xl bg-white border border-amber-200 shadow-sm text-sm font-semibold text-amber-800">
              Racha <span className="text-amber-600 text-base">{state.streak}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white border border-amber-200 shadow-sm text-sm font-semibold text-amber-800">
              Aciertos <span className="text-emerald-600 text-base">
                {state.totalAttempts > 0
                  ? `${Math.round(state.correctAttempts / state.totalAttempts * 100)}%`
                  : '-'}
              </span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white border border-amber-200 shadow-sm text-sm font-semibold text-amber-800">
              Intentos <span className="text-red-600 text-base">{state.totalAttempts}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-amber-200 shadow-lg shadow-amber-100/50 p-4 mb-4 animate-slide-up">
          <PianoKeyboard onPlayNote={handleKeyboardPlay} highlightKey={highlightKey} />
        </div>

        {state.phase === 'idle' ? (
          <div className="text-center animate-slide-up">
            <button
              className="px-12 py-4 text-lg font-bold rounded-2xl bg-gradient-to-b from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 transition-all duration-150 cursor-pointer border-none shadow-lg shadow-red-200/50 hover:shadow-xl hover:shadow-red-300/50 hover:-translate-y-0.5 active:translate-y-0"
              onClick={startGame}
            >
              Iniciar Juego
            </button>
          </div>
        ) : (
          <Feedback isCorrect={state.lastAnswerCorrect} note={state.currentNote} />
        )}

        {state.phase === 'feedback' && (
          <div className="text-center mt-3 animate-slide-up">
            <button
              className="px-8 py-3 text-base font-semibold rounded-xl border-2 border-amber-300 bg-white text-amber-700 hover:bg-amber-50 active:bg-amber-100 transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md"
              onClick={() => { setHighlightKey(null); nextNote() }}
            >
              Siguiente Nota &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
