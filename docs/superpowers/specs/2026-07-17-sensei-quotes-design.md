# Sabiduría del Sensei — Frases Celebres sobre Música

## Context

Dashboard shows a "Sabiduría del Sensei" block with 4 hardcoded quotes, selected deterministically by user level. User wants famous music quotes in Spanish, rotating randomly on each load, with maximum variety possible.

## Goal

Replace static 4-quote pool with a dynamic system that delivers fresh, relevant quotes about music in Spanish every time the dashboard loads.

## Approach: Hybrid (Static + API)

### Source Strategy

1. **Primary**: Curated static pool of ~100+ famous music quotes in Spanish
   - Works offline, instant load, zero latency
   - Quotes from composers, musicians, philosophers about music
   - All in Spanish, verified quality

2. **Secondary**: Free quotes API for variety supplement
   - If API provides English quotes → translate via simple client-side mapping (pre-translated fallback)
   - If API supports Spanish natively → use directly
   - API fetch is non-blocking, runs in background after static quote is shown

3. **Fallback**: If API unavailable, static pool handles everything

### API Options (research pending)

Best candidate APIs (no auth required):
- **ZenQuotes.io** (`https://zenquotes.io/api/random`) — random quote, no key needed
- **Quotable** (`https://api.quotable.io/random`) — open source, tag filtering
- **DummyJSON Quotes** (`https://dummyjson.com/quotes/random`) — simple, no auth

Translation strategy if API returns English:
- Maintain a small `translations.ts` map for common music-related English quotes
- For unmapped quotes: show English original with Spanish note, OR skip and use static pool
- Do NOT call external translation API (adds latency, dependency, cost)

### Flow per Dashboard Load

```
1. Pick random quote from static pool → display immediately (no loading state)
2. Fire API fetch in background (timeout: 2s)
3. If API returns new quote → store in session cache, show on NEXT dashboard visit
4. If API fails/times out → static quote stays, no visual change
```

Session cache: keep last 5 API quotes in memory to avoid repeats within session.

### Random Selection

- `Math.random()` index into pool array
- Track last 5 shown quotes in session state to avoid immediate repeats
- No deterministic mapping (remove `userLevel % length` pattern)

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/data/senseiQuotes.ts` | **CREATE** — ~100+ curated Spanish music quotes array |
| `src/utils/quoteService.ts` | **CREATE** — fetch API + fallback + session cache |
| `src/App.tsx` | **MODIFY** — replace `SENSEI_QUOTES` with quoteService, pass random quote |
| `src/screens/DashboardScreen.tsx` | **MODIFY** — optional: add subtle animation on quote change |

## Quote Format

```ts
interface Quote {
  text: string      // The quote in Spanish
  author: string    // Who said it
}
```

Example entries:
```ts
{ text: "La música es el lenguaje universal del alma.", author: "Victor Hugo" }
{ text: "Sin música, la vida sería un error.", author: "Friedrich Nietzsche" }
{ text: "La música expresa lo que no se puede decir.", author: "Victor Hugo" }
```

## UX Details

- Quote block retains current styling (italic, quotation marks, attribution)
- No loading spinner — always show static quote instantly
- Optional: subtle fade transition when API quote replaces static (CSS transition, 300ms)
- Mobile bottom nav unaffected

## Scope

- In scope: quote pool, random selection, API integration, session dedup
- Out of scope: user-submitted quotes, quote categories, sharing quotes, quote-of-the-day persistence

## Verification

1. Load dashboard 10 times → should see different quotes each time
2. Disconnect network → dashboard still loads with static quotes
3. Reconnect → next dashboard load may show API quote
4. No console errors on API failure
5. Bundle size increase < 15KB (100 quotes ≈ ~10KB)
