import { Difficulty } from '../types'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { Checkbox } from './ui/checkbox'

const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate']

interface ToolbarProps {
  difficulty: Difficulty
  showNoteName: boolean
  onDifficultyChange: (d: Difficulty) => void
  onShowNoteNameChange: (v: boolean) => void
}

export default function Toolbar({
  difficulty, showNoteName,
  onDifficultyChange, onShowNoteNameChange,
}: ToolbarProps) {
  return (
    <div className="flex justify-center gap-3 mb-4 flex-wrap items-center">
      <Select value={difficulty} onValueChange={(val) => {
        if (DIFFICULTIES.includes(val as Difficulty)) onDifficultyChange(val as Difficulty)
      }}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
        </SelectContent>
      </Select>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <Checkbox checked={showNoteName} onCheckedChange={(v) => onShowNoteNameChange(!!v)} />
        Show note name
      </label>
    </div>
  )
}
