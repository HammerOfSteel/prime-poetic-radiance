# Phase 10 (Stretch): Additional "Day in the Life" Reframes

**Goal:** Optional, lower-priority reframes of the two remaining existing
rooms into the "Day in the Life of X" concept, reusing established
patterns from Phases 7–9. Not required for the MVP roster (Developer +
Adventurer), pick up only after those ship and test green.

**Depends on:** Phase 7 (shared scaffolding); ideally after Phase 8/9 to
validate the pattern twice before repeating it.
**Branch suggestion:** `phase-10-stretch-additional-days` (or split into
two separate branches, one per role, if picked up independently).

## Task Set A: "A Day in the Life of a Wizard" (Dungeon reframe)

- [ ] Set `roleLabel: 'Wizard'` and
  `roleTagline: 'A Day in the Life of a Dungeon-Keeping Wizard'` on the
  `dungeon` entry in `src/engine/scenes.ts`.
- [ ] Add 2-3 alchemy-flavored busywork props to `DungeonRoom.tsx` via
  Phase 7's `InteractiveProp` (e.g. bubbling cauldron/potion bottles with
  a click-triggered bubble-pop animation, a spellbook with a page-flip
  animation, a crystal ball with an idle-glow pulse toggle).
- [ ] Review `dungeon` word theme for wizard-flavored vocabulary gaps
  (optional).
- [ ] Component smoke test + manual QA pass.
- [ ] `npm run lint && npm run typecheck && npm test && npm run build`
  green before merge.

## Task Set B: "A Day in the Life of a Cook" (Kitchen reframe)

- [ ] Set `roleLabel: 'Cook'` and
  `roleTagline: 'A Day in the Life of a Cook'` on the `kitchen` entry in
  `src/engine/scenes.ts`.
- [ ] Add 1-2 additional busywork props to `Kitchen.tsx`/`Fridge.tsx` if a
  natural gap exists (e.g. a stovetop pot with a stirring animation) —
  Kitchen Atmosphere is already the most fully-realized room, so this is
  the lightest-touch task in the whole roadmap; skip entirely if nothing
  adds clear value.
- [ ] Component smoke test + manual QA pass if any new prop is added.
- [ ] `npm run lint && npm run typecheck && npm test && npm run build`
  green before merge.

## Out of Scope

- Both task sets are independent and can be done in either order, or
  skipped entirely — this phase exists to record the idea, not to commit
  the team to building it.