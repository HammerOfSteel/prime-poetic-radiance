# Phase 8: "A Day in the Life of a Developer" — New Room

**Goal:** Build a brand-new scene: a developer's desk/home-office, as the
first fully-original "Day in the Life of X" room, reusing all shared
patterns (magnet board, atmosphere layer, busywork props) established by
Phase 7 and precedent from Kitchen/Tavern/Dungeon.

**Depends on:** Phase 7 (role metadata, `InteractiveProp`, `developer`
`WordTheme` placeholder).
**Branch suggestion:** `phase-8-developer-day`.

## Tasks

### Scene registration

- [ ] Add `'developer'` to `SceneId`/`SCENE_IDS` in `src/engine/scenes.ts`
  with a full `SceneDefinition` entry: `wordTheme: 'developer'`,
  `usesEnvironmentLighting: true` (per research finding #5 — a developer's
  day plausibly tracks real time of day), `roleLabel: 'Developer'`,
  `roleTagline: 'A Day in the Life of a Developer'`.
- [ ] Register in `SCENE_COMPONENTS` in `src/App.tsx` (`Room`/`Board`
  pair), following the exact pattern of kitchen/tavern/dungeon.

### Room & board components

- [ ] `src/scene/DeveloperRoom.tsx` (mirrors `TavernRoom.tsx`/
  `Kitchen.tsx` structure): desk, chair, wall, floor, monitor(s), keyboard,
  built from primitives + existing `proceduralTextures.ts` helpers
  (wood-grain desk, grain-textured wall) — no new texture-generator code
  needed if existing helpers suffice; add a new one only if genuinely
  necessary.
- [ ] `src/scene/DeveloperBoard.tsx` (mirrors `Fridge.tsx`/
  `TavernNoticeboard.tsx`): the magnet surface — e.g. a corkboard/monitor-
  bezel sticky-note-covered surface, wired through the existing
  `MagnetBoard.tsx` abstraction with this scene's `magnetSurfaceZ`/
  `magnetBoardBounds`/`magnetCount` tuned to its geometry.
- [ ] `src/scene/DeveloperAtmosphere.tsx` (mirrors
  `KitchenAtmosphere.tsx`): monitor screen-glow flicker (emissive plane +
  gsap intensity flicker, similar technique to Tavern's hearth flicker),
  coffee mug steam (reuse Kitchen's kettle-steam sprite technique), subtle
  dust motes.
- [ ] **Busywork props** using Phase 7's `InteractiveProp`: rubber duck
  (click → squeak/wiggle), coffee mug (click → steam puff/refill
  animation), sticky-note pad (click → shuffle animation). 2-4 props per
  research finding #6 — no game-state consequence, pure juice.

### Word bank & poetry content

- [ ] Extend `src/engine/wordBank.ts` with a `developer`-themed word list
  (code/coffee/bug/deploy/terminal/commit-flavored vocabulary across
  existing categories), weighted consistently with how `kitchen`/`tavern`/
  `dungeon` themes are structured today.
- [ ] Extend/verify grammar templates in `src/engine/templates.ts` produce
  sensible output with the new theme (add unit tests in
  `wordBank.test.ts`/`templates.test.ts` following existing patterns).

### Testing & polish

- [ ] Unit tests: `scenes.test.ts` update for the new scene entry,
  `wordBank.test.ts` for the new theme, any new pure logic in
  `blueprintGenerator`/`magnetSelection` if bounds need adjustment.
- [ ] Component smoke tests for `DeveloperBoard.tsx`/`DeveloperRoom.tsx`
  mount cleanly (mirrors existing `TavernRoom.test.tsx` pattern).
- [ ] Manual Playwright/browser visual QA pass (per existing project
  convention for R3F atmosphere components).
- [ ] `npm run lint && npm run typecheck && npm test && npm run build` all
  green before merge.

## Out of Scope

- No multiplayer, no save/progress, no branching narrative.
- No new global post-processing effects (existing pipeline applies
  automatically).