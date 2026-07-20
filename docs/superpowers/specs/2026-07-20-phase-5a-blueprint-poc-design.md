# Phase 5a: Procedural Blueprint Generator (POC) — Design

**Date:** 2026-07-20
**Status:** Approved

## Summary

Phase 5 on the roadmap ("Procedural Blueprint System") is a large, multi-part goal:
modular, composable scene blueprints (rooms, props, palettes, word themes as data)
enabling algorithmic/emergent random scene generation. That's too large for a single
spec/plan, so — following the same sub-phase pattern used for Phase 4 (4a tavern,
4b dungeon) — this is **Phase 5a**, the first slice: a small, dev-only technical
proof-of-concept that a room can be procedurally generated from a seed. Later
sub-phases (5b, 5c, ...) can build on this to add magnet boards/word themes,
richer prop variety, collision avoidance, and eventual player-facing exposure.

This phase does **not** touch the existing kitchen/tavern/dungeon scenes, the
`sceneStore`, or `HUD.tsx` — it is fully additive and isolated.

## Goals

- Prove that a room's shell (dimensions + wall/floor palette) and a scatter of
  props can be generated procedurally from a numeric seed, with the same seed
  always producing the identical room (deterministic).
- Keep the prop library small and hand-authored (6 shapes), matching the existing
  toon-shaded, primitive-geometry visual style used by `Kitchen.tsx`/`TavernRoom.tsx`/
  `DungeonRoom.tsx`.
- Make it dev-triggerable via a "Generate Random Room" debug button that swaps the
  main 3D view to show the generated room, with a "Back to Scenes" button to return.
- Log/display the seed so a specific generation can be reproduced later.

## Non-goals (for this sub-phase)

- No magnet board, no word theme, no poem-generation tie-in for generated rooms.
- No collision/overlap avoidance between placed props — visual overlap is an
  accepted limitation for this POC.
- No persistence of generated rooms across reloads.
- No exposure to end users — this is a dev-only debug feature, not wired into the
  normal player-facing scene switcher.
- No camera-zoom/OrbitControls tuning per generated room — the existing zoomed-out
  default camera view is sufficient since there's no magnet board to zoom into.
- No changes to `sceneStore.ts`, `HUD.tsx`, or any of the 3 existing scenes.

## Architecture

Two new layers, mirroring the project's existing `engine/` (pure logic) +
`scene/` (rendering) split:

```
src/engine/blueprintGenerator.ts   — pure, seeded, unit-tested generation logic
src/scene/proceduralProps.tsx      — small library of 6 prop components
src/scene/ProceduralRoom.tsx       — renders a RoomBlueprint (shell + props)
src/ui/BlueprintDebugPanel.tsx     — dev debug button/label, fully controlled
src/App.tsx                        — local state + conditional render (modified)
```

