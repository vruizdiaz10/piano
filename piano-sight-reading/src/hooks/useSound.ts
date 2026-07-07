import { useRef, useCallback } from 'react'

const HARMONICS = [
  { mult: 1, gain: 1.0 },
  { mult: 2, gain: 0.5 },
  { mult: 3, gain: 0.3 },
  { mult: 4, gain: 0.15 },
  { mult: 5, gain: 0.08 },
]

const NOTE_DURATION = 1.6

function playOsc(ctx: AudioContext, freq: number, harmonic: number, startTime: number, duration = NOTE_DURATION) {
  const osc = ctx.createOscillator()
  osc.type = harmonic === 1 ? 'triangle' : 'sine'
  osc.frequency.setValueAtTime(freq, startTime)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(harmonic === 1 ? 0.4 : 0.2, startTime + 0.005)
  gain.gain.linearRampToValueAtTime(0.15, startTime + 0.3)
  gain.gain.setValueAtTime(0.15, startTime + 0.6)
  gain.gain.linearRampToValueAtTime(0, startTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration)
}

function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12)
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
    const freq = midiToFreq(midi)
    const now = ctx.currentTime

    for (const h of HARMONICS) {
      playOsc(ctx, freq * h.mult, h.mult, now)
    }
  }, [getContext])

  const playCorrect = useCallback(() => {
    const ctx = getContext()
    const now = ctx.currentTime
    // Major chord arpeggio C5-E5-G5
    const notes = [72, 76, 79]
    notes.forEach((midi, i) => {
      playOsc(ctx, midiToFreq(midi), 1, now + i * 0.12, 0.8)
    })
  }, [getContext])

  const playWrong = useCallback(() => {
    const ctx = getContext()
    const now = ctx.currentTime
    // Minor chord C5-Eb5-G5
    const notes = [72, 75, 79]
    notes.forEach((midi, i) => {
      playOsc(ctx, midiToFreq(midi), 1, now + i * 0.1, 0.6)
    })
  }, [getContext])

  const playStreakMilestone = useCallback(() => {
    const ctx = getContext()
    const now = ctx.currentTime
    // Ascending scale fragment
    const notes = [72, 74, 76, 79, 84]
    notes.forEach((midi, i) => {
      playOsc(ctx, midiToFreq(midi), 1, now + i * 0.08, 0.5)
    })
  }, [getContext])

  const playLevelComplete = useCallback(() => {
    const ctx = getContext()
    const now = ctx.currentTime
    // Fanfare: C5-E5-G5-C6
    const notes = [72, 76, 79, 84]
    notes.forEach((midi, i) => {
      playOsc(ctx, midiToFreq(midi), 1, now + i * 0.15, 1.2)
      playOsc(ctx, midiToFreq(midi) * 2, 2, now + i * 0.15, 1.2)
    })
  }, [getContext])

  return { playNote, playCorrect, playWrong, playStreakMilestone, playLevelComplete }
}
