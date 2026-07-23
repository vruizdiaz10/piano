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

// Basic natural-only lessons — used as base pool (no sharps, no ledger extras)
const BASIC_TREBLE = ['lines', 'spaces', 'lines-spaces', 'staff-range']
const BASIC_BASS = ['bass-lines', 'bass-spaces', 'bass-lines-spaces', 'bass-staff-range']

/**
 * Build a MIDI note pool from a QuickLessonConfig.
 * Base pool = only natural-note staff lessons (no sharps, no ledger).
 * Ledger lines and accidentals added only when enabled.
 */
export function buildCustomPool(config: QuickLessonConfig): number[] {
  const { clef, lines, spaces, ledgerAbove, ledgerBelow, sharps } = config

  // 1. Base pool: only basic natural lessons (no accidentals, no ledger lessons)
  const basicIds = clef === 'bass' ? BASIC_BASS : BASIC_TREBLE
  let allMidi = [...new Set(
    LESSONS.filter(l => basicIds.includes(l.id)).flatMap(l => l.pool)
  )]

  if (clef === 'both') {
    const trebleMidi = LESSONS.filter(l => BASIC_TREBLE.includes(l.id)).flatMap(l => l.pool)
    const bassMidi = LESSONS.filter(l => BASIC_BASS.includes(l.id))
      .flatMap(l => l.pool)
      .filter(m => m < 60 || m > 64) // remove overlap zone (C4-E4)
    allMidi = [...new Set([...trebleMidi, ...bassMidi])]
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

  // Filter out notes outside allowed ledger range
  const minPos = ledgerBelow > 0 ? -(ledgerBelow * 2) : 0
  const maxPos = ledgerAbove > 0 ? 8 + (ledgerAbove * 2) : 8
  filtered = filtered.filter(midi => {
    const note = midiToNote(midi)
    const pos = noteToPosition(note, clef === 'both' ? (midi < 60 ? 'bass' : 'treble') : clef)
    return pos >= minPos && pos <= maxPos
  })

  // 3. Add ledger lines above (only if requested)
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

  // 4. Add ledger lines below (only if requested)
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

  // 5. Add sharps (only if enabled)
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
