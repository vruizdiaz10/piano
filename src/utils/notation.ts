import { NoteName, Notation } from '../types'

const AMERICAN_TO_LATIN: Record<string, string> = {
  'C': 'Do', 'C#': 'Do#', 'D': 'Re', 'D#': 'Re#', 'E': 'Mi',
  'F': 'Fa', 'F#': 'Fa#', 'G': 'Sol', 'G#': 'Sol#', 'A': 'La', 'A#': 'La#', 'B': 'Si'
}

export function displayNoteName(name: NoteName, notation: Notation): string {
  if (notation === 'american') return name
  return AMERICAN_TO_LATIN[name] ?? name
}
