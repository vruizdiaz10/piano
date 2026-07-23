import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameState } from './hooks/useGameState'
import { useDailyStreak } from './hooks/useDailyStreak'
import { saveSession, getSessions } from './utils/sessionHistory'
import { computeDashboardStats, rankFromLevel } from './utils/dashboardStats'
import { useMidi } from './hooks/useMidi'
import { useSound } from './hooks/useSound'
import { buildCustomPool } from './utils/notePool'
import type { QuickLessonConfig } from './types'
import { LESSONS } from './data/lessons'
import Staff from './components/Staff'
import PianoKeyboard from './components/PianoKeyboard'
import OctaveBar from './components/OctaveBar'
import Feedback from './components/Feedback'
import PracticeNavBar from './components/PracticeNavBar'
import AuthProvider from './hooks/useAuthProvider'
import { useAuth } from './hooks/useAuth'
import { useSessionSync } from './hooks/useSessionSync'
import { useConfigSync } from './hooks/useConfigSync'
import { useQuoteHistory } from './hooks/useQuoteHistory'


import Toast from './components/Toast'
import InicioScreen from './screens/InicioScreen'
import DashboardScreen from './screens/DashboardScreen'
import BibliotecaScreen from './screens/BibliotecaScreen'
import PerfilScreen from './screens/PerfilScreen'
import ResultadosScreen from './screens/ResultadosScreen'

type Screen = 'inicio' | 'dashboard' | 'biblioteca' | 'perfil' | 'practica' | 'resultados'

