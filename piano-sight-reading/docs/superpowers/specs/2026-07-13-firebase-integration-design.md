# Firebase Integration Design

**Date**: 2026-07-13
**Project**: NoteDojo (piano-sight-reading)
**Approach**: Direct Firebase integration (Enfoque A)
**Reviewed by**: Software Architect, Security Architect, Frontend Developer, UX Researcher

## Goal

Integrate Firebase into NoteDojo for two purposes:
1. Public registration via Google (Gmail) authentication
2. Progress storage in Firestore database

## Constraints

- Firebase Spark plan (free tier)
- Online only (no offline persistence)
- Optional login — game works without auth, progress not saved to cloud
- Always use Firestore when logged in (localStorage only for non-logged-in sessions)
- All UI strings in Spanish (matching existing app language)

## Architecture

### Package

```
firebase (v11+)
```

Single package. Firestore and Auth included.

### New Dependencies

| Package | Purpose |
|---------|---------|
| `firebase` | Auth + Firestore SDK |
| `@radix-ui/react-dropdown-menu` | User menu dropdown (consistent with existing Radix primitives) |
| `@radix-ui/react-dialog` | Login modal with focus trapping, scroll locking, Escape key |

### New File Structure

```
src/
├── firebase/
│   ├── config.ts              # Firebase initialization
│   ├── auth.ts                # Auth functions (signInWithGoogle, signOut, onAuthStateChanged)
│   └── firestore.ts           # Thin Firestore SDK wrapper (readDoc, writeDoc)
├── hooks/
│   ├── useAuthProvider.tsx    # React Context provider for auth state
│   ├── useAuth.ts             # Hook: reads auth context (session state, login, logout)
│   ├── useSessionSync.ts      # Hook: session save/load (localStorage ↔ Firestore)
│   └── useConfigSync.ts       # Hook: config persistence with debouncing
├── components/
│   ├── UserMenu.tsx           # User avatar/name dropdown in toolbar
│   ├── LoginModal.tsx         # Modal with Google login button
│   └── Toast.tsx              # Lightweight toast notification
```

### AuthProvider Pattern (React Context)

Auth state is a global concern needed across the component tree. Use React Context instead of prop drilling:

```typescript
// useAuthProvider.tsx
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
```

`App.tsx` wraps everything in `<AuthProvider>`. Child components call `useAuth()` to read context.

### Firestore Data Model

```
Collection: users
  Document: {uid}
    ├── level: number                    # Unlocked lesson level
    ├── notation: 'american' | 'latino' # Match existing codebase type
    ├── theme: 'light' | 'dark'
    ├── timed: boolean
    ├── showNoteName: boolean            # Whether to show note names on staff
    ├── sessionTarget: number            # Preferred session length (5, 10, 20)
    ├── dailyStreak: number
    ├── lastPlayDate: string             # YYYY-MM-DD
    ├── lastSyncTime: string             # ISO timestamp of last successful sync
    └── sessions: Array<{
          accuracy: number
          notes: number
          lessonId: string
          date: string
          elapsedMs?: number
        }>                               # Max 20 sessions (latest), enforced client AND server
```

Single document per user. No subcollections. Simple and within Firestore's 1MB limit.

### Data Flow

```
[User plays without login]
    → localStorage (as before)

[User logs in with Google]
    → useAuth detects state change (via AuthContext)
    → useSessionSync: Firestore.load()
      → If Firestore document exists → replace local state
      → If Firestore document is new/empty → MIGRATE localStorage to Firestore first
    → From here: every session/completion → Firestore.save()

[User logs out]
    → useAuth detects logout
    → Game continues with local localStorage
    → Sync hooks switch to localStorage mode
```

### First-Login Migration Strategy

This is critical to prevent data loss. When a user logs in for the first time:

```
1. Firestore.load() → returns null (no document yet)
2. Read localStorage: sessions (sessionHistory), config (notation, theme, etc.)
3. If localStorage has data:
   a. Create Firestore document with localStorage data
   b. Replace local state with Firestore data
   c. Clear localStorage backup (optional, for consistency)
4. If localStorage is empty:
   a. Create empty Firestore document with defaults
   b. Use Firestore from now on
```

This ensures no user loses progress when they finally decide to create an account.

### Sync Lifecycle

`useSessionSync` has an internal `loading` state to prevent race conditions:

```typescript
interface SyncState {
  isLoading: boolean   // true while initial Firestore load is in progress
  lastSyncTime: string | null
  syncError: boolean   // true if last sync failed
}
```