`App.tsx` holds a local `proceduralBlueprint: RoomBlueprint | null` state
(`useState`, not the global `sceneStore` — this is non-persisted, dev-only state
and doesn't belong in the store that represents real scene/magnet data). When
non-null, the Canvas renders `<ProceduralRoom blueprint={proceduralBlueprint} />`
instead of the normal `SCENE_COMPONENTS[activeSceneId]` Room/Board pair, and the
normal HUD scene-switcher is hidden (there's no active magnet-board scene while
viewing a generated room).

## Data Model & Seeded Generation

`src/engine/blueprintGenerator.ts`:

```ts
export type PropType = 'crate' | 'barrel' | 'pillar' | 'rug' | 'pottedPlant' | 'chest';

export interface PlacedProp {
  type: PropType;
  position: [number, number, number];
  rotationY: number;
  scale: number;
}

export interface RoomPalette {
  floorColor: string;
  wallColor: string;
  accentColor: string;
}

export interface RoomBlueprint {
  seed: number;
  width: number;   // x extent
  depth: number;   // z extent
  height: number;  // wall height
  palette: RoomPalette;
  props: PlacedProp[];
}

export function createSeededRandom(seed: number): () => number;
export function generateRoomBlueprint(seed: number): RoomBlueprint;
```

- **Seeded PRNG:** `createSeededRandom` implements the `mulberry32` algorithm (no
  new dependency) — a pure function from a numeric seed to a deterministic
  `() => number` generator producing values in `[0, 1)`. All randomness in
  `generateRoomBlueprint` is drawn from one instance of this generator seeded
  with the input `seed`, so the same seed always produces an identical
  `RoomBlueprint`.
- **Dimensions:** `width`/`depth` each randomized in `[8, 16]`, `height` in
  `[6, 10]` — keeps generated rooms in the same "cozy interior" scale as the
  existing 3 scenes (whose rooms span roughly this range).
- **Palette:** picked (not freely randomized) from **5 curated presets**, to
  avoid ugly/clashing random RGB combinations and preserve the cozy toy
  aesthetic:
  1. Warm Stone — `floorColor: '#8a5a3b'`, `wallColor: '#f2e3c9'`, `accentColor: '#c96a3e'`
  2. Cool Cellar — `floorColor: '#4a4a52'`, `wallColor: '#3a3a42'`, `accentColor: '#6a6a72'`
  3. Autumn Wood — `floorColor: '#7a5230'`, `wallColor: '#a97a4a'`, `accentColor: '#c98a3e'`
  4. Moss Green — `floorColor: '#5a6e4a'`, `wallColor: '#7a8e6a'`, `accentColor: '#4a5e3a'`
  5. Dusty Rose — `floorColor: '#8a6a6a'`, `wallColor: '#c9a3a3'`, `accentColor: '#a35a5a'`
- **Prop count:** `4-8` props (inclusive), count itself randomized.
- **Per-prop generation:** for each prop — a uniformly random `PropType` from
  the 6-shape library; a random `position` within the room's floor bounds with
  a `1.5` unit margin from every wall (so nothing clips through geometry);
  a random `rotationY` in `[0, 2π)`; a random `scale` in `[0.8, 1.3]`.
- **Known limitation (accepted):** no collision/overlap avoidance between
  props — two props may visually overlap. Acceptable for a technical POC.

## Prop Library & Room Rendering

`src/scene/proceduralProps.tsx` — one file housing the 6 small, related prop
components (each ~5-10 lines, tightly related, following the same "small
focused file" principle as grouping related word entries in `wordBank.ts`):

- `Crate` — a single `RoundedBox` (wood-toned box).
- `Barrel` — a single tapered `cylinderGeometry`.
- `Pillar` — a single tall, thin `cylinderGeometry`.
- `Rug` — a single flat `planeGeometry` laid on the floor (slightly above
  y=0 to avoid z-fighting with the floor).
- `PottedPlant` — two meshes: a `cylinderGeometry` pot + a `sphereGeometry`
  "foliage" ball on top (mirrors the existing decorative plant already in
  `Kitchen.tsx`).
- `Chest` — a single `RoundedBox` (slightly flatter/wider than `Crate`).

All prop components use `meshToonMaterial` + the room's `accentColor` (passed
down from `ProceduralRoom`), matching the existing toon-shaded style. Each
takes `{ position: [number, number, number], rotationY: number, scale: number,
accentColor: string }`.

```ts
export const PROP_COMPONENTS: Record<PropType, ComponentType<PropProps>> = {
  crate: Crate,
  barrel: Barrel,
  pillar: Pillar,
  rug: Rug,
  pottedPlant: PottedPlant,
  chest: Chest,
};
```

`src/scene/ProceduralRoom.tsx`:

```ts
export function ProceduralRoom({ blueprint }: { blueprint: RoomBlueprint }): JSX.Element;
```

Renders:
- A floor: `planeGeometry [blueprint.width, blueprint.depth]`, rotated flat,
  `palette.floorColor`.
- Two walls (back + left, same floor+2-wall shell convention as
  `Kitchen`/`TavernRoom`/`DungeonRoom`): `boxGeometry` sized from
  `blueprint.width`/`height`/`depth`, `palette.wallColor`.
- Maps over `blueprint.props`, rendering `PROP_COMPONENTS[prop.type]` for each
  with its `position`/`rotationY`/`scale`/`palette.accentColor`.

## App Wiring

`src/ui/BlueprintDebugPanel.tsx` — small, fully controlled, no internal state:

```ts
export function BlueprintDebugPanel(props: {
  activeSeed: number | null;
  onGenerate: () => void;
  onExit: () => void;
}): JSX.Element;
```

Always renders a "Generate Random Room" button. When `activeSeed` is non-null,
additionally renders a "Back to Scenes" button and a label showing
`Seed: {activeSeed}`.

`App.tsx` changes:
- New `const [proceduralBlueprint, setProceduralBlueprint] = useState<RoomBlueprint | null>(null)`.
- `handleGenerate`: picks `const seed = Math.floor(Math.random() * 1e9)`, calls
  `generateRoomBlueprint(seed)`, `console.log`s the seed, sets
  `proceduralBlueprint`.
- `handleExit`: sets `proceduralBlueprint` to `null`.
- Canvas rendering: when `proceduralBlueprint` is non-null, render
  `<ProceduralRoom blueprint={proceduralBlueprint} />` in place of
  `<ActiveRoom /><ActiveBoard />`; when null, render as today.
- HUD's normal scene-switcher is hidden while `proceduralBlueprint` is
  non-null (conditionally render `<HUD />` only when
  `proceduralBlueprint === null`); `<BlueprintDebugPanel />` is always
  rendered, passed `activeSeed={proceduralBlueprint?.seed ?? null}`,
  `onGenerate={handleGenerate}`, `onExit={handleExit}`.

## Testing

- `src/engine/blueprintGenerator.test.ts`:
  - Same seed → identical `RoomBlueprint` (deep-equal), proving determinism.
  - Different seeds → can (not must, but statistically will for a spread of
    seeds) produce different blueprints.
  - `width`/`depth` in `[8, 16]`, `height` in `[6, 10]` across a sample of seeds.
  - `props.length` in `[4, 8]` across a sample of seeds.
  - Every prop's `position.x`/`position.z` stay within
    `[-width/2 + 1.5, width/2 - 1.5]` / `[-depth/2 + 1.5, depth/2 - 1.5]`
    (the wall margin), across a sample of seeds.
  - `palette` is always one of the 5 documented presets (exact object match
    against one of them).
- `src/scene/ProceduralRoom.test.tsx`: renders with one fixed, hand-written
  `RoomBlueprint` (3 known props: one `crate`, one `barrel`, one
  `pottedPlant`), asserts mesh count is at least `3 (shell) + 4` (3 single-mesh
  props + 1 extra mesh for the 2-mesh `pottedPlant`) = `7`, mirroring the
  threshold-based pattern already used in `DungeonRoom.test.tsx`.
- `src/ui/BlueprintDebugPanel.test.tsx`: renders with `activeSeed={null}` and
  asserts only "Generate Random Room" is present; renders with
  `activeSeed={12345}` and asserts "Back to Scenes" and "Seed: 12345" are
  also present; clicking each button calls the corresponding prop callback
  (`onGenerate`/`onExit`).
- `src/App.test.tsx`: one new test — click "Generate Random Room", assert a
  seed label appears and the normal HUD scene-switcher (e.g. the "Kitchen
  Fridge" button) is no longer present; click "Back to Scenes", assert the
  normal HUD scene-switcher reappears.

## Process

Same as prior phases: implemented on a feature branch/worktree
(`phase-5a-blueprint-poc`), TDD per file, full `npm test`/`npm run
typecheck`/`npm run lint` clean before merge, reviewed, merged to `main` via
the same subagent-driven-development workflow used for Phase 4.
