import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameState } from './hooks/useGameState'
import { useDailyStreak } from './hooks/useDailyStreak'
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
import ParticleCanvas from './components/ParticleCanvas'
import HitRipple from './components/HitRipple'
import LevelComplete from './components/LevelComplete'
import ThemeToggle from './components/ThemeToggle'
import OrnateFrame from './components/OrnateFrame'
import ConcertCurtains from './components/ConcertCurtains'
import ProgressChart from './components/ProgressChart'
import Spotlight from './components/Spotlight'
import ScoreFlyUp from './components/ScoreFlyUp'
import { Music } from 'lucide-react'
import AuthProvider from './hooks/useAuthProvider'
import { useAuth } from './hooks/useAuth'
import { useSessionSync } from './hooks/useSessionSync'
import { useConfigSync } from './hooks/useConfigSync'
import UserMenu from './components/UserMenu'
import LoginModal from './components/LoginModal'
import Toast from './components/Toast'

function AppContent() {
  const { user, signOut } = useAuth()
  const { syncState, saveSession: saveSessionCloud, migrateIfNeeded } = useSessionSync(user)
  const { config, updateConfig } = useConfigSync(user)
  const { state, startGame, submitAnswer, nextNote, setLesson, setShowNoteName, setMuted, setTimed, setTheme, setNotation, restartGame } = useGameState()
  const [highlightKey, setHighlightKey] = useState<number | null>(null)
  const [correctKey, setCorrectKey] = useState<number | null>(null)
  const [wrongKey, setWrongKey] = useState<number | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [staffFlash, setStaffFlash] = useState<'correct' | 'wrong' | null>(null)
  const [scoreFlyUp, setScoreFlyUp] = useState(false)
  const [scoreFlyCorrect, setScoreFlyCorrect] = useState(true)
  const [wrongFlash, setWrongFlash] = useState(false)
  const [noteTrigger, setNoteTrigger] = useState(0)
  const [trail, setTrail] = useState<Array<{ note: import('./types').Note; id: number }>>([])
  const trailIdRef = useRef(0)
  const [noteExpression, setNoteExpression] = useState<'happy' | 'sad' | null>(null)
  const [themeTransition, setThemeTransition] = useState(false)
  const [answeredNotes, setAnsweredNotes] = useState<number[]>([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null)
  const { playNote, playCorrect, playWrong, playStreakMilestone, playLevelComplete } = useSound()
  const { dailyStreak, markToday } = useDailyStreak()
  const liveRegionRef = useRef<HTMLDivElement>(null)

  const handleDeleteAccount = async () => {
    if (!user) return
    const confirmed = window.confirm('¿Eliminar tu progreso de la nube? Esta acción no se puede deshacer.')
    if (!confirmed) return
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
      setNoteTrigger(prev => prev + 1)
      if (state.lastAnswerCorrect) {
        if (!state.isMuted) playCorrect()
        setShowConfetti(true)
        setStaffFlash('correct')
        setScoreFlyUp(true)
        setScoreFlyCorrect(true)
        setTimeout(() => setShowConfetti(false), 1500)
        setTimeout(() => setScoreFlyUp(false), 100)
        if (state.streak > 0 && state.streak % 5 === 0 && !state.isMuted) {
          playStreakMilestone()
        }
      } else {
        if (!state.isMuted) playWrong()
        setStaffFlash('wrong')
        setScoreFlyUp(true)
        setScoreFlyCorrect(false)
        setWrongFlash(true)
        setTimeout(() => setScoreFlyUp(false), 100)
        setTimeout(() => setWrongFlash(false), 400)
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
  }, [state.phase, state.recovering, state.lastAnswerCorrect, state.noteShownAt])

  // Safety: if phase is waiting/feedback but no note, recover
  useEffect(() => {
    if ((state.phase === 'waiting' || state.phase === 'feedback') && !state.currentNote) {
      nextNote()
    }
  }, [state.phase, state.currentNote, nextNote])

  // Announce streak to screen readers
  useEffect(() => {
    if (state.streak > 0 && state.streak % 5 === 0 && liveRegionRef.current) {
      liveRegionRef.current.textContent = `Racha de ${state.streak}`
    }
  }, [state.streak])

  // Save session history on level complete
  useEffect(() => {
    if (state.phase === 'levelComplete') {
      saveSessionCloud({ accuracy, notes: state.totalAttempts, lessonId: state.lessonId, date: new Date().toISOString(), elapsedMs: state.startTime ? Date.now() - state.startTime : undefined })
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
        background: `
          radial-gradient(ellipse at 50% 20%, rgba(0, 212, 255, 0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(178, 75, 243, 0.04) 0%, transparent 40%),
          linear-gradient(180deg, var(--stage-bg) 0%, var(--stage-floor) 100%)
        `,
      }}>
      <ParticleCanvas active={showConfetti} streak={state.streak} />
      <ScoreFlyUp active={scoreFlyUp} isCorrect={scoreFlyCorrect} streak={state.streak} />
      {wrongFlash && <div className="fixed inset-0 z-40 pointer-events-none screen-wrong-flash" aria-hidden="true" />}
      {state.streak >= 3 && <div className="combo-glow" data-combo={state.streak >= 10 ? 'furious' : state.streak >= 5 ? 'hot' : 'warm'} aria-hidden="true" />}
      <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRegionRef} />
      <div className="stage-mote" aria-hidden="true" />
      <div className="stage-mote" aria-hidden="true" />
      <div className="stage-mote" aria-hidden="true" />
      <div className="stage-mote" aria-hidden="true" />
      <div className="stage-mote" aria-hidden="true" />
      <div className="bokeh-orb" style={{ left: '15%', top: '20%', width: 80, height: 80, animationDelay: '0s' }} aria-hidden="true" />
      <div className="bokeh-orb" style={{ left: '75%', top: '60%', width: 120, height: 120, animationDelay: '3s' }} aria-hidden="true" />
      <div className="bokeh-orb" style={{ left: '50%', top: '80%', width: 60, height: 60, animationDelay: '6s' }} aria-hidden="true" />
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
          <h1 className="text-xl sm:text-2xl font-display font-black text-neon-blue tracking-wider uppercase"
              style={{ textShadow: '0 0 10px var(--glow-blue), 0 0 40px rgba(0,212,255,0.15)' }}>
            Lectura Musical
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl bg-[var(--stage-surface)]/90 border border-neon-blue/20 p-1 backdrop-blur-sm">
              <button
                onClick={() => setMuted(!state.isMuted)}
                className="p-1.5 rounded-lg hover:bg-neon-blue/10 text-neon-cyan transition-all cursor-pointer relative"
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
              <div className="w-px h-5 bg-neon-blue/20" />
              <Select value={state.notation} onValueChange={(v: 'american' | 'latino') => setNotation(v)}>
                <SelectTrigger className="w-28 h-8 border-0 bg-transparent text-neon-cyan hover:bg-neon-blue/10 text-xs rounded-lg">
                  <Music className="w-3.5 h-3.5 mr-1" />
                  <SelectValue placeholder="A B C D E" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="american">A B C D E</SelectItem>
                  <SelectItem value="latino">Do Re Mi Fa</SelectItem>
                </SelectContent>
              </Select>
              <div className="w-px h-5 bg-neon-blue/20" />
              <ThemeToggle theme={state.theme} onToggle={setTheme} className="p-1.5 rounded-lg hover:bg-neon-blue/10 text-neon-cyan transition-all cursor-pointer" />
              <div className="w-px h-5 bg-neon-blue/20" />
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
          <div className="bg-[var(--stage-surface)] rounded-2xl border border-neon-blue/15 mb-2 lg:mb-3 overflow-hidden"
               style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(0,212,255,0.08)' }}>
            <div className="px-3 py-1 lg:py-0.5 border-b border-neon-blue/10">
              <ProgressBar current={state.totalAttempts} total={state.sessionTarget} label="Progreso" />
            </div>
            <div className="flex items-center divide-x divide-neon-blue/10 text-xs sm:text-sm">
              <div className="flex items-center gap-2 px-3 py-2 lg:py-1.5 flex-1 justify-center">
                <StreakBadge streak={state.streak} />
                <StreakOwl streak={state.streak} />
              </div>
              <div className="px-3 py-2 lg:py-1.5 flex-1 text-center font-semibold">
                <ScoreDisplay accuracy={accuracy} totalAttempts={state.totalAttempts} timerDisplay={state.isTimed ? timerDisplay : undefined} isTimed={state.isTimed} />
              </div>
              <div className="px-3 py-2 lg:py-1.5 flex-1 text-center">
                <span className="text-neon-blue/50">Intentos </span>
                <span className="text-neon-pink font-bold">{state.totalAttempts}</span>
              </div>
              {dailyStreak > 1 && (
                <div className="px-3 py-2 lg:py-1.5 flex-1 text-center">
                  <span className="text-xs text-neon-amber">{'\uD83D\uDD25'} {dailyStreak}d</span>
                </div>
              )}
            </div>
          </div>
        )}

        {state.phase !== 'idle' && (
        <div className="game-layout flex flex-col">
          <div className="game-layout-staff">
            <OrnateFrame>
              <div className={`bg-[var(--stage-surface)] rounded-2xl border border-neon-purple/20 p-3 sm:p-4 mb-3 lg:p-1.5 lg:mb-3 transition-colors duration-300 ${staffClass} ${sleepyClass}`}
                   style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 1px rgba(178,75,243,0.3)' }}>
                <Toolbar
                  lessonId={state.lessonId}
                  showNoteName={state.showNoteName}
                  isTimed={state.isTimed}
                  onLessonChange={setLesson}
                  onShowNoteNameChange={setShowNoteName}
                  onTimedChange={setTimed}
                />
                <div className="mt-2 lg:mt-0.5 relative">
                  <HitRipple isCorrect={state.lastAnswerCorrect} noteTrigger={noteTrigger} />
                  <Staff note={state.currentNote} showNoteName={state.showNoteName} lessonPool={getLessonPool(state.lessonId)} trail={trail} noteExpression={noteExpression} isMuted={state.isMuted} clef={clef} lastCorrectNote={state.lastCorrectNote} notation={state.notation} />
                </div>
              </div>
            </OrnateFrame>

          </div>

          <div className="game-layout-keyboard">
            <div className="bg-[var(--stage-surface)] rounded-2xl border border-neon-blue/15 p-3 mb-3 lg:p-1.5 lg:mb-2 transition-colors duration-300"
                 style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 1px rgba(0,212,255,0.3)' }}>
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
                  className={`px-5 py-2 rounded-full font-semibold transition-all cursor-pointer border text-sm font-display tracking-wide ${
                    state.sessionTarget === n
                      ? 'bg-neon-blue/15 text-neon-cyan border-neon-blue/60'
                      : 'bg-[var(--stage-surface)] text-neon-blue/60 border-neon-blue/20 hover:text-neon-cyan hover:border-neon-blue/40'
                  }`}
                  style={state.sessionTarget === n ? { boxShadow: '0 0 12px rgba(0,212,255,0.2)' } : undefined}
                  onClick={() => { markToday(); startGame(n) }}
                >
                  {n} notas
                </button>
              ))}
            </div>
            <button
              className="px-12 py-4 text-lg font-display font-bold rounded-2xl transition-all duration-150 cursor-pointer border border-neon-cyan/40 text-neon-cyan hover:border-neon-cyan/70"
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(178,75,243,0.1))',
                boxShadow: '0 0 20px rgba(0,212,255,0.15), 0 8px 32px rgba(0,0,0,0.3)',
              }}
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
              className="px-8 py-3 text-base font-display font-semibold rounded-xl border-2 border-neon-amber/50 text-neon-amber hover:bg-neon-amber/10 transition-all duration-150 cursor-pointer"
              style={{ boxShadow: '0 0 12px rgba(255,184,0,0.1)' }}
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
