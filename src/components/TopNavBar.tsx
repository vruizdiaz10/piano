import { useState } from 'react';
import NavUserMenu from './NavUserMenu';
import logoUrl from '../assets/logo.svg';
import { midiToNote } from '../utils/midiToNote';

interface TopNavBarProps {
  activeScreen: 'dashboard' | 'biblioteca' | 'perfil';
  onNavigate: (target: string) => void;
  onLogout?: () => void;
  userName: string;
  userLevel?: number;
  userAvatar?: string;
  // Optional dashboard-specific props
  onToggleHelp?: () => void;
  onToggleTimer?: () => void;
  onToggleMute?: () => void;
  onMenuOpen?: () => void;
  isMuted?: boolean;
  isHelpVisible?: boolean;
  isTimerActive?: boolean;
  midiConnected?: boolean;
  controllerRange?: { min: number; max: number } | null;
  onOpenCalibration?: () => void;
}

const NAV_LINKS = [
  { key: 'dashboard', label: 'Inicio' },
  { key: 'biblioteca', label: 'Biblioteca' },
];

export default function TopNavBar({
  activeScreen,
  onNavigate,
  onLogout,
  userName,
  userLevel = 1,
  userAvatar,
  onToggleHelp,
  onToggleTimer,
  onToggleMute,
  onMenuOpen,
  isMuted = false,
  isHelpVisible = false,
  isTimerActive = false,
  midiConnected,
  controllerRange,
  onOpenCalibration,
}: TopNavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [midiMenuOpen, setMidiMenuOpen] = useState(false);

  const handleMenuOpen = () => {
    if (onMenuOpen) {
      onMenuOpen();
    } else {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-container-padding h-20 bg-sheet-cream/90 backdrop-blur-md shadow-[0_8px_30px_-5px_rgba(61,31,16,0.05)] border-b border-outline-variant/30">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 font-headline-lg text-headline-lg font-bold text-primary hover:text-velvet-red transition-colors"
          aria-label="Ir al inicio"
        >
          <img src={logoUrl} alt="" className="w-8 h-8 rounded-md" aria-hidden="true" />
          Clavis
        </button>
      </div>
      <div className="hidden md:flex gap-8">
        {NAV_LINKS.map((s) => (
          <button
            key={s.key}
            onClick={() => onNavigate(s.key)}
            className={`font-label-caps text-label-caps uppercase tracking-widest transition-colors ${
              s.key === activeScreen
                ? 'text-primary border-b-2 border-primary pb-1 font-bold'
                : 'text-on-surface-variant font-medium hover:text-primary'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4">
        {onToggleHelp && (
          <button
            type="button"
            onClick={onToggleHelp}
            className={`p-2 rounded-xl transition-colors clay-btn-icon ${
              isHelpVisible ? 'bg-primary/10 text-primary' : 'text-on-surface-variant'
            }`}
            aria-label={isHelpVisible ? 'Ocultar ayuda' : 'Mostrar ayuda'}
            aria-pressed={isHelpVisible}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>help</span>
          </button>
        )}
        {onToggleTimer && (
          <button
            type="button"
            onClick={onToggleTimer}
            className={`p-2 rounded-xl transition-colors clay-btn-icon ${
              isTimerActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant'
            }`}
            aria-label={isTimerActive ? 'Detener temporizador' : 'Iniciar temporizador'}
            aria-pressed={isTimerActive}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>timer</span>
          </button>
        )}
        {onToggleMute && (
          <button
            type="button"
            onClick={onToggleMute}
            className={`p-2 rounded-xl transition-colors clay-btn-icon ${
              isMuted ? 'bg-primary/10 text-primary' : 'text-on-surface-variant'
            }`}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
            aria-pressed={isMuted}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>
        )}
        {onMenuOpen && (
          <button
            type="button"
            onClick={handleMenuOpen}
            className="p-2 rounded-xl transition-colors clay-btn-icon text-on-surface-variant"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>more_vert</span>
          </button>
        )}
        {/* MIDI Status Chip */}
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
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-label
                transition-all duration-200 border
                ${!midiConnected
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default'
                  : controllerRange
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                    : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 cursor-pointer animate-pulse'
                }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {!midiConnected ? 'settings_input_hdmi' : 'piano'}
              </span>
              <span>
                {!midiConnected
                  ? 'Sin MIDI'
                  : controllerRange
                    ? `${midiToNote(controllerRange.min).name}${midiToNote(controllerRange.min).octave}–${midiToNote(controllerRange.max).name}${midiToNote(controllerRange.max).octave}`
                    : 'Sin calibrar'
                }
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
          userAvatar={userAvatar}
          onProfile={() => onNavigate('perfil')}
          onLogout={onLogout}
        />
      </div>
    </nav>
  );
}
