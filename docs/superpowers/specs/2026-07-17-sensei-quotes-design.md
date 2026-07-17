# Sabiduría del Sensei — Frases Celebres sobre Música

## Context

Dashboard shows a "Sabiduría del Sensei" block with 4 hardcoded quotes, selected deterministically by user level. User wants famous music quotes in Spanish, rotating randomly on each load, with maximum variety.

## Goal

Replace static 4-quote pool with a curated pool of 100+ famous music quotes in Spanish, rotating randomly on each dashboard load.

## Approach: Static Pool (API discarded)

### Why no API

Research confirmed: **no free quote API supports Spanish or music topic filtering.** All tested (ZenQuotes, Quotable, DummyJSON, QuoteGarden, type.fit, Forismatic, Quoterism) are English-only. Quotable had a `music` tag but is dead (ETIMEDOUT). Translation adds latency + dependency for uncertain quality. Static pool is the right call.

### Random Selection

- `Math.random()` index into pool array
- Track last 5 shown quotes in session state to avoid immediate repeats
- No deterministic mapping (remove `userLevel % length` pattern)
- New random quote on every dashboard mount

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/data/senseiQuotes.ts` | **CREATE** — ~100+ curated Spanish music quotes |
| `src/App.tsx` | **MODIFY** — replace `SENSEI_QUOTES` with import from senseiQuotes, random selection |
| `src/screens/DashboardScreen.tsx` | No changes needed (already receives `senseiQuote` prop) |

## Quote Format

```ts
interface Quote {
  text: string      // The quote in Spanish
  author: string    // Who said it
}
```

Source pool: famous composers (Beethoven, Mozart, Chopin, Verdi, Bernstein), musicians (B.B. King, Ella Fitzgerald), philosophers (Nietzsche, Schopenhauer), and cultural figures — all quotes commonly translated to Spanish.

## UX Details

- Quote block retains current styling (italic, quotation marks, attribution)
- No loading state — quote appears instantly
- Mobile bottom nav unaffected

## Scope

- In scope: quote pool, random selection, session dedup
- Out of scope: API integration, translation, user-submitted quotes, quote categories

## Verification

1. Load dashboard 10 times → different quotes each time
2. No repeated quote in same session (until pool exhausted)
3. Bundle size increase < 15KB (100 quotes ≈ ~10KB)
4. `tsc --noEmit` passes, build succeeds
