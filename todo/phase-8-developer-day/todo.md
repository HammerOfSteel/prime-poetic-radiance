# Phase 8: "A Day in the Life of a Developer" — Home Office

**Goal:** Build the first Developer sub-room: a cozy **Home Office**,
the base implementation that establishes the shared `developer` word
theme, board, and atmosphere patterns reused by Phase 8b's Cubicle and
Office Kitchen rooms.

**Depends on:** Phase 7 (role metadata, `InteractiveProp`, `developer`
`WordTheme` placeholder).
**Branch:** `phase-8-developer-day`.
**Status:** Complete (core room + board + busywork props + word bank).

## Tasks

### Scene registration

- [x] Added `'developerHomeOffice'` to `SceneId`/`SCENE_IDS` in
  `src/engine/scenes.ts` with a full `SceneDefinition` entry.
- [x] Registered in `SCENE_COMPONENTS` in `src/App.tsx`.

### Room & board components

- [x] `src/scene/DeveloperHomeOffice.tsx`: desk, chair, monitor, keyboard,
  window, potted plant.
- [x] `src/scene/DeveloperHomeOfficeBoard.tsx`: standing corkboard magnet
  surface wired through `MagnetBoard`.
- [x] **Busywork props** using Phase 7's `InteractiveProp`: rubber duck
  and coffee mug (hover + click-bounce).
- [ ] `src/scene/DeveloperHomeOfficeAtmosphere.tsx` (monitor glow flicker,
  steam) — deferred; not required for MVP room to be playable, can be
  picked up as a follow-up polish pass alongside Phase 8b.
- [ ] Optional cat/pet prop — deferred as low-priority polish.

### Word bank & poetry content

- [x] Added `developer`-themed words to `src/engine/wordBank.ts`
  (code, bug, terminal, commit, keyboard, monitor, standup, deadline,
  server, cursor, branch, duck, debug, deploy, refactor, compile, ship).
- [x] Existing grammar templates already work generically with any theme
  (verified via `wordBank.test.ts`); no template changes needed.

### Testing & polish

- [x] Unit tests: `scenes.test.ts`, `wordBank.test.ts` updated.
- [x] Component smoke tests: `DeveloperHomeOffice.test.tsx`,
  `DeveloperHomeOfficeBoard.test.tsx`.
- [ ] Manual Playwright/browser visual QA pass — recommended before
  merge to main, not yet performed.
- [x] `npm run lint && npm run typecheck && npm test` all green
  (pre-existing unrelated `music-visualizer` worktree test failures are
  out of scope for this project).

## Out of Scope

- Cubicle and Office Kitchen rooms — see Phase 8b.
- No multiplayer, no save/progress, no branching narrative.
- No new global post-processing effects (existing pipeline applies
  automatically).