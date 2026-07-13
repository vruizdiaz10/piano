# Agent Team Design: Visual + Pedagogical + Mobile

## Goal
Team of opencode agents to analyze and improve the piano sight-reading game across three axes: visual impressiveness, pedagogical depth, and mobile landscape support.

## Team Composition (5 agents)

| Agent | Role | Scope |
|-------|------|-------|
| Game Designer | Pedagogy | Learning mechanics, difficulty curve, error analysis, progression, music theory integration |
| UI Designer | Visual design | Components, color palette, typography, design system, visual consistency |
| Whimsy Injector | Delight | Animations, transitions, particles, feedback, personality, atmosphere |
| UX Architect | Mobile responsive | Landscape layout, CSS systems, responsive structure, touch events, viewport |
| Senior Developer | Implementation | Implements approved changes, coordinates with analysts, build verification |

## Workflow

### Phase 1 — Parallel Analysis
Each analyst agent explores the codebase independently and produces a report:
- **Game Designer**: Pedagogical analysis — what mechanics help/hinder learning, progression gaps, error feedback improvements
- **UI Designer**: Visual audit — component polish, color harmony, typography, consistency, light/dark mode
- **Whimsy Injector**: Delight audit — animation opportunities, feedback moments, atmosphere, personality
- **UX Architect**: Mobile audit — landscape layout, touch targets, viewport, CSS architecture for responsiveness

### Phase 2 — User Review
User reviews all 4 reports, approves or rejects each recommendation.

### Phase 3 — Implementation
Senior Developer implements only approved changes. Build + verification after each batch.

## Recommendation Format
Each recommendation includes:
- What to change (file + line)
- Why (problem statement)
- Effort estimate (low / medium / high)
- Prevents scope creep, lets user prioritize.

## Constraints
- Zero external asset files — all visuals via CSS/SVG
- Components must work in light AND dark mode
- Mobile landscape: `(orientation: landscape) and (max-height: 600px)`
- All changes synced to both `src/` and `piano-sight-reading/src/`
- Build must pass after each implementation batch
