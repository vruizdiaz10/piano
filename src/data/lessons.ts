export interface Lesson {
  id: string
  name: string
  desc: string
  pool: number[]
}

export const LESSONS: Lesson[] = [
  { id: 'lines', name: 'Líneas', desc: 'Notas en líneas del pentagrama', pool: [64, 67, 71, 74, 77] },
  { id: 'spaces', name: 'Espacios', desc: 'Notas en espacios del pentagrama', pool: [65, 69, 72, 76] },
  { id: 'lines-spaces', name: 'Líneas+Espacios', desc: 'Líneas y espacios combinados', pool: [64, 65, 67, 69, 71, 72, 74, 76, 77, 79] },
  { id: 'staff-range', name: 'Rango del pentagrama', desc: 'Pentagrama completo (C4-E5)', pool: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76] },
  { id: 'below-staff', name: 'Debajo del pentagrama', desc: 'Líneas adicionales inferiores', pool: [60, 62] },
  { id: 'above-staff', name: 'Encima del pentagrama', desc: 'Líneas adicionales superiores', pool: [79, 81, 83, 84] },
  { id: 'full-naturals', name: 'Naturales completas', desc: 'Todas las notas naturales C4-C6', pool: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84] },
  { id: 'accidentals', name: 'Sostenidos', desc: 'Introducir sostenidos', pool: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84] },
  { id: 'all-notes', name: 'Todas las notas', desc: 'Clave de sol completa C4-C6', pool: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84] },
]

export function getLessonPool(lessonId: string): number[] {
  const lesson = LESSONS.find(l => l.id === lessonId)
  return lesson ? lesson.pool : LESSONS[0].pool
}
