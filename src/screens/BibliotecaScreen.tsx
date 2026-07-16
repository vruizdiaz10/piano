
import NavUserMenu from '../components/NavUserMenu';

interface BibliotecaScreenProps {
  onNavigate: (target: string) => void;
  onLogout: () => void;
  onSelectLesson: (lessonId: string) => void;
  onStartGame: () => void;
  userName?: string;
  userLevel?: number;
  userAvatar?: string;
}

interface LessonNode {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'locked';
  progress?: number;
  icon: string;
  offset?: 'left' | 'right' | 'center';
}

const FUNDAMENTOS: LessonNode[] = [
  { id: 'lines', title: 'Las Líneas', description: 'Introducción a las cinco líneas del pentagrama y su significado.', status: 'completed', icon: 'check_circle' },
  { id: 'spaces', title: 'Los Espacios', description: 'Descubre cómo los espacios entre líneas albergan nuevas notas.', status: 'completed', icon: 'check_circle' },
  { id: 'mixed', title: 'Fluidez Mixta', description: 'Combina la lectura de líneas y espacios para leer tu primera partitura completa.', status: 'active', progress: 60, icon: 'music_note' },
];

const INTERMEDIA: LessonNode[] = [
  { id: 'scales', title: 'Escalas Mayores', description: 'Comprende la estructura de tonos y semitonos en las escalas mayores.', status: 'locked', icon: 'lock' },
  { id: 'chords', title: 'Acordes Básicos', description: 'Construye tríadas mayores y menores fundamentales.', status: 'locked', icon: 'lock' },
];

