import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameState } from './hooks/useGameState'
import { useDailyStreak } from './hooks/useDailyStreak'
import { saveSession } from './utils/sessionHistory'
import { useMidi } from './hooks/useMidi'
import { useSound } from './hooks/useSound'
import { getLessonPool, LESSONS } from './data/lessons'
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
import OrnateFrame from './components/OrnateFrame'
import ConcertCurtains from './components/ConcertCurtains'
import ProgressChart from './components/ProgressChart'
import Spotlight from './components/Spotlight'

export default function App() {
  const { state, startGame, submitAnswer, nextNote, setLesson, setShowNoteName, setMuted, setTimed, setTheme, restartGame } = useGameState()
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
  const { dailyStreak, markToday } = useDailyStreak()
  const liveRegionRef = useRef<HTMLDivElement>(null)

  const currentLesson = LESSONS.find(l => l.id === state.lessonId)
  const clef = currentLesson?.clef ?? 'treble'
  const keyboardStart = clef === 'bass' ? 36 : 48

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
    }
    return () => setNoteExpression(null)
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

  // Save session history on level complete
  useEffect(() => {
    if (state.phase === 'levelComplete') {
      saveSession({ accuracy, notes: state.totalAttempts, lessonId: state.lessonId, date: new Date().toISOString() })
    }
  }, [state.phase])

  // Countdown timer
  const tickRef = useRef(0)
  const [timerDisplay, setTimerDisplay] = useState(5)
  useEffect(() => {
    tickRef.current = 0
    const duration = state.sessionTarget > 10 ? 8 : 5
    setTimerDisplay(duration)
    if (!state.isTimed || state.phase !== 'waiting') return
    const interval = setInterval(() => {
      tickRef.current += 1
      setTimerDisplay(duration - tickRef.current)
      if (tickRef.current >= duration) {
        clearInterval(interval)
        submitAnswer(-1)
      }
    }, 1000)
    return () => { clearInterval(interval) }
  }, [state.isTimed, state.phase, state.noteShownAt])

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
    <div
      className={`min-h-screen transition-colors duration-300 ${themeTransition ? 'animate-theatre-glow' : ''}`}
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, var(--stage-floor) 0%, var(--stage-bg) 100%)',
      }}>
      <Confetti active={showConfetti} />
      <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRegionRef} />
      <div className="stage-mote" aria-hidden="true" />
      <div className="stage-mote" aria-hidden="true" />
      <div className="stage-mote" aria-hidden="true" />
      <div className="stage-mote" aria-hidden="true" />
      <div className="stage-mote" aria-hidden="true" />
      <ConcertCurtains isOpen={state.phase !== 'idle'} />
      <Spotlight active={state.phase === 'feedback' || state.phase === 'levelComplete'} />
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
          lessonId={state.lessonId}
          onRetry={restartGame}
          onNext={() => { restartGame() }}
          answeredNotes={answeredNotes}
          responseTimes={state.responseTimes}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 pt-20 pb-6 sm:pt-24 sm:pb-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Lectura Musical
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
            <div className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full text-xs font-semibold ${
              midiConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
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

        <div className="game-layout flex flex-col">
          <div className="game-layout-staff">
            <OrnateFrame>
              <div className={`bg-card rounded-2xl border border-border p-4 sm:p-6 mb-4 animate-slide-up transition-colors duration-300 ${staffClass} ${sleepyClass}`}>
                <Toolbar
                  lessonId={state.lessonId}
                  showNoteName={state.showNoteName}
                  isTimed={state.isTimed}
                  onLessonChange={setLesson}
                  onShowNoteNameChange={setShowNoteName}
                  onTimedChange={setTimed}
                />
                <div className="mt-4">
                  <Staff note={state.currentNote} showNoteName={state.showNoteName} lessonPool={getLessonPool(state.lessonId)} trail={trail} noteExpression={noteExpression} isMuted={state.isMuted} clef={clef} lastCorrectNote={state.lastCorrectNote} />
                </div>
              </div>
            </OrnateFrame>

            {state.phase !== 'idle' && (
              <div className="flex justify-center items-center gap-2 sm:gap-3 mb-4 animate-slide-up flex-wrap">
                <StreakBadge streak={state.streak} />
                <StreakOwl streak={state.streak} />
                {dailyStreak > 1 && (
                  <div className="px-2 py-1 rounded-full text-xs font-bold bg-card border border-[var(--gold-dim)]/40 text-muted-foreground shadow-sm">
                    {'\uD83D\uDD25'} {dailyStreak}d
                  </div>
                )}
                <div className="px-2 py-1 sm:px-4 sm:py-2 rounded-xl bg-card border border-[var(--gold-dim)]/60 shadow-sm text-xs sm:text-sm font-semibold text-muted-foreground transition-colors">
                  <ScoreDisplay accuracy={accuracy} totalAttempts={state.totalAttempts} timerDisplay={state.isTimed ? timerDisplay : undefined} isTimed={state.isTimed} />
                </div>
                <div className="px-2 py-1 sm:px-4 sm:py-2 rounded-xl bg-card border border-[var(--gold-dim)]/60 shadow-sm text-xs sm:text-sm font-semibold text-muted-foreground transition-colors">
                  <span className="hidden sm:inline">Intentos </span>
                  <span className="text-destructive text-sm sm:text-base">{state.totalAttempts}</span>
                </div>
              </div>
            )}
          </div>

          <div className="game-layout-keyboard">
            <div className="bg-card rounded-2xl border border-border p-4 mb-4 animate-slide-up transition-colors duration-300">
              <PianoKeyboard onPlayNote={handleKeyboardPlay} highlightKey={highlightKey} correctKey={correctKey} wrongKey={wrongKey} startMidi={keyboardStart} />
            </div>
          </div>
        </div>

        {state.phase === 'idle' ? (
          <div className="text-center animate-slide-up">
            <ProgressChart />
            <div className="flex justify-center gap-3 mb-4">
              {[5, 10, 20].map(n => (
                <button key={n}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer border-2 btn-3d text-sm ${
                    state.sessionTarget === n
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/50'
                  }`}
                  onClick={() => { markToday(); startGame(n) }}
                >
                  {n} notas
                </button>
              ))}
            </div>
            <button
              className="px-12 py-4 text-lg font-bold rounded-2xl bg-primary text-primary-foreground hover:opacity-90 active:opacity-80 transition-all duration-150 cursor-pointer border-none btn-3d"
              onClick={() => { markToday(); startGame() }}
            >
              Iniciar Juego
            </button>
          </div>
        ) : (
          <Feedback isCorrect={state.lastAnswerCorrect} note={state.currentNote} recovering={state.recovering} errorType={state.lastErrorType} />
        )}

        {state.phase === 'feedback' && (
          <div className="text-center mt-3 animate-slide-up">
            <button
              className="px-8 py-3 text-base font-semibold rounded-xl border-2 border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted active:bg-card transition-all duration-150 cursor-pointer btn-3d"
              onClick={() => { setHighlightKey(null); nextNote() }}
            >
              Siguiente Nota &rarr;
            </button>
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 h-2 z-30 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent, var(--stage-floor))' }} aria-hidden="true" />
    </div>
  )
}
