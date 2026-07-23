# Logo Placement Design

**Date:** 2026-07-17
**Status:** Approved

## Goal

Integrate the official Clavis logo (`C:\Users\Víctor Ruiz\Downloads\logo.svg`) into the app's splash screen and navigation bars, replacing text-only or Material icon branding with the actual logo.

## Logo Asset

- **Source:** `C:\Users\Víctor Ruiz\Downloads\logo.svg`
- **Destination:** `src/assets/logo.svg`
- **Dimensions:** 1024×1024 SVG
- **Colors:** Cream background (#f6f1e4), gold/brass musical elements (#c8ad76, #b39662), dark brown monogram (#3c2c2c)
- **Note:** The cream background matches the app's `--bg-cream` CSS variable, so it blends naturally on cream-colored surfaces.

## Placement

### 1. Splash Screen (InicioScreen)

**Current:** Material `school` icon inside a `clay-icon-raised w-24 h-24` box.
**New:** Full logo `<img>` replacing the icon + box.

- Remove the `clay-icon-raised` wrapper div
- Add `<img src={logoUrl} alt="Clavis" className="w-36 h-auto" />` (144px wide)
- Keep the "Clavis" `<h1>` and tagline below unchanged
- The logo's cream background blends with the card's cream surface

### 2. TopNavBar (Dashboard, Biblioteca, Perfil)

**Current:** `<button>` containing text "Clavis" in `font-headline-lg`.
**New:** Small logo mark (32×32) to the left of the text.

- Import logo: `import logoUrl from '../assets/logo.svg'`
- Inside the existing brand `<button>`, prepend `<img src={logoUrl} alt="" className="w-8 h-8 rounded-md" />` before the text span
- Keep `aria-label="Ir al inicio"` on the button
- Add `aria-hidden="true"` on the `<img>` (the button label covers accessibility)

### 3. PracticeNavBar (Lesson)

**Current:** Back arrow button + `<button>` containing text "Clavis".
**New:** Same as TopNavBar — small logo mark (32×32) to the left of the text.

- Import logo: `import logoUrl from '../assets/logo.svg'`
- Inside the existing brand `<button>`, prepend `<img src={logoUrl} alt="" className="w-8 h-8 rounded-md" />` before the text
- The button already has `aria-label="Volver al panel"` via the back arrow, but the brand button should also have an aria-label

## Files to Modify

| File | Change |
|------|--------|
| `src/assets/logo.svg` | **Create** — copy from downloads |
| `src/screens/InicioScreen.tsx` | Replace Material icon with logo `<img>` |
| `src/components/TopNavBar.tsx` | Add logo `<img>` next to "Clavis" text |
| `src/components/PracticeNavBar.tsx` | Add logo `<img>` next to "Clavis" text |

## What Stays the Same

- "Clavis" text remains in all locations (splash title, both navbars)
- Click behavior on navbar brand buttons unchanged
- All other branding (footers, page title) unchanged
- No new dependencies added

## Accessibility

- Logo `<img>` in navbars gets `alt=""` + `aria-hidden="true"` (button text provides the accessible name)
- Splash logo `<img>` gets `alt="Clavis"` (no surrounding text label in the icon area)
