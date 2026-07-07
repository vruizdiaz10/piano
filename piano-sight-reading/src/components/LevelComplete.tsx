import { LESSONS } from '../data/lessons'

interface LevelCompleteProps {
  accuracy: number
  bestStreak: number
  totalNotes: number
  elapsedMs: number
  lessonId: string
  onRetry: () => void
  onNext: () => void
  answeredNotes?: number[]
}

function getStars(accuracy: number): number {
  if (accuracy >= 90) return 3
  if (accuracy >= 70) return 2
  if (accuracy >= 50) return 1
  return 0
}

function formatTime(ms: number): string {
  const sec = Math.floor(ms / 1000)
  const min = Math.floor(sec / 60)
  const s = sec % 60
  return min > 0 ? `${min}m ${s}s` : `${s}s`
}

function hash(midi: number, seed: number): number {
  return ((midi * 9301 + 49297 * seed) % 233280) / 233280
}

function midiToConstellationPos(midi: number, index: number, total: number): { x: number; y: number } {
  const angle = (index / Math.max(total, 2)) * Math.PI * 2 - Math.PI / 2
  const r = 35 + hash(midi, 7) * 45
  return {
    x: 100 + Math.cos(angle) * r,
    y: 70 + Math.sin(angle) * r,
  }
}

export default function LevelComplete({ accuracy, bestStreak, totalNotes, elapsedMs, lessonId, onRetry, onNext, answeredNotes }: LevelCompleteProps) {
  const stars = getStars(accuracy)
  const lesson = LESSONS.find(l => l.id === lessonId)
  const mastery = lesson?.mastery
  const masteryAchieved = mastery
    ? accuracy / 100 >= mastery.minAccuracy
      && bestStreak >= mastery.minStreak
      && totalNotes >= mastery.minNotes
    : false

  const constellationPoints = answeredNotes && answeredNotes.length >= 2
    ? answeredNotes.map((midi, i) => ({
        midi,
        ...midiToConstellationPos(midi, i, answeredNotes.length),
      }))
    : null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Lección completada">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onRetry} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full animate-slide-up border border-amber-200 dark:border-amber-700">
        <h2 className="text-xl font-bold text-center text-amber-800 dark:text-amber-200 mb-4">
          {'\u00A1'}Lección Completada!
        </h2>

        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map(i => (
            <span
              key={i}
              className={`text-3xl ${i <= stars ? 'animate-star-appear' : 'opacity-20 grayscale'}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {'\u2B50'}
            </span>
          ))}
        </div>

        {mastery && (
          <div className={`text-center mb-3 px-3 py-2 rounded-xl text-sm font-semibold ${
            masteryAchieved
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600'
              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-600'
          }`}>
            {masteryAchieved
              ? '\u2714 Maestría alcanzada'
              : `Falta: ${accuracy / 100 < mastery.minAccuracy ? `precisión ${Math.round(mastery.minAccuracy * 100)}% ` : ''}${bestStreak < mastery.minStreak ? `racha ${mastery.minStreak} ` : ''}${totalNotes < mastery.minNotes ? `notas ${mastery.minNotes}` : ''}`}
          </div>
        )}

        {constellationPoints && (
          <div className="flex justify-center mb-3">
            <svg viewBox="0 0 200 140" className="w-full max-w-[200px] h-auto" aria-hidden="true">
              <rect width="200" height="140" rx={8} fill="var(--constellation-bg, #0F172A)" opacity={0.15} className="dark:opacity-30" />
              {constellationPoints.map((p, i) => {
                if (i === 0) return null
                const prev = constellationPoints[i - 1]
                return (
                  <line key={`line-${i}`} x1={prev.x} y1={prev.y} x2={p.x} y2={p.y} stroke="#DC2626" strokeWidth={1} opacity={0.5} strokeDasharray="200" className="animate-constellation-draw" />
                )
              })}
              {constellationPoints.map((p, i) => (
                <g key={`star-${i}`} className="animate-star-appear" style={{ animationDelay: `${i * 0.2}s` }}>
                  <circle cx={p.x} cy={p.y} r={3} fill="#DC2626" opacity={0.8} />
                  <circle cx={p.x} cy={p.y} r={6} fill="#DC2626" opacity={0.2} />
                </g>
              ))}
              {constellationPoints.map((p, i) => (
                <text key={`label-${i}`} x={p.x} y={p.y + 14} textAnchor="middle" fontSize={8} fill="#9CA3AF" opacity={0.6}>
                  {p.midi}
                </text>
              ))}
            </svg>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6 text-center">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3">
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">Precisión</div>
            <div className="text-lg font-bold text-amber-800 dark:text-amber-200">{Math.round(accuracy)}%</div>
          </div>
          <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 p-3">
            <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">Mejor Racha</div>
            <div className="text-lg font-bold text-orange-800 dark:text-orange-200">{'\uD83D\uDD25'} {bestStreak}</div>
          </div>
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-3">
            <div className="text-xs text-red-600 dark:text-red-400 font-medium">Notas</div>
            <div className="text-lg font-bold text-red-800 dark:text-red-200">{totalNotes}</div>
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3">
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Tiempo</div>
            <div className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{formatTime(elapsedMs)}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-amber-300 dark:border-amber-600 bg-white dark:bg-gray-700 text-amber-700 dark:text-amber-300 font-semibold hover:bg-amber-50 dark:hover:bg-gray-600 transition-all cursor-pointer"
          >
            Reintentar
          </button>
          <button
            onClick={onNext}
            disabled={mastery && mastery.unlockNext && !masteryAchieved}
            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all cursor-pointer shadow-md ${
              mastery && mastery.unlockNext && !masteryAchieved
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-b from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
            }`}
            title={mastery && mastery.unlockNext && !masteryAchieved ? 'Alcanza la maestría para desbloquear' : ''}
          >
            Siguiente Lección
          </button>
        </div>
      </div>
    </div>
  )
}
