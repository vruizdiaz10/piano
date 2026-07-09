import { Note, ErrorType, Notation } from '../types'
import { midiToNote } from './midiToNote'
import { noteToPosition } from './noteToPosition'
import { displayNoteName } from './notation'

export function analyzeError(correct: Note, answerMidi: number): ErrorType {
  const answer = midiToNote(answerMidi)
  const diff = Math.abs(correct.midi - answerMidi)

  const isSameName = correct.name.replace('#', '') === answer.name.replace('#', '')
  if (isSameName && correct.midi !== answerMidi) return 'octave'

  if (diff === 1) {
    if (correct.name.includes('#') || answer.name.includes('#')) return 'accidental'
    return 'step'
  }

  if (diff === 2) {
    try {
      const correctOnLine = noteToPosition(correct) % 2 === 0
      const answerOnLine = noteToPosition(answer) % 2 === 0
      if (correctOnLine !== answerOnLine) return 'line-space'
    } catch {
      return 'random'
    }
    return 'skip'
  }

  if (diff <= 5) return 'skip'

  if (correct.midi < 64 || correct.midi > 79) return 'ledger-line'

  return 'random'
}

export function getErrorTip(type: ErrorType, note: Note, notation: Notation = 'american'): string {
  const tips: Record<ErrorType, string> = {
    'line-space': `Has confundido línea con espacio. Las notas en LÍNEAS son E-G-B-D-F, los ESPACIOS son F-A-C-E. "${displayNoteName(note.name, notation)}${note.octave}" está en un ${noteToPosition(note) % 2 === 0 ? 'línea' : 'espacio'}.`,
    'step': '¡Estuviste cerca! Solo un tono de distancia. Practica la secuencia ascendente y descendente.',
    'skip': 'Te saltaste varias notas. Cuenta desde la nota que tocaste hasta la correcta en el pentagrama.',
    'octave': `La nota correcta, pero en la octava equivocada. "${displayNoteName(note.name, notation)}${note.octave}" está más ${note.octave < 5 ? 'abajo' : 'arriba'} en el pentagrama.`,
    'accidental': 'Error de sostenido. El # sube medio tono. Las teclas negras están entre las blancas.',
    'ledger-line': 'Las líneas adicionales son confusas. Cuenta desde el pentagrama hacia afuera.',
    'random': `Era ${displayNoteName(note.name, notation)}${note.octave}. Sigue practicando.`,
  }
  return tips[type]
}