**Rules:**
- While `isLoading` is true, session saves queue in memory (not written yet)
- Once load completes, queued saves flush to Firestore
- `saveSession()` is atomic: always writes the full sessions array (not append)
- Config writes are debounced (500ms) to batch rapid toggles into a single write

**Sync Logic:**

| Event | Action |
|-------|--------|
| Login | `Firestore.load()` → migrate if needed → replace local state |
| Logout | Switch to localStorage mode |
| New session completed | `saveSessionToFirestore()` immediately (not deferred) |
| Config change (lesson, theme, notation, etc.) | Debounced `updateFirestoreConfig()` (500ms) |
| Page close | `beforeunload` → best-effort flush of pending writes (not primary save) |
| Network reconnect | Retry last failed sync |

**Conflicts:** No conflicts because it's a single user on a single device per session. If multi-device is added later, Firestore resolves with timestamps.

## Components and UI

### User Menu Location

The user button lives in the **toolbar bar** alongside the mute button, notation selector, and theme toggle — NOT in ScoreDisplay. ScoreDisplay remains a pure presentation component (accuracy percentage + progress bar).

```
┌──────────────────────────────────────────────────────────────┐
│  [ThemeToggle] [Mute] [Notacion▾] [Temporizador] [👤/Avatar]│  ← Toolbar bar
├──────────────────────────────────────────────────────────────┤
│  [StreakBadge] [StreakOwl] [ScoreDisplay] [Attempts]        │  ← Status bar (no changes)
├──────────────────────────────────────────────────────────────┤
│  [Staff - pentagrama]                                        │
│  [ProgressBar]                                               │
│  [PianoKeyboard]                                             │
└──────────────────────────────────────────────────────────────┘
```

### UserMenu Component

Uses `@radix-ui/react-dropdown-menu`:

```
[Avatar circle] click →
┌─────────────────────────────┐
│  🔄 Sincronizado            │  ← sync status indicator
│  ─────────────────          │
│  Cerrar sesion              │
└─────────────────────────────┘
```

- **Without login**: Gray user icon (`lucide-react User`). Tooltip: "Guardar progreso". Click → opens LoginModal.
- **With login**: Circular profile photo + short name. Click → dropdown with sync status and "Cerrar sesion".
- **Avatar fallback**: If `photoURL` is null or fails to load, show user initials inside the circle, or generic User icon.
- **Loading state**: While `useAuth.loading` is true, show a subtle skeleton/pulse animation matching the icon dimensions.
- **Transition**: Login cross-fades from gray icon to photo with a brief neon glow. Logout fades back to gray icon.

### LoginModal Component

Uses `@radix-ui/react-dialog` for proper accessibility (focus trapping, scroll locking, Escape key, `role="dialog"`, `aria-modal="true"`). Follows same pattern as LevelComplete modal.

```
┌─────────────────────────────────────┐
│  🎵 NoteDojo                        │
│                                     │
│  Guarda tu progreso en la nube      │
│  • No pierdes datos si cambias      │
│    de navegador o dispositivo       │
│  • Tu racha y sesiones se guardan   │
│  • Continua donde lo dejaste        │
│                                     │
│  [🔴 Continuar con Google]          │
│                                     │
└─────────────────────────────────────┘
```

- Backdrop click to close (same as LevelComplete)
- Escape key to close
- Focus trap within modal
- Focus returns to trigger button after closing
- All text in Spanish

### Toast Component

Lightweight toast for transient notifications (auth errors, sync status):

```
┌─────────────────────────────────┐
│  ⚠ Error de conexion.          │  ← appears at top-center
│     Intenta de nuevo.           │     auto-dismiss after 3s
└─────────────────────────────────┘
```

- Position: top-center
- Duration: 3 seconds (auto-dismiss)
- Animation: `animate-slide-up` (existing pattern)
- Max visible: 1 toast at a time (new replaces old)
- Respects `prefers-reduced-motion`
- Uses existing neon theme (amber for warnings, pink for errors, green for success)

### Login Flow

```
1. User clicks gray user icon in toolbar
2. LoginModal opens (Radix Dialog)
3. User clicks "Continuar con Google"
4. Google Auth popup → user selects account
5. Firebase creates session
6. useAuth (via AuthContext) updates state
7. useSessionSync: Firestore.load()
   → If document exists: replace local state
   → If new: migrate localStorage → Firestore
8. UI transitions: gray icon → photo with neon glow
9. Sync status shows "Sincronizado"
```

