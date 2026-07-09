const LS_KEY = 'piano-weak-notes'

export function addWeakNote(midi: number) {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || '[]') as number[]
    const next = raw.filter(n => n !== midi).concat(midi).slice(-10)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
  } catch {}
}

export function getWeakNotes(): number[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]') as number[]
  } catch { return [] }
}

export function clearWeakNotes() {
  try { localStorage.removeItem(LS_KEY) } catch {}
}
