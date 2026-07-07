import { Note, Clef } from '../types'

const TREBLE_POSITIONS: Record<string, number> = {
  'C3': -14, 'D3': -13, 'E3': -12, 'F3': -11, 'G3': -10, 'A3': -9, 'B3': -8,
  'C4': -2, 'D4': -1, 'E4': 0, 'F4': 1, 'G4': 2, 'A4': 3, 'B4': 4,
  'C5': 5, 'D5': 6, 'E5': 7, 'F5': 8, 'G5': 9, 'A5': 10, 'B5': 11,
  'C6': 12, 'D6': 13, 'E6': 14, 'F6': 15, 'G6': 16,
}

const BASS_POSITIONS: Record<string, number> = {
  'A1': -8, 'B1': -7,
  'C2': -4, 'D2': -3, 'E2': -2, 'F2': -1, 'G2': 0, 'A2': 1, 'B2': 2,
  'C3': 3, 'D3': 4, 'E3': 5, 'F3': 6, 'G3': 7, 'A3': 8, 'B3': 9,
  'C4': 10, 'D4': 11, 'E4': 12, 'F4': 13, 'G4': 14,
}

export function noteToPosition(note: Note, clef: Clef = 'treble'): number {
  const name = note.name.replace('#', '')
  const key = `${name}${note.octave}`
  const map = clef === 'bass' ? BASS_POSITIONS : TREBLE_POSITIONS
  const pos = map[key]
  if (pos === undefined) throw new Error(`Note ${key} not in ${clef} clef range`)
  return pos
}
