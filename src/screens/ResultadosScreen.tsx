import { useEffect } from 'react'

interface SessionStats {
  score: number;
  notesPlayed: number;
  accuracy: number;
  maxStreak: number;
  totalTime: string;
  challengingNotes: Array<{ note: string; octave: number }>;
  newBadges: number;
}

interface ResultadosScreenProps {
  stats: SessionStats;
  onDashboard: () => void;
  onRetry: () => void;
  onNext?: () => void;
}

export default function ResultadosScreen({ stats, onDashboard, onRetry, onNext }: ResultadosScreenProps) {
  // Prevent background scroll while the scrim is open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Sesión completada"
    >
      {/* Scrim / backdrop */}
      <div
        className="fixed inset-0 bg-mahogany-dark/75 backdrop-blur-md"
        aria-hidden="true"
      />

      <main className="relative z-10 w-full max-w-[700px] flex flex-col">
        <div className="clay-card p-4 md:p-6 flex flex-col items-center text-center shadow-2xl">
          {/* Header */}
          <div className="mb-3">
            <span
              className="material-symbols-outlined text-secondary-container"
              style={{ fontSize: 40, fontVariationSettings: "'FILL' 1" }}
            >
              workspace_premium
            </span>
            <h1 className="font-headline-lg text-headline-lg text-primary mt-1">
              ¡Sesión Completada!
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Práctica de lección
            </p>
          </div>

          {/* Score Display */}
          <div className="clay-score-pill px-6 py-3 w-full max-w-[260px] flex flex-col items-center justify-center mb-3">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">
              Puntuación Total
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="font-headline-lg text-headline-lg text-mahogany-dark">
                {stats.score.toLocaleString()}
              </span>
              <span className="font-body-md text-body-md text-mahogany-dark">pts</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 w-full mb-3">
            <MetricCard icon="music_note" value={String(stats.notesPlayed)} label="Notas" />
            <MetricCard icon="analytics" value={`${stats.accuracy}%`} label="Precisión" />
            <MetricCard icon="local_fire_department" value={String(stats.maxStreak)} label="Racha" />
            <MetricCard icon="timer" value={stats.totalTime} label="Tiempo" />
          </div>

          {/* Detailed Feedback & Rewards */}
          <div className="flex flex-row w-full gap-3 mb-3">
            {/* Challenging Notes */}
            <div className="flex-1 clay-metric-card p-3 text-left flex flex-col">
              <h3 className="font-body-sm text-body-sm text-primary mb-2 flex items-center">
                <span className="material-symbols-outlined mr-1" style={{ fontSize: 16 }}>
                  warning
                </span>
                Áreas de Mejora
              </h3>
              <div className="flex gap-2">
                {stats.challengingNotes.map((n, i) => (
                  <div
                    key={i}
                    className="flex-1 clay-inner-panel rounded-lg p-2 flex flex-col items-center justify-center border border-outline-variant/30"
                  >
                    <span className="font-title-sm text-title-sm text-mahogany-dark">{n.note}</span>
                    <span className="font-label-xs text-label-xs text-on-surface-variant">
                      Oct {n.octave}
                    </span>
                  </div>
                ))}
                {stats.challengingNotes.length === 0 && (
                  <p className="font-body-xs text-body-xs text-on-surface-variant">
                    ¡Sin áreas problemáticas!
                  </p>
                )}
              </div>
            </div>

            {/* Rewards */}
            <div className="flex-1 clay-metric-card p-3 flex flex-col items-center justify-center text-center">
              <span
                className="material-symbols-outlined text-secondary-container mb-1"
                style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}
              >
                stars
              </span>
              <h3 className="font-body-sm text-body-sm text-primary mb-1">Nuevos Sellos</h3>
              <p className="font-body-xs text-body-xs text-on-surface-variant mb-1">
                Insignias por consistencia.
              </p>
              <div className="font-headline-sm text-headline-sm text-mahogany-dark font-bold">
                +{stats.newBadges}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row w-full gap-3">
            <button
              onClick={onDashboard}
              className="clay-button-secondary flex-1 py-3 px-4 rounded-xl font-body-md text-body-md flex items-center justify-center z-10"
            >
              <span className="material-symbols-outlined mr-2" style={{ fontSize: 20 }}>grid_view</span>
              Dashboard
            </button>
            <button
              onClick={onRetry}
              className="clay-button-secondary flex-1 py-3 px-4 rounded-xl font-body-md text-body-md flex items-center justify-center z-10"
            >
              <span className="material-symbols-outlined mr-2" style={{ fontSize: 20 }}>replay</span>
              Reintentar
            </button>
            {onNext && (
              <button
                onClick={onNext}
                className="clay-button-primary flex-1 py-3 px-4 rounded-xl font-body-md text-body-md flex items-center justify-center z-10"
              >
                <span className="material-symbols-outlined mr-2" style={{ fontSize: 20 }}>arrow_forward</span>
                Siguiente
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="clay-metric-card p-2 flex flex-col items-center">
      <span
        className="material-symbols-outlined text-primary-container mb-1"
        style={{ fontSize: 18, fontVariationSettings: "'FILL' 0" }}
      >
        {icon}
      </span>
      <span className="font-body-sm text-body-sm text-primary font-bold">{value}</span>
      <span className="font-label-xs text-label-xs text-on-surface-variant text-center">{label}</span>
    </div>
  );
}
