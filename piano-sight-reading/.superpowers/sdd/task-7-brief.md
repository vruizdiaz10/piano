### Task 7: App Integration + Feedback + Toolbar

**Files:**
- Create: `src/App.tsx`
- Create: `src/components/Feedback.tsx`
- Create: `src/components/Toolbar.tsx`
- Create: `src/components/ui/select.tsx` (shadcn/ui select primitive)
- Create: `src/components/ui/checkbox.tsx` (shadcn/ui checkbox primitive)

**Interfaces:**
- Consumes: all previous tasks (Staff, PianoKeyboard, useGameState, useMidi, Toolbar, Feedback)
- Produces: working MVP game

**Step 1: Create shadcn/ui primitives (select, checkbox)**

`src/components/ui/select.tsx`:
```tsx
import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export const Select = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        position === 'popper' && 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn('p-1', position === 'popper' && 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]')}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName
```

`src/components/ui/checkbox.tsx`:
```tsx
import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cn } from '../../lib/utils'

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName
```

**Step 2: Create Feedback.tsx**
```tsx
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
```

**Step 3: Create Toolbar.tsx**
```tsx
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
```

**Step 4: Wire App.tsx**
```tsx
import { useCallback, useEffect, useState } from 'react'
import { useGameState } from './hooks/useGameState'
import { useMidi } from './hooks/useMidi'
import Staff from './components/Staff'
import PianoKeyboard from './components/PianoKeyboard'
import Feedback from './components/Feedback'
import Toolbar from './components/Toolbar'

export default function App() {
  const { state, startGame, submitAnswer, nextNote, setDifficulty, setShowNoteName } = useGameState()
  const [highlightKey, setHighlightKey] = useState<number | null>(null)

  const { midiConnected } = useMidi(
    useCallback((midi: number) => {
      if (state.phase === 'waiting') {
        submitAnswer(midi)
      }
    }, [state.phase, submitAnswer])
  )

  useEffect(() => {
    if (state.phase === 'feedback' && state.currentNote) {
      setHighlightKey(state.currentNote.midi)
      const timer = setTimeout(() => {
        setHighlightKey(null)
        nextNote()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [state.phase])

  const handleKeyboardPlay = useCallback((note: { name: string; octave: number; midi: number }) => {
    if (state.phase === 'waiting') {
      submitAnswer(note.midi)
    }
  }, [state.phase, submitAnswer])

  return (
    <div className="max-w-3xl mx-auto p-6 text-center font-sans">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Piano Sight-Reading</h1>
      <div className="flex justify-center gap-4 mb-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <span className={`inline-block w-2 h-2 rounded-full ${midiConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          MIDI: {midiConnected ? 'Connected' : 'Disconnected'}
        </span>
        {state.phase !== 'idle' && (
          <>
            <span>Streak: {state.streak}</span>
            <span>Score: {state.totalAttempts > 0
              ? `${Math.round(state.correctAttempts / state.totalAttempts * 100)}%`
              : '-'}
            </span>
          </>
        )}
      </div>
      <Toolbar
        difficulty={state.difficulty}
        showNoteName={state.showNoteName}
        onDifficultyChange={setDifficulty}
        onShowNoteNameChange={setShowNoteName}
      />
      <Staff note={state.currentNote} showNoteName={state.showNoteName} />
      <PianoKeyboard onPlayNote={handleKeyboardPlay} highlightKey={highlightKey} difficulty={state.difficulty} />
      {state.phase === 'idle' ? (
        <button
          className="mt-6 px-8 py-3 text-base rounded-lg bg-green-600 text-white hover:bg-green-700 cursor-pointer border-none"
          onClick={startGame}
        >
          Start Game
        </button>
      ) : state.phase === 'feedback' ? (
        <Feedback isCorrect={state.lastAnswerCorrect} note={state.currentNote} />
      ) : null}
      {state.phase === 'feedback' && (
        <button
          className="mt-2 px-6 py-2 text-sm rounded-md border border-gray-400 bg-white hover:bg-gray-100 cursor-pointer"
          onClick={() => { setHighlightKey(null); nextNote() }}
        >
          Next Note
        </button>
      )}
    </div>
  )
}
```

**Step 5: Update package.json with radix-ui dependencies**
Add to `dependencies`:
```json
"@radix-ui/react-checkbox": "^1.1.0",
"@radix-ui/react-select": "^2.1.0"
```

**Step 6: Verify app works**
Run: `npm run dev`
Expected: App loads at localhost:5173. Toolbar, staff, piano keyboard visible. "Start Game" button works. Clicking keyboard keys triggers game flow.

**Step 7: Commit**
```bash
git add -A
git commit -m "feat: integrate game with App, Feedback, and Toolbar"
```
