# Phase 4b: RPG Dungeon Board — Design

## Summary

Phase 4a delivered a scene-agnostic "magnet surface" abstraction (`SCENES`
registry + shared `MagnetBoard` component) and validated it against one new
scene (the tavern noticeboard), explicitly deferring further scenes. Phase 4b
adds the third scene named in the roadmap: an **RPG dungeon board**, where
magnets sit on a stone rune tablet embedded in a torch-lit dungeon wall.

This phase is almost entirely new *content* — a scene registry entry, room
geometry, a magnet-board host object, and vocabulary — with **no new
architecture**. Every mechanism it needs (per-scene magnet layout, theme-
weighted word selection, HUD scene switching, camera framing from the
registry) already exists from Phase 4a.

## Goals

- Add a `dungeon` scene: `SceneDefinition` entry, a `DungeonRoom` (static room
  geometry) + `DungeonTablet` (stone rune slab hosting the shared
  `MagnetBoard`) component pair, mirroring the existing `Kitchen`/`Fridge` and
  `TavernRoom`/`TavernNoticeboard` pairs exactly.
- Unlike the tavern (which opted out of the Phase 3 environment system with a
  fixed firelight preset), the dungeon **participates in the Auto/Manual
  day/night/season/weather system** the same way the kitchen does — it uses
  `usesEnvironmentLighting: true` and no fixed preset. This is a stylistic
  choice (torches flicker differently by "outside" time of day/season/weather,
  same tinting logic already implemented in `computeActiveLightingPreset`),
  requiring no new lighting code, only a registry flag.
- Add ~12 new dungeon-flavored words to the shared word bank, and lightly
  reweight a handful of existing generic words toward `dungeon`.
- Properly tune the dungeon's `cameraZoomedIn`/`cameraTarget` values for its
  actual geometry (the tavern's values were left as kitchen-identical
  placeholders in Phase 4a — a cosmetic follow-up noted in that phase's final
  review; this phase does the tuning properly rather than repeating the
  placeholder shortcut).

## Non-goals

- No new architecture in `MagnetBoard`, `sceneStore`, or the `SCENES` type —
  Phase 4b is purely additive content on top of the existing abstraction.
- No change to the tavern's fixed-lighting behavior or word bank.
- No persistence of magnet layouts across page reloads (unchanged from
  Phase 4a/earlier).
- No fix for the pre-existing "Slam/Tesseract animated positions aren't
  persisted to the store" limitation noted in Phase 4a's final review — that
  is an independent, cross-scene issue tracked separately, not in this
  phase's scope.
- Does not revisit "other mundane objects" mentioned as an example in the
  original roadmap non-goals — only the dungeon board is added this phase.

## Architecture

No new modules or interfaces. This phase extends existing ones:

- `src/engine/scenes.ts`: `SceneId` widens to `'kitchen' | 'tavern' |
  'dungeon'`; `SCENE_IDS` gains `'dungeon'`; `SCENES` gains a `dungeon` entry.
  No changes to the `SceneDefinition` interface itself — all fields the
  dungeon needs already exist.
- `src/engine/wordBank.ts`: `WordTheme` widens to include `'dungeon'`; new
  word entries and reweighted existing entries follow the exact pattern
  Phase 4a Task 2 established for `tavern`.
- `src/scene/DungeonRoom.tsx` (new): static room geometry, no props, no
  state — same shape as `TavernRoom.tsx`.
- `src/scene/DungeonTablet.tsx` (new): a `RoundedBox` stone slab composing
  `<MagnetBoard sceneId="dungeon" ...>` — same shape as
  `TavernNoticeboard.tsx`.
- `src/App.tsx`: the current `activeSceneId === 'kitchen' ? A : B` ternary
  that picks room+board components becomes a 3-way mapping (e.g. a small
  `SCENE_COMPONENTS` lookup keyed by `SceneId`, each entry a `{ Room,
  Board }` component pair) so adding future scenes doesn't require touching
  this conditional's shape again. `HUD.tsx` needs no changes — its
  scene-switcher already maps over `SCENE_IDS` generically.

