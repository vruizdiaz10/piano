import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';

interface PracticeNavBarProps {
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onRestart: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: (theme: 'light' | 'dark') => void;
  timerDisplay?: number;
  isTimed: boolean;
  streak: number;
  accuracy: number;
  totalAttempts: number;
  sessionTarget: number;
  syncState: any;
  onDeleteAccount: () => void;
  midiConnected: boolean;
}

export default function PracticeNavBar({
  onBack,
  isMuted,
  onToggleMute,
  onRestart,
  theme,
  onToggleTheme,
  timerDisplay,
  isTimed,
  streak,
  accuracy,
  totalAttempts,
  sessionTarget,
  syncState,
  onDeleteAccount,
  midiConnected,
}: PracticeNavBarProps) {
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
          className="font-headline-lg text-headline-lg font-bold text-primary italic hover:text-velvet-red transition-colors"
        >
          Clavis
        </button>
      </div>
      {/* Stats Bar */}
      <div className="hidden md:flex items-center gap-5">
        {[
          { icon: 'timer', value: isTimed ? timerDisplay : '∞', label: 'Tiempo', show: isTimed },
          { icon: 'local_fire_department', value: String(streak), label: 'Racha' },
          { icon: 'stars', value: `${Math.round(accuracy)}%`, label: 'Precisión' },
          { icon: 'music_note', value: `${totalAttempts}/${sessionTarget}`, label: 'Notas' },
        ].filter(s => s.show !== false).map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">{s.icon}</span>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-outline">{s.label}</span>
            <span className="font-title-md text-primary">{s.value}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMute}
          className="text-on-surface-variant hover:text-primary transition-colors"
          aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
        >
          <span className="material-symbols-outlined" aria-hidden="true">{isMuted ? 'volume_off' : 'volume_up'}</span>
        </button>
        <button
          onClick={onRestart}
          className="text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Reiniciar"
        >
          <span className="material-symbols-outlined" aria-hidden="true">history</span>
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} className="text-on-surface-variant hover:text-primary transition-colors" />
        <div className="w-px h-5 bg-outline-variant/50 mx-1" />
        <UserMenu syncState={syncState} onDeleteAccount={onDeleteAccount} />
        <span
          role="status"
          aria-label={midiConnected ? 'MIDI: Conectado' : 'MIDI: Sin conexión'}
          className={`inline-block w-2 h-2 rounded-full ${midiConnected ? 'bg-emerald-500' : 'bg-red-400'}`}
        />
      </div>
    </nav>
  );
}
