### Task 5: useMidi Hook

**Note:** Use the REFACTORED version (Step 2 below). The initial version in the plan was a first draft; Step 2 is the final design.

**Files:**
- Create: `src/hooks/useMidi.ts`

**Interfaces:**
- Consumes: nothing (uses browser's `navigator.requestMIDIAccess`)
- Produces: `{ midiConnected: boolean }` (cleans up on unmount)
- Accepts: `onNoteOn: (midi: number) => void` callback prop

**Step 1: Create useMidi.ts (refactored listener pattern)**
```ts
import { useState, useEffect, useRef } from 'react'

export function useMidi(onNoteOn: (midi: number) => void) {
  const [midiConnected, setMidiConnected] = useState(false)
  const handlerRef = useRef(onNoteOn)
  handlerRef.current = onNoteOn

  useEffect(() => {
    let midiAccess: MIDIAccess | null = null
    let inputs: MIDIInput[] = []

    function onMidiMessage(event: MIDIMessageEvent) {
      if (!event.data) return
      const [status, note, velocity] = event.data
      if ((status & 0xf0) === 0x90 && velocity > 0) {
        handlerRef.current?.(note)
      }
    }

    function connectInputs(access: MIDIAccess) {
      inputs.forEach(inp => { inp.onmidimessage = null })
      inputs = []
      for (const input of access.inputs.values()) {
        input.onmidimessage = onMidiMessage
        inputs.push(input)
      }
      setMidiConnected(inputs.length > 0)
    }

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then((access) => {
          midiAccess = access
          connectInputs(access)
          access.onstatechange = () => connectInputs(access)
        })
        .catch(() => setMidiConnected(false))
    }

    return () => {
      inputs.forEach(inp => { inp.onmidimessage = null })
      if (midiAccess) midiAccess.onstatechange = null
    }
  }, [])

  return { midiConnected }
}
```

**Step 2: Commit**
```bash
git add src/hooks/useMidi.ts
git commit -m "feat: add useMidi hook for Web MIDI API"
```