## Data: scene registry entry

```ts
dungeon: {
  id: 'dungeon',
  label: 'Dungeon Tablet',
  wordTheme: 'dungeon',
  magnetSurfaceZ: -1.84,
  magnetCount: 30,
  cameraZoomedIn: [4, 5, 3.5],   // tuned for the tablet's actual position/scale
  cameraTarget: [4, 5, -1.85],
  usesEnvironmentLighting: true,
  fixedLightingPreset: null,
},
```

(Exact camera numbers are tuned during implementation once `DungeonRoom` and
`DungeonTablet` geometry exists, the same way Phase 4a tuned the tavern's —
this phase's whole point is to not leave placeholders, so the implementation
plan will include a manual visual-tuning step rather than accepting whatever
numbers are drafted here.)

## Data: vocabulary additions

New words, all with `themeWeights: { dungeon: 3 }`: `torch`, `rune`,
`skeleton`, `crypt`, `curse`, `treasure`, `abyss`, `chains`, `goblin`,
`crumbling`, `stone`, `dagger`.

Reweighted existing words (added `dungeon` weight alongside any existing
theme weight): `shadow` → `{ dungeon: 2 }`, `echo` → `{ dungeon: 2 }`, `key` →
`{ dungeon: 2 }`, `lock` → `{ dungeon: 2 }`, `ancient` → `{ tavern: 2, dungeon:
2 }` (already tavern-weighted), `sword` → `{ tavern: 3, dungeon: 2 }` (already
tavern-weighted at 3 — dungeon gets it too, tavern more strongly since it's
more central to that theme).

## Visuals

- `DungeonRoom`: rough grey stone floor and walls (toon-shaded, same
  `createToonGradientMap` material approach as every other room), a couple of
  unlit wall-torch prop meshes (decorative geometry only — actual scene
  lighting still comes from the shared `Lighting` rig, tinted by
  `computeActiveLightingPreset`'s environment path), a chain or rubble accent
  for texture. Structurally identical in shape/complexity to `TavernRoom`.
- `DungeonTablet`: a `RoundedBox` stone slab mounted on a wall, rough grey
  toon material distinct from the tavern's warm wood and the kitchen's cream
  enamel, composing `<MagnetBoard sceneId="dungeon" ...>` exactly like
  `TavernNoticeboard` does.

## Testing

Same shape and rigor as every Phase 4a content task:

- `src/engine/scenes.test.ts`: extend for the new `dungeon` entry (mirrors
  existing kitchen/tavern assertions).
- `src/engine/wordBank.test.ts`: extend for the new dungeon words and
  reweighted entries.
- `src/scene/DungeonRoom.test.tsx` (new): smoke test, mirrors
  `TavernRoom.test.tsx` (renders without throwing, at least N meshes).
- `src/scene/DungeonTablet.test.tsx` (new): smoke test, mirrors
  `TavernNoticeboard.test.tsx` (renders `magnetCount + 3` meshes: board
  backing + magnets + slam + tesseract).
- `src/App.test.tsx`: extend the scene-switch test to also cover clicking
  into the dungeon scene.
- Full `npm test`, `npm run typecheck`, `npm run lint` must stay 100% clean
  throughout, same bar as every prior phase.
- Manual smoke check (dev server, as done for Phase 4a) before considering
  the phase done: dungeon loads with its own magnet set and tuned camera
  framing, day/night/season/weather tinting visibly applies to the dungeon
  scene, switching away and back preserves the dungeon's magnet layout, and
  the Slam button favors dungeon-flavored words there.

## Process

Implemented the same way as Phase 4a: this spec → a detailed TDD
implementation plan (via `writing-plans`) → subagent-driven execution,
task-by-task, each individually reviewed → a final whole-branch review →
PR → merge.
