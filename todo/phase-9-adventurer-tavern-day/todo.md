# Phase 9: "A Day in the Life of an Adventurer" — Tavern Reframe

**Goal:** Reframe the existing (nearly-complete) Tavern room/noticeboard
as "A Day in the Life of an Adventurer" by adding role metadata and a
small set of adventurer-flavored busywork props on top of the already
approved Tavern Atmosphere work
(`docs/superpowers/specs/2026-07-21-tavern-atmosphere-design.md`), rather
than building new room geometry.

**Depends on:** Phase 7 (role metadata fields, `InteractiveProp`); the
existing Tavern Atmosphere spec/plan should be implemented/merged first if
not already (`docs/superpowers/plans/2026-07-21-tavern-atmosphere.md`).
**Branch:** `phase-9-adventurer-tavern-day`.
**Status:** Complete.

## Tasks

### Role framing

- [x] Set `roleLabel: 'Adventurer'` and
  `roleTagline: 'A Day in the Life of an Adventurer'` on the `tavern`
  entry in `src/engine/scenes.ts` (done in Phase 7).
- [x] Confirm HUD title card (Phase 7) renders correctly for this scene
  (covered by `HUD.test.tsx`'s role-tagline test).

### Adventurer busywork props

- [x] **Map table**: table + rolled map plane + post prop; click →
  bounce (shared `InteractiveProp` affordance).
- [x] **Whetstone + dagger**: whetstone block + angled blade prop.
- [x] **Coin pouch**: sack + coin props.
- [x] All new props use the shared `createToonGradientMap()` shading
  already established in `TavernRoom.tsx` — no new shading code.

### Word bank tuning

- [x] Reviewed existing `tavern` word theme — already reads as
  "adventurer" flavored (quest/tavern/ale/sword/dragon/journey
  vocabulary); no changes needed.

### Testing & polish

- [x] Component smoke test update: extended `TavernRoom.test.tsx` to
  assert new props mount without error.
- [ ] Manual Playwright/browser visual QA pass — recommended before
  merge to main, not yet performed.
- [x] `npm run lint && npm run typecheck && npm test` all green
  (pre-existing unrelated `music-visualizer` worktree failures excluded).

## Out of Scope

- No changes to `TavernNoticeboard.tsx` magnet mechanics themselves.
- No new lighting system changes — tavern keeps its fixed firelit preset
  (`usesEnvironmentLighting: false`), per the existing design spec's
  rationale (fantasy setting, no real-world day/night tracking).