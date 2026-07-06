import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [correctKey, setCorrectKey] = useState<number | null>(null)
  const { playNote } = useSound()
  const liveRegionRef = useRef<HTMLDivElement>(null)

  const accuracy = state.totalAttempts > 0 ? (state.correctAttempts / state.totalAttempts) * 100 : 0

  // Apply dark mode class
  useEffect(() => {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    const stored = localStorage.getItem('piano-theme')
    const theme = stored ?? (prefersDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [])

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

  // Highlight correct key on correct answer
  useEffect(() => {
    if (state.phase === 'feedback' && state.lastAnswerCorrect && state.currentNote) {
      setCorrectKey(state.currentNote.midi)
      const timer = setTimeout(() => setCorrectKey(null), 400)
      return () => clearTimeout(timer)
    }
  }, [state.phase])

  // Auto-advance after feedback
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

  // Announce streak to screen readers
  useEffect(() => {
    if (state.streak > 0 && state.streak % 5 === 0 && liveRegionRef.current) {
      liveRegionRef.current.textContent = `Racha de ${state.streak}`
    }
  }, [state.streak])

  const handleKeyboardPlay = useCallback((note: { name: string; octave: number; midi: number }) => {
    if (state.phase === 'waiting') {
      submitAnswer(note.midi)
    }
  }, [state.phase, submitAnswer])

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRegionRef} />

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-red-700 dark:text-red-400 tracking-tight">
            Lectura Musical al Piano
          </h1>
          <div className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
            midiConnected
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'
              : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700'
          }`}>
            <span className={`inline-block w-2 h-2 rounded-full ${midiConnected ? 'bg-emerald-500' : 'bg-red-400'}`} />
            <span className="hidden sm:inline">MIDI: {midiConnected ? 'Conectado' : 'Sin conexión'}</span>
            <span className="sm:hidden">MIDI</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-amber-200 dark:border-gray-700 shadow-lg shadow-amber-100/50 dark:shadow-none p-4 sm:p-6 mb-4 animate-slide-up transition-colors duration-300">
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
          <div className="flex justify-center items-center gap-2 sm:gap-3 mb-4 animate-slide-up flex-wrap">
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white dark:bg-gray-800 border border-amber-200 dark:border-gray-700 shadow-sm text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300 transition-colors" aria-live="polite" aria-atomic="true">
              Racha <span className="text-amber-600 dark:text-amber-400 text-sm sm:text-base">{state.streak}</span>
            </div>
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white dark:bg-gray-800 border border-amber-200 dark:border-gray-700 shadow-sm text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300 transition-colors">
              <span className="hidden sm:inline">Aciertos </span>
              <span className="text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                {state.totalAttempts > 0
                  ? `${Math.round(accuracy)}%`
                  : '-'}
              </span>
            </div>
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white dark:bg-gray-800 border border-amber-200 dark:border-gray-700 shadow-sm text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300 transition-colors">
              <span className="hidden sm:inline">Intentos </span>
              <span className="text-red-600 dark:text-red-400 text-sm sm:text-base">{state.totalAttempts}</span>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-amber-200 dark:border-gray-700 shadow-lg shadow-amber-100/50 dark:shadow-none p-4 mb-4 animate-slide-up transition-colors duration-300">
          <PianoKeyboard onPlayNote={handleKeyboardPlay} highlightKey={highlightKey} correctKey={correctKey} />
        </div>

        {state.phase === 'idle' ? (
          <div className="text-center animate-slide-up">
            <button
              className="px-12 py-4 text-lg font-bold rounded-2xl bg-gradient-to-b from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 transition-all duration-150 cursor-pointer border-none shadow-lg shadow-red-200/50 hover:shadow-xl hover:shadow-red-300/50 btn-3d"
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
              className="px-8 py-3 text-base font-semibold rounded-xl border-2 border-amber-300 dark:border-amber-600 bg-white dark:bg-gray-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-gray-600 active:bg-amber-100 transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md btn-3d"
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
