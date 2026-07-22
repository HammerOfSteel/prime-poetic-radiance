# Phase 10 (Stretch): Wizard Day + Cook Day

**Goal:** Lightest-touch reframes of the two remaining existing rooms —
Dungeon as "A Day in the Life of a Dungeon-Keeping Wizard" and Kitchen as
"A Day in the Life of a Cook" — per `todo/overview_todo.md`'s roster.
Both already had role labels/taglines set in Phase 7; this phase adds a
small, thematically appropriate busywork prop pair to each, mirroring the
Adventurer/Tavern treatment from Phase 9.

**Depends on:** Phase 7 (role metadata, `InteractiveProp`).
**Branch:** `phase-10-stretch-additional-days`.
**Status:** Complete.

## Tasks

### Wizard (Dungeon reframe)

- [x] Role label/tagline already set in Phase 7
  (`roleLabel: 'Wizard'`, `roleTagline: 'A Day in the Life of a
  Dungeon-Keeping Wizard'`).
- [x] Added alchemy-table busywork props to `DungeonRoom.tsx`: a glowing
  bubbling cauldron and a spellbook, both using the shared
  `InteractiveProp` hover/bounce affordance.
- [x] Extended `DungeonRoom.test.tsx` with a smoke assertion for the new
  props.

### Cook (Kitchen reframe)

- [x] Role label/tagline already set in Phase 7 (`roleLabel: 'Cook'`,
  `roleTagline: 'A Day in the Life of a Cook'`).
- [x] Added a mixing-bowl + whisk busywork prop to `Kitchen.tsx`, using
  the shared `InteractiveProp` affordance.
- [x] Extended `Kitchen.test.tsx` with a smoke assertion for the new
  prop.

### Testing & polish

- [x] `npm run lint && npm run typecheck && npm test` all green
  (pre-existing unrelated `music-visualizer` worktree failures excluded).
- [ ] Manual Playwright/browser visual QA pass — recommended before
  merge to main, not yet performed.

## Out of Scope

- No new room geometry, no new lighting presets — both rooms keep their
  existing environment-lighting behavior from earlier phases.
- No word-bank changes — `tavern`/`dungeon`/`kitchen` themes were already
  tuned in earlier phases and read as appropriately evocative for their
  reframed roles without further changes.