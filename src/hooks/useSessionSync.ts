import { useState, useEffect, useRef, useCallback } from 'react'
import type { User } from 'firebase/auth'
import { loadUserDoc, saveUserDoc, type UserDoc } from '../firebase/firestore'
import { getSessions, saveSession as saveSessionLocal, type SessionRecord } from '../utils/sessionHistory'

export interface SyncState {
  isLoading: boolean
  lastSyncTime: string | null
  syncError: boolean
}

interface UseSessionSyncReturn {
  syncState: SyncState
  saveSession: (record: SessionRecord) => void
  getSessions: () => SessionRecord[]
  migrateIfNeeded: (config: Partial<UserDoc>) => Promise<void>
}

export function useSessionSync(user: User | null): UseSessionSyncReturn {
  const [syncState, setSyncState] = useState<SyncState>({
    isLoading: true,
    lastSyncTime: null,
    syncError: false,
  })
  const queueRef = useRef<SessionRecord[]>([])
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!user) {
      setSyncState({ isLoading: false, lastSyncTime: null, syncError: false })
      loadedRef.current = false
      return
    }

    let cancelled = false
    let retryCount = 0
    const MAX_RETRIES = 6
    const RETRY_DELAY = 5000

    async function load(): Promise<void> {
      try {
        const doc = await loadUserDoc(user!.uid)
        if (cancelled) return

        loadedRef.current = true
        setSyncState(prev => ({ ...prev, isLoading: false, syncError: false }))

        if (queueRef.current.length > 0) {
          const merged = mergeSessions(doc?.sessions ?? [], queueRef.current)
          await saveUserDoc(user!.uid, {
            ...(doc ?? defaultUserDoc()),
            sessions: merged,
          })
          queueRef.current = []
          setSyncState(prev => ({ ...prev, lastSyncTime: new Date().toISOString() }))
        }
      } catch {
        if (cancelled) return
        retryCount++
        if (retryCount < MAX_RETRIES) {
          setSyncState(prev => ({ ...prev, isLoading: false, syncError: true }))
          setTimeout(load, RETRY_DELAY)
        } else {
          setSyncState(prev => ({ ...prev, isLoading: false, syncError: true }))
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [user?.uid])

  const saveSession = useCallback((record: SessionRecord) => {
    saveSessionLocal(record)

    if (!user || !loadedRef.current) {
      if (user) queueRef.current = [record, ...queueRef.current].slice(0, 20)
      return
    }

    saveToFirestore(user.uid, record).then(() => {
      setSyncState(prev => ({ ...prev, lastSyncTime: new Date().toISOString(), syncError: false }))
    }).catch(() => {
      setSyncState(prev => ({ ...prev, syncError: true }))
    })
  }, [user?.uid])

  const getSessionsFn = useCallback(() => {
    return getSessions()
  }, [user?.uid])

  const migrateIfNeeded = useCallback(async (config: Partial<UserDoc>) => {
    if (!user) return
    const existing = await loadUserDoc(user.uid)
    if (existing) return

    const localSessions = getSessions()
    const doc: UserDoc = {
      level: 1,
      notation: config.notation ?? 'american',
      theme: config.theme ?? 'light',
      timed: config.timed ?? false,
      showNoteName: config.showNoteName ?? false,
      sessionTarget: config.sessionTarget ?? 10,
      dailyStreak: config.dailyStreak ?? 0,
      lastPlayDate: config.lastPlayDate ?? '',
      lastSyncTime: new Date().toISOString(),
      sessions: localSessions.slice(0, 20),
    }
    await saveUserDoc(user.uid, doc)
  }, [user?.uid])

  return { syncState, saveSession, getSessions: getSessionsFn, migrateIfNeeded }
}

function mergeSessions(existing: UserDoc['sessions'], incoming: SessionRecord[]): UserDoc['sessions'] {
  const all = [...incoming, ...existing]
  const seen = new Set<string>()
  const merged: UserDoc['sessions'] = []
  for (const s of all) {
    const key = `${s.date}-${s.lessonId}-${s.accuracy}`
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(s)
    }
    if (merged.length >= 20) break
  }
  return merged
}

async function saveToFirestore(uid: string, record: SessionRecord) {
  try {
    const doc = await loadUserDoc(uid)
    const sessions = mergeSessions(doc?.sessions ?? [], [record])
    await saveUserDoc(uid, { ...(doc ?? defaultUserDoc()), sessions })
  } catch {
    // Firestore not available; will retry on next save
  }
}

function defaultUserDoc(): UserDoc {
  return {
    level: 1,
    notation: 'american',
    theme: 'light',
    timed: false,
    showNoteName: false,
    sessionTarget: 10,
    dailyStreak: 0,
    lastPlayDate: '',
    lastSyncTime: new Date().toISOString(),
    sessions: [],
  }
}
