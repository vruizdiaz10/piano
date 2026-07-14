import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameState } from './hooks/useGameState'
import { useDailyStreak } from './hooks/useDailyStreak'
import { saveSession } from './utils/sessionHistory'
import { useMidi } from './hooks/useMidi'
import { useSound } from './hooks/useSound'
import { getLessonPool, LESSONS } from './data/lessons'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui/select'
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
import AuthProvider from './hooks/useAuthProvider'
import { useAuth } from './hooks/useAuth'
import { useSessionSync } from './hooks/useSessionSync'
import { useConfigSync } from './hooks/useConfigSync'
import UserMenu from './components/UserMenu'
import LoginModal from './components/LoginModal'
import Toast from './components/Toast'
import { Music } from 'lucide-react'

function AppContent() {
  const { state, startGame, submitAnswer, nextNote, setLesson, setShowNoteName, setMuted, setTimed, setTheme, setNotation, restartGame } = useGameState()
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
  const { user, signOut } = useAuth()
  const { syncState, saveSession: saveSessionCloud, migrateIfNeeded } = useSessionSync(user)
  const { config, updateConfig } = useConfigSync(user)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null)

  const handleDeleteAccount = async () => {
    if (!user) return
    if (!window.confirm('¿Eliminar tu progreso de la nube? Esta acción no se puede deshacer.')) return
    try {
      const { deleteUserDoc } = await import('./firebase/firestore')
      await deleteUserDoc(user.uid)
      await signOut()
      setToast({ message: 'Datos eliminados correctamente', type: 'success' })
    } catch {
      setToast({ message: 'Error al eliminar datos', type: 'error' })
    }
  }

  // First-login migration: localStorage → Firestore
  useEffect(() => {
    if (user && config) {
      migrateIfNeeded({
        notation: config.notation,
        theme: config.theme,
        timed: config.timed,
        showNoteName: config.showNoteName,
        sessionTarget: config.sessionTarget,
        dailyStreak: config.dailyStreak,
      })
    }
  }, [user?.uid, !!config])

  // Sync Firestore config → local state on login
  useEffect(() => {
    if (!config || !user) return
    if (config.notation !== state.notation) setNotation(config.notation)
    if (config.theme !== state.theme) setTheme(config.theme)
    if (config.showNoteName !== state.showNoteName) setShowNoteName(config.showNoteName)
    if (config.timed !== state.isTimed) setTimed(config.timed)
    if (config.sessionTarget !== state.sessionTarget) startGame(config.sessionTarget)
  }, [!!user, !!config])

  // Push local config changes to Firestore when logged in
  useEffect(() => {
    if (!user || !config) return
    updateConfig({
      notation: state.notation,
      theme: state.theme,
      showNoteName: state.showNoteName,
      timed: state.isTimed,
      sessionTarget: state.sessionTarget,
    })
  }, [state.notation, state.theme, state.showNoteName, state.isTimed, state.sessionTarget, !!user])

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

  // Safety: if phase is waiting/feedback but no note, recover
  useEffect(() => {
    if ((state.phase === 'waiting' || state.phase === 'feedback') && !state.currentNote) {
      nextNote()
    }
  }, [state.phase, state.currentNote, nextNote])

  // Save session history on level complete (localStorage + cloud if logged in)
  useEffect(() => {
    if (state.phase === 'levelComplete') {
      const session = { accuracy, notes: state.totalAttempts, lessonId: state.lessonId, date: new Date().toISOString(), elapsedMs: state.startTime ? Date.now() - state.startTime : undefined }
      saveSession(session)
      if (user) saveSessionCloud(session)
    }
  }, [state.phase, user])

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
      <a href="#game-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-card focus:text-foreground focus:rounded-lg focus:ring-2 focus:ring-ring">
        Saltar al juego
      </a>
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

        <div id="game-content" className="max-w-2xl mx-auto px-4 pt-20 pb-4 sm:pt-24 sm:pb-6 lg:pt-[68px] lg:pb-1 relative z-10">
          <div className="flex items-center justify-between mb-4 lg:mb-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Lectura Musical
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl bg-white/80 dark:bg-gray-700/80 border border-amber-200 dark:border-gray-600 p-1">
              <button
                onClick={() => setMuted(!state.isMuted)}
                className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-gray-600 text-amber-700 dark:text-amber-300 transition-all cursor-pointer relative"
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
              <div className="w-px h-5 bg-amber-200/50 dark:bg-gray-600" />
              <Select value={state.notation} onValueChange={(v: 'american' | 'latino') => setNotation(v)}>
                <SelectTrigger className="w-28 h-8 border-0 bg-transparent text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-gray-600 text-xs rounded-lg" aria-label="Notación musical">
                  <Music className="w-3.5 h-3.5 mr-1" />
                  <SelectValue placeholder="A B C D E" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="american">A B C D E</SelectItem>
                  <SelectItem value="latino">Do Re Mi Fa</SelectItem>
                </SelectContent>
              </Select>
              <div className="w-px h-5 bg-amber-200/50 dark:bg-gray-600" />
              <ThemeToggle theme={state.theme} onToggle={setTheme} className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-gray-600 text-amber-700 dark:text-amber-300 transition-all cursor-pointer" />
              <div className="w-px h-5 bg-amber-200/50 dark:bg-gray-600" />
              <UserMenu syncState={syncState} onDeleteAccount={handleDeleteAccount} />
            </div>
            <span
              className={`inline-block w-2 h-2 rounded-full ${midiConnected ? 'bg-emerald-500' : 'bg-red-400'}`}
              title={midiConnected ? 'MIDI: Conectado' : 'MIDI: Sin conexión'}
              role="img"
              aria-label={midiConnected ? 'MIDI conectado' : 'MIDI sin conexión'}
            />
          </div>
        </div>

        {state.phase !== 'idle' && (
          <div className="bg-card rounded-xl border border-border shadow-sm mb-2 lg:mb-3 overflow-hidden">
            <div className="px-3 py-1 lg:py-0.5 border-b border-border/50">
              <ProgressBar current={state.totalAttempts} total={state.sessionTarget} label="Progreso" />
            </div>
            <div className="flex items-center divide-x divide-border/50 text-xs sm:text-sm">
              <div className="flex items-center gap-2 px-3 py-2 lg:py-1.5 flex-1 justify-center">
                <StreakBadge streak={state.streak} />
                <StreakOwl streak={state.streak} />
              </div>
              <div className="px-3 py-2 lg:py-1.5 flex-1 text-center font-semibold">
                <ScoreDisplay accuracy={accuracy} totalAttempts={state.totalAttempts} timerDisplay={state.isTimed ? timerDisplay : undefined} isTimed={state.isTimed} />
              </div>
              <div className="px-3 py-2 lg:py-1.5 flex-1 text-center">
                <span className="text-muted-foreground">Intentos </span>
                <span className="text-destructive font-bold">{state.totalAttempts}</span>
              </div>
              {dailyStreak > 1 && (
                <div className="px-3 py-2 lg:py-1.5 flex-1 text-center">
                  <span className="text-xs">{'\uD83D\uDD25'} {dailyStreak}d</span>
                </div>
              )}
            </div>
          </div>
        )}

        {state.phase !== 'idle' && (
        <div className="game-layout flex flex-col">
          <div className="game-layout-staff">
            <OrnateFrame>
              <div className={`bg-card rounded-2xl border border-border p-3 sm:p-4 mb-3 lg:p-1.5 lg:mb-3 transition-colors duration-300 ${staffClass} ${sleepyClass}`}>
                <Toolbar
                  lessonId={state.lessonId}
                  showNoteName={state.showNoteName}
                  isTimed={state.isTimed}
                  onLessonChange={setLesson}
                  onShowNoteNameChange={setShowNoteName}
                  onTimedChange={setTimed}
                />
                <div className="mt-2 lg:mt-0.5">
                  <Staff note={state.currentNote} showNoteName={state.showNoteName} lessonPool={getLessonPool(state.lessonId)} trail={trail} noteExpression={noteExpression} isMuted={state.isMuted} clef={clef} lastCorrectNote={state.lastCorrectNote} notation={state.notation} />
                </div>
              </div>
            </OrnateFrame>

          </div>

          <div className="game-layout-keyboard">
            <div className="bg-card rounded-2xl border border-border p-3 mb-3 lg:p-1.5 lg:mb-2 transition-colors duration-300">
              <PianoKeyboard onPlayNote={handleKeyboardPlay} highlightKey={highlightKey} correctKey={correctKey} wrongKey={wrongKey} startMidi={keyboardStart} />
            </div>
          </div>
        </div>
        )}

        {state.phase === 'idle' ? (
          <div className="text-center animate-slide-up">
            <ProgressChart />
            <div className="flex justify-center gap-3 mb-4 lg:mb-1">
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
          <div className="max-sm:fixed max-sm:inset-x-0 max-sm:bottom-20 max-sm:z-30 max-sm:px-4">
            <Feedback isCorrect={state.lastAnswerCorrect} note={state.currentNote} recovering={state.recovering} errorType={state.lastErrorType} notation={state.notation} />
          </div>
        )}

        {state.phase === 'feedback' && (
          <div className="text-center mt-3 lg:mt-0">
            <button
              className="px-8 py-3 text-base font-semibold rounded-xl border-2 bg-[var(--gold-dim)]/20 border-[var(--gold)] text-amber-700 dark:text-amber-300 hover:bg-[var(--gold-dim)]/30 transition-all duration-150 cursor-pointer btn-3d"
              onClick={() => { setHighlightKey(null); nextNote() }}
            >
              Siguiente Nota &rarr;
            </button>
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 h-2 z-30 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent, var(--stage-floor))' }} aria-hidden="true" />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
