# NoteDojo — Naming Design Spec

**Date:** 2026-07-13
**Status:** Approved
**App type:** Piano sight-reading web game (React + TypeScript, PWA)

## Decision

Rename the app from "Lectura Musical al Piano" to **NoteDojo** with tagline **"A tu ritmo, nota a nota"**.

### Rationale

- "Note" = universal music term (works in Spanish and English)
- "Dojo" = place of practice/discipline — evokes structured learning through play
- Casual/playful vibe matching the neon arcade redesign
- Bilingual: works naturally in both Spanish and English
- Short, memorable, easy to type and pronounce

## Changes required

| File | Field | Old value | New value |
|------|-------|-----------|-----------|
| `piano-sight-reading/index.html` | `<title>` | Lectura Musical al Piano | NoteDojo |
| `piano-sight-reading/public/manifest.json` | `name` | Lectura Musical al Piano | NoteDojo |
| `piano-sight-reading/public/manifest.json` | `short_name` | Piano | NoteDojo |
| `piano-sight-reading/public/manifest.json` | `description` | Aprende a leer partituras a primera vista | A tu ritmo, nota a nota |

### What does NOT change

- `piano-sight-reading/` directory name (renaming directories is overhead with no user value)
- `package.json` name field (internal, no branding impact)
- All source code, components, and functionality
- Domain/hosting — existing deployment continues to work

## Domain suggestions (future)

- `notedojo.app`
- `notedojo.dev`
- `note-dojo.com` (fallback if single word unavailable)
