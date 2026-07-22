# "Day in the Life" Foundation — Design Spec

**Date:** 2026-07-22
**Status:** Implemented (Phase 7)

## Purpose

Establishes the shared scaffolding all "Day in the Life of X" scenes reuse:
per-scene role metadata for HUD framing, a reusable `InteractiveProp`
"busywork prop" wrapper, and the `developer` word-theme placeholder — with
no new room content yet (see `todo/overview_todo.md` for the full concept
and roster).

## 1. Role Metadata on `SceneDefinition`

`src/engine/scenes.ts`'s `SceneDefinition` gained two optional fields:

```ts
roleLabel?: string;    // e.g. "Developer"
roleTagline?: string;  // e.g. "A Day in the Life of a Developer — Home Office"
```

Optional so future scenes aren't forced to set them immediately, but every
existing scene (kitchen, tavern, dungeon) was given placeholder values
reflecting the roster in `todo/overview_todo.md` (Cook, Adventurer,
Wizard respectively) so the HUD title card has content today.

## 2. HUD Title Card

`src/ui/HUD.tsx` renders the active scene's `roleTagline` (if set) as a
small italic line under the existing intro copy, with
`data-testid="role-tagline"` for testing. No layout restructuring — it
sits inline with the existing `<h1>`/`<p>` intro.

## 3. `InteractiveProp` — Busywork Prop Abstraction

`src/scene/InteractiveProp.tsx` wraps any prop's geometry in a `<group>`
that provides, uniformly across every future busywork prop:

- **Hover affordance**: cursor changes to `pointer` on hover (research
  finding #1/#2 — no pixel-hunting, always signal an interactive prop).
- **Click response**: a one-shot squash/stretch "bounce" animation via
  `buildPropBounceTimeline`, a pure function of the target scale object
  + base scale, extracted specifically so it's unit-testable without
  mounting any Three.js/R3F scene graph (see `InteractiveProp.test.ts`).
- **`onActivate` callback**: fires alongside the bounce so callers can
  layer their own flavor animation (steam puff, confetti, tally
  increment, etc.) without re-implementing the shared affordance.

No game-state consequence is baked in — purely presentational, per the
"cozy toy" ethos already established by this project.

## 4. `developer` Word Theme Placeholder

`WordTheme` in `src/engine/wordBank.ts` gained a fourth value,
`'developer'`, with no word content yet — reserved for Phase 8's
Developer Home Office room, so that phase doesn't need to touch this
shared union type again.

## Testing

- `scenes.test.ts`: new assertion that every scene defines a non-empty
  `roleLabel` and a `roleTagline` containing "A Day in the Life of".
- `HUD.test.tsx`: new assertion that the role tagline renders and updates
  correctly when the active scene changes.
- `InteractiveProp.test.ts`: unit tests for `buildPropBounceTimeline`'s
  pure animation-curve behavior (settles back to base scale; squashes
  away from it partway through).
- `InteractiveProp.tsx` itself (the R3F component) is verified via manual
  Playwright/browser QA once used by a real prop in Phase 8+, consistent
  with this project's established pattern for R3F components.

## Out of Scope

- No new rooms — see Phase 8 (`todo/phase-8-developer-day/todo.md`).
- No `developer` word bank content — see Phase 8.
- No inventory, dialogue, or save/progress systems.