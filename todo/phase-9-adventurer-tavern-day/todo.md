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
**Branch suggestion:** `phase-9-adventurer-tavern-day`.

## Tasks

### Role framing

- [ ] Set `roleLabel: 'Adventurer'` and
  `roleTagline: 'A Day in the Life of an Adventurer'` on the `tavern`
  entry in `src/engine/scenes.ts`.
- [ ] Confirm HUD title card (Phase 7) renders correctly for this scene.

### Adventurer busywork props

Using Phase 7's `InteractiveProp` wrapper, add 2-4 of the following to
`TavernRoom.tsx` (placed so they don't collide with the existing hearth/
barrel/shelf/sconce/bench props from the Tavern Atmosphere pass):

- [ ] **Map table**: a flat table prop with a rolled/partially-unrolled
  "map" plane texture on top; click → brief unroll/highlight animation.
- [ ] **Whetstone + dagger**: small cylinder whetstone + thin blade prop;
  click → sharpening animation (short back-and-forth slide + spark
  particle burst, reusing `Sparkles` or a quick emissive flash).
- [ ] **Coin pouch**: small sack prop on the bench/table; click → coins
  spill/jingle animation (small primitive coin meshes bouncing briefly
  via gsap).
- [ ] All new props use the shared `createToonGradientMap()` shading
  already established in `TavernRoom.tsx` — no new shading code.

### Word bank tuning (optional, low-risk)

- [ ] Review the existing `tavern` word theme in `wordBank.ts` — confirm
  it already reads as "adventurer" flavored (quest/tavern/ale/sword
  vocabulary). Add/adjust a handful of adventurer-specific words (e.g.
  "bounty", "quest", "camp", "ranger") if there's an easy gap, but this is
  optional polish, not a required rework.

### Testing & polish

- [ ] Component smoke test update: extend `TavernRoom.test.tsx` to assert
  new props mount without error.
- [ ] Manual Playwright/browser visual QA pass for the new props and hover
  affordances (per project's existing R3F testing convention).
- [ ] `npm run lint && npm run typecheck && npm test && npm run build` all
  green before merge.

## Out of Scope

- No changes to `TavernNoticeboard.tsx` magnet mechanics themselves.
- No new lighting system changes — tavern keeps its fixed firelit preset
  (`usesEnvironmentLighting: false`), per the existing design spec's
  rationale (fantasy setting, no real-world day/night tracking).