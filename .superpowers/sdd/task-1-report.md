### Task 1: Infrastructure Setup — Report

**Commit:** `a5f9529` — `chore: add .gitignore env patterns, vite-env.d.ts, .env.example`

**Changes made:**

1. **`.gitignore`** — Appended env file patterns (`.env`, `.env.local`, `.env.development.local`, `.env.test.local`, `.env.production.local`) to prevent leaking Firebase config.

2. **`src/vite-env.d.ts`** — Extended the existing Vite client reference with typed `ImportMetaEnv` interface for the six `VITE_FIREBASE_*` variables (API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID).

3. **`.env.example`** — Created template with placeholder values for all six Firebase config variables.

**Verification:** `npx tsc --noEmit` passed with zero errors.
