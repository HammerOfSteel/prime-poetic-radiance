# Phase 7: Concept Foundation — "Day in the Life" Shared Scaffolding

**Goal:** Build the shared abstractions all "Day in the Life of X" rooms
need, without building any new room content yet. Everything here is
additive/refactor-only against the existing scene/engine architecture
(`src/engine/scenes.ts`, `src/state/sceneStore.ts`, `src/ui/HUD.tsx`).

**Depends on:** nothing (can start immediately).
**Branch:** `phase-7-concept-foundation`.
**Status:** Complete.

## Tasks

- [x] **Role/day metadata on `SceneDefinition`** (`src/engine/scenes.ts`):
  added optional `roleLabel`/`roleTagline` fields; kitchen/tavern/dungeon
  given placeholder Cook/Adventurer/Wizard labels.
- [x] **HUD role title card** (`src/ui/HUD.tsx`): renders the active
  scene's `roleTagline`; test asserts it renders and updates on scene
  switch.
- [x] **"Busywork prop" interaction abstraction**
  (`src/scene/InteractiveProp.tsx`): hover cursor + click "bounce"
  animation via pure, unit-tested `buildPropBounceTimeline`.
- [x] **Word theme scaffolding for `developer`** (`src/engine/wordBank.ts`):
  added `'developer'` to the `WordTheme` union.
- [x] `npm run lint`, `npm run typecheck`, `npm test` all green.
- [x] Design note: `docs/superpowers/specs/2026-07-22-day-in-the-life-foundation-design.md`.

## Out of Scope

- No new rooms, no new word bank content beyond the `developer` theme's
  type placeholder.
- No inventory system, no dialogue, no save/progress mechanics.