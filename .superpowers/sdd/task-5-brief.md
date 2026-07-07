### Task 5: Concert Hall Background in App.tsx

**Files:**
- Modify: `src/App.tsx`, `piano-sight-reading/src/App.tsx`

- [ ] **Step 1: Replace background**

Change `className="min-h-screen bg-background ..."` to:
```tsx
className="min-h-screen transition-colors duration-300"
style={{
  background: 'radial-gradient(ellipse at 50% 30%, var(--stage-floor) 0%, var(--stage-bg) 100%)',
}}
```

- [ ] **Step 2: Add ConcertCurtains + Spotlight**

Import both. Add inside return before main container:
```tsx
<ConcertCurtains isOpen={state.phase !== 'idle'} />
<Spotlight active={state.phase === 'feedback' || state.phase === 'levelComplete'} />
```

- [ ] **Step 3: Add stage floor bar**

After main container div:
```tsx
<div className="fixed bottom-0 left-0 right-0 h-2 z-30 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent, var(--stage-floor))' }} aria-hidden="true" />
```

- [ ] **Step 4: Verify build + check both themes**
- [ ] **Step 5: Commit**

---

