import NavUserMenu from './NavUserMenu';
import { useAuth } from '../hooks/useAuth';
import logoUrl from '../assets/logo.svg';
import { midiToNote } from '../utils/midiToNote';

interface PracticeNavBarProps {
  onBack: () => void;
  onProfile: () => void;
  streak: number;
  accuracy: number;
  totalAttempts: number;
  sessionTarget: number;
  userLevel?: number;
  midiConnected?: boolean;
  controllerRange?: { min: number; max: number } | null;
}

export default function PracticeNavBar({
  onBack,
  onProfile,
  streak,
  accuracy,
  totalAttempts,
  sessionTarget,
  userLevel = 1,
  midiConnected,
  controllerRange,
}: PracticeNavBarProps) {
  const { user, signOut } = useAuth();
  const userName = user?.displayName ?? user?.email?.split('@')[0] ?? 'Usuario';

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-container-padding h-20 bg-sheet-cream/90 backdrop-blur-md shadow-[0_8px_30px_-5px_rgba(61,31,16,0.05)] border-b border-outline-variant/30">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="clay-inner-panel w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Volver al panel"
        >
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        </button>
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-headline-lg text-headline-lg font-bold text-primary hover:text-velvet-red transition-colors"
        >
          <img src={logoUrl} alt="" className="w-8 h-8 rounded-md" aria-hidden="true" />
          Clavis
        </button>
      </div>
      {/* Stats Bar */}
      <div className="hidden md:flex items-center gap-5">
        {[
          { icon: 'local_fire_department', value: String(streak), label: 'Racha' },
          { icon: 'stars', value: `${Math.round(accuracy)}%`, label: 'Precisión' },
          { icon: 'music_note', value: `${totalAttempts}/${sessionTarget}`, label: 'Notas' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">{s.icon}</span>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-outline">{s.label}</span>
            <span className="font-title-md text-primary">{s.value}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {midiConnected !== undefined && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-label border
              ${!midiConnected
                ? 'bg-gray-100 text-gray-400 border-gray-200'
                : controllerRange
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border-amber-200'
              }`}
          >
            <span className={`w-2 h-2 rounded-full ${midiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="material-symbols-outlined text-[14px]">piano</span>
            <span>
              {midiConnected
                ? controllerRange
                  ? `${midiToNote(controllerRange.min).name}${midiToNote(controllerRange.min).octave}–${midiToNote(controllerRange.max).name}${midiToNote(controllerRange.max).octave}`
                  : 'Sin calibrar'
                : 'Sin MIDI'}
            </span>
          </div>
        )}
        <NavUserMenu
          userName={userName}
          userLevel={userLevel}
          userAvatar={user?.photoURL ?? undefined}
          onProfile={onProfile}
          onLogout={() => signOut()}
        />
      </div>
    </nav>
  );
}