**Mobile fallback**: If `signInWithPopup` fails (blocked on mobile), fall back to `signInWithRedirect`. Note: iOS Safari has known issues with redirect callback losing state.

### Logout Flow

```
1. User clicks avatar → dropdown opens
2. User clicks "Cerrar sesion"
3. Confirmation dialog: "Cerrar sesion? Tu progreso local seguira guardado."
4. User confirms → Firebase closes session
5. useAuth updates state
6. Game continues with local localStorage
7. UI transitions: photo → gray icon
```

## Hooks

### useAuth (Context Consumer)

```typescript
interface AuthContextValue {
  user: User | null              // Firebase User type (not custom)
  loading: boolean               // true while verifying initial state
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}
```

- Reads from AuthContext (provided by AuthProvider)
- `loading` state prevents UI flicker on load
- `onAuthStateChanged` fires on both login AND token refresh — useCloudSync must not re-download on refresh

### useSessionSync

```typescript
function useSessionSync(user: User | null) {
  const [syncState, setSyncState] = useState<SyncState>({
    isLoading: true,
    lastSyncTime: null,
    syncError: false,
  })

  // When user changes to non-null → load from Firestore (with migration)
  // When user is null → use localStorage
  // Exposes saveSession(), getSessions()
}
```

**Key behaviors:**
- While `isLoading` is true, session saves queue in memory
- `saveSession()` writes immediately after load completes
- Retries on network reconnect (via `navigator.onLine`)
- Sets `syncError: true` if write fails (shows yellow dot on avatar)

### useConfigSync

```typescript
function useConfigSync(user: User | null) {
  // Debounced config writes (500ms)
  // Exposes updateConfig(), getConfig()
}
```

**Key behaviors:**
- Config changes debounce 500ms to batch rapid toggles
- Reads config from Firestore on login, from localStorage when offline
- Writes to both Firestore and localStorage (localStorage as cache)

### localStorage Persistence (New)

The following config fields are NOT currently persisted to localStorage. This must be added:

| Field | Current behavior | New behavior |
|-------|-----------------|--------------|
| `notation` | Saved to localStorage | Saved (already works) |
| `theme` | Not saved (from `prefers-color-scheme`) | Saved to localStorage |
| `lessonId` | Not saved | Saved to localStorage |
| `isTimed` | Not saved | Saved to localStorage |
| `showNoteName` | Not saved | Saved to localStorage |
| `sessionTarget` | Not saved | Saved to localStorage |

All fields sync to Firestore when logged in, to localStorage when not.

### Session Record Type Update

Add `elapsedMs` to the local `SessionRecord` type for consistency:

```typescript
interface SessionRecord {
  accuracy: number
  notes: number
  lessonId: string
  date: string
  elapsedMs?: number   // NEW: total elapsed time in ms
}
```

### useDailyStreak Sync

Daily streak (`useDailyStreak`) is currently localStorage-only (`piano-daily-streak`). It should be included in the Firestore sync:

```
On login:
  - If Firestore has dailyStreak > localStorage → use Firestore value
  - If localStorage has dailyStreak > Firestore → use localStorage value (take higher)
  - On each play: sync the max of both values
```

### weakPool Sync

Weak notes pool (`weakPool.ts`) is excluded from sync for now. It is a local optimization feature and not critical for cross-device consistency. Documented as a known gap.

## Error Handling

### Authentication Errors

| Error | Behavior |
|-------|----------|
| Popup closed by user | Silent. Nothing shown. |
| Network error | Toast: "Error de conexion. Intenta de nuevo." |
| Popup blocked (mobile) | Fallback to `signInWithRedirect` |
| Account not found | Firebase auto-creates account on first login |

### Firestore Errors

| Error | Behavior |
|-------|----------|
| No connection | Game works. Sync retries on reconnect. Shows yellow dot on avatar. |
| Firestore quota exceeded | Silent. User shouldn't hit it on Spark (1GB free). |
| Permission denied | Log to console (no PII). Game continues with localStorage. Shows yellow dot. |
| Write fails | Retry on next attempt. Show yellow dot on avatar until sync succeeds. |

### Sync Status Indicator

When logged in, the UserMenu shows sync status:
- **Green dot + "Sincronizado"**: Last sync successful
- **Yellow dot + "Reintentando..."**: Last sync failed, retrying
- **No dot**: Not logged in

The yellow dot resolves automatically when sync succeeds. This gives users awareness without being intrusive.

### General Strategy

