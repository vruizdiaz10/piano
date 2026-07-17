import { useState, useEffect, useRef } from 'react';
import type { QuickLessonConfig } from '../types'
import type { RankInfo, RoadmapStep } from '../utils/dashboardStats';
import type { Quote } from '../data/senseiQuotes';
import { weeklyAccuracyPath } from '../utils/dashboardStats';
import TopNavBar from '../components/TopNavBar';

interface DashboardProps {
  onNavigate: (target: string) => void;
  onLogout: () => void;
  onStartGame: () => void;
  lessonTypes: string[];
  selectedLesson: string;
  onSelectLesson: (lesson: string) => void;
  noteCount: number;
  onSelectNoteCount: (count: number) => void;
  timedMode: boolean;
  onToggleTimed: () => void;
  stats: {
    streak: number;
    score: string;
    totalNotes: string;
    goldBadges: number;
    totalTime: string;
    weeklyPrecision: number;
    weeklyAccuracies: Array<number | null>;
    practiceDays: boolean[];
    challengingNotes: string[];
  };
  roadmap: RoadmapStep[];
  rank: RankInfo;
  senseiQuote: Quote;
  userName?: string;
  userLevel?: number;
  userAvatar?: string;
  onQuickLesson?: (config: QuickLessonConfig) => void; // Added from task brief
}

