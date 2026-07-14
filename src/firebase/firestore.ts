import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore'
import { auth } from './config'

const db = getFirestore(auth.app)

export interface UserDoc {
  level: number
  notation: 'american' | 'latino'
  theme: 'light' | 'dark'
  timed: boolean
  showNoteName: boolean
  sessionTarget: number
  dailyStreak: number
  lastPlayDate: string
  lastSyncTime: string
  sessions: Array<{
    accuracy: number
    notes: number
    lessonId: string
    date: string
    elapsedMs?: number
  }>
}

export async function loadUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserDoc) : null
}

export async function saveUserDoc(uid: string, data: UserDoc): Promise<void> {
  await setDoc(doc(db, 'users', uid), { ...data, lastSyncTime: new Date().toISOString() })
}

export async function deleteUserDoc(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid))
}
