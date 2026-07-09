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
        className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-base font-bold shadow-lg ${
          isCorrect
            ? 'bg-success/10 text-success border-2 border-success/30 animate-slide-up'
            : 'bg-destructive/10 text-destructive border-2 border-destructive/30 animate-slide-up'
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
        <div className="max-w-xs text-xs text-center text-muted-foreground bg-muted px-3 py-2 rounded-xl animate-slide-up border border-border">
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
