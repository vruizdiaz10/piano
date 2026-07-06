import { Note } from '../types'

interface FeedbackProps {
  isCorrect: boolean | null
  note: Note | null
}

export default function Feedback({ isCorrect, note }: FeedbackProps) {
  if (isCorrect === null || !note) return <div className="h-12" />

  return (
    <div className="flex flex-col items-center justify-center gap-2 mt-2">
      <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold ${
        isCorrect
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}>
        <span className="text-base">{isCorrect ? '\u2713' : '\u2717'}</span>
        {isCorrect ? 'Correct!' : 'Wrong'}
      </div>
      {!isCorrect && (
        <div className="text-sm text-slate-500">
          That was <span className="font-semibold text-slate-700">{note.name}{note.octave}</span>
        </div>
      )}
    </div>
  )
}
