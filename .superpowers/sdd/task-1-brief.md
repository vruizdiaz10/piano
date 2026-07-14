### Task 1: Infrastructure Setup (.gitignore, env vars, vite-env.d.ts)

**Files:**
- Modify: `.gitignore`
- Create: `src/vite-env.d.ts`
- Create: `.env.example`

**Interfaces:**
- Consumes: nothing
- Produces: typed `import.meta.env.VITE_FIREBASE_*` variables available app-wide

- [ ] **Step 1: Update .gitignore**

Append these lines to the existing `.gitignore`:

```gitignore
# Firebase config (contains API keys — not secrets but keep for hygiene)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

- [ ] **Step 2: Create src/vite-env.d.ts**

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

- [ ] **Step 3: Create .env.example**

```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

- [ ] **Step 4: Verify TypeScript picks up env types**

Run: `npx tsc --noEmit`
Expected: no new errors

- [ ] **Step 5: Commit**

```bash
git add .gitignore src/vite-env.d.ts .env.example
git commit -m "chore: add .gitignore env patterns, vite-env.d.ts, .env.example"
```

---

