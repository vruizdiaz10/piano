# Quote History — Persistencia Diaria Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** No repeated quotes within the same calendar day, even across app sessions. localStorage for fast access, Firestore for cross-device sync.

**Architecture:** New `useQuoteHistory` hook reads/writes localStorage + Firestore subcollection. `App.tsx` uses hook instead of `useRef<Set>`.

**Tech Stack:** TypeScript, React hooks, Firestore subcollections, localStorage

## Global Constraints

- Spanish language only
- Light mode only
- No new npm dependencies
- `tsc --noEmit` must pass
- `vite build` must succeed
- Guest users: localStorage only
- Authenticated users: localStorage + Firestore

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/firebase/firestore.ts` | **MODIFY** | Add loadQuoteHistory, saveQuoteHistory |
| `src/hooks/useQuoteHistory.ts` | **CREATE** | Hook for quote history persistence |
| `src/App.tsx` | **MODIFY** | Replace useRef with useQuoteHistory hook |

---

### Task 1: Add Firestore quote history functions

**Files:**
- Modify: `src/firebase/firestore.ts`

**Interfaces:**
- Produces: `loadQuoteHistory(uid, date)` and `saveQuoteHistory(uid, date, indices)` used by Task 2

- [ ] **Step 1: Add collectionGroup import**

Add `collectionGroup` to the Firestore imports at line 4:

```ts
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  getDocs,
} from 'firebase/firestore'
```

- [ ] **Step 2: Add loadQuoteHistory function**

Add after `deleteUserDoc` function (after line 41):

```ts
export async function loadQuoteHistory(uid: string, date: string): Promise<number[]> {
  const snap = await getDoc(doc(db, 'users', uid, 'quoteHistory', date))
  if (!snap.exists()) return []
  const data = snap.data()
  return Array.isArray(data.indices) ? data.indices : []
}
```

- [ ] **Step 3: Add saveQuoteHistory function**

Add after `loadQuoteHistory`:

```ts
export async function saveQuoteHistory(uid: string, date: string, indices: number[]): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'quoteHistory', date), { indices })
}
```

- [ ] **Step 4: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/firebase/firestore.ts
git commit -m "feat: add Firestore quote history functions for daily dedup"
```

---

### Task 2: Create useQuoteHistory hook

**Files:**
- Create: `src/hooks/useQuoteHistory.ts`

**Interfaces:**
- Consumes: `loadQuoteHistory`, `saveQuoteHistory` from Task 1
- Consumes: `SENSEI_QUOTES` from `src/data/senseiQuotes.ts`
- Produces: `useQuoteHistory(user)` hook returning `{ getRandomQuote }` used by Task 3

- [ ] **Step 1: Create the hook file**

```ts
// src/hooks/useQuoteHistory.ts
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
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useQuoteHistory.ts
git commit -m "feat: create useQuoteHistory hook with localStorage + Firestore persistence"
```

---

### Task 3: Wire useQuoteHistory into App.tsx

**Files:**
- Modify: `src/App.tsx` lines 17, 41, 315-325

**Interfaces:**
- Consumes: `useQuoteHistory` from Task 2

- [ ] **Step 1: Add import**

Add after line 16 (after useConfigSync import):

```ts
import { useQuoteHistory } from './hooks/useQuoteHistory'
```

- [ ] **Step 2: Replace useRef with hook**

Delete line 41:
```ts
const recentQuotes = useRef<Set<string>>(new Set())
```

Add after line 44 (after useConfigSync):
```ts
const { getRandomQuote } = useQuoteHistory(user)
```

- [ ] **Step 3: Remove old getRandomQuote function**

Delete lines 315-325 (the entire old `getRandomQuote` function):
```ts
const getRandomQuote = () => {
  if (recentQuotes.current.size >= SENSEI_QUOTES.length - 1) {
    recentQuotes.current.clear()
  }
  let quote: Quote
  do {
    quote = SENSEI_QUOTES[Math.floor(Math.random() * SENSEI_QUOTES.length)]
  } while (recentQuotes.current.has(quote.text))
  recentQuotes.current.add(quote.text)
  return quote
}
```

- [ ] **Step 4: Remove unused imports**

Remove `useRef` from React import if no longer used (check other useRef usage first). Remove `Quote` type import if no longer used.

- [ ] **Step 5: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Verify build**

Run: `npx vite build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "feat: use useQuoteHistory hook for daily quote dedup"
```

---

### Task 4: Verify + Deploy

- [ ] **Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Production build**

Run: `npx vite build`
Expected: Build succeeds

- [ ] **Step 3: Deploy to Vercel**

```bash
npx vercel --yes --prod
```

Expected: Deployment succeeds

---

## Verification Checklist

After implementation, manually verify:

1. Load dashboard → see a quote
2. Close app, reopen same day → different quote (not the same one)
3. Keep refreshing → no repeats until pool exhausted
4. After all quotes shown → falls back to random (allows repeats)
5. New day → fresh pool, starts over
6. Guest user → works with localStorage only
7. `tsc --noEmit` passes
8. `vite build` succeeds
