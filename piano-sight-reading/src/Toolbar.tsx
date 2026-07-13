import { LESSONS } from '../data/lessons'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { Checkbox } from './ui/checkbox'

interface ToolbarProps {
  lessonId: string
  showNoteName: boolean
  isTimed: boolean
  onLessonChange: (id: string) => void
  onShowNoteNameChange: (v: boolean) => void
  onTimedChange: (v: boolean) => void
}

export default function Toolbar({
  lessonId, showNoteName, isTimed,
  onLessonChange, onShowNoteNameChange, onTimedChange,
}: ToolbarProps) {
  const current = LESSONS.find(l => l.id === lessonId)

  return (
    <div className="flex justify-center gap-3 flex-wrap items-center flex-col sm:flex-row">
      <div className="flex flex-col items-start gap-1 w-full sm:w-auto">
        <Select value={lessonId} onValueChange={onLessonChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Seleccionar lección" />
          </SelectTrigger>
          <SelectContent>
            {LESSONS.map(l => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {current && (
          <span className="text-xs text-muted-foreground ml-1 mt-1 sm:mt-0">{current.desc}</span>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer text-muted-foreground hover:text-foreground transition-colors flex-row">
        <Checkbox checked={showNoteName} onCheckedChange={(v) => onShowNoteNameChange(!!v)} />
        Mostrar nota
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer text-muted-foreground hover:text-foreground transition-colors flex-row">
        <Checkbox checked={isTimed} onCheckedChange={(v) => onTimedChange(!!v)} />
        Temporizador
      </label>
    </div>
  )
}
