import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameState } from './hooks/useGameState'
import { useDailyStreak } from './hooks/useDailyStreak'
import { saveSession } from './utils/sessionHistory'
import { computeDashboardStats } from './utils/dashboardStats'
import { useMidi } from './hooks/useMidi'
import { useSound } from './hooks/useSound'
import { getLessonPool, LESSONS } from './data/lessons'
import Staff from './components/Staff'
import PianoKeyboard from './components/PianoKeyboard'
import Feedback from './components/Feedback'
import PracticeNavBar from './components/PracticeNavBar'
import AuthProvider from './hooks/useAuthProvider'
import { useAuth } from './hooks/useAuth'
import { useSessionSync } from './hooks/useSessionSync'
import { useConfigSync } from './hooks/useConfigSync'

import Toast from './components/Toast'
import InicioScreen from './screens/InicioScreen'
import DashboardScreen from './screens/DashboardScreen'
import BibliotecaScreen from './screens/BibliotecaScreen'
import PerfilScreen from './screens/PerfilScreen'
import ResultadosScreen from './screens/ResultadosScreen'

type Screen = 'inicio' | 'dashboard' | 'biblioteca' | 'perfil' | 'practica' | 'resultados'

const SENSEI_QUOTES = [
  'La repetición es la madre del aprendizaje — y el maestro del arte.',
  'Cada nota incorrecta es una lección disfrazada de error.',
  'La paciencia es la virtud del pianista que alcanza la maestría.',
  'No toques las notas, deja que ellas te toquen a ti.',
]

