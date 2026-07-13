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
        className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-base font-display font-bold ${
          isCorrect
            ? 'bg-neon-green/10 text-neon-green border-2 border-neon-green/30 animate-slide-up feedback-correct-shimmer'
            : 'bg-neon-pink/10 text-neon-pink border-2 border-neon-pink/30 animate-slide-up'
        }`}
        style={isCorrect
          ? { boxShadow: '0 0 20px rgba(57,255,20,0.15)' }
          : { boxShadow: '0 0 20px rgba(255,46,151,0.15)' }
        }
      >
        <span className="text-xl">{isCorrect ? '\u2713' : '\u2717'}</span>
        {isCorrect ? '\u00A1Correcto!' : 'Incorrecto'}
      </div>
      {!isCorrect && !recovering && (
        <div className="text-sm text-neon-blue/50 font-medium animate-slide-up">
          Era <span className="font-bold text-neon-pink">{note.name}{note.octave}</span>
        </div>
      )}
      {!isCorrect && !recovering && errorType && errorType !== 'random' && (
        <div className="max-w-xs text-xs text-center text-neon-amber/80 bg-neon-amber/5 px-3 py-2 rounded-xl animate-slide-up border border-neon-amber/15">
          {getErrorTip(errorType, note, notation)}
        </div>
      )}
      {!isCorrect && recovering && (
        <div className="flex flex-col items-center gap-1.5">
          <div className="text-sm text-neon-cyan font-medium animate-pulse px-3 py-1 rounded-lg">
            ¡Intenta de nuevo!
          </div>
          <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-neon-cyan rounded-full animate-timer-shrink" />
          </div>
        </div>
      )}
      <span className="sr-only">{announcement}</span>
    </div>
  )
}
