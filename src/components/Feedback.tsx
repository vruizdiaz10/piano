import { Note } from '../types'
import { cn } from '../lib/utils'

interface FeedbackProps {
  isCorrect: boolean | null
  note: Note | null
}

export default function Feedback({ isCorrect, note }: FeedbackProps) {
  if (isCorrect === null || !note) return <div className="min-h-12" />

  return (
    <div className="min-h-12 flex flex-col items-center justify-center mt-2">
      <span className={cn('text-lg font-bold', isCorrect ? 'text-green-600' : 'text-red-500')}>
        {isCorrect ? '\u2713 Correct!' : '\u2717 Wrong'}
      </span>
      {!isCorrect && (
        <span className="text-sm text-gray-500 mt-1">
          That was {note.name}{note.octave}
        </span>
      )}
    </div>
  )
}
