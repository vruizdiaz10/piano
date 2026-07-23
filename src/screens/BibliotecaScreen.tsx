import TopNavBar from '../components/TopNavBar'
import { LESSONS } from '../data/lessons'
import { computeMasteryStatus } from '../utils/dashboardStats'
import type { SessionRecord } from '../utils/sessionHistory'

interface LessonNode {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'locked';
  accuracy?: number;
  icon: string;
  offset?: 'left' | 'right' | 'center';
}

interface BibliotecaScreenProps {
  onNavigate: (target: string) => void;
  onLogout: () => void;
  onStartGame: (lessonId?: string) => void;
  userName?: string;
  userLevel?: number;
  userAvatar?: string;
  sessions?: SessionRecord[];
}

export default function BibliotecaScreen({
  onNavigate,
  onLogout,
  onStartGame,
  userName = 'Pianista',
  userLevel = 1,
  userAvatar,
  sessions = [],
}: BibliotecaScreenProps) {
  const trebleLessons = LESSONS.filter(l => l.clef === 'treble')
  const bassLessons = LESSONS.filter(l => l.clef === 'bass')

  function getStatus(lessonId: string): { status: 'completed' | 'active' | 'locked'; accuracy: number } {
    const ms = computeMasteryStatus(lessonId, sessions)
    return { status: ms.mastered ? 'completed' : ms.unlocked ? 'active' : 'locked', accuracy: ms.bestAccuracy }
  }

  function getActiveIndex(lessons: typeof LESSONS): number {
    const idx = lessons.findIndex(l => !computeMasteryStatus(l.id, sessions).mastered)
    return idx === -1 ? lessons.length - 1 : idx
  }

  const trebleActiveIdx = getActiveIndex(trebleLessons)
  const bassActiveIdx = getActiveIndex(bassLessons)
  // ponytail: O(n*m) fine for 18 lessons, batch-compute if lesson count grows
  const trebleCompleted = trebleLessons.filter(l => computeMasteryStatus(l.id, sessions).mastered).length
  const bassCompleted = bassLessons.filter(l => computeMasteryStatus(l.id, sessions).mastered).length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavBar
        activeScreen="biblioteca"
        onNavigate={onNavigate}
        onLogout={onLogout}
        userName={userName}
        userLevel={userLevel}
        userAvatar={userAvatar}
      />

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-container-padding pt-28 pb-stack-lg flex flex-col items-center">
        <div className="text-center mb-stack-lg max-w-2xl">
          <h1 className="font-display-lg text-display-lg text-primary mb-stack-sm drop-shadow-sm">
            Biblioteca de Lecciones
          </h1>
          <p className="font-body-lg text-on-surface-variant">
            Tu camino hacia el dominio musical. Completa las lecciones paso a paso para desbloquear nuevos conceptos y refinar tu técnica.
          </p>
        </div>

        {/* Learning Path */}
        <div className="relative w-full max-w-3xl flex flex-col items-center gap-6 py-8">
          <div className="path-line" />

          {/* Treble Section */}
          <div className="w-full text-center z-10 mb-4 bg-background/90 py-2 rounded-xl border border-brass-highlight/30 clay-card max-w-sm mx-auto">
            <h2 className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">
              Clave de Sol
            </h2>
            <span className="text-body-sm text-on-surface-variant">{trebleCompleted}/{trebleLessons.length} completadas</span>
          </div>

          {trebleLessons.map((lesson, i) => {
            const { status, accuracy } = getStatus(lesson.id)
            const isActive = i === trebleActiveIdx && status !== 'completed'
            return (
              <LessonNodeCard
                key={lesson.id}
                node={{
                  id: lesson.id,
                  title: lesson.name,
                  description: lesson.desc,
                  status: isActive ? 'active' : status,
                  accuracy,
                  icon: status === 'completed' ? 'check_circle' : isActive ? 'music_note' : 'lock',
                }}
                index={i}
                onStartGame={onStartGame}
              />
            )
          })}

          {/* Bass Section — extra top margin for visual break */}
          <div className="w-full text-center z-10 mt-12 mb-4 bg-background/90 py-2 rounded-xl border border-outline-variant/30 clay-card max-w-sm mx-auto">
            <h2 className="font-label-caps text-label-caps text-outline uppercase tracking-widest">
              Clave de Fa
            </h2>
            <span className="text-body-sm text-on-surface-variant">{bassCompleted}/{bassLessons.length} completadas</span>
          </div>

          {bassLessons.map((lesson, i) => {
            const { status, accuracy } = getStatus(lesson.id)
            const isActive = i === bassActiveIdx && status !== 'completed'
            return (
              <LessonNodeCard
                key={lesson.id}
                node={{
                  id: lesson.id,
                  title: lesson.name,
                  description: lesson.desc,
                  status: isActive ? 'active' : status,
                  accuracy,
                  icon: status === 'completed' ? 'check_circle' : isActive ? 'music_note' : 'lock',
                }}
                index={i + trebleLessons.length}
                onStartGame={onStartGame}
              />
            )
          })}
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
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
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
      <footer className="w-full py-stack-lg px-container-padding flex flex-col md:flex-row justify-between items-center gap-4 bg-mahogany-dark shadow-[inset_0_10px_20px_rgba(0,0,0,0.2)] mt-auto">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <span className="font-headline-lg text-headline-lg text-surface-bright">Clavis</span>
        </div>
        <p className="font-body-sm text-body-sm text-outline-variant text-center md:text-left text-xs md:text-sm">
          © 2025 <a href="https://linktr.ee/vruizdiaz" target="_blank" rel="noopener noreferrer" className="hover:text-surface-bright transition-colors">Víctor Enrique Ruiz Díaz Music</a>
        </p>
      </footer>
    </div>
  );
}

function LessonNodeCard({
  node,
  index,
  onStartGame,
}: {
  node: LessonNode;
  index: number;
  onStartGame: (lessonId?: string) => void;
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
          {isActive && node.accuracy !== undefined && node.accuracy > 0 && (
            <div className="w-full mb-6">
              <div className="flex justify-between text-body-sm text-on-surface-variant mb-2">
                <span>Precisión</span>
                <span className="font-bold">{Math.round(node.accuracy)}%</span>
              </div>
              <div className="h-4 clay-progress-bar w-full">
                <div className="h-full clay-progress-fill" style={{ width: `${node.accuracy}%` }} />
              </div>
            </div>
          )}

          {/* Actions */}
          {isCompleted && (
            <button
              onClick={() => { onStartGame(node.id); }}
              className="font-title-md text-title-md text-primary font-medium hover:text-velvet-red transition-colors flex items-center justify-center sm:justify-start gap-1"
            >
              <span className="material-symbols-outlined text-sm">replay</span> Repasar Lección
            </button>
          )}
          {isActive && (
            <button
              onClick={() => { onStartGame(node.id); }}
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
