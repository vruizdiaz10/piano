import { MasteryCriteria } from '../types'

export interface Lesson {
  id: string
  name: string
  desc: string
  pool: number[]
  mastery: MasteryCriteria
}

export const LESSONS: Lesson[] = [
  { id: 'lines', name: 'Líneas', desc: 'Notas en líneas del pentagrama', pool: [64, 67, 71, 74, 77], mastery: { minAccuracy: 0.85, minStreak: 4, minNotes: 8, unlockNext: true } },
  { id: 'spaces', name: 'Espacios', desc: 'Notas en espacios del pentagrama', pool: [65, 69, 72, 76], mastery: { minAccuracy: 0.85, minStreak: 4, minNotes: 8, unlockNext: true } },
  { id: 'lines-spaces', name: 'Líneas+Espacios', desc: 'Líneas y espacios combinados', pool: [64, 65, 67, 69, 71, 72, 74, 76, 77, 79], mastery: { minAccuracy: 0.80, minStreak: 3, minNotes: 10, unlockNext: true } },
  { id: 'staff-range', name: 'Rango del pentagrama', desc: 'Pentagrama completo (C4-E5)', pool: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76], mastery: { minAccuracy: 0.80, minStreak: 3, minNotes: 10, unlockNext: true } },
  { id: 'below-staff', name: 'Debajo del pentagrama', desc: 'Líneas adicionales inferiores', pool: [60, 62], mastery: { minAccuracy: 0.90, minStreak: 5, minNotes: 8, unlockNext: true } },
  { id: 'above-staff', name: 'Encima del pentagrama', desc: 'Líneas adicionales superiores', pool: [79, 81, 83, 84], mastery: { minAccuracy: 0.90, minStreak: 5, minNotes: 8, unlockNext: true } },
  { id: 'full-naturals', name: 'Naturales completas', desc: 'Todas las notas naturales C4-C6', pool: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84], mastery: { minAccuracy: 0.80, minStreak: 3, minNotes: 15, unlockNext: true } },
  { id: 'accidentals', name: 'Sostenidos', desc: 'Introducir sostenidos', pool: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84], mastery: { minAccuracy: 0.75, minStreak: 3, minNotes: 15, unlockNext: true } },
  { id: 'all-notes', name: 'Todas las notas', desc: 'Clave de sol completa C4-C6', pool: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84], mastery: { minAccuracy: 0.75, minStreak: 3, minNotes: 20, unlockNext: false } },
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
