// src/utils/notePool.ts
import { QuickLessonConfig } from '../types'
import { LESSONS } from '../data/lessons'
import { midiToNote } from './midiToNote'
import { noteToPosition } from './noteToPosition'

function isLinePosition(midi: number, clef: 'treble' | 'bass'): boolean {
  try {
    const note = midiToNote(midi)
    const pos = noteToPosition(note, clef)
    return pos % 2 === 0 // even positions = lines (0,2,4,6,8)
  } catch {
    return false
  }
}

function isSpacePosition(midi: number, clef: 'treble' | 'bass'): boolean {
  try {
    const note = midiToNote(midi)
    const pos = noteToPosition(note, clef)
    return pos % 2 !== 0 // odd positions = spaces (1,3,5,7)
  } catch {
    return false
  }
}

function filterByPosition(
  midiPool: number[],
  clef: 'treble' | 'bass',
  lines: boolean,
  spaces: boolean,
): number[] {
  if (lines && spaces) return midiPool
  return midiPool.filter(midi => {
    if (lines && isLinePosition(midi, clef)) return true
    if (spaces && isSpacePosition(midi, clef)) return true
    return false
  })
}

/**
 * Build a MIDI note pool from a QuickLessonConfig.
 * Filters existing lesson pools by position classification (line/space),
 * adds ledger lines and sharps with the same filter applied.
 */
export function buildCustomPool(config: QuickLessonConfig): number[] {
  const { clef, lines, spaces, ledgerAbove, ledgerBelow, sharps } = config

  // 1. Base pool by clef
  let allMidi: number[]
  if (clef === 'both') {
    const treblePool = LESSONS.filter(l => l.clef === 'treble').flatMap(l => l.pool)
    const bassPool = LESSONS.filter(l => l.clef === 'bass')
      .flatMap(l => l.pool)
      .filter(m => m < 60 || m > 64) // remove overlap zone (C4-E4)
    allMidi = [...new Set([...treblePool, ...bassPool])]
  } else {
    allMidi = [...new Set(LESSONS.filter(l => l.clef === clef).flatMap(l => l.pool))]
  }

  // 2. Filter by lines/spaces
  const targetClef = clef === 'both' ? 'treble' : clef
  let filtered = filterByPosition(allMidi, targetClef, lines, spaces)

  // For 'both' clef, also filter bass notes using bass clef classification
  if (clef === 'both') {
    const bassMidi = allMidi.filter(m => m < 60)
    const trebleMidi = allMidi.filter(m => m >= 60)
    const filteredBass = filterByPosition(bassMidi, 'bass', lines, spaces)
    const filteredTreble = filterByPosition(trebleMidi, 'treble', lines, spaces)
    filtered = [...new Set([...filteredTreble, ...filteredBass])]
  }

  // 3. Add ledger lines above (with same line/space filter)
  if (ledgerAbove > 0) {
    const addLedger = (lessonId: string, ledgerClef: 'treble' | 'bass') => {
      const lesson = LESSONS.find(l => l.id === lessonId)
      if (!lesson) return
      const filteredNotes = filterByPosition(lesson.pool, ledgerClef, lines, spaces)
      const count = Math.min(ledgerAbove, filteredNotes.length)
      for (let i = 0; i < count; i++) filtered.push(filteredNotes[i])
    }
    if (clef === 'treble' || clef === 'both') addLedger('above-staff', 'treble')
    if (clef === 'bass' || clef === 'both') addLedger('bass-above', 'bass')
  }

  // 4. Add ledger lines below (with same line/space filter)
  if (ledgerBelow > 0) {
    const addLedger = (lessonId: string, ledgerClef: 'treble' | 'bass') => {
      const lesson = LESSONS.find(l => l.id === lessonId)
      if (!lesson) return
      const filteredNotes = filterByPosition(lesson.pool, ledgerClef, lines, spaces)
      const count = Math.min(ledgerBelow, filteredNotes.length)
      for (let i = 0; i < count; i++) filtered.push(filteredNotes[i])
    }
    if (clef === 'treble' || clef === 'both') addLedger('below-staff', 'treble')
    if (clef === 'bass' || clef === 'both') addLedger('bass-below', 'bass')
  }

  // 5. Add sharps (with same line/space filter)
  if (sharps) {
    const accidentalIds = clef === 'bass' || clef === 'both'
      ? ['accidentals', 'bass-accidentals']
      : ['accidentals']
    const sharpMidi = accidentalIds
      .flatMap(id => LESSONS.find(l => l.id === id)?.pool ?? [])
      .filter(m => !filtered.includes(m))
    const filteredSharps = clef === 'both'
      ? [
          ...filterByPosition(sharpMidi.filter(m => m >= 60), 'treble', lines, spaces),
          ...filterByPosition(sharpMidi.filter(m => m < 60), 'bass', lines, spaces),
        ]
      : filterByPosition(sharpMidi, targetClef, lines, spaces)
    filtered.push(...filteredSharps)
  }

  // 6. Deduplicate
  const unique = [...new Set(filtered)]
  return unique.length > 0 ? unique : allMidi
}
