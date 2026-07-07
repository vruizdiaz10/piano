import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameState } from './hooks/useGameState'
import { useMidi } from './hooks/useMidi'
import { useSound } from './hooks/useSound'
import { getLessonPool } from './data/lessons'
import Staff from './components/Staff'
import PianoKeyboard from './components/PianoKeyboard'
import Feedback from './components/Feedback'
import Toolbar from './components/Toolbar'
import ProgressBar from './components/ProgressBar'
import StreakBadge from './components/StreakBadge'
import StreakOwl from './components/StreakOwl'
import ScoreDisplay from './components/ScoreDisplay'
import Confetti from './components/Confetti'
import LevelComplete from './components/LevelComplete'
import ThemeToggle from './components/ThemeToggle'

export default function App() {
  const { state, startGame, submitAnswer, nextNote, setLesson, setShowNoteName, setMuted, setTheme, restartGame } = useGameState()
  const [highlightKey, setHighlightKey] = useState<number | null>(null)
  const [correctKey, setCorrectKey] = useState<number | null>(null)
  const [wrongKey, setWrongKey] = useState<number | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [staffFlash, setStaffFlash] = useState<'correct' | 'wrong' | null>(null)
  const [trail, setTrail] = useState<Array<{ note: import('./types').Note; id: number }>>([])
  const trailIdRef = useRef(0)
  const [noteExpression, setNoteExpression] = useState<'happy' | 'sad' | null>(null)
  const [themeTransition, setThemeTransition] = useState(false)
  const [answeredNotes, setAnsweredNotes] = useState<number[]>([])
  const { playNote, playCorrect, playWrong, playStreakMilestone, playLevelComplete } = useSound()
  const liveRegionRef = useRef<HTMLDivElement>(null)

  const accuracy = state.totalAttempts > 0 ? (state.correctAttempts / state.totalAttempts) * 100 : 0

  // Apply dark mode class + twilight theater
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
    setThemeTransition(true)
    const timer = setTimeout(() => setThemeTransition(false), 1500)
    return () => clearTimeout(timer)
  }, [state.theme])

  const { midiConnected } = useMidi(
    useCallback((midi: number) => {
      if (state.phase === 'waiting' || (state.phase === 'feedback' && state.recovering)) {
        submitAnswer(midi)
      }
    }, [state.phase, state.recovering, submitAnswer])
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

  // Highlight wrong key ghost
  useEffect(() => {
    if (state.phase === 'feedback' && state.lastAnswerCorrect === false && state.currentNote) {
      setWrongKey(state.currentNote.midi)
      const timer = setTimeout(() => setWrongKey(null), 1500)
      return () => clearTimeout(timer)
    }
  }, [state.phase])

  // Push answered notes to trail + note expression + answered notes on feedback
  useEffect(() => {
    if (state.phase === 'feedback' && state.lastAnswerCorrect !== null && state.currentNote) {
      setTrail(prev => {
        const next = [...prev, { note: state.currentNote!, id: trailIdRef.current++ }]
        return next.slice(-3)
      })
      setNoteExpression(state.lastAnswerCorrect ? 'happy' : 'sad')
      setAnsweredNotes(prev => [...prev, state.currentNote!.midi])
      const timer = setTimeout(() => setNoteExpression(null), 1500)
      return () => clearTimeout(timer)
    }
  }, [state.phase, state.lastAnswerCorrect, state.currentNote])

  // Clear trail + answered notes on new game
  useEffect(() => {
    if (state.totalAttempts === 0 && state.phase === 'waiting') {
      setTrail([])
      setAnsweredNotes([])
    }
  }, [state.totalAttempts, state.phase])

  // Sound effects + confetti + flash on answer
  useEffect(() => {
    if (state.phase === 'feedback' || state.phase === 'levelComplete') {
      if (state.lastAnswerCorrect) {
        if (!state.isMuted) playCorrect()
        setShowConfetti(true)
        setStaffFlash('correct')
        setTimeout(() => setShowConfetti(false), 1500)
        if (state.streak > 0 && state.streak % 5 === 0 && !state.isMuted) {
          playStreakMilestone()
        }
      } else {
        if (!state.isMuted) playWrong()
        setStaffFlash('wrong')
      }
      setTimeout(() => setStaffFlash(null), 600)
    }
    if (state.phase === 'levelComplete' && !state.isMuted) {
      playLevelComplete()
    }
  }, [state.phase])

  // Auto-advance after feedback (with recovery window + timing jitter)
  useEffect(() => {
    if (state.phase === 'feedback' && state.currentNote) {
      setHighlightKey(state.currentNote.midi)
      const base = state.lastAnswerCorrect === false ? 2500 : 1500
      const jitter = (Math.random() - 0.5) * 400
      const timer = setTimeout(() => {
        setHighlightKey(null)
        nextNote()
      }, base + jitter)
      return () => clearTimeout(timer)
    }
  }, [state.phase, state.recovering, state.lastAnswerCorrect])

  // Announce streak to screen readers
  useEffect(() => {
    if (state.streak > 0 && state.streak % 5 === 0 && liveRegionRef.current) {
      liveRegionRef.current.textContent = `Racha de ${state.streak}`
    }
  }, [state.streak])

  const handleKeyboardPlay = useCallback((note: { name: string; octave: number; midi: number }) => {
    if (state.phase === 'waiting' || (state.phase === 'feedback' && state.recovering)) {
      submitAnswer(note.midi)
    }
  }, [state.phase, state.recovering, submitAnswer])

  const staffClass = staffFlash === 'correct'
    ? 'animate-flash-green'
    : staffFlash === 'wrong'
      ? 'animate-flash-red animate-shake'
      : ''

  const sleepyClass = state.isMuted ? 'opacity-70 animate-sleepy-sway' : ''

  return (
    <div className={`min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 ${themeTransition ? 'animate-theatre-glow' : ''}`}>
      <Confetti active={showConfetti} />
      <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRegionRef} />
      {themeTransition && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center" aria-hidden="true">
          <span className={`text-6xl animate-twilight-theater ${state.theme === 'light' ? 'text-yellow-400' : 'text-blue-200'}`}>
            {state.theme === 'light' ? '\u2600\uFE0F' : '\uD83C\uDF19'}
          </span>
        </div>
      )}

      {state.phase === 'levelComplete' && (
        <LevelComplete
          accuracy={accuracy}
          bestStreak={state.bestStreak}
          totalNotes={state.totalAttempts}
          elapsedMs={state.startTime ? Date.now() - state.startTime : 0}
          onRetry={restartGame}
          onNext={() => { restartGame() }}
          answeredNotes={answeredNotes}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-red-700 dark:text-red-400 tracking-tight">
            Lectura Musical al Piano
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted(!state.isMuted)}
              className="p-2 rounded-xl bg-white/80 dark:bg-gray-700/80 border border-amber-200 dark:border-gray-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-gray-600 transition-all cursor-pointer shadow-sm relative"
              aria-label={state.isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            >
              {state.isMuted ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                  <span className="absolute -top-2 -right-1 text-xs font-bold text-blue-400 animate-zzz-float" aria-hidden="true">Z</span>
                  <span className="absolute -top-3 right-2 text-[10px] font-bold text-blue-300 animate-zzz-float" style={{ animationDelay: '0.3s' }} aria-hidden="true">z</span>
                  <span className="absolute -top-4 right-4 text-[8px] font-bold text-blue-200 animate-zzz-float" style={{ animationDelay: '0.6s' }} aria-hidden="true">z</span>
                </>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
            <ThemeToggle theme={state.theme} onToggle={setTheme} />
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
        </div>

        {state.phase !== 'idle' && (
          <ProgressBar current={state.totalAttempts} total={state.sessionTarget} label="Progreso" />
        )}

        <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-amber-200 dark:border-gray-700 shadow-lg shadow-amber-100/50 dark:shadow-none p-4 sm:p-6 mb-4 animate-slide-up transition-colors duration-300 ${staffClass} ${sleepyClass}`}>
          <Toolbar
            lessonId={state.lessonId}
            showNoteName={state.showNoteName}
            onLessonChange={setLesson}
            onShowNoteNameChange={setShowNoteName}
          />
          <div className="mt-4">
            <Staff note={state.currentNote} showNoteName={state.showNoteName} lessonPool={getLessonPool(state.lessonId)} trail={trail} noteExpression={noteExpression} isMuted={state.isMuted} />
          </div>
        </div>

        {state.phase !== 'idle' && (
          <div className="flex justify-center items-center gap-2 sm:gap-3 mb-4 animate-slide-up flex-wrap">
            <StreakBadge streak={state.streak} />
            <StreakOwl streak={state.streak} />
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white dark:bg-gray-800 border border-amber-200 dark:border-gray-700 shadow-sm text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300 transition-colors">
              <span className="hidden sm:inline">Aciertos </span>
              <ScoreDisplay accuracy={accuracy} totalAttempts={state.totalAttempts} />
            </div>
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white dark:bg-gray-800 border border-amber-200 dark:border-gray-700 shadow-sm text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300 transition-colors">
              <span className="hidden sm:inline">Intentos </span>
              <span className="text-red-600 dark:text-red-400 text-sm sm:text-base">{state.totalAttempts}</span>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-amber-200 dark:border-gray-700 shadow-lg shadow-amber-100/50 dark:shadow-none p-4 mb-4 animate-slide-up transition-colors duration-300">
          <PianoKeyboard onPlayNote={handleKeyboardPlay} highlightKey={highlightKey} correctKey={correctKey} wrongKey={wrongKey} />
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
          <Feedback isCorrect={state.lastAnswerCorrect} note={state.currentNote} recovering={state.recovering} />
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
