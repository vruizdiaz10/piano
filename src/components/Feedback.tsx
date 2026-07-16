import { Note, ErrorType, Notation } from '../types'
import { getErrorTip } from '../utils/errorAnalysis'

interface FeedbackProps {
  isCorrect: boolean | null
  note: Note | null
  recovering: boolean
  errorType?: ErrorType | null
  notation: Notation
}

export default function Feedback({ isCorrect, note, recovering, errorType, notation }: FeedbackProps) {
  if (isCorrect === null || !note) return <div className="h-6" />

  const announcement = isCorrect
    ? '\u00A1Correcto!'
    : `Incorrecto. Era ${note.name}${note.octave}`

  return (
    <div className="flex flex-col items-center justify-center gap-2 lg:gap-1 mt-2 lg:mt-1">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-base font-bold animate-slide-up ${
          isCorrect
            ? 'clay-surface !text-success'
            : 'clay-surface !text-destructive'
        }`}
      >
        <span className="text-xl">{isCorrect ? '\u2713' : '\u2717'}</span>
        {isCorrect ? '\u00A1Correcto!' : 'Incorrecto'}
      </div>
      {!isCorrect && !recovering && (
        <div className="text-sm text-muted-foreground font-medium animate-slide-up">
          Era <span className="font-bold text-destructive">{note.name}{note.octave}</span>
        </div>
      )}
      {!isCorrect && !recovering && errorType && errorType !== 'random' && (
        <div className="max-w-[calc(100vw-2rem)] text-xs text-center text-muted-foreground bg-muted/50 px-3 py-2 rounded-xl animate-slide-up clay-surface">
          {getErrorTip(errorType, note, notation)}
        </div>
      )}
      {!isCorrect && recovering && (
        <div className="flex flex-col items-center gap-1.5">
          <div className="text-sm text-accent font-medium animate-pulse px-3 py-1 rounded-lg">
            ¡Intenta de nuevo!
          </div>
          <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full animate-timer-shrink" />
          </div>
        </div>
      )}
      <span className="sr-only">{announcement}</span>
    </div>
  )
}