- **Never block the game** due to a Firebase error. If Firestore fails, the game continues with localStorage.
- **Never silently lose data**. If a Firestore write fails, the user sees the yellow dot and knows their latest progress may not be saved.
- **Retries**: `useSessionSync` automatically retries sync when network returns (via `navigator.onLine`).

## Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null
                  && request.auth.uid == userId;

      allow create: if request.auth != null
                    && request.auth.uid == userId
                    && request.resource.data.keys().hasAll([
                         'level', 'notation', 'theme', 'timed',
                         'showNoteName', 'sessionTarget',
                         'dailyStreak', 'lastPlayDate', 'sessions'
                       ])
                    && request.resource.data.level is number
                    && request.resource.data.notation in ['american', 'latino']
                    && request.resource.data.theme in ['light', 'dark']
                    && request.resource.data.timed is bool
                    && request.resource.data.showNoteName is bool
                    && request.resource.data.sessionTarget is number
                    && request.resource.data.dailyStreak is number
                    && request.resource.data.lastPlayDate is string
                    && request.resource.data.sessions is list
                    && request.resource.data.sessions.size() <= 20;

      allow update: if request.auth != null
                    && request.auth.uid == userId
                    && request.resource.data.level is number
                    && request.resource.data.notation in ['american', 'latino']
                    && request.resource.data.theme in ['light', 'dark']
                    && request.resource.data.timed is bool
                    && request.resource.data.showNoteName is bool
                    && request.resource.data.sessionTarget is number
                    && request.resource.data.sessions is list
                    && request.resource.data.sessions.size() <= 20;
    }
  }
}
```

**Key protections:**
- Users can only read/write their own document (UID-based)
- Field types are validated on create and update
- Sessions array is capped at 20 entries (server-enforced)
- Notation values are constrained to valid options

## Content Security

### Firebase Config Exposure

Firebase client-side config values (apiKey, projectId, etc.) are **intentionally public** — they are embedded in the JavaScript bundle that every user downloads. The real security boundary is:
1. Firestore security rules (above)
2. Firebase App Check (future hardening)

The `.env` file should still not be committed to git for hygiene, but the config values are not secrets.

### Content Security Policy (CSP)

Deployment should include CSP headers:
- `connect-src`: `firestore.googleapis.com`, `identitytoolkit.googleapis.com`, `securetoken.googleapis.com`
- `script-src`: app origin only
- This provides defense-in-depth against XSS token exfiltration

### Future Hardening: Firebase App Check

Firebase App Check with reCAPTCHA Enterprise throttles anonymous requests and prevents API abuse. Documented as a future hardening step, not required for MVP.

## Data Lifecycle

### Account Deletion

For GDPR compliance and user control:
- Add "Eliminar mis datos" option in UserMenu dropdown
- Confirmation dialog: "Se eliminara tu progreso de la nube. Esta accion no se puede deshacer."
- Implementation: client-side `deleteDoc(doc(db, 'users', user.uid))`
- No server-side cleanup needed on Spark plan

### Data Export

Not required for MVP. Could be added later as a "Descargar mis datos" button that exports the Firestore document as JSON.

### Console Logging

No user PII (UID, displayName, photoURL) is written to `console.log` in production. Use anonymous structured logging only.

## Testing and Deployment

### .gitignore Update

Before any Firebase code is written, update `.gitignore`:

```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### TypeScript Env Declarations

Create `src/vite-env.d.ts` with typed declarations for all Firebase env variables to prevent silent misconfiguration:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### Environment Variables

```bash
# .env (do not commit — see .gitignore above)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Vite exposes these as `import.meta.env.VITE_*`.

### Firebase Console Setup

1. Create project in Firebase Console (Spark plan)
2. Enable **Authentication** → Provider **Google**
3. Enable **Firestore Database** → Production mode
4. Copy `firebaseConfig` to `src/firebase/config.ts`
5. Apply Firestore rules from the Security Rules section above

### Deployment

- **Firebase Hosting** (free on Spark): `npm run build` → `firebase deploy`
- Or **Vercel/Netlify**: as before, with env vars configured in dashboard

### Spark Plan Limits (Free)

| Limit | Amount | Impact |
|-------|--------|--------|
| Firestore storage | 1 GB | ~50,000 users with 20 sessions each |
| Reads/day | 50,000 | ~2,500 active users/day |
| Writes/day | 20,000 | ~1,000 active users/day |
| Authentication | 10,000 users | Enough to start |
| Hosting | 10 GB | Covers a small static site |

Spark plan is sufficient to start. If it grows, migrate to Blaze (pay-as-you-go).
