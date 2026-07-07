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
        .catch(() => { console.warn('MIDI access denied or unavailable'); setMidiConnected(false) })
    }

    return () => {
      inputs.forEach(inp => { inp.onmidimessage = null })
      if (midiAccess) midiAccess.onstatechange = null
    }
  }, [])

  return { midiConnected }
}
