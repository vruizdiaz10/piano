import { useState, useEffect, useRef } from 'react'
import type { User } from 'firebase/auth'
import { SENSEI_QUOTES, type Quote } from '../data/senseiQuotes'
import { loadQuoteHistory, saveQuoteHistory } from '../firebase/firestore'

function getToday(): string {
  return new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD in local timezone
}

function getLocalKey(): string {
  return `piano-quotes-${getToday()}`
}

function loadLocal(): number[] {
  try {
    const raw = localStorage.getItem(getLocalKey())
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLocal(indices: number[]): void {
  try {
    localStorage.setItem(getLocalKey(), JSON.stringify(indices))
  } catch { /* noop */ }
}

export function useQuoteHistory(user: User | null) {
  const [quote, setQuote] = useState(() => pickQuote(loadLocal()))
  const shownRef = useRef<number[]>(loadLocal())

  // Sync from Firestore on mount (authenticated users only)
  useEffect(() => {
    if (!user) return
    const date = getToday()
    loadQuoteHistory(user.uid, date).then((firestoreIndices) => {
      if (firestoreIndices.length === 0) return
      shownRef.current = [...new Set([...shownRef.current, ...firestoreIndices])]
      saveLocal(shownRef.current)
    }).catch(() => { /* offline — localStorage is source of truth */ })
  }, [user])

  // Pick a new quote (called from event handlers, not during render)
  const nextQuote = () => {
    const q = pickQuote(shownRef.current)
    shownRef.current = [...shownRef.current, q.index]
    saveLocal(shownRef.current)
    setQuote(q)
    if (user) {
      saveQuoteHistory(user.uid, getToday(), shownRef.current).catch(() => { /* noop */ })
    }
    return q
  }

  return { quote, nextQuote }
}

function pickQuote(shownIndices: number[]): Quote & { index: number } {
  const pool = SENSEI_QUOTES
  const available = pool
    .map((q, i) => ({ ...q, index: i }))
    .filter(({ index }) => !shownIndices.includes(index))

  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)]
  }
  // Pool exhausted — allow repeats
  const index = Math.floor(Math.random() * pool.length)
  return { ...pool[index], index }
}
