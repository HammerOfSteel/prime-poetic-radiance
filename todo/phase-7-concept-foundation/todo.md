# Phase 7: Concept Foundation — "Day in the Life" Shared Scaffolding

**Goal:** Build the shared abstractions all "Day in the Life of X" rooms
need, without building any new room content yet. Everything here is
additive/refactor-only against the existing scene/engine architecture
(`src/engine/scenes.ts`, `src/state/sceneStore.ts`, `src/ui/HUD.tsx`).

**Depends on:** nothing (can start immediately).
**Branch suggestion:** `phase-7-concept-foundation`.

## Tasks

- [ ] **Role/day metadata on `SceneDefinition`** (`src/engine/scenes.ts`):
  add optional fields `roleLabel: string` (e.g. "Developer", "Adventurer")
  and `roleTagline: string` (e.g. "A Day in the Life of a Developer") so
  the HUD can render a title-card without hardcoding strings per scene.
  Existing scenes (kitchen/tavern/dungeon) get placeholder labels for now
  (can be refined in later phases when reframed).
- [ ] **HUD role title card** (`src/ui/HUD.tsx`): small unobtrusive label
  (corner or under scene switcher) showing the active scene's
  `roleTagline`. Style consistent with existing HUD chrome. Add a
  component test asserting the tagline renders and updates on scene
  switch.
- [ ] **"Busywork prop" interaction abstraction**: a small reusable
  hook/component (e.g. `src/scene/InteractiveProp.tsx`) wrapping a mesh
  with: hover cursor change + hover emissive/outline highlight (per
  research finding #1/#2 in `overview_todo.md`) and an `onClick` handler
  that plays a one-shot gsap "response" animation (scale bounce / rotate
  wiggle) — generic enough for coffee mugs, rubber ducks, whetstones,
  etc. across future phases. Unit-test any pure helper logic (e.g. the
  animation-timeline builder if extracted as a pure function); component
  itself follows the project's existing "R3F components verified via
  manual QA" convention (see Tavern Atmosphere spec's Testing section).
- [ ] **Word theme scaffolding for `developer`** (`src/engine/wordBank.ts`,
  `src/engine/scenes.ts` `WordTheme` union): add `'developer'` as a
  valid `WordTheme` value (content added in Phase 8) so Phase 8 doesn't
  need to touch the shared type again.
- [ ] Run `npm run lint`, `npm run typecheck`, `npm test` — all green
  before merge.
- [ ] Write a short design note under `docs/superpowers/specs/` (following
  existing naming convention, e.g.
  `2026-07-22-day-in-the-life-foundation-design.md`) documenting the
  role-label/busywork-prop abstractions for future contributors, mirroring
  the level of detail in `2026-07-21-tavern-atmosphere-design.md`.

## Out of Scope

- No new rooms, no new word bank content beyond the `developer` theme's
  type placeholder.
- No inventory system, no dialogue, no save/progress mechanics.