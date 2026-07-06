export interface Lesson {
  id: string
  name: string
  desc: string
  pool: number[]
}

export const LESSONS: Lesson[] = [
  { id: 'lines', name: 'Lines', desc: 'Notes on staff lines', pool: [64, 67, 71, 74, 77] },
  { id: 'spaces', name: 'Spaces', desc: 'Notes in staff spaces', pool: [65, 69, 72, 76] },
  { id: 'lines-spaces', name: 'Lines+Spaces', desc: 'Lines and spaces combined', pool: [64, 65, 67, 69, 71, 72, 74, 76, 77, 79] },
  { id: 'staff-range', name: 'Staff Range', desc: 'Full staff (C4-E5)', pool: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76] },
  { id: 'below-staff', name: 'Below Staff', desc: 'Ledger lines below staff', pool: [60, 62] },
  { id: 'above-staff', name: 'Above Staff', desc: 'Ledger lines above staff', pool: [79, 81, 83, 84] },
  { id: 'full-naturals', name: 'Full Naturals', desc: 'All natural notes C4-C6', pool: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84] },
  { id: 'accidentals', name: 'Accidentals', desc: 'Introduce sharps', pool: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84] },
  { id: 'all-notes', name: 'All Notes', desc: 'Full treble clef C4-C6', pool: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84] },
]

export function getLessonPool(lessonId: string): number[] {
  const lesson = LESSONS.find(l => l.id === lessonId)
  return lesson ? lesson.pool : LESSONS[0].pool
}