function AppContent() {
  const { state, startGame, submitAnswer, nextNote, setLesson, setSessionTarget, setShowNoteName, setMuted, setTimed, setTheme, setNotation, restartGame } = useGameState()
  const [highlightKey, setHighlightKey] = useState<number | null>(null)
  const [correctKey, setCorrectKey] = useState<number | null>(null)
  const [wrongKey, setWrongKey] = useState<number | null>(null)

  const [staffFlash, setStaffFlash] = useState<'correct' | 'wrong' | null>(null)
  const [trail, setTrail] = useState<Array<{ note: import('./types').Note; id: number }>>([])
  const trailIdRef = useRef(0)
  const [noteExpression, setNoteExpression] = useState<'happy' | 'sad' | null>(null)
  const { playNote, playCorrect, playWrong, playStreakMilestone, playLevelComplete } = useSound()
  const { dailyStreak, markToday } = useDailyStreak()
  const liveRegionRef = useRef<HTMLDivElement>(null)
  const { user, loading, signOut } = useAuth()
  const { syncState, saveSession: saveSessionCloud, migrateIfNeeded } = useSessionSync(user)
  const { config, updateConfig } = useConfigSync(user)
  const [isPaused, setIsPaused] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null)

  // Screen routing
  const [screen, setScreen] = useState<Screen>('inicio')
  const [isStarting, setIsStarting] = useState(false)

  // Skip welcome screen if user is already logged in
  useEffect(() => {
    if (!loading && user && screen === 'inicio') {
      setScreen('dashboard')
    }
  }, [loading, user, screen])

  const handleNavigate = (target: string) => setScreen(target as Screen)

  const handleStartGame = useCallback((target?: string) => {
    if (target) setLesson(target)
    markToday()
    startGame()
    setScreen('practica')
  }, [markToday, startGame, setLesson])

  const handleDeleteAccount = async () => {
    if (!user) return
    if (!window.confirm('¿Eliminar tu progreso de la nube? Esta acción no se puede deshacer.')) return
    try {
      const { deleteUserDoc } = await import('./firebase/firestore')
      await deleteUserDoc(user.uid)
      await signOut()
      setScreen('inicio')
      setToast({ message: 'Datos eliminados correctamente', type: 'success' })
    } catch {
      setToast({ message: 'Error al eliminar datos', type: 'error' })
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setScreen('inicio')
    } catch { /* noop */ }
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
  }, [config?.notation, config?.theme, config?.showNoteName, config?.timed, config?.sessionTarget, user?.uid])

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

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
  }, [state.theme])

  const { midiConnected } = useMidi(
    useCallback((midi: number) => {
      if (isPaused) return
      if (state.phase === 'waiting' || (state.phase === 'feedback' && state.recovering)) {
        submitAnswer(midi)
      }
    }, [state.phase, state.recovering, submitAnswer, isPaused])
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
    }
    return () => setNoteExpression(null)
  }, [state.phase, state.lastAnswerCorrect, state.currentNote])

  // Clear trail + answered notes on new game
  useEffect(() => {
    if (state.totalAttempts === 0 && state.phase === 'waiting') {
      setTrail([])
    }
  }, [state.totalAttempts, state.phase])

  // Sound effects + flash on answer
  useEffect(() => {
    if (state.phase === 'feedback' || state.phase === 'levelComplete') {
      if (state.lastAnswerCorrect) {
        if (!state.isMuted) playCorrect()
        setStaffFlash('correct')
        if (state.streak > 0 && state.streak % 5 === 0 && !state.isMuted) {
          playStreakMilestone()
        }
      } else {
        if (!state.isMuted) playWrong()
        navigator.vibrate?.(100)
        setStaffFlash('wrong')
      }
      if (state.phase === 'levelComplete' && !state.isMuted) {
        playLevelComplete()
      }
      const t = setTimeout(() => setStaffFlash(null), 600)
      return () => clearTimeout(t)
    }
  }, [state.phase])

  // Auto-advance after feedback
  useEffect(() => {
    if (state.phase === 'feedback' && state.currentNote) {
      setHighlightKey(state.currentNote.midi)
      const delay = state.lastAnswerCorrect === false ? 2500 : 1500
      const timer = setTimeout(() => {
        setHighlightKey(null)
        nextNote()
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [state.phase, state.recovering, state.lastAnswerCorrect])

  // Announce streak to screen readers
  useEffect(() => {
    if (state.streak > 0 && state.streak % 5 === 0 && liveRegionRef.current) {
      liveRegionRef.current.textContent = `Racha de ${state.streak}`
    }
  }, [state.streak])

  // Keyboard shortcuts: R=restart, P=pause, Space=next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return
      if (e.key === 'p' || e.key === 'P') { setIsPaused(p => !p); return }
      if (isPaused) return
      if (e.key === 'r' || e.key === 'R') restartGame()
      if (e.key === ' ' && state.phase === 'feedback') {
        e.preventDefault()
        if (state.lastAnswerCorrect === false && state.currentNote) playNote(state.currentNote.midi)
        nextNote()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.phase, state.lastAnswerCorrect, state.currentNote, nextNote, restartGame, playNote, isPaused])

  // Safety: if phase is waiting/feedback but no note, recover
  useEffect(() => {
    if ((state.phase === 'waiting' || state.phase === 'feedback') && !state.currentNote) {
      nextNote()
    }
  }, [state.phase, state.currentNote, nextNote])

  // Save session history on level complete
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
      if (isPaused) return
      tickRef.current += 1
      setTimerDisplay(duration - tickRef.current)
      if (tickRef.current >= duration) {
        clearInterval(interval)
        submitAnswer(-1)
      }
    }, 1000)
    return () => { clearInterval(interval) }
  }, [state.isTimed, state.phase, state.noteShownAt, isPaused])

  const handleKeyboardPlay = useCallback((note: { name: string; octave: number; midi: number }) => {
    if (isPaused) return
    if (state.phase === 'waiting' || (state.phase === 'feedback' && state.recovering)) {
      submitAnswer(note.midi)
    }
  }, [state.phase, state.recovering, submitAnswer, isPaused])

  const staffClass = staffFlash === 'correct'
    ? 'animate-flash-green'
    : staffFlash === 'wrong'
      ? 'animate-flash-red animate-shake'
      : ''

  const handleGuestEnter = () => {
    setIsStarting(true)
    setTimeout(() => { setScreen('dashboard'); setIsStarting(false) }, 600)
  }

  const handleGoogleSignIn = async () => {
    setIsStarting(true)
    try {
      await (await import('./firebase/auth')).signInWithGoogle()
      setScreen('dashboard')
    } catch { /* noop */ }
    setIsStarting(false)
  }

  const sessionStats = {
    score: Math.round(state.correctAttempts * 10 * (1 + state.bestStreak / 20)),
    notesPlayed: state.totalAttempts,
    accuracy: Math.round(accuracy),
    maxStreak: state.bestStreak,
    totalTime: state.startTime ? `${Math.round((Date.now() - state.startTime) / 1000)}s` : '0s',
    challengingNotes: [] as Array<{ note: string; octave: number }>,
    newBadges: Math.floor(state.bestStreak / 5),
  }

  const selectedLesson = currentLesson?.name ?? 'Líneas'

  // ── Render ──
  if (screen === 'inicio') {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <InicioScreen
          onSignInGoogle={handleGoogleSignIn}
          onEnterGuest={handleGuestEnter}
          isLoading={isStarting}
        />
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </div>
    )
  }

  if (screen === 'dashboard') {
    const dash = computeDashboardStats(state.lessonId, state.notation)
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <DashboardScreen
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onStartGame={() => handleStartGame()}
          lessonTypes={LESSONS.map(l => l.name)}
          selectedLesson={selectedLesson}
          onSelectLesson={(name) => {
            const lesson = LESSONS.find(l => l.name === name)
            if (lesson) setLesson(lesson.id)
          }}
          noteCount={state.sessionTarget}
          onSelectNoteCount={(n) => setSessionTarget(n)}
          timedMode={state.isTimed}
          onToggleTimed={() => setTimed(!state.isTimed)}
          stats={{
            streak: dailyStreak,
            score: dash.score,
            totalNotes: dash.totalNotes,
            goldBadges: dash.goldBadges,
            totalTime: dash.totalTime,
            weeklyPrecision: dash.weeklyPrecision,
            weeklyAccuracies: dash.weeklyAccuracies,
            practiceDays: dash.practiceDays,
            challengingNotes: dash.challengingNotes,
          }}
          roadmap={dash.roadmap}
          rank={dash.rank}
          senseiQuote={SENSEI_QUOTES[dash.userLevel % SENSEI_QUOTES.length]}
          userName={user?.displayName || user?.email?.split('@')[0] || 'Pianista'}
          userLevel={dash.userLevel}
          userAvatar={user?.photoURL || undefined}
        />
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </div>
    )
  }

  if (screen === 'biblioteca') {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <BibliotecaScreen
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onSelectLesson={(id) => setLesson(id)}
          onStartGame={() => handleStartGame()}
          userName={user?.displayName || user?.email?.split('@')[0] || 'Pianista'}
          userLevel={Math.floor(state.bestStreak / 10) + 1}
          userAvatar={user?.photoURL || undefined}
        />
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </div>
    )
  }

  if (screen === 'perfil') {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <PerfilScreen
          onNavigate={handleNavigate}
          userName={user?.displayName || 'Pianista'}
          userLevel={Math.floor(state.bestStreak / 10) + 1}
          userAvatar={user?.photoURL || undefined}
          stats={{ stars: state.correctAttempts, notesMastered: state.totalAttempts, streak: dailyStreak }}
          settings={{
            language: 'es',
            showAlphabetical: state.showNoteName,
            correctKeyFlash: true,
            incorrectKeyFlash: true,
            darkMode: state.theme === 'dark',
            difficulty: state.sessionTarget <= 5 ? 'facil' : state.sessionTarget <= 10 ? 'normal' : 'dificil',
          }}
          onSettingsChange={(s) => {
            setShowNoteName(s.showAlphabetical)
            setTheme(s.darkMode ? 'dark' : 'light')
          }}
          onDeleteAccount={handleDeleteAccount}
          onLogout={handleLogout}
        />
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </div>
    )
  }

  if (screen === 'resultados') {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <ResultadosScreen
          stats={sessionStats}
          onDashboard={() => setScreen('dashboard')}
          onRetry={() => { restartGame(); setScreen('practica') }}
          onNext={() => { startGame(); setScreen('practica') }}
        />
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </div>
    )
  }

  // ── PRACTICE SCREEN ──
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRegionRef} />

      <PracticeNavBar
        onBack={() => setScreen('dashboard')}
        isMuted={state.isMuted}
        onToggleMute={() => setMuted(!state.isMuted)}
        onRestart={() => restartGame()}
        theme={state.theme}
        onToggleTheme={setTheme}
        timerDisplay={timerDisplay}
        isTimed={state.isTimed}
        streak={state.streak}
        accuracy={accuracy}
        totalAttempts={state.totalAttempts}
        sessionTarget={state.sessionTarget}
        syncState={syncState}
        onDeleteAccount={handleDeleteAccount}
        midiConnected={midiConnected}
      />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 pt-24 pb-32 flex flex-col items-center">
        <h1 className="sr-only">Practicar: {selectedLesson}</h1>

        {/* Conductor's Stand */}
        <div className="perspective-stage w-full max-w-3xl mb-8">
          <div className="tilted-stand wood-texture rounded-t-3xl rounded-b-xl p-6 md:p-10 border-t-8 border-r-4 border-l-4 border-b-8 border-mahogany-dark/80 relative">
            <div className={`absolute inset-0 rounded-3xl transition-opacity duration-300 pointer-events-none mix-blend-overlay ${staffFlash === 'correct' ? 'opacity-100' : staffFlash === 'wrong' ? 'opacity-100' : 'opacity-0'}`} style={{ background: staffFlash === 'correct' ? 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(168,32,36,0.2) 0%, transparent 70%)' }} />
            <div className={`clay-surface rounded-xl p-4 sm:p-6 relative mx-auto w-full max-w-xl flex flex-col items-center justify-center min-h-[180px] transition-colors duration-300 ${staffClass}`}>
              <div className="mt-2 w-full">
                <Staff note={state.currentNote} showNoteName={state.showNoteName} lessonPool={getLessonPool(state.lessonId)} trail={trail} noteExpression={noteExpression} isMuted={state.isMuted} clef={clef} lastCorrectNote={state.lastCorrectNote} notation={state.notation} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-6 bg-mahogany-dark/90 rounded-b-xl border-t border-brass-highlight/20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]" />
          </div>
        </div>

        {/* Feedback */}
        <div className="w-full max-w-3xl px-4">
          <Feedback isCorrect={state.lastAnswerCorrect} note={state.currentNote} recovering={state.recovering} errorType={state.lastErrorType} notation={state.notation} />
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-3xl mt-6">
          <div className="flex justify-between items-center mb-2 px-2">
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-outline font-bold">Progreso</span>
            <span className="font-label-caps text-[10px] text-outline">{state.totalAttempts}/{state.sessionTarget}</span>
          </div>
          <div
            className="h-3 rounded-full clay-progress-bar overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round((state.totalAttempts / state.sessionTarget) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progreso: ${state.totalAttempts} de ${state.sessionTarget} notas`}
          >
            <div className="h-full rounded-full transition-all duration-500 ease-out clay-progress-fill" style={{ width: `${Math.min((state.totalAttempts / state.sessionTarget) * 100, 100)}%` }} />
          </div>
        </div>

        {/* Virtual Keyboard */}
        <div className="w-full max-w-3xl bg-surface-variant/50 p-4 rounded-3xl shadow-inner border border-outline-variant/40 mt-8">
          <div className="font-label-caps text-[10px] text-center text-outline uppercase tracking-widest font-bold mb-4">Select the matching key</div>
          <PianoKeyboard onPlayNote={handleKeyboardPlay} highlightKey={highlightKey} correctKey={correctKey} wrongKey={wrongKey} startMidi={keyboardStart} />
        </div>
      </main>

      {/* Pause Overlay */}
      {isPaused && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm gap-4"
          role="dialog"
          aria-modal="true"
          aria-label="Pausa"
          onKeyDown={(e) => { if (e.key === 'Escape') setIsPaused(false) }}
        >
          <button
            onClick={() => setIsPaused(false)}
            className="clay-btn-primary p-6 rounded-full shadow-lg cursor-pointer"
            aria-label="Reanudar"
            autoFocus
          >
            <span className="material-symbols-outlined text-brass-highlight" style={{ fontSize: '40px' }}>play_arrow</span>
          </button>
          <span className="font-title-md text-title-md text-on-surface-variant">Pausado</span>
        </div>
      )}

      {/* Level Complete → Results screen */}
      {state.phase === 'levelComplete' && (
        <ResultadosScreen
          stats={sessionStats}
          onDashboard={() => setScreen('dashboard')}
          onRetry={() => { restartGame(); setScreen('practica') }}
          onNext={() => { startGame(); setScreen('practica') }}
        />
      )}

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