function AppContent() {
  const { state, startGame, submitAnswer, nextNote, setLesson, setSessionTarget, setShowNoteName, setMuted, setTimed, setNotation, restartGame, setClef } = useGameState()
  const [highlightKey, setHighlightKey] = useState<number | null>(null)
  const [correctKey, setCorrectKey] = useState<number | null>(null)
  const [wrongKey, setWrongKey] = useState<number | null>(null)
  const [lastSequentialLesson, setLastSequentialLesson] = useState<string>('lines')
  const sessions = getSessions()

  const [staffFlash, setStaffFlash] = useState<'correct' | 'wrong' | null>(null)
  const [trail, setTrail] = useState<Array<{ note: import('./types').Note; id: number }>>([])
  const trailIdRef = useRef(0)
  const [noteExpression, setNoteExpression] = useState<'happy' | 'sad' | null>(null)
  const [octaveBarVisible, setOctaveBarVisible] = useState(false)
  const [octaveShift, setOctaveShift] = useState(0)
  const { playNote, playCorrect, playWrong, playStreakMilestone, playLevelComplete } = useSound()
  const { dailyStreak, markToday } = useDailyStreak()
  const liveRegionRef = useRef<HTMLDivElement>(null)

  // Save/restore user prefs around quick lessons (prevent Firestore overwrite)
  const [savedSettings, setSavedSettings] = useState<{ target: number; timed: boolean } | null>(null)

  const { user, loading, signOut } = useAuth()
  const { saveSession: saveSessionCloud, migrateIfNeeded } = useSessionSync(user)
  const { config, updateConfig } = useConfigSync(user)
  const { quote: currentQuote, nextQuote } = useQuoteHistory(user)

  const handleQuickLesson = useCallback((config: QuickLessonConfig) => {
    setSavedSettings({ target: state.sessionTarget, timed: state.isTimed })
    updateConfig({ quickLessonConfig: config })
    setLesson('custom')
    setClef(config.clef)
    setTimed(config.timed)
    const pool = buildCustomPool(config)
    startGame(config.noteCount, pool)
    setScreen('practica')
  }, [state.sessionTarget, state.isTimed, setLesson, setClef, setTimed, startGame, updateConfig])
  const [isPaused, setIsPaused] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null)

  // Screen routing
  const [screen, setScreen] = useState<Screen>('inicio')
  const [isStarting, setIsStarting] = useState(false)

  // Skip welcome screen if user is already logged in
  useEffect(() => {
    if (!loading && user && screen === 'inicio') {
      nextQuote()
      setScreen('dashboard')
    }
  }, [loading, user, screen])

  const handleNavigate = (target: string) => setScreen(target as Screen)

  const handleStartGame = useCallback((target?: string, lessonId?: string) => {
    const id = lessonId ?? target ?? lastSequentialLesson
    const lesson = LESSONS.find(l => l.id === id)
    if (lesson) {
      setLesson(id)
      setClef(lesson.clef)
      setLastSequentialLesson(id)
    }
    markToday()
    startGame()
    setScreen('practica')
  }, [markToday, startGame, setLesson, setClef, lastSequentialLesson])

  const handleNextLesson = useCallback(() => {
    const current = LESSONS.find(l => l.id === state.lessonId)
    if (!current) return handleStartGame()
    const sameClef = LESSONS.filter(l => l.clef === current.clef)
    const idx = sameClef.findIndex(l => l.id === current.id)
    const next = sameClef[(idx + 1) % sameClef.length]
    setLesson(next.id)
    setClef(next.clef)
    markToday()
    startGame()
    setScreen('practica')
  }, [state.lessonId, markToday, startGame, setLesson, setClef, handleStartGame])

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

  useEffect(() => {
    if (screen === 'dashboard' && savedSettings) {
      setSessionTarget(savedSettings.target)
      setTimed(savedSettings.timed)
      setClef('treble') // reset to default for sequential
      setSavedSettings(null)
    }
  }, [screen, savedSettings, setSessionTarget, setTimed, setClef])

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
    if (state.lessonId === 'custom') return  // skip during quick lessons
    if (config.notation !== state.notation) setNotation(config.notation)
    if (config.showNoteName !== state.showNoteName) setShowNoteName(config.showNoteName)
    if (config.timed !== state.isTimed) setTimed(config.timed)
    if (config.sessionTarget !== state.sessionTarget) startGame(config.sessionTarget)
  }, [config?.notation, config?.showNoteName, config?.timed, config?.sessionTarget, user?.uid])

  // Push local config changes to Firestore when logged in
  useEffect(() => {
    if (!user || !config) return
    if (state.lessonId === 'custom') return  // skip during quick lessons
    updateConfig({
      notation: state.notation,
      showNoteName: state.showNoteName,
      timed: state.isTimed,
      sessionTarget: state.sessionTarget,
    })
  }, [state.notation, state.showNoteName, state.isTimed, state.sessionTarget, !!user])

  const currentLesson = LESSONS.find(l => l.id === state.lessonId)
  const clef =
    state.clef === 'both'
      ? (state.currentNote && state.currentNote.midi <= 60 ? 'bass' : 'treble')
      : (currentLesson?.clef ?? state.clef ?? 'treble')
  const baseKeyboardStart = state.clef === 'both' ? 36 : (currentLesson?.clef === 'bass' ? 36 : 48)
  const keyboardStart = baseKeyboardStart + octaveShift * 12

  const accuracy = state.totalAttempts > 0 ? (state.correctAttempts / state.totalAttempts) * 100 : 0

  const { midiConnected } = useMidi(
    useCallback((midi: number) => {
      if (isPaused) return
      if (state.phase === 'waiting' || (state.phase === 'feedback' && state.recovering)) {
        submitAnswer(midi - octaveShift * 12)
      }
    }, [state.phase, state.recovering, submitAnswer, isPaused, octaveShift])
  )

  useEffect(() => {
    if (state.currentNote && (state.phase === 'waiting' || state.phase === 'feedback') && !state.isMuted) {
      playNote(state.currentNote.midi)
    }
  }, [state.currentNote, state.phase, playNote, state.isMuted])

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
        if (state.lastAnswerCorrect === false && state.currentNote && !state.isMuted) playNote(state.currentNote.midi)
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
  const phaseRef = useRef(state.phase)
  phaseRef.current = state.phase
  const [timerDisplay, setTimerDisplay] = useState(5)
  useEffect(() => {
    tickRef.current = 0
    const duration = state.sessionTarget > 10 ? 8 : 5
    setTimerDisplay(duration)
    if (!state.isTimed || state.phase !== 'waiting') return
    const interval = setInterval(() => {
      if (isPaused || phaseRef.current !== 'waiting') return
      tickRef.current += 1
      console.log('Timer tick: ', tickRef.current, ' duration: ', duration);
      setTimerDisplay(duration - tickRef.current)
      if (tickRef.current >= duration) {
        console.log('Timer expired, submitting -1');
        clearInterval(interval)
        submitAnswer(-1)
      }
    }, 1000)
    return () => { clearInterval(interval) }
  }, [state.isTimed, state.phase, state.noteShownAt, isPaused, state.sessionTarget, submitAnswer])

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
    setTimeout(() => { nextQuote(); setScreen('dashboard'); setIsStarting(false) }, 600)
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
    const dash = computeDashboardStats(lastSequentialLesson, state.notation)
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <DashboardScreen
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onStartGame={handleStartGame}
          onQuickLesson={handleQuickLesson}
          savedQuickLessonConfig={config?.quickLessonConfig}
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
          rank={rankFromLevel(Math.floor(state.bestStreak / 10) + 1)}
          senseiQuote={currentQuote}
          userName={user?.displayName || user?.email?.split('@')[0] || 'Pianista'}
          userLevel={Math.floor(state.bestStreak / 10) + 1}
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
          onStartGame={handleStartGame}
          userName={user?.displayName || user?.email?.split('@')[0] || 'Pianista'}
          userLevel={Math.floor(state.bestStreak / 10) + 1}
          userAvatar={user?.photoURL || undefined}
          sessions={sessions}
        />
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </div>
    )
  }

  if (screen === 'perfil') {
    // Compute profile stats from session history
    const sessions = getSessions()
    const totalNotes = sessions.reduce((sum, s) => sum + (s.notes || 0), 0)
    const totalMs = sessions.reduce((sum, s) => sum + (s.elapsedMs || 0), 0)
    const firstSessionDate = sessions.length > 0
      ? new Date(sessions[sessions.length - 1].date)
      : null
    const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
    const formatTime = (ms: number) => {
      if (ms <= 0) return '0s'
      const sec = Math.floor(ms / 1000)
      const h = Math.floor(sec / 3600)
      const m = Math.floor((sec % 3600) / 60)
      if (h > 0) return `${h}h ${m}m`
      if (m > 0) return `${m}m`
      return `${sec}s`
    }
    const formatDate = (d: Date) => {
      const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    }

    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <PerfilScreen
          onNavigate={handleNavigate}
          userName={user?.displayName || 'Pianista'}
          userLevel={Math.floor(state.bestStreak / 10) + 1}
          userAvatar={user?.photoURL || undefined}
          stats={{ stars: state.correctAttempts, notesMastered: state.totalAttempts, streak: dailyStreak }}
          notation={state.notation}
          onNotationChange={setNotation}
          profileStats={{
            totalNotes: formatNumber(totalNotes),
            totalTime: formatTime(totalMs),
            firstSession: firstSessionDate ? formatDate(firstSessionDate) : 'Sin datos',
          }}
          settings={{
            difficulty: state.sessionTarget <= 5 ? 'facil' : state.sessionTarget <= 10 ? 'normal' : 'dificil',
          }}
          onSettingsChange={(s) => {
            const target = s.difficulty === 'facil' ? 5 : s.difficulty === 'normal' ? 10 : 20
            setSessionTarget(target)
            updateConfig({ sessionTarget: target })
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
          onNext={state.lessonId === 'custom' ? undefined : handleNextLesson}
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
        onProfile={() => setScreen('perfil')}
        streak={state.streak}
        accuracy={accuracy}
        totalAttempts={state.totalAttempts}
        sessionTarget={state.sessionTarget}
        userLevel={Math.floor(state.bestStreak / 10) + 1}
      />

      {/* Main Content */}
      <main className="h-screen w-full max-w-[1200px] mx-auto px-6 pt-20 pb-4 flex flex-col items-center overflow-hidden">
        <h1 className="sr-only">Practicar: {selectedLesson}</h1>

        {/* Conductor's Stand */}
        <div className="perspective-stage w-full max-w-3xl mb-2 shrink-0">
          <div className="tilted-stand wood-texture rounded-t-3xl rounded-b-xl p-4 md:p-6 border-t-8 border-r-4 border-l-4 border-b-8 border-mahogany-dark/80 relative">
            <div className={`absolute inset-0 rounded-3xl transition-opacity duration-300 pointer-events-none mix-blend-overlay ${staffFlash === 'correct' ? 'opacity-100' : staffFlash === 'wrong' ? 'opacity-100' : 'opacity-0'}`} style={{ background: staffFlash === 'correct' ? 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(168,32,36,0.2) 0%, transparent 70%)' }} />
            <div className={`clay-surface rounded-xl p-3 sm:p-4 relative mx-auto w-full max-w-xl flex flex-col items-center justify-center min-h-[140px] transition-colors duration-300 ${staffClass}`}>
              <div className="w-full">
                <Staff note={state.currentNote} showNoteName={state.showNoteName} trail={trail} noteExpression={noteExpression} isMuted={state.isMuted} clef={clef} lastCorrectNote={state.lastCorrectNote} notation={state.notation} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-4 bg-mahogany-dark/90 rounded-b-xl border-t border-brass-highlight/20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]" />
          </div>
        </div>

        {/* Feedback — fixed height to prevent keyboard layout shift */}
        <div className="w-full max-w-3xl px-4 h-16 overflow-hidden flex items-start justify-center shrink-0">
          <Feedback isCorrect={state.lastAnswerCorrect} note={state.currentNote} recovering={state.recovering} errorType={state.lastErrorType} notation={state.notation} />
        </div>

        {/* Octave Bar — toggleable manual octave shift */}
        {octaveBarVisible && (
          <div className="w-full max-w-3xl shrink-0">
            <OctaveBar shift={octaveShift} onShiftChange={setOctaveShift} baseStart={baseKeyboardStart} />
          </div>
        )}

        {/* Progress bar */}
        <div className="w-full max-w-3xl mt-2 shrink-0">
          <div className="flex justify-between items-center mb-1 px-2">
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-outline font-bold">Progreso</span>
            <span className="font-label-caps text-[10px] text-outline">{state.totalAttempts}/{state.sessionTarget}</span>
          </div>
          <div
            className="h-2 rounded-full clay-progress-bar overflow-hidden"
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
        <div className="w-full max-w-3xl bg-surface-variant/50 p-3 rounded-3xl shadow-inner border border-outline-variant/40 mt-3">
          <div className="font-label-caps text-[10px] text-center text-outline uppercase tracking-widest font-bold mb-2">Selecciona la tecla correcta</div>
          <PianoKeyboard onPlayNote={handleKeyboardPlay} highlightKey={highlightKey} correctKey={correctKey} wrongKey={wrongKey} startMidi={keyboardStart} />
        </div>

        {/* Lesson Controls */}
        <div className="w-full max-w-3xl flex items-center justify-center gap-6 mt-2 shrink-0">
          <div className="flex items-center gap-2 clay-inner-panel px-3 py-2 rounded-full" aria-label={midiConnected ? 'MIDI: Conectado' : 'MIDI: Sin conexión'}>
            <span className={`w-2.5 h-2.5 rounded-full ${midiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="material-symbols-outlined text-sm text-primary">piano</span>
            <span className="font-label-caps text-[9px] uppercase tracking-widest text-primary">{midiConnected ? 'MIDI' : 'Sin MIDI'}</span>
          </div>
          <ControlButton
            icon={state.isMuted ? 'volume_off' : 'volume_up'}
            label={state.isMuted ? 'Sonido' : 'Silenciar'}
            onClick={() => setMuted(!state.isMuted)}
            active={state.isMuted}
          />
          <ControlButton
            icon="history"
            label="Reiniciar"
            onClick={() => restartGame()}
          />
          <ControlButton
            icon="text_fields"
            label={state.showNoteName ? 'Ocultar nota' : 'Mostrar nota'}
            onClick={() => setShowNoteName(!state.showNoteName)}
            active={state.showNoteName}
          />
          <ControlButton
            icon="graphic_eq"
            label={octaveBarVisible ? 'Ocultar octava' : 'Octava'}
            onClick={() => setOctaveBarVisible(!octaveBarVisible)}
            active={octaveBarVisible}
          />
          {state.isTimed && (
            <div className="flex items-center gap-2 clay-inner-panel px-3 py-2 rounded-full">
              <span className="material-symbols-outlined text-sm text-primary">timer</span>
              <span className="font-title-sm text-primary">{timerDisplay}s</span>
            </div>
          )}
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
          onNext={state.lessonId === 'custom' ? undefined : handleNextLesson}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  )
}

function ControlButton({ icon, label, onClick, active }: { icon: string; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
      aria-label={label}
    >
      <span className="clay-inner-panel w-10 h-10 rounded-full flex items-center justify-center">
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 20 }}>{icon}</span>
      </span>
      <span className="font-label-caps text-[9px] uppercase tracking-widest">{label}</span>
    </button>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
