### Task 3: Firebase Config + Auth Functions

**Files:**
- Create: `src/firebase/config.ts`
- Create: `src/firebase/auth.ts`

**Interfaces:**
- Consumes: `import.meta.env.VITE_FIREBASE_*` from Task 1
- Produces: `auth` (Firebase Auth instance), `signInWithGoogle()`, `signOutUser()`, `onAuthStateChanged` re-export

- [ ] **Step 1: Create src/firebase/config.ts**

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
```

- [ ] **Step 2: Create src/firebase/auth.ts**

```typescript
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
    // Mobile: popup may be blocked, fallback to redirect
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user'
    ) {
      await signInWithRedirect(auth, provider)
      return
    }
    // Re-throw for caller to handle
    throw error
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth)
}

export { onAuthStateChanged } from 'firebase/auth'
export type { User }
```

- [ ] **Step 3: Verify imports work**

Run: `npx tsc --noEmit`
Expected: no errors (env vars typed from Task 1)

- [ ] **Step 4: Commit**

```bash
git add src/firebase/
git commit -m "feat: add Firebase config and auth functions"
```

---