const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function DashboardScreen({
  onNavigate,
  onLogout,
  onStartGame,
  lessonTypes,
  selectedLesson,
  onSelectLesson,
  noteCount,
  onSelectNoteCount,
  timedMode,
  onToggleTimed,
  stats,
  roadmap,
  rank,
  senseiQuote,
  userName = 'Pianista',
  userLevel = 1,
  userAvatar,
  onQuickLesson, // Added from task brief
}: DashboardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State for the new generator UI and onboarding banner
  const [config, setConfig] = useState<QuickLessonConfig>({
    clef: 'treble',
    lines: true,
    spaces: true,
    ledgerAbove: 0,
    ledgerBelow: 0,
    sharps: false,
    timed: true,
    noteCount: 20,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('piano-onboarding-seen');
  });

  useEffect(() => {
    if (!showDropdown) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDropdown])

  const chartPath = weeklyAccuracyPath(stats.weeklyAccuracies)
  const todayIdx = (() => {
    const d = new Date().getDay()
    return d === 0 ? 6 : d - 1 // Mon=0 … Sun=6
  })()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavBar
        activeScreen="dashboard"
        onNavigate={onNavigate}
        onLogout={onLogout}
        userName={userName}
        userLevel={userLevel}
        userAvatar={userAvatar}
      />

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-container-padding pt-28 pb-20 md:pb-stack-lg grid grid-cols-1 lg:grid-cols-12 gap-10"> {/* pb-20 added from task brief */}
        {/* Left Section */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* Session Config */}
          {/* Replaced "Elige tu Desafío" section with new Generator UI and Onboarding Banner */}
          {/* Onboarding Banner */}
          {showOnboarding && (
            <div className="clay-card p-4 flex items-center justify-between gap-4 border border-brass-highlight/30">
              <p className="text-body-sm text-on-surface-variant">
                <strong>Rápido</strong> = práctica personalizada. <strong>Camino</strong> = lecciones ordenadas en la biblioteca.
              </p>
              <button
                onClick={() => { localStorage.setItem('piano-onboarding-seen', '1'); setShowOnboarding(false); }}
                className="shrink-0 clay-input-key px-3 py-1 text-label-caps font-label-caps uppercase text-primary"
                aria-label="Cerrar aviso"
              >
                Entendido
              </button>
            </div>
          )}

          {/* Generador Rápido */}
          <section className="clay-card p-6 sm:p-8">
            <h3 className="font-headline-lg-mobile md:font-headline-lg text-foreground mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">bolt</span>
              Generador Rápido
            </h3>

            {/* Default controls */}
            <div className="space-y-4">
              {/* Clef selector */}
              <div>
                <label className="text-body-sm font-medium text-on-surface-variant mb-2 block">Clave</label>
                <div className="flex gap-2">
                  {(['treble', 'bass', 'both'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setConfig(prev => ({ ...prev, clef: c }))}
                      aria-pressed={config.clef === c}
                      aria-label={`Clave ${c === 'treble' ? 'Sol' : c === 'bass' ? 'Fa' : 'Ambas'}`}
                      className={`flex-1 py-2 rounded-xl text-title-md font-medium transition-all clay-input-key ${
                        config.clef === c ? 'bg-primary-container text-on-primary-container' : ''
                      }`}
                    >
                      {c === 'treble' ? 'Sol' : c === 'bass' ? 'Fa' : 'Ambas'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note count */}
              <div>
                <label className="text-body-sm font-medium text-on-surface-variant mb-2 block">Notas</label>
                <div className="flex gap-2">
                  {([5, 10, 20] as const).map(n => (
                    <button
                      key={n}
                      onClick={() => setConfig(prev => ({ ...prev, noteCount: n }))}
                      aria-pressed={config.noteCount === n}
                      aria-label={`${n} notas`}
                      className={`flex-1 py-2 rounded-xl text-title-md font-medium transition-all clay-input-key ${
                        config.noteCount === n ? 'bg-primary-container text-on-primary-container' : ''
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer toggle — using existing clay-switch */}
              <div className="flex items-center justify-between">
                <span className="text-body-md font-medium text-on-surface-variant">Cronómetro</span>
                <button
                  role="switch"
                  aria-checked={config.timed}
                  aria-label="Modo Cronometrado"
                  onClick={() => setConfig(prev => ({ ...prev, timed: !prev.timed }))}
                  className={`clay-switch ${config.timed ? 'on' : ''}`}
                >
                  <span className="clay-switch-knob" />
                </button>
              </div>
            </div>

            {/* Advanced toggle — using clay-input-key */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              aria-expanded={showAdvanced}
              className="w-full mt-4 py-2 clay-input-key flex items-center justify-center gap-1 text-primary"
            >
              <span className="font-label-caps text-label-caps uppercase">{showAdvanced ? 'Ocultar opciones' : 'Personalizar'}</span>
              <span className={`material-symbols-outlined text-sm transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {/* Advanced controls */}
            {showAdvanced && (
              <div className="mt-4 space-y-4 border-t border-outline-variant/30 pt-4">
                {/* Lines/Spaces — using clay-switch */}
                <div className="flex gap-4">
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-body-md font-medium text-on-surface-variant">Líneas</span>
                    <button
                      role="switch"
                      aria-checked={config.lines}
                      aria-label="Líneas"
                      onClick={() => setConfig(prev => ({ ...prev, lines: !prev.lines }))}
                      className={`clay-switch ${config.lines ? 'on' : ''}`}
                    >
                      <span className="clay-switch-knob" />
                    </button>
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-body-md font-medium text-on-surface-variant">Espacios</span>
                    <button
                      role="switch"
                      aria-checked={config.spaces}
                      aria-label="Espacios"
                      onClick={() => setConfig(prev => ({ ...prev, spaces: !prev.spaces }))}
                      className={`clay-switch ${config.spaces ? 'on' : ''}`}
                    >
                      <span className="clay-switch-knob" />
                    </button>
                  </div>
                </div>

                {(!config.lines && !config.spaces) && (
                  <p className="text-body-sm text-velvet-red text-center">Selecciona al menos líneas o espacios</p>
                )}

                {/* Ledger lines — w-12 h-12 steppers */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-body-sm font-medium text-on-surface-variant mb-2 block">Adic. arriba</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, ledgerAbove: Math.max(0, prev.ledgerAbove - 1) }))}
                        aria-label="Reducir adicionales arriba"
                        className="w-12 h-12 rounded-xl clay-input-key flex items-center justify-center text-lg"
                      >-</button>
                      <span className="flex-1 text-center text-title-md font-bold" aria-live="polite">{config.ledgerAbove}</span>
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, ledgerAbove: Math.min(3, prev.ledgerAbove + 1) }))}
                        aria-label="Aumentar adicionales arriba"
                        className="w-12 h-12 rounded-xl clay-input-key flex items-center justify-center text-lg"
                      >+</button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-body-sm font-medium text-on-surface-variant mb-2 block">Adic. abajo</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, ledgerBelow: Math.max(0, prev.ledgerBelow - 1) }))}
                        aria-label="Reducir adicionales abajo"
                        className="w-12 h-12 rounded-xl clay-input-key flex items-center justify-center text-lg"
                      >-</button>
                      <span className="flex-1 text-center text-title-md font-bold" aria-live="polite">{config.ledgerBelow}</span>
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, ledgerBelow: Math.min(3, prev.ledgerBelow + 1) }))}
                        aria-label="Aumentar adicionales abajo"
                        className="w-12 h-12 rounded-xl clay-input-key flex items-center justify-center text-lg"
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* Sharps — using clay-switch */}
                <div className="flex items-center justify-between">
                  <span className="text-body-md font-medium text-on-surface-variant">Sostenidos</span>
                  <button
                    role="switch"
                    aria-checked={config.sharps}
                    aria-label="Sostenidos"
                    onClick={() => setConfig(prev => ({ ...prev, sharps: !prev.sharps }))}
                    className={`clay-switch ${config.sharps ? 'on' : ''}`}
                  >
                    <span className="clay-switch-knob" />
                  </button>
                </div>
              </div>
            )}

            {/* Start button — using existing clay-btn-primary CTA */}
            <button
              onClick={() => onQuickLesson?.(config)} // Use new callback prop
              disabled={!config.lines && !config.spaces}
              className={`w-full mt-6 py-6 flex items-center justify-center gap-3 font-title-md text-title-md uppercase tracking-widest transition-all ${
                (!config.lines && !config.spaces)
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'clay-btn-primary text-brass-highlight'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              Practicar {/* Changed button label from "Iniciar Sesión" */}
            </button>
          </section>

          {/* Roadmap */}
          <section className="clay-card p-10 md:p-12">
            <div className="flex justify-between items-end mb-16 pb-6">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary italic">
                  HOJA DE RUTA
                </h2>
                <p className="font-body-sm text-body-sm text-outline italic mt-2">
                  Progreso actual en el conjunto de lecciones
                </p>
              </div>
              <button
                onClick={() => onNavigate('biblioteca')}
                className="clay-input-key px-5 py-3 font-label-caps text-[10px] uppercase text-primary font-bold hover:text-secondary transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">info</span> Detalles
              </button>
            </div>
            <div className="relative pl-8 md:pl-20 py-4">
              <svg className="absolute left-12 md:left-24 top-0 w-[calc(100%-60px)] h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,10 C40,10 60,90 100,90" fill="none" stroke="#d7c2ba" strokeDasharray="8,8" strokeWidth="3" strokeLinecap="round" />
              </svg>
              {roadmap.map((step, i) => {
                const isReverse = i % 2 === 1
                const isCurrent = step.status === 'current'
                const isDone = step.status === 'done'
                return (
                  <div
                    key={step.id}
                    className={`relative flex items-center z-10 ${i < roadmap.length - 1 ? 'mb-32' : ''} ${
                      isReverse ? 'flex-row-reverse justify-between w-full md:pr-12' : ''
                    }`}
                  >
                    <div
                      className={`${isReverse ? '' : 'absolute -left-16 md:-left-28'} w-20 h-20 ${
                        isCurrent ? 'w-24 h-24 rounded-3xl clay-icon-raised text-on-secondary-container border-2 border-on-secondary-container/30' : 'rounded-2xl clay-icon-dark text-brass-highlight'
                      } flex items-center justify-center transform ${isReverse ? 'rotate-3' : '-rotate-3'} ${
                        step.status === 'locked' ? 'opacity-40' : ''
                      }`}
                    >
                      <span className={`material-symbols-outlined ${isCurrent ? 'text-5xl' : 'text-4xl'}`}>
                        {isDone ? 'check_circle' : isCurrent ? 'piano' : 'lock'}
                      </span>
                    </div>
                    <div className={`${isReverse ? 'text-right' : ''} ${isCurrent ? 'w-full max-w-md' : ''}`}>
                      <span
                        className={`font-label-caps text-[10px] uppercase font-bold tracking-widest ${
                          isCurrent ? 'text-velvet-red' : 'text-outline-variant'
                        }`}
                      >
                        {isCurrent
                          ? `En progreso ${step.progress}%`
                          : isDone
                            ? `Paso ${String(i + 1).padStart(2, '0')} · Completado`
                            : `Paso ${String(i + 1).padStart(2, '0')} · Bloqueado`}
                      </span>
                      <h3 className="font-headline-lg text-3xl text-primary uppercase tracking-wide mt-1">{step.title}</h3>
                      <p
                        className={`font-body-sm text-body-sm text-on-surface-variant max-w-xs mt-2 leading-relaxed ${
                          isReverse ? 'ml-auto' : ''
                        } ${isCurrent ? 'mb-5' : ''}`}
                      >
                        {step.desc}
                      </p>
                      {isCurrent && (
                        <div
                          className="clay-progress-bar w-full h-3"
                          role="progressbar"
                          aria-valuenow={step.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Progreso: ${step.progress}%`}
                        >
                          <div className="clay-progress-fill" style={{ width: `${step.progress}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {roadmap.length === 0 && (
                <p className="font-body-sm text-outline italic">Completa una sesión para ver tu hoja de ruta.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Section */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Rango */}
          <div className="clay-card p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl clay-inner-panel flex items-center justify-center text-secondary border border-brass-highlight/50">
              <span className="material-symbols-outlined text-3xl">emoji_events</span>
            </div>
            <div className="flex-1">
              <p className="font-label-caps text-[10px] uppercase text-outline tracking-widest mb-1">Rango</p>
              <h3 className="font-title-md text-primary uppercase tracking-wide">{rank.name}</h3>
              <div
                className="clay-progress-bar h-2.5 mt-3"
                role="progressbar"
                aria-valuenow={rank.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Rango: ${rank.progress}%`}
              >
                <div className="clay-progress-fill" style={{ width: `${rank.progress}%` }} />
              </div>
            </div>
          </div>

          {/* Panel de Clavis */}
          <div className="clay-card p-8">
            <div className="flex justify-between items-center mb-8 pb-4">
              <h2 className="font-headline-lg text-2xl text-primary italic">PANEL DE CLAVIS</h2>
              <span className="clay-inner-panel px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase tracking-wider text-velvet-red text-[10px] font-bold border border-velvet-red/20">
                <span className="material-symbols-outlined text-[14px]">sensors</span> Live
              </span>
            </div>
            <div className="grid grid-cols-2 gap-5 mb-8">
              <div className="clay-input-key flex flex-col items-center justify-center p-6">
                <div className="w-10 h-10 rounded-full clay-inner-panel flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-secondary">local_fire_department</span>
                </div>
                <span className="font-headline-lg text-4xl font-bold text-primary mb-1">{stats.streak}</span>
                <span className="font-label-caps text-[9px] uppercase tracking-widest text-outline">Racha Diaria</span>
              </div>
              <div className="clay-input-key flex flex-col items-center justify-center p-6">
                <div className="w-10 h-10 rounded-full clay-inner-panel flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-secondary">stars</span>
                </div>
                <span className="font-headline-lg text-4xl font-bold text-primary mb-1">{stats.score}</span>
                <span className="font-label-caps text-[9px] uppercase tracking-widest text-outline">Puntaje</span>
              </div>
            </div>

            {/* Notas Desafiantes */}
            <div className="clay-inner-panel p-5 mb-8">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-velvet-red text-[18px]">warning</span>
                <span className="font-label-caps text-[11px] uppercase text-primary font-bold tracking-widest">Notas Desafiantes</span>
              </div>
              {stats.challengingNotes.length > 0 ? (
                <div className="flex justify-between px-3">
                  {stats.challengingNotes.map((note, i) => (
                    <div key={`${note}-${i}`} className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-sheet-cream shadow-sm relative flex flex-col justify-center gap-1.5 mb-3 border border-outline-variant/30">
                        <div className="w-8 mx-auto h-px bg-outline-variant" />
                        <div className="w-8 mx-auto h-px bg-outline-variant" />
                        <div className="w-8 mx-auto h-px bg-outline-variant" />
                        <div className="w-3.5 h-3.5 bg-primary rounded-full absolute shadow-sm" style={{
                          top: i === 0 ? '50%' : i === 1 ? 'auto' : '2px',
                          bottom: i === 1 ? '6px' : 'auto',
                          left: '50%',
                          transform: 'translateX(-50%)',
                        }} />
                      </div>
                      <span className="font-label-caps text-[10px] text-outline font-bold">{note}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body-sm text-outline italic text-center text-sm px-2">
                  Sin notas débiles aún. ¡Practica para descubrirlas!
                </p>
              )}
            </div>

            {/* Precisión Semanal */}
            <div className="clay-inner-panel p-5">
              <div className="flex justify-between items-center mb-5">
                <span className="font-label-caps text-[11px] uppercase text-primary font-bold tracking-widest">Precisión Semanal</span>
                <span className="font-label-caps text-[11px] text-on-secondary-container font-bold">{stats.weeklyPrecision}%</span>
              </div>
              <svg className="w-full h-16 overflow-visible" viewBox="0 0 100 30">
                <polyline
                  points={chartPath}
                  fill="none"
                  stroke="#785a1a"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>

          {/* Rendimiento */}
          <div className="clay-card p-8">
            <h3 className="font-label-caps text-[12px] uppercase text-primary font-bold tracking-widest mb-6 text-center">Rendimiento</h3>
            <div className="flex justify-between items-center mb-6">
              {WEEKDAY_LABELS.map((d, i) => {
                const practiced = stats.practiceDays[i]
                const isToday = i === todayIdx
                const isMissed = !practiced && i < todayIdx
                return (
                  <div
                    key={i}
                    title={practiced ? 'Practicaste' : isMissed ? 'Sin práctica' : isToday ? 'Hoy' : 'Pendiente'}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-label-caps text-[11px] ${
                      practiced
                        ? 'clay-icon-dark text-brass-highlight'
                        : isMissed
                          ? 'bg-error-container text-error shadow-inner border border-error/10'
                          : 'clay-inner-panel text-outline'
                    }`}
                  >
                    {d}
                  </div>
                )
              })}
            </div>
            <p className="text-center font-body-sm text-[13px] text-outline italic">
              &ldquo;{senseiQuote.text}&rdquo;
            </p>
            <p className="text-center font-label-caps text-[10px] text-outline mt-2">
              — {senseiQuote.author}
            </p>
          </div>

          {/* Sabiduría Musical */}
          <div className="clay-card-dark p-8 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full border-2 border-brass-highlight overflow-hidden mb-6 shadow-lg">
              {userAvatar ? (
                <img src={userAvatar} alt={`Avatar de ${userName}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-mahogany-dark flex items-center justify-center text-brass-highlight font-title-md" aria-hidden="true">
                  {userName.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="font-label-caps text-[11px] uppercase text-brass-highlight font-bold tracking-widest mb-4">
              Sabiduría Musical
            </h3>
            <div className="border-l-2 border-brass-highlight/50 pl-5 py-2">
              <p className="font-body-sm text-surface-bright italic opacity-90 leading-relaxed text-[15px]">
                &ldquo;{senseiQuote.text}&rdquo;
              </p>
              <p className="font-label-caps text-[11px] text-brass-highlight mt-3 tracking-wide">
                — {senseiQuote.author}
              </p>
            </div>
          </div>

          {/* Estadísticas Totales */}
          <div className="clay-card p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
              <span className="font-label-caps text-[11px] uppercase text-outline tracking-widest">Notas Tocadas</span>
              <span className="font-title-md text-primary text-xl">{stats.totalNotes}</span>
            </div>
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
              <span className="font-label-caps text-[11px] uppercase text-outline tracking-widest">Sellos de Oro</span>
              <span className="clay-input-key px-3 py-1 rounded-lg text-on-secondary-container text-sm font-bold border-none">{stats.goldBadges}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label-caps text-[11px] uppercase text-outline tracking-widest">Tiempo Total</span>
              <span className="font-headline-lg text-2xl text-primary">{stats.totalTime}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-sheet-cream/95 backdrop-blur-md border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex justify-around items-center py-2">
          {[
            { key: 'dashboard', icon: 'home', label: 'Inicio' },
            { key: 'biblioteca', icon: 'menu_book', label: 'Librería' },
            { key: 'perfil', icon: 'person', label: 'Perfil' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${ {/* py-2 applied from task brief */}
                item.key === 'dashboard'
                  ? 'text-primary'
                  : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{item.icon}</span>
              <span className="font-label-caps text-[9px] uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <footer className="w-full py-stack-lg px-container-padding flex flex-col md:flex-row justify-between items-center gap-4 bg-mahogany-dark shadow-[inset_0_10px_20px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <span className="font-headline-lg text-headline-lg text-surface-bright">Clavis</span>
        </div>
        <p className="font-body-sm text-body-sm text-outline-variant text-center md:text-left text-xs md:text-sm">
          © 18th Century Conservatory - Clavis Academy of Musical Excellence.
        </p>
      </footer>
    </div>
  );
}
