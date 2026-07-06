import { Note } from '../types'

interface FeedbackProps {
  isCorrect: boolean | null
  note: Note | null
}

export default function Feedback({ isCorrect, note }: FeedbackProps) {
  if (isCorrect === null || !note) return <div className="h-14" />

  return (
    <div className="flex flex-col items-center justify-center gap-2 mt-2 animate-pop-in">
      <div className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-base font-bold shadow-sm ${
        isCorrect
          ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300'
          : 'bg-red-50 text-red-700 border-2 border-red-300'
      }`}>
        <span className="text-xl">{isCorrect ? '\u2713' : '\u2717'}</span>
        {isCorrect ? 'Correct!' : 'Wrong'}
      </div>
      {!isCorrect && (
        <div className="text-sm text-amber-700 font-medium">
          That was <span className="font-bold text-red-600">{note.name}{note.octave}</span>
        </div>
      )}
    </div>
  )
}
