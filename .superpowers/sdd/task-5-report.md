# Task 5 Report: Concert Hall Background in App.tsx

**Status**: ✅ Complete

**SHA**: `cbaa6db`

**Build**: `npx tsc --noEmit` — clean (both root and subproject)
            `npm run build` — success (1604 modules, 10.78s)

**Changes applied to both `src/App.tsx` and `piano-sight-reading/src/App.tsx`**:

1. Added imports: `ConcertCurtains`, `Spotlight`
2. Replaced `bg-background` className with `radial-gradient` inline style using `--stage-floor` / `--stage-bg` CSS vars
3. Added `<ConcertCurtains isOpen={state.phase !== 'idle'}>` and `<Spotlight active={...}>` after Confetti/liveRegion
4. Added stage floor bar (`fixed bottom-0 h-2`) after main container

**Verification**:
- TypeScript: no errors
- Build: succeeds
- Both themes: background uses CSS vars, respects light/dark via `--stage-floor` and `--stage-bg`
- OrnateFrame import preserved
