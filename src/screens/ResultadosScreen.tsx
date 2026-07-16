

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
  onNext: () => void;
}

export default function ResultadosScreen({ stats, onDashboard, onRetry, onNext }: ResultadosScreenProps) {
  return (
    <div className="concert-hall-bg min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="fixed inset-0 bg-overlay -z-10" />
      <main className="w-full max-w-[800px] mx-auto z-10 relative">
        <div className="clay-card p-6 md:p-10 flex flex-col items-center text-center space-y-stack-md">
          {/* Header */}
          <div className="space-y-stack-sm">
            <span
              className="material-symbols-outlined text-secondary-container"
              style={{ fontSize: 48, fontVariationSettings: "'FILL' 1" }}
            >
              workspace_premium
            </span>
            <h1 className="font-display-lg text-display-lg text-primary">
              ¡Sesión Completada!
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Práctica de lección
            </p>
          </div>

          {/* Score Display */}
          <div className="clay-score-pill px-8 py-6 w-full max-w-[300px] flex flex-col items-center justify-center">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">
              Puntuación Total
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="font-display-lg text-display-lg text-mahogany-dark">
                {stats.score.toLocaleString()}
              </span>
              <span className="font-title-md text-title-md text-mahogany-dark">pts</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-4">
            <MetricCard icon="music_note" value={String(stats.notesPlayed)} label="Notas Tocadas" />
            <MetricCard icon="analytics" value={`${stats.accuracy}%`} label="Precisión" />
            <MetricCard icon="local_fire_department" value={String(stats.maxStreak)} label="Racha Máxima" />
            <MetricCard icon="timer" value={stats.totalTime} label="Tiempo Total" />
          </div>

          {/* Detailed Feedback & Rewards */}
          <div className="flex flex-col md:flex-row w-full gap-6 pt-4">
            {/* Challenging Notes */}
            <div className="flex-1 clay-metric-card p-5 text-left flex flex-col justify-between">
              <div>
                <h3 className="font-title-md text-title-md text-primary mb-3 flex items-center">
                  <span className="material-symbols-outlined mr-2" style={{ fontSize: 20 }}>
                    warning
                  </span>
                  Áreas de Mejora
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                  Notas que requirieron más atención:
                </p>
              </div>
              <div className="flex space-x-3">
                {stats.challengingNotes.map((n, i) => (
                  <div
                    key={i}
                    className="flex-1 clay-inner-panel rounded-xl p-3 flex flex-col items-center justify-center border border-outline-variant/30"
                  >
                    <span className="font-headline-lg text-headline-lg text-mahogany-dark">{n.note}</span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant mt-1">
                      Octava {n.octave}
                    </span>
                  </div>
                ))}
                {stats.challengingNotes.length === 0 && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    ¡Sin áreas problemáticas!
                  </p>
                )}
              </div>
            </div>

            {/* Rewards */}
            <div className="flex-1 clay-metric-card p-5 flex flex-col items-center justify-center text-center">
              <span
                className="material-symbols-outlined text-secondary-container mb-3"
                style={{ fontSize: 40, fontVariationSettings: "'FILL' 1" }}
              >
                stars
              </span>
              <h3 className="font-title-md text-title-md text-primary mb-1">Nuevos Sellos</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
                Has ganado nuevas insignias por tu consistencia.
              </p>
              <div className="font-headline-lg-mobile text-headline-lg-mobile text-mahogany-dark font-bold">
                +{stats.newBadges}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row w-full gap-4 pt-6">
            <button
              onClick={onDashboard}
              className="clay-button-secondary flex-1 py-5 px-8 rounded-2xl font-title-md text-title-md flex items-center justify-center z-10"
            >
              <span className="material-symbols-outlined mr-2">grid_view</span>
              Volver al Dashboard
            </button>
            <button
              onClick={onRetry}
              className="clay-button-secondary flex-1 py-5 px-8 rounded-2xl font-title-md text-title-md flex items-center justify-center z-10"
            >
              <span className="material-symbols-outlined mr-2">replay</span>
              Reintentar Lección
            </button>
            <button
              onClick={onNext}
              className="clay-button-primary flex-1 py-5 px-8 rounded-2xl font-title-md text-title-md flex items-center justify-center z-10"
            >
              <span className="material-symbols-outlined mr-2">arrow_forward</span>
              Siguiente Lección
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="clay-metric-card p-4 flex flex-col items-center">
      <span
        className="material-symbols-outlined text-primary-container mb-2"
        style={{ fontVariationSettings: "'FILL' 0" }}
      >
        {icon}
      </span>
      <span className="font-title-md text-title-md text-primary">{value}</span>
      <span className="font-label-caps text-label-caps text-on-surface-variant mt-1 text-center">{label}</span>
    </div>
  );
}
