import { Note, ErrorType } from '../types'
import { getErrorTip } from '../utils/errorAnalysis'

interface FeedbackProps {
  isCorrect: boolean | null
  note: Note | null
  recovering: boolean
  errorType?: ErrorType | null
}

export default function Feedback({ isCorrect, note, recovering, errorType }: FeedbackProps) {
  if (isCorrect === null || !note) return <div className="h-14" />

  const announcement = isCorrect
    ? '\u00A1Correcto!'
    : `Incorrecto. Era ${note.name}${note.octave}`

  return (
    <div className="flex flex-col items-center justify-center gap-2 mt-2">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-base font-bold shadow-sm ${
          isCorrect
            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-600 animate-bounce-once'
            : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-2 border-red-300 dark:border-red-600 animate-shake'
        }`}
      >
        <span className="text-xl">{isCorrect ? '\u2713' : '\u2717'}</span>
        {isCorrect ? '\u00A1Correcto!' : 'Incorrecto'}
      </div>
      {!isCorrect && !recovering && (
        <div className="text-sm text-amber-700 dark:text-amber-400 font-medium animate-slide-up">
          Era <span className="font-bold text-red-600 dark:text-red-400">{note.name}{note.octave}</span>
        </div>
      )}
      {!isCorrect && !recovering && errorType && errorType !== 'random' && (
        <div className="max-w-xs text-xs text-center text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl animate-slide-up border border-amber-200 dark:border-amber-700">
          {getErrorTip(errorType, note)}
        </div>
      )}
      {!isCorrect && recovering && (
        <div className="flex flex-col items-center gap-1.5">
          <div className="text-sm text-amber-700 dark:text-amber-400 font-medium animate-pulse animate-pulse-ring px-3 py-1 rounded-lg">
            ¡Intenta de nuevo!
          </div>
          <div className="w-48 h-1.5 bg-amber-200 dark:bg-amber-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full animate-timer-shrink" />
          </div>
        </div>
      )}
      <span className="sr-only">{announcement}</span>
    </div>
  )
}
