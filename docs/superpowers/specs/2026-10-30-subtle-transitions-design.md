# Subtle transitions for Tanzeel (2026-10-30)

Approved direction: user delegated selection of a limited, coherent set of transitions from 10 examples, requested implementation and avoidance of visual clutter.

## Goals
- A 170–240ms opacity + slight vertical translate transition between primary public routes; stable persistent Header and Footer; no large directional slide, overlay wipe, or additional page loader.
- One smooth moving active-nav indicator on desktop; semantic navigation stays link-based and `aria-current="page"` continues to reflect the selected destination. Tablet/mobile retains current accessible menu.
- Lightweight stagger (max ~200ms total delay) and position changes only within the articles catalog when filtering; search text and results remain accessible and never wait for animation.
- Reuse already installed `css-doodle` and existing paper-grain/dot textures without extra background dependency or dynamic particle engine.
- Reduced motion: no enter/exit translation, no shared-layout motion; no artificial delay or focus interception.

## Approaches
1. Pure CSS + `@starting-style`: zero dependency, harder to coordinate exit and shared nav indicator.
2. Motion for React (chosen): one MIT-licensed, pinned package shared by all three patterns, with correct component lifecycle.
3. GSAP + separate route engine: unnecessary complexity and dependency surface for this restrained site.

## Constraints and verification
- React 19 + React Router 7; retain existing nested `<Routes>` structure and AuthProvider.
- No state resets on header/footer when routes change; no changes to Supabase, fake submissions, disabled consultations, sample content, or clinical controls.
- Add browser tests for route/indicator/filter interactions and reduced-motion mode.
- Keep the animation in opacity and compositor-friendly transform; movement max 10px.
- Budget threshold and Lighthouse/Playwright gates must pass on exact commit.
- No copying unlicensed animation code or protected visuals: implement behavior using official Motion APIs.
