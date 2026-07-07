### Task 3: Spotlight Component

**Files:**
- Create: `src/components/Spotlight.tsx`
- Create: `piano-sight-reading/src/components/Spotlight.tsx`

- [ ] **Step 1: Write component**

```tsx
interface SpotlightProps {
  active?: boolean
}

export default function Spotlight({ active }: SpotlightProps) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-10 transition-opacity duration-700"
      style={{
        background: 'radial-gradient(ellipse at 50% 25%, var(--spotlight-color) 0%, transparent 60%)',
        opacity: active ? 0.9 : 0.4,
      }}
      aria-hidden="true"
    />
  )
}
```

- [ ] **Step 2: Verify build**
- [ ] **Step 3: Commit**

---