export default function BibliotecaScreen({
  onNavigate,
  onLogout,
  onSelectLesson,
  onStartGame,
  userName = 'Pianista',
  userLevel = 1,
  userAvatar,
}: BibliotecaScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* TopNavBar */}
      <header className="sticky top-0 z-50 bg-sheet-cream shadow-[0_20px_20px_-5px_rgba(0,0,0,0.05),inset_4px_4px_8px_rgba(255,255,255,0.8),inset_-4px_-4px_8px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center px-container-padding py-4 w-full max-w-7xl mx-auto">
          <div className="font-display-lg text-display-lg font-semibold text-primary">
            Clavis
          </div>
          <nav className="hidden md:flex gap-8">
            {[
              { key: 'dashboard', label: 'Inicio' },
              { key: 'perfil', label: 'Perfil' },
              { key: 'biblioteca', label: 'Biblioteca', active: true },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => onNavigate(s.key)}
                className={`font-body-lg text-body-lg font-medium transition-all duration-150 hover:scale-105 active:scale-95 ${
                  s.active
                    ? 'text-primary border-b-2 border-brass-highlight pb-1 font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <NavUserMenu
            userName={userName}
            userLevel={userLevel}
            userAvatar={userAvatar}
            onProfile={() => onNavigate('perfil')}
            onLogout={onLogout}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-container-padding py-stack-lg flex flex-col items-center">
        <div className="text-center mb-stack-lg max-w-2xl">
          <h1 className="font-display-lg text-display-lg text-primary mb-stack-sm drop-shadow-sm">
            Biblioteca de Lecciones
          </h1>
          <p className="font-body-lg text-on-surface-variant">
            Tu camino hacia el dominio musical. Completa las lecciones paso a paso para desbloquear nuevos conceptos y refinar tu técnica.
          </p>
        </div>

        {/* Learning Path */}
        <div className="relative w-full max-w-3xl flex flex-col items-center gap-16 py-8">
          {/* Connecting Line */}
          <div className="path-line" />

          {/* Category: Fundamentos */}
          <div className="w-full text-center z-10 mb-4 bg-background/90 py-2 rounded-xl border border-brass-highlight/30 clay-card max-w-sm mx-auto">
            <h2 className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">
              Fundamentos
            </h2>
          </div>

          {FUNDAMENTOS.map((node, i) => (
            <LessonNodeCard key={node.id} node={node} index={i} onSelect={onSelectLesson} onStartGame={onStartGame} />
          ))}

          {/* Category: Técnica Intermedia */}
          <div className="w-full text-center z-10 my-4 bg-background/90 py-2 rounded-xl border border-outline-variant/30 clay-card max-w-sm mx-auto opacity-70">
            <h2 className="font-label-caps text-label-caps text-outline uppercase tracking-widest">
              Técnica Intermedia
            </h2>
          </div>

          {INTERMEDIA.map((node, i) => (
            <LessonNodeCard key={node.id} node={node} index={i + 3} onSelect={onSelectLesson} onStartGame={onStartGame} />
          ))}
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
                item.key === 'biblioteca'
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
      <footer className="bg-primary text-on-primary font-body-sm text-body-sm w-full bottom-0 shadow-[0_-10px_20px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.1)] mt-auto z-10 relative">
        <div className="w-full py-stack-md px-container-padding flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
          <div className="font-display-lg text-display-lg text-on-primary">Clavis</div>
          <div className="text-center md:text-left opacity-90">
            © 1724 Clavis Conservatory of Music. All rights reserved.
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            {['Honor Code', 'Terms of Service', 'Support'].map((link) => (
              <a key={link} href="#" className="text-on-primary/80 hover:text-brass-highlight transition-colors duration-200 opacity-90 hover:opacity-100" aria-disabled="true" tabIndex={-1}>
                {link}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

function LessonNodeCard({
  node,
  index,
  onSelect,
  onStartGame,
}: {
  node: LessonNode;
  index: number;
  onSelect: (id: string) => void;
  onStartGame: () => void;
}) {
  const isLocked = node.status === 'locked';
  const isActive = node.status === 'active';
  const isCompleted = node.status === 'completed';

  // Alternate sides for desktop
  const offsetClass = node.offset
    ? node.offset === 'left'
      ? 'sm:ml-12'
      : node.offset === 'right'
      ? 'sm:mr-12'
      : ''
    : index % 2 === 0
    ? ''
    : 'sm:ml-12';

  return (
    <div
      className={`path-node-container w-full flex justify-center ${
        isActive ? 'transform scale-105 z-20 my-4' : ''
      } ${isLocked ? 'opacity-75' : ''}`}
    >
      <div
        className={`clay-card p-6 ${
          isActive ? 'p-8 w-full md:w-5/6 border-2 border-brass-highlight/50 shadow-[0_0_30px_rgba(232,208,155,0.3)]'
          : 'w-full md:w-3/4'
        } flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left relative ${offsetClass}`}
      >
        {/* Icon */}
        <div
          className={`clay-icon-bubble shrink-0 ${
            isActive
              ? 'text-primary scale-110 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(0,0,0,0.1)]'
              : isCompleted
              ? 'text-velvet-red'
              : 'opacity-50'
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: isActive ? 36 : 32, fontVariationSettings: isCompleted ? "'FILL' 1" : undefined }}
          >
            {node.icon}
          </span>
        </div>

        {/* Content */}
        <div className={`flex-grow ${isActive ? 'w-full' : ''}`}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
            <h3 className={`font-headline-lg-mobile md:font-headline-lg leading-tight ${
              isActive ? 'text-primary' : isCompleted ? 'text-primary' : 'text-on-surface-variant'
            }`}>
              {node.title}
            </h3>
            <span className={`inline-block px-3 py-1 rounded-full font-label-caps text-label-caps self-center sm:self-start ${
              isCompleted
                ? 'bg-secondary-fixed text-on-secondary-fixed'
                : isActive
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-surface-variant text-on-surface-variant'
            }`}>
              {isCompleted ? 'Completado' : isActive ? 'En Progreso' : 'Bloqueado'}
            </span>
          </div>

          <p className={`text-body-sm ${isLocked ? 'text-outline' : 'text-on-surface-variant'} ${isActive ? 'text-body-lg mb-6' : 'mb-0'}`}>
            {node.description}
          </p>

          {/* Progress bar for active */}
          {isActive && node.progress !== undefined && (
            <div className="w-full mb-6">
              <div className="flex justify-between text-body-sm text-on-surface-variant mb-2">
                <span>Progreso</span>
                <span className="font-bold">{node.progress}%</span>
              </div>
              <div className="h-4 clay-progress-bar w-full">
                <div className="h-full clay-progress-fill" style={{ width: `${node.progress}%` }} />
              </div>
            </div>
          )}

          {/* Actions */}
          {isCompleted && (
            <button
              onClick={() => { onSelect(node.id); onStartGame(); }}
              className="font-title-md text-title-md text-primary font-medium hover:text-velvet-red transition-colors flex items-center justify-center sm:justify-start gap-1"
            >
              <span className="material-symbols-outlined text-sm">replay</span> Repasar Lección
            </button>
          )}
          {isActive && (
            <button
              onClick={() => { onSelect(node.id); onStartGame(); }}
              className="clay-btn-primary w-full sm:w-auto px-8 py-3 font-title-md text-title-md flex items-center justify-center gap-2 mx-auto sm:mx-0"
            >
              <span>Continuar Lección</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
