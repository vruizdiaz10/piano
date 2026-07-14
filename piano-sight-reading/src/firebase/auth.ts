import {
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from './config'

const provider = new GoogleAuthProvider()

export async function signInWithGoogle(): Promise<void> {
  try {
    await signInWithPopup(auth, provider)
  } catch (error: any) {
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user'
    ) {
      await signInWithRedirect(auth, provider)
      return
    }
    throw error
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth)
}

export { onAuthStateChanged } from 'firebase/auth'
export type { User }
