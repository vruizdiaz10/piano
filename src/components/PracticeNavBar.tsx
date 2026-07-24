import { useState } from 'react';
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
  onOpenCalibration?: () => void;
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
  onOpenCalibration,
}: PracticeNavBarProps) {
  const [midiMenuOpen, setMidiMenuOpen] = useState(false);
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
          <div className="relative">
            <button
              onClick={() => midiConnected && setMidiMenuOpen(!midiMenuOpen)}
              disabled={!midiConnected}
              aria-label={
                !midiConnected
                  ? 'Sin controlador MIDI'
                  : controllerRange
                    ? `MIDI calibrado: ${midiToNote(controllerRange.min).name}${midiToNote(controllerRange.min).octave} - ${midiToNote(controllerRange.max).name}${midiToNote(controllerRange.max).octave}. Tocá para opciones`
                    : 'MIDI conectado sin calibrar. Tocá para opciones'
              }
              aria-expanded={midiMenuOpen}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-label border
                transition-all duration-200
                ${!midiConnected
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default'
                  : controllerRange
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                    : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 cursor-pointer animate-pulse'
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
              {midiConnected && <span className="material-symbols-outlined text-[12px] ml-0.5">expand_more</span>}
            </button>
            {midiMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMidiMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-surface rounded-xl shadow-lg border border-outline-variant/30 py-1 min-w-[160px]">
                  <button
                    onClick={() => { setMidiMenuOpen(false); onOpenCalibration?.() }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-variant/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">settings</span>
                    {controllerRange ? 'Recalibrar' : 'Calibrar'}
                  </button>
                </div>
              </>
            )}
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
