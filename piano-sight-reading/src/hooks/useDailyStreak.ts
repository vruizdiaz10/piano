import { useState, useCallback } from 'react'

const LS_KEY = 'piano-daily-streak'

function load(): number {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return 0
    const { date, count } = JSON.parse(raw)
    const today = new Date().toDateString()
    if (date === today) return count
    const yesterday = new Date(Date.now() - 864e5).toDateString()
    return date === yesterday ? count + 1 : 1
  } catch { return 0 }
}

function save(count: number) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ date: new Date().toDateString(), count }))
  } catch {}
}

export function useDailyStreak() {
  const [streak, setStreak] = useState(load)

  const markToday = useCallback(() => {
    setStreak(prev => {
      const next = prev === 0 ? 1 : new Date().toDateString() !== JSON.parse(localStorage.getItem(LS_KEY) || '{}').date ? prev + 1 : prev
      save(next)
      return next
    })
  }, [])

  return { dailyStreak: streak, markToday }
}
