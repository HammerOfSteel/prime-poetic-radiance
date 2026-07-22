# Phase 8: "A Day in the Life of a Developer" — Home Office

**Goal:** Build the first Developer sub-room: a cozy **Home Office**,
the base implementation that establishes the shared `developer` word
theme, board, and atmosphere patterns reused by Phase 8b's Cubicle and
Office Kitchen rooms.

**Depends on:** Phase 7 (role metadata, `InteractiveProp`, `developer`
`WordTheme` placeholder).
**Branch suggestion:** `phase-8-developer-day`.

## Tasks

### Scene registration

- [ ] Add `'developer-home-office'` to `SceneId`/`SCENE_IDS` in
  `src/engine/scenes.ts` with a full `SceneDefinition` entry:
  `wordTheme: 'developer'`, `usesEnvironmentLighting: true` (a home
  office plausibly tracks real time of day — morning light through the
  window, warm lamp glow at night), `roleLabel: 'Developer'`,
  `roleTagline: 'A Day in the Life of a Developer — Home Office'`.
- [ ] Register in `SCENE_COMPONENTS` in `src/App.tsx` (`Room`/`Board`
  pair), following the exact pattern of kitchen/tavern/dungeon.

### Room & board components

- [ ] `src/scene/DeveloperHomeOffice.tsx` (mirrors `TavernRoom.tsx`/
  `Kitchen.tsx` structure): desk, chair, wall, floor, monitor(s),
  keyboard, window, potted plant, pet bed — cozy WFH aesthetic — built
  from primitives + existing `proceduralTextures.ts` helpers (wood-grain
  desk, grain-textured wall).
- [ ] `src/scene/DeveloperHomeOfficeBoard.tsx` (mirrors `Fridge.tsx`/
  `TavernNoticeboard.tsx`): the magnet surface — e.g. a corkboard/monitor-
  bezel sticky-note-covered surface, wired through the existing
  `MagnetBoard.tsx` abstraction with this scene's `magnetSurfaceZ`/
  `magnetBoardBounds`/`magnetCount` tuned to its geometry.
- [ ] `src/scene/DeveloperHomeOfficeAtmosphere.tsx` (mirrors
  `KitchenAtmosphere.tsx`): monitor screen-glow flicker (emissive plane +
  gsap intensity flicker), coffee mug steam (reuse Kitchen's
  kettle-steam sprite technique), subtle dust motes.
- [ ] **Busywork props** using Phase 7's `InteractiveProp`:
  - **Rubber duck** — click → squeak/wiggle animation (classic "rubber
    duck debugging" in-joke, the signature Home Office prop).
  - **Coffee mug** — click → steam puff/refill animation.
  - **Cat/pet prop** (optional, high-charm) — click → stretch/yawn
    animation, no game-state consequence.

### Word bank & poetry content

- [ ] Add `'developer'` word list to `src/engine/wordBank.ts`
  (code/coffee/bug/deploy/terminal/commit-flavored vocabulary across
  existing categories), weighted consistently with how `kitchen`/`tavern`/
  `dungeon` themes are structured today. This word bank is shared by all
  three Developer sub-rooms (Phase 8b reuses it, no duplication).
- [ ] Extend/verify grammar templates in `src/engine/templates.ts` produce
  sensible output with the new theme (add unit tests in
  `wordBank.test.ts`/`templates.test.ts` following existing patterns).

### Testing & polish

- [ ] Unit tests: `scenes.test.ts` update for the new scene entry,
  `wordBank.test.ts` for the new theme.
- [ ] Component smoke tests for `DeveloperHomeOfficeBoard.tsx`/
  `DeveloperHomeOffice.tsx` mount cleanly (mirrors existing
  `TavernRoom.test.tsx` pattern).
- [ ] Manual Playwright/browser visual QA pass (per existing project
  convention for R3F atmosphere components).
- [ ] `npm run lint && npm run typecheck && npm test && npm run build` all
  green before merge.

## Out of Scope

- Cubicle and Office Kitchen rooms — see Phase 8b.
- No multiplayer, no save/progress, no branching narrative.
- No new global post-processing effects (existing pipeline applies
  automatically).