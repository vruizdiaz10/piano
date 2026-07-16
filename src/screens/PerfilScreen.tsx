import React, { useState } from 'react';

interface PerfilScreenProps {
  onNavigate: (target: string) => void;
  userName?: string;
  userLevel?: number;
  userAvatar?: string;
  stats: { stars: number; notesMastered: number; streak: number };
  settings: {
    language: string;
    showAlphabetical: boolean;
    correctKeyFlash: boolean;
    incorrectKeyFlash: boolean;
    darkMode: boolean;
    difficulty: 'facil' | 'normal' | 'dificil';
  };
  onSettingsChange: (settings: PerfilScreenProps['settings']) => void;
  onDeleteAccount: () => void;
  onLogout?: () => void;
}

export default function PerfilScreen({
  onNavigate,
  userName = 'Pianista',
  userLevel = 5,
  userAvatar,
  stats,
  settings,
  onSettingsChange,
  onDeleteAccount,
  onLogout,
}: PerfilScreenProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateSetting = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="clay-card rounded-none px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="font-headline-lg text-headline-lg text-primary italic">Clavis</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {['dashboard', 'perfil', 'biblioteca'].map((s) => (
            <button
              key={s}
              onClick={() => onNavigate(s)}
              className={`font-body-lg text-body-lg transition-colors ${
                s === 'perfil' ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {s === 'dashboard' ? 'Inicio' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-[800px] mx-auto p-4 md:p-8 space-y-6">
        {/* Profile Header */}
        <div className="clay-card p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="clay-icon-raised w-20 h-20 flex items-center justify-center text-display-lg font-display-lg text-primary">
            {userAvatar ? (
              <img src={userAvatar} alt={`Avatar de ${userName}`} className="w-full h-full rounded-full object-cover" />
            ) : (
              userName.charAt(0)
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">{userName}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <span
                className="material-symbols-outlined text-secondary-container"
                style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
              >
                workspace_premium
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                Nivel {userLevel}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="clay-button-secondary py-2 px-4 rounded-xl font-title-md text-title-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Cerrar Sesión
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon="star" value={String(stats.stars)} label="Estrellas" />
          <StatCard icon="music_note" value={String(stats.notesMastered)} label="Notas Maestradas" />
          <StatCard icon="local_fire_department" value={String(stats.streak)} label="Racha" />
        </div>

        {/* Configuración */}
        <div className="clay-card p-6 space-y-6">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">Configuración</h2>

          {/* Language */}
          <SettingRow label="Idioma">
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="clay-input-key px-4 py-2 font-body-lg text-body-lg text-on-surface rounded-xl border-none outline-none"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </SettingRow>

          {/* Alphabetical display */}
          <SettingRow label="Visualización: Notas Alfabéticas">
            <button
              role="switch"
              aria-checked={settings.showAlphabetical}
              aria-label="Notas Alfabéticas"
              onClick={() => updateSetting('showAlphabetical', !settings.showAlphabetical)}
              className={`clay-switch ${settings.showAlphabetical ? 'on' : ''}`}
            >
              <span className="clay-switch-knob" />
            </button>
          </SettingRow>

          {/* Correct key flash */}
          <SettingRow label="Tecla Correcta: Flash de Éxito">
            <button
              role="switch"
              aria-checked={settings.correctKeyFlash}
              aria-label="Flash de Éxito en tecla correcta"
              onClick={() => updateSetting('correctKeyFlash', !settings.correctKeyFlash)}
              className={`clay-switch ${settings.correctKeyFlash ? 'on' : ''}`}
            >
              <span className="clay-switch-knob" />
            </button>
          </SettingRow>

          {/* Incorrect key flash */}
          <SettingRow label="Tecla Incorrecta: Flash de Error">
            <button
              role="switch"
              aria-checked={settings.incorrectKeyFlash}
              aria-label="Flash de Error en tecla incorrecta"
              onClick={() => updateSetting('incorrectKeyFlash', !settings.incorrectKeyFlash)}
              className={`clay-switch ${settings.incorrectKeyFlash ? 'on' : ''}`}
            >
              <span className="clay-switch-knob" />
            </button>
          </SettingRow>

          {/* Dark Mode */}
          <SettingRow label="Tema: Modo Oscuro">
            <button
              role="switch"
              aria-checked={settings.darkMode}
              aria-label="Modo Oscuro"
              onClick={() => updateSetting('darkMode', !settings.darkMode)}
              className={`clay-switch ${settings.darkMode ? 'on' : ''}`}
            >
              <span className="clay-switch-knob" />
            </button>
          </SettingRow>

          {/* Difficulty */}
          <div>
            <span className="font-title-md text-title-md text-primary block mb-3">Nivel de Dificultad</span>
            <div className="flex gap-3" role="radiogroup" aria-label="Nivel de Dificultad">
              {(['facil', 'normal', 'dificil'] as const).map((d) => (
                <button
                  key={d}
                  role="radio"
                  aria-checked={settings.difficulty === d}
                  onClick={() => updateSetting('difficulty', d)}
                  className={`clay-button-secondary flex-1 py-3 rounded-xl font-title-md text-title-md ${
                    settings.difficulty === d ? 'bg-secondary-container text-on-secondary-container' : ''
                  }`}
                >
                  {d === 'facil' ? 'Fácil' : d === 'normal' ? 'Normal' : 'Difícil'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mi Perfil */}
        <div className="clay-card p-6 space-y-4">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">Mi Perfil</h2>
          <ProfileRow label="Notas Tocadas" value="1,245" />
          <ProfileRow label="Tiempo Tocando" value="12h 30m" />
          <ProfileRow label="Primera Sesión" value="15 Ene 2025" />
        </div>

        {/* Danger Zone */}
        <div className="clay-card p-6 border-2 border-error/20">
          <h2 className="font-title-md text-title-md text-error mb-4">Zona de Peligro</h2>
          {showDeleteConfirm ? (
            <div className="space-y-3">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                ¿Estás seguro? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="clay-button-secondary flex-1 py-3 rounded-xl font-title-md text-title-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={onDeleteAccount}
                  className="flex-1 py-3 rounded-xl font-title-md text-title-md bg-error text-on-error"
                >
                  Sí, Borrar Cuenta
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 rounded-xl font-title-md text-title-md border-2 border-error/40 text-error hover:bg-error/10 transition-colors"
            >
              Borrar Cuenta
            </button>
          )}
        </div>
      </div>

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
                item.key === 'perfil'
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
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-body-lg text-body-lg text-on-surface">{label}</span>
      {children}
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="clay-metric-card p-4 flex flex-col items-center">
      <span className="material-symbols-outlined text-secondary-container mb-1" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      <span className="font-title-md text-title-md text-primary">{value}</span>
      <span className="font-label-caps text-label-caps text-on-surface-variant mt-1 text-center">{label}</span>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-outline-variant/20">
      <span className="font-body-lg text-body-lg text-on-surface-variant">{label}</span>
      <span className="font-body-lg text-body-lg text-on-surface font-medium">{value}</span>
    </div>
  );
}
