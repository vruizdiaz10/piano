import { MasteryCriteria, Clef } from '../types'

export interface Lesson {
  id: string
  name: string
  desc: string
  pool: number[]
  mastery: MasteryCriteria
  clef: Clef
}

export const LESSONS: Lesson[] = [
  { id: 'lines', name: 'Líneas (Sol)', desc: 'Notas en líneas del pentagrama', pool: [64, 67, 71, 74, 77], mastery: { minAccuracy: 0.85, minStreak: 4, minNotes: 8, unlockNext: true }, clef: 'treble' },
  { id: 'spaces', name: 'Espacios (Sol)', desc: 'Notas en espacios del pentagrama', pool: [65, 69, 72, 76], mastery: { minAccuracy: 0.85, minStreak: 4, minNotes: 8, unlockNext: true }, clef: 'treble' },
  { id: 'lines-spaces', name: 'Líneas+Espacios (Sol)', desc: 'Líneas y espacios combinados', pool: [64, 65, 67, 69, 71, 72, 74, 76, 77, 79], mastery: { minAccuracy: 0.80, minStreak: 3, minNotes: 10, unlockNext: true }, clef: 'treble' },
  { id: 'staff-range', name: 'Rango pentagrama (Sol)', desc: 'Pentagrama completo (C4-E5)', pool: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76], mastery: { minAccuracy: 0.80, minStreak: 3, minNotes: 10, unlockNext: true }, clef: 'treble' },
  { id: 'below-staff', name: 'Debajo pentagrama (Sol)', desc: 'Líneas adicionales inferiores', pool: [60, 62], mastery: { minAccuracy: 0.90, minStreak: 5, minNotes: 8, unlockNext: true }, clef: 'treble' },
  { id: 'above-staff', name: 'Encima pentagrama (Sol)', desc: 'Líneas adicionales superiores', pool: [79, 81, 83, 84], mastery: { minAccuracy: 0.90, minStreak: 5, minNotes: 8, unlockNext: true }, clef: 'treble' },
  { id: 'full-naturals', name: 'Naturales (Sol)', desc: 'Todas las notas naturales C4-C6', pool: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84], mastery: { minAccuracy: 0.80, minStreak: 3, minNotes: 15, unlockNext: true }, clef: 'treble' },
  { id: 'accidentals', name: 'Sostenidos (Sol)', desc: 'Introducir sostenidos', pool: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84], mastery: { minAccuracy: 0.75, minStreak: 3, minNotes: 15, unlockNext: true }, clef: 'treble' },
  { id: 'all-notes', name: 'Todas las notas (Sol)', desc: 'Clave de sol completa C4-C6', pool: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84], mastery: { minAccuracy: 0.75, minStreak: 3, minNotes: 20, unlockNext: false }, clef: 'treble' },
  { id: 'bass-lines', name: 'Líneas (Fa)', desc: 'Notas en líneas clave de Fa', pool: [43, 47, 50, 53, 57], mastery: { minAccuracy: 0.85, minStreak: 4, minNotes: 8, unlockNext: true }, clef: 'bass' },
  { id: 'bass-spaces', name: 'Espacios (Fa)', desc: 'Notas en espacios clave de Fa', pool: [45, 48, 52, 55], mastery: { minAccuracy: 0.85, minStreak: 4, minNotes: 8, unlockNext: true }, clef: 'bass' },
  { id: 'bass-lines-spaces', name: 'Líneas+Espacios (Fa)', desc: 'Líneas y espacios combinados', pool: [43, 45, 47, 48, 50, 52, 53, 55, 57, 59], mastery: { minAccuracy: 0.80, minStreak: 3, minNotes: 10, unlockNext: true }, clef: 'bass' },
  { id: 'bass-staff-range', name: 'Rango pentagrama (Fa)', desc: 'Pentagrama completo (G2-D4)', pool: [43, 45, 47, 48, 50, 52, 53, 55, 57, 59, 60, 62], mastery: { minAccuracy: 0.80, minStreak: 3, minNotes: 10, unlockNext: true }, clef: 'bass' },
  { id: 'bass-below', name: 'Debajo pentagrama (Fa)', desc: 'Líneas adicionales inferiores', pool: [36, 38, 40, 41], mastery: { minAccuracy: 0.90, minStreak: 5, minNotes: 8, unlockNext: true }, clef: 'bass' },
  { id: 'bass-above', name: 'Encima pentagrama (Fa)', desc: 'Líneas adicionales superiores', pool: [60, 62, 64], mastery: { minAccuracy: 0.90, minStreak: 5, minNotes: 8, unlockNext: true }, clef: 'bass' },
  { id: 'bass-full-naturals', name: 'Naturales (Fa)', desc: 'Todas las notas naturales C2-D4', pool: [36, 38, 40, 41, 43, 45, 47, 48, 50, 52, 53, 55, 57, 59, 60, 62], mastery: { minAccuracy: 0.80, minStreak: 3, minNotes: 15, unlockNext: true }, clef: 'bass' },
  { id: 'bass-accidentals', name: 'Sostenidos (Fa)', desc: 'Introducir sostenidos bajo', pool: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62], mastery: { minAccuracy: 0.75, minStreak: 3, minNotes: 15, unlockNext: true }, clef: 'bass' },
  { id: 'bass-all-notes', name: 'Todas las notas (Fa)', desc: 'Clave de Fa completa C2-E4', pool: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64], mastery: { minAccuracy: 0.75, minStreak: 3, minNotes: 20, unlockNext: false }, clef: 'bass' },
]

export function getLessonPool(lessonId: string): number[] {
  const lesson = LESSONS.find(l => l.id === lessonId)
  return lesson ? lesson.pool : LESSONS[0].pool
}

export function getNextLessonPool(lessonId: string): number[] | null {
  const idx = LESSONS.findIndex(l => l.id === lessonId)
  if (idx === -1 || idx >= LESSONS.length - 1) return null
  return LESSONS[idx + 1].pool
}
