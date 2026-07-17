# Quote History — Persistencia Diaria de Frases

## Context

`getRandomQuote()` in App.tsx uses `useRef<Set>` for session dedup. If user closes and reopens the app the same day, they can see repeated quotes. Goal: no repeats within the same calendar day, across sessions.

## Approach: Hybrid localStorage + Firestore

### Storage Layers

1. **localStorage** (always, fast access): key `piano-quotes-{YYYY-MM-DD}`, value `number[]` (indices of shown quotes)
2. **Firestore** (authenticated users only): subcollection `users/{uid}/quoteHistory/{date}`, field `indices: number[]`

### Flow

**On dashboard mount:**
1. Read localStorage for today's date key → get shown indices
2. If user has active session, read Firestore `quoteHistory/{today}` → merge with localStorage (union of indices)
3. Pick random quote from pool excluding shown indices
4. If all quotes shown → fallback to pure `Math.random()` (allow repeats)
5. Add selected index to shown set, write to both localStorage and Firestore (if authenticated)

**Day change:**
- New date key = new empty set automatically. No cleanup needed.

### Functions

**`src/firebase/firestore.ts`** — add:
```ts
export async function loadQuoteHistory(uid: string, date: string): Promise<number[]>
export async function saveQuoteHistory(uid: string, date: string, indices: number[]): Promise<void>
```

Uses subcollection `users/{uid}/quoteHistory/{date}` to avoid bloating main UserDoc.

**`src/hooks/useQuoteHistory.ts`** — new hook:
```ts
export function useQuoteHistory(user: User | null)
// Returns: { shownIndices, recordQuote }
// Handles localStorage read/write + Firestore sync
```

**`src/App.tsx`** — replace `getRandomQuote`:
- Use `useQuoteHistory` hook
- Selection logic: filter SENSEI_QUOTES by indices not in shownIndices, pick random from remaining
- On pick: call `recordQuote(index)` to persist

### Edge Cases

- **Guest user:** localStorage only, no Firestore
- **Pool exhausted:** allow repeats (Math.random fallback)
- **Firestore offline:** localStorage is source of truth, sync later
- **Date timezone:** use local date (`new Date().toLocaleDateString('sv-SE')` for YYYY-MM-DD format)

## Files

| File | Action |
|------|--------|
| `src/firebase/firestore.ts` | **MODIFY** — add loadQuoteHistory, saveQuoteHistory |
| `src/hooks/useQuoteHistory.ts` | **CREATE** — hook for quote history persistence |
| `src/App.tsx` | **MODIFY** — use hook, rewrite getRandomQuote |

## Out of Scope

- Quote categories/themes
- User preferences for quote types
- Quote sharing/social features
- Analytics on which quotes are shown
