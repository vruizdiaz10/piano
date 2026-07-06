import { LESSONS } from '../data/lessons'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { Checkbox } from './ui/checkbox'

interface ToolbarProps {
  lessonId: string
  showNoteName: boolean
  onLessonChange: (id: string) => void
  onShowNoteNameChange: (v: boolean) => void
}

export default function Toolbar({
  lessonId, showNoteName,
  onLessonChange, onShowNoteNameChange,
}: ToolbarProps) {
  const current = LESSONS.find(l => l.id === lessonId)

  return (
    <div className="flex justify-center gap-3 mb-4 flex-wrap items-center">
      <div className="flex flex-col items-start gap-1">
        <div className="relative z-50">
          <Select value={lessonId} onValueChange={onLessonChange}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LESSONS.map(l => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {current && (
          <span className="text-xs text-gray-400 ml-1">{current.desc}</span>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <Checkbox checked={showNoteName} onCheckedChange={(v) => onShowNoteNameChange(!!v)} />
        Show note name
      </label>
    </div>
  )
}
