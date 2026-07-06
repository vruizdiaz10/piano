import { Note } from '../types'
import { Difficulty } from '../types'

const NOTE_POSITIONS: Record<string, number> = {
  'C3': -14, 'D3': -13, 'E3': -12, 'F3': -11, 'G3': -10, 'A3': -9, 'B3': -8,
  'C4': -2, 'D4': -1, 'E4': 0, 'F4': 1, 'G4': 2, 'A4': 3, 'B4': 4,
  'C5': 5, 'D5': 6, 'E5': 7, 'F5': 8, 'G5': 9, 'A5': 10, 'B5': 11,
  'C6': 12, 'D6': 13, 'E6': 14, 'F6': 15, 'G6': 16,
}

export function noteToPosition(note: Note): number {
  const name = note.name.replace('#', '')
  const key = `${name}${note.octave}`
  const pos = NOTE_POSITIONS[key]
  if (pos === undefined) throw new Error(`Note ${key} not in treble clef range`)
  return pos
}

export function getNotePool(difficulty: Difficulty): number[] {
  if (difficulty === 'beginner') {
    return [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84]
  }
  return Array.from({ length: 49 }, (_, i) => 48 + i)
}
