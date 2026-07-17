import { useState, useEffect, useCallback } from 'react'
import type { User } from 'firebase/auth'
import { SENSEI_QUOTES } from '../data/senseiQuotes'
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
  const [shownIndices, setShownIndices] = useState<number[]>(() => loadLocal())

  // Sync from Firestore on mount (authenticated users only)
  useEffect(() => {
    if (!user) return
    const date = getToday()
    loadQuoteHistory(user.uid, date).then((firestoreIndices) => {
      if (firestoreIndices.length === 0) return
      setShownIndices((prev) => {
        const merged = [...new Set([...prev, ...firestoreIndices])]
        if (merged.length > prev.length) {
          saveLocal(merged) // update localStorage with merged set
        }
        return merged
      })
    }).catch(() => { /* offline or error — localStorage is source of truth */ })
  }, [user])

  const getRandomQuote = useCallback(() => {
    const pool = SENSEI_QUOTES
    const available = pool
      .map((q, i) => ({ q, i }))
      .filter(({ i }) => !shownIndices.includes(i))

    let selected: typeof pool[number]
    let selectedIndex: number

    if (available.length > 0) {
      const pick = available[Math.floor(Math.random() * available.length)]
      selected = pick.q
      selectedIndex = pick.i
    } else {
      // Pool exhausted — allow repeats
      selectedIndex = Math.floor(Math.random() * pool.length)
      selected = pool[selectedIndex]
    }

    const newIndices = [...shownIndices, selectedIndex]
    setShownIndices(newIndices)
    saveLocal(newIndices)

    // Persist to Firestore if authenticated
    if (user) {
      saveQuoteHistory(user.uid, getToday(), newIndices).catch(() => { /* noop */ })
    }

    return selected
  }, [shownIndices, user])

  return { getRandomQuote }
}
