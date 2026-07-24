import { useState, useEffect, useRef, useCallback } from 'react'
import type { User } from 'firebase/auth'
import { loadUserDoc, saveUserDoc, type UserDoc } from '../firebase/firestore'

type ConfigField = 'notation' | 'theme' | 'timed' | 'showNoteName' | 'sessionTarget' | 'dailyStreak' | 'lastPlayDate' | 'level' | 'quickLessonConfig' | 'controllerRange'

interface UseConfigSyncReturn {
  config: Pick<UserDoc, ConfigField> | null
  updateConfig: (patch: Partial<Pick<UserDoc, ConfigField>>) => void
  isLoading: boolean
}

export function useConfigSync(user: User | null): UseConfigSyncReturn {
  const [config, setConfig] = useState<Pick<UserDoc, ConfigField> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const pendingRef = useRef<Partial<Pick<UserDoc, ConfigField>>>({})

  useEffect(() => {
    if (!user) {
      setConfig(null)
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      try {
        const doc = await loadUserDoc(user!.uid)
        if (cancelled) return
        if (doc) {
          setConfig({
            level: doc.level,
            notation: doc.notation,
            theme: doc.theme,
            timed: doc.timed,
            showNoteName: doc.showNoteName,
            sessionTarget: doc.sessionTarget,
            dailyStreak: doc.dailyStreak,
            lastPlayDate: doc.lastPlayDate,
            quickLessonConfig: doc.quickLessonConfig,
            controllerRange: doc.controllerRange,
          })
        }
      } catch {}
      if (!cancelled) setIsLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [user?.uid])

  const updateConfig = useCallback((patch: Partial<Pick<UserDoc, ConfigField>>) => {
    setConfig(prev => prev ? { ...prev, ...patch } : prev)

    if (!user) return

    // controllerRange: save immediately (bypass debounce — calibration is rare, must persist reliably)
    if (patch.controllerRange) {
      const range = patch.controllerRange
      loadUserDoc(user.uid).then(doc => {
        if (doc) saveUserDoc(user.uid, { ...doc, controllerRange: range })
      }).catch(() => {})
      return
    }

    pendingRef.current = { ...pendingRef.current, ...patch }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const toSave = { ...pendingRef.current }
      pendingRef.current = {}
      try {
        const doc = await loadUserDoc(user!.uid)
        if (doc) {
          await saveUserDoc(user!.uid, { ...doc, ...toSave })
        }
      } catch {
        // Will retry on next update
      }
    }, 500)
  }, [user?.uid])

  return { config, updateConfig, isLoading }
}
