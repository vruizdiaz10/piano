### Task 1: CSS Variables + Keyframes for Concert Theme

**Files:**
- Modify: `src/index.css` + `piano-sight-reading/src/index.css`

- [ ] **Step 1: Add CSS variables to `:root`**

After `--staff-line` variable, add:
```css
--curtain-primary: #6B1A1A;
--curtain-fold: #4A0E0E;
--gold: #C9922B;
--gold-light: #E2B84D;
--gold-dim: rgba(201, 146, 43, 0.3);
--stage-floor: #3D1F1A;
--stage-bg: #2C1810;
--spotlight-color: rgba(255, 220, 150, 0.12);
--ebony: #2C1810;
--ivory: #F5F0E5;
```

- [ ] **Step 2: Add dark mode variables to `.dark`**

```css
--curtain-primary: #4A0E0E;
--curtain-fold: #2D0808;
--gold: #D4A533;
--gold-light: #E8C55A;
--gold-dim: rgba(212, 165, 51, 0.25);
--stage-floor: #1A0E08;
--stage-bg: #0D0704;
--spotlight-color: rgba(255, 220, 150, 0.08);
--ebony: #0D0704;
--ivory: #E8DDD0;
```

- [ ] **Step 3: Add keyframes**

```css
@keyframes curtain-slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(0); }
}
@keyframes curtain-slide-right {
  0% { transform: translateX(100%); }
  100% { transform: translateX(0); }
}
@keyframes curtain-open-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-40px); }
}
@keyframes curtain-open-right {
  0% { transform: translateX(0); }
  100% { transform: translateX(40px); }
}
@keyframes gold-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
```

- [ ] **Step 4: Add utility classes**

```css
.animate-curtain-slide { animation: curtain-slide 0.8s ease-out; }
.animate-curtain-slide-right { animation: curtain-slide-right 0.8s ease-out; }
.animate-curtain-open-left { animation: curtain-open-left 0.6s ease-out forwards; }
.animate-curtain-open-right { animation: curtain-open-right 0.6s ease-out forwards; }
.animate-gold-pulse { animation: gold-pulse 2s ease-in-out infinite; }
```

- [ ] **Step 5: Sync both files** (same changes in both `src/index.css` and `piano-sight-reading/src/index.css`)

- [ ] **Step 6: Verify build:** `npm run build` (root) — confirm no errors.

- [ ] **Step 7: Commit**

```bash
git add src/index.css piano-sight-reading/src/index.css
git commit -m "feat(styles): add concert hall CSS variables + curtain keyframes"
```

---

