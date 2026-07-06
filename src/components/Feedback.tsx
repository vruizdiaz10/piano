import { Note } from '../types'

interface FeedbackProps {
  isCorrect: boolean | null
  note: Note | null
}

export default function Feedback({ isCorrect, note }: FeedbackProps) {
  if (isCorrect === null || !note) return <div className="h-14" />

  return (
    <div className="flex flex-col items-center justify-center gap-2 mt-2">
      <div className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-base font-bold shadow-sm ${
        isCorrect
          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-600 animate-bounce-once'
          : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-2 border-red-300 dark:border-red-600 animate-shake'
      }`}>
        <span className="text-xl">{isCorrect ? '\u2713' : '\u2717'}</span>
        {isCorrect ? '\u00A1Correcto!' : 'Incorrecto'}
      </div>
      {!isCorrect && (
        <div className="text-sm text-amber-700 dark:text-amber-400 font-medium animate-slide-up">
          Era <span className="font-bold text-red-600 dark:text-red-400">{note.name}{note.octave}</span>
        </div>
      )}
    </div>
  )
}
