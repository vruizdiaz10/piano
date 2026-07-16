import { useState, useEffect, useRef } from 'react';

interface DashboardProps {
  onNavigate: (target: string) => void;
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
  };
  senseiQuote: string;
  userName?: string;
  userLevel?: number;
  userAvatar?: string;
}

export default function DashboardScreen({
  onNavigate,
  onStartGame,
  lessonTypes,
  selectedLesson,
  onSelectLesson,
  noteCount,
  onSelectNoteCount,
  timedMode,
  onToggleTimed,
  stats,
  senseiQuote,
  userName = 'Sensei Alex',
  userLevel = 12,
  userAvatar,
}: DashboardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-container-padding h-20 bg-sheet-cream/90 backdrop-blur-md shadow-[0_8px_30px_-5px_rgba(61,31,16,0.05)] border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <span className="font-headline-lg text-headline-lg font-bold text-primary">Clavis</span>
        </div>
        <div className="hidden md:flex gap-8">
          {['dashboard', 'perfil', 'biblioteca'].map((s) => (
            <button
              key={s}
              onClick={() => onNavigate(s)}
              className={`font-label-caps text-label-caps uppercase tracking-widest transition-colors ${
                s === 'dashboard'
                  ? 'text-primary border-b-2 border-primary pb-1 font-bold'
                  : 'text-on-surface-variant font-medium hover:text-primary'
              }`}
            >
              {s === 'dashboard' ? 'Inicio' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('perfil')}
            className="text-on-surface-variant hover:text-primary transition-colors"
            title="Configuración"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button
            onClick={() => onNavigate('perfil')}
            className="flex items-center gap-2 pl-4 border-l border-outline-variant/50 group"
          >
            <div className="text-right hidden sm:block">
              <p className="font-label-caps text-label-caps text-outline uppercase tracking-widest text-[10px]">Nivel {userLevel}</p>
              <p className="font-title-md text-title-md text-primary group-hover:text-velvet-red transition-colors">{userName}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-surface-variant overflow-hidden border-2 border-brass-highlight shadow-sm">
              {userAvatar ? (
                <img src={userAvatar} alt={`Avatar de ${userName}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-title-md text-primary" aria-hidden="true">
                  {userName.charAt(0)}
                </div>
              )}
            </div>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-container-padding py-stack-md md:py-stack-lg grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Section */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* Session Config */}
          <section className="clay-card p-10 md:p-12 relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 text-surface-dim/30 select-none pointer-events-none" aria-hidden="true">
              <span className="material-symbols-outlined" style={{ fontSize: 240 }}>music_note</span>
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 clay-inner-panel px-4 py-2 mb-8 border border-outline-variant/20 rounded-full">
                <span className="font-label-caps text-[10px] uppercase text-on-secondary-container tracking-wider font-bold">
                  Ajuste Session Config
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg text-primary italic mb-12 max-w-md">
                ELIGE TU DESAFÍO
              </h1>

              {/* Lesson Type Dropdown */}
              <div className="mb-8">
                <label className="font-label-caps text-[10px] uppercase text-outline tracking-widest mb-3 block">
                  Tipo de Lección
                </label>
                <div
                  ref={dropdownRef}
                  className="clay-input-key flex items-center justify-between p-5 cursor-pointer group relative"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">music_note</span>
                    <span className="font-title-md text-primary uppercase tracking-wide">{selectedLesson}</span>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
                    expand_more
                  </span>
                  {showDropdown && (
                    <div className="absolute top-full left-0 w-full mt-4 clay-card z-50 overflow-hidden rounded-xl p-2">
                      {lessonTypes.map((lt) => (
                        <div
                          key={lt}
                          onClick={(e) => { e.stopPropagation(); onSelectLesson(lt); setShowDropdown(false); }}
                          className="p-3 hover:bg-surface-variant text-primary font-medium text-sm rounded-lg transition-colors cursor-pointer"
                        >
                          {lt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Note Count Buttons */}
              <div className="grid grid-cols-3 gap-6 mb-10">
                {[5, 10, 20].map((count) => (
                  <button
                    key={count}
                    onClick={() => onSelectNoteCount(count)}
                    aria-pressed={noteCount === count}
                    className={`clay-input-key flex flex-col items-center justify-center py-8 ${
                      noteCount === count ? 'bg-primary-container text-on-primary-container' : 'text-primary'
                    }`}
                  >
                    <span className="font-headline-lg text-headline-lg font-bold mb-2">
                      {String(count).padStart(2, '0')}
                    </span>
                    <span className={`font-label-caps text-[10px] uppercase tracking-widest ${
                      noteCount === count ? 'text-current opacity-80' : 'text-outline'
                    }`}>
                      Notas
                    </span>
                  </button>
                ))}
              </div>

              {/* Timed Mode */}
              <div className="clay-inner-panel flex items-center justify-between p-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full clay-icon-raised flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">timer</span>
                  </div>
                  <div>
                    <h3 className="font-title-md text-primary uppercase tracking-wide">Modo Cronometrado</h3>
                    <p className="font-body-sm text-body-sm text-outline italic">Corre contra el reloj</p>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={timedMode}
                  aria-label="Modo Cronometrado"
                  onClick={onToggleTimed}
                  className={`clay-switch ${timedMode ? 'on' : ''}`}
                >
                  <span className="clay-switch-knob" />
                </button>
              </div>

              {/* Start Button */}
              <button
                onClick={onStartGame}
                className="clay-btn-primary w-full py-6 flex items-center justify-center gap-3 font-title-md text-title-md uppercase tracking-widest text-brass-highlight"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
                Iniciar Sesión
              </button>
            </div>
          </section>

          {/* Roadmap */}
          <section className="clay-card p-10 md:p-12">
            <div className="flex justify-between items-end mb-16 pb-6">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary italic">HOJA DE RUTA: {selectedLesson.toUpperCase()}</h2>
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
              {/* Step 1 */}
              <div className="relative flex items-center mb-32 z-10">
                <div className="absolute -left-16 md:-left-28 w-20 h-20 rounded-2xl clay-icon-dark text-brass-highlight flex items-center justify-center transform -rotate-3">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <div>
                  <span className="font-label-caps text-[10px] uppercase text-outline-variant font-bold tracking-widest">Paso 01</span>
                  <h3 className="font-headline-lg text-3xl text-primary uppercase tracking-wide mt-1">Las Líneas</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mt-2 leading-relaxed">
                    E-G-B-D-F. Memorización completa de las líneas fundamentales.
                  </p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="relative flex flex-row-reverse items-center justify-between mb-32 z-10 w-full md:pr-12">
                <div className="w-20 h-20 rounded-2xl clay-icon-dark text-brass-highlight flex items-center justify-center transform rotate-3">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <div className="text-right">
                  <span className="font-label-caps text-[10px] uppercase text-outline-variant font-bold tracking-widest">Paso 02</span>
                  <h3 className="font-headline-lg text-3xl text-primary uppercase tracking-wide mt-1">Los Espacios</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mt-2 ml-auto leading-relaxed">
                    F-A-C-E. Identificación instantánea de los espacios.
                  </p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="relative flex items-center z-10">
                <div className="absolute -left-16 md:-left-28 w-24 h-24 rounded-3xl clay-icon-raised text-on-secondary-container flex items-center justify-center transform -rotate-3 border-2 border-on-secondary-container/30">
                  <span className="material-symbols-outlined text-5xl">piano</span>
                </div>
                <div className="w-full max-w-md">
                  <span className="font-label-caps text-[10px] uppercase text-velvet-red font-bold tracking-widest">En Progreso 74%</span>
                  <h3 className="font-headline-lg text-3xl text-primary uppercase tracking-wide mt-1">Fluidez Mixta</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 mb-5 leading-relaxed">
                    Integración de líneas y espacios en tiempo real.
                  </p>
                  <div className="clay-progress-bar w-full h-3" role="progressbar" aria-valuenow={74} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso: 74%">
                    <div className="clay-progress-fill w-[74%]" />
                  </div>
                </div>
              </div>
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
              <h3 className="font-title-md text-primary uppercase tracking-wide">Mastery Gold</h3>
              <div className="clay-progress-bar h-2.5 mt-3" role="progressbar" aria-valuenow={80} aria-valuemin={0} aria-valuemax={100} aria-label="Rango: 80%">
                <div className="clay-progress-fill w-[80%]" />
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
              <div className="flex justify-between px-3">
                {['Fa', 'Si', 'Do♯'].map((note, i) => (
                  <div key={i} className="flex flex-col items-center">
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
            </div>

            {/* Precisión Semanal */}
            <div className="clay-inner-panel p-5">
              <div className="flex justify-between items-center mb-5">
                <span className="font-label-caps text-[11px] uppercase text-primary font-bold tracking-widest">Precisión Semanal</span>
                <span className="font-label-caps text-[11px] text-on-secondary-container font-bold">{stats.weeklyPrecision}%</span>
              </div>
              <svg className="w-full h-16 overflow-visible" viewBox="0 0 100 30">
                <path d="M0,25 Q10,15 20,20 T40,10 T60,15 T80,10 T100,0" fill="none" stroke="#785a1a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
          </div>

          {/* Rendimiento */}
          <div className="clay-card p-8">
            <h3 className="font-label-caps text-[12px] uppercase text-primary font-bold tracking-widest mb-6 text-center">Rendimiento</h3>
            <div className="flex justify-between items-center mb-6">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-label-caps text-[11px] ${
                    i < 5
                      ? 'clay-icon-dark text-brass-highlight'
                      : i === 5
                      ? 'clay-inner-panel text-outline'
                      : 'bg-error-container text-error shadow-inner border border-error/10'
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>
            <p className="text-center font-body-sm text-[13px] text-outline italic">
              "La repetición es la madre de la maestría."
            </p>
          </div>

          {/* Sabiduría del Sensei */}
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
              Sabiduría del Sensei
            </h3>
            <div className="border-l-2 border-brass-highlight/50 pl-5 py-2">
              <p className="font-body-sm text-surface-bright italic opacity-90 leading-relaxed text-[15px]">
                "{senseiQuote}"
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
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
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
