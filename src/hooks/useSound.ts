import { useRef, useCallback } from 'react'

// Piano-like harmonic spectrum (relative amplitudes)
const HARMONICS = [
  { mult: 1, gain: 1.0 },
  { mult: 2, gain: 0.5 },
  { mult: 3, gain: 0.3 },
  { mult: 4, gain: 0.15 },
  { mult: 5, gain: 0.08 },
]

const NOTE_DURATION = 1.6

function playOsc(ctx: AudioContext, freq: number, harmonic: number, startTime: number) {
  const osc = ctx.createOscillator()
  osc.type = harmonic === 1 ? 'triangle' : 'sine'
  osc.frequency.setValueAtTime(freq, startTime)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(harmonic === 1 ? 0.4 : 0.2, startTime + 0.005)
  gain.gain.linearRampToValueAtTime(0.15, startTime + 0.3)
  gain.gain.setValueAtTime(0.15, startTime + 0.6)
  gain.gain.linearRampToValueAtTime(0, startTime + NOTE_DURATION)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + NOTE_DURATION)
}

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getContext = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const playNote = useCallback((midi: number) => {
    const ctx = getContext()
    const freq = 440 * Math.pow(2, (midi - 69) / 12)
    const now = ctx.currentTime

    for (const h of HARMONICS) {
      playOsc(ctx, freq * h.mult, h.mult, now)
    }
  }, [getContext])

  return { playNote }
}
