const LS_KEY = 'piano-sessions'

export interface SessionRecord {
  accuracy: number
  notes: number
  lessonId: string
  date: string
}

export function saveSession(r: SessionRecord) {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || '[]') as SessionRecord[]
    const next = [r, ...raw].slice(0, 20)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
  } catch {}
}

export function getSessions(): SessionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]') as SessionRecord[]
  } catch { return [] }
}
