interface LevelCompleteProps {
  accuracy: number
  bestStreak: number
  totalNotes: number
  elapsedMs: number
  onRetry: () => void
  onNext: () => void
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

export default function LevelComplete({ accuracy, bestStreak, totalNotes, elapsedMs, onRetry, onNext }: LevelCompleteProps) {
  const stars = getStars(accuracy)

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
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-b from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all cursor-pointer shadow-md"
          >
            Siguiente Lección
          </button>
        </div>
      </div>
    </div>
  )
}
