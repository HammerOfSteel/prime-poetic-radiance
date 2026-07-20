# Phase 4a: Scene Variety — Magnet Surface Abstraction + Tavern Noticeboard

## Summary

Phase 4 of the roadmap calls for multiple hand-authored scenes beyond the
kitchen fridge, sharing a common "magnet surface" abstraction so the
poetry/drag mechanic is scene-agnostic. This phase (4a) delivers that
abstraction plus **one** new scene — a fantasy tavern noticeboard — to prove
the abstraction against a real second scene rather than designing it in the
abstract. Additional scenes (e.g. an RPG dungeon) are deferred to later
sub-phases (4b, 4c, ...) once the abstraction is validated.

## Goals

- Introduce a `SceneDefinition` registry so scene-specific values (magnet
  surface plane, camera framing, word theme, lighting behavior) are
  configuration, not hardcoded constants scattered across components.
- Add a second scene: a fantasy tavern noticeboard, visually and thematically
  distinct from the kitchen (warm wood/candlelight vs. toon-shaded kitchen).
- Add a HUD control to switch between scenes.
- Give each scene independent, in-memory magnet state (per-scene layout
  persists while switching back and forth within a session; first visit to a
  scene starts fresh).
- Add ~12 new tavern-flavored words to the shared word bank and weight a
  handful of existing words higher for the `tavern` theme.

## Non-goals

- No additional scenes beyond the tavern in this phase (dungeon, other
  mundane objects — deferred).
- No persistence of magnet layouts across page reloads (matches existing
  behavior: reload already reshuffles).
- No shared/combined 3D world where multiple scenes are visible
  simultaneously — switching is a hard cut (zoom out → swap scene → zoom in),
  reusing the existing camera-rig tween/transition-overlay mechanism.
- The tavern does not participate in the Phase 3 environment system (no
  auto/manual lighting toggle) — it always uses fixed warm firelight, since a
  windowless tavern interior has no real "outside weather" to reflect.

## Architecture

### `SceneDefinition` registry (`src/engine/scenes.ts`, new)

Pure, rendering-agnostic configuration module (follows the existing
`src/engine/` convention — no React/three.js/network imports):

```ts
export type SceneId = 'kitchen' | 'tavern';

export interface SceneDefinition {
  id: SceneId;
  label: string;                         // HUD display name, e.g. "Kitchen Fridge"
  wordTheme: WordTheme;                  // 'kitchen' | 'tavern' — feeds getThemeWeight()
  magnetSurfaceZ: number;                // replaces hardcoded FRIDGE_DOOR_Z
  magnetCount: number;                   // replaces hardcoded 35 in Fridge.tsx
  cameraZoomedIn: [number, number, number];
  cameraTarget: [number, number, number]; // OrbitControls target when zoomed in
  usesEnvironmentLighting: boolean;      // false for tavern
}

export const SCENES: Record<SceneId, SceneDefinition>;
export const SCENE_IDS: SceneId[]; // ['kitchen', 'tavern'], display/cycle order
```

`kitchen`'s values are extracted unchanged from current constants
(`FRIDGE_DOOR_Z = -1.84`, magnet count `35`, `CAMERA_ZOOMED_IN = [4, 5, 3.5]`,
target `[4, 5, -1.85]`, `usesEnvironmentLighting: true`). `tavern`'s values are
new, tuned during implementation for the noticeboard's geometry.

### Magnet surface generalization

- `Magnet.tsx`: replace the imported `FRIDGE_DOOR_Z` constant with a required
  `surfaceZ: number` prop, used both for the initial position and the drag
  plane (`computeDragPoint(ndc, camera, surfaceZ)`). No other behavior change.
- New shared component `src/scene/MagnetBoard.tsx`: extracts the
  magnet-placement/shuffle/mesh-registry logic currently inline in
  `Fridge.tsx` (word selection via `WORDS`/theme weighting, `SlamButton`,
  `TesseractButton` wiring) into a reusable component parameterized by
  `sceneId`, `surfaceZ`, and `magnetCount`. It reads `SCENES[sceneId]` for
  `wordTheme` to bias word selection via the existing `getThemeWeight`
  mechanism.
- `Fridge.tsx` becomes a thin composition of static fridge geometry +
  `<MagnetBoard sceneId="kitchen" ... />`.
- New `src/scene/TavernNoticeboard.tsx`: thin composition of static
  noticeboard geometry (a corkboard mounted on a tavern wall) +
  `<MagnetBoard sceneId="tavern" ... />`.

### Scene switching & state (`src/state/sceneStore.ts`)

- New state: `activeSceneId: SceneId` (default `'kitchen'`),
  `setActiveScene(id: SceneId)`.
- Per-scene magnet state: `magnetLayoutBySceneId: Partial<Record<SceneId,
  MagnetLayoutEntry[]>>`, where each entry is `{ word, index, position }`.
  Lazily initialized (shuffled fresh) the first time a scene is visited;
  read/written thereafter so switching back preserves in-progress poems for
  the session. Not persisted to localStorage/disk.
- `setActiveScene` behavior: if `isZoomedIn` is true, zoom out first (reusing
  the existing camera-rig tween/`TransitionOverlay`), swap `activeSceneId`,
  then leave the user zoomed out on the new scene's establishing view (user
  taps to zoom in, consistent with the existing "click to zoom" interaction —
  no auto re-zoom into the new scene).
- Auto/Manual lighting toggle and preset buttons in `HUD.tsx` are hidden
  (not just disabled) when `SCENES[activeSceneId].usesEnvironmentLighting` is
  `false`.

### App composition (`src/App.tsx`)

- Renders `SCENES[activeSceneId]` to select which geometry components to
  mount: `{activeSceneId === 'kitchen' ? <><Kitchen /><Fridge /></> : <><TavernRoom
  /><TavernNoticeboard /></>}`.
- Camera zoom-in target and `OrbitControls` target are read from
  `SCENES[activeSceneId]` instead of the current hardcoded
  `CAMERA_ZOOMED_IN`/`cameraTarget` constants.
- `Lighting.tsx` receives (or reads from the store) whether the active scene
  uses environment lighting; when `false`, it renders a fixed warm
  torch/firelight preset instead of the auto/manual-driven preset.

### Word bank (`src/engine/wordBank.ts`)

- `WordTheme` widens: `export type WordTheme = 'kitchen' | 'tavern';`
- ~12 new entries added to `WORD_ENTRIES`, each `{ word, category,
  themeWeights: { tavern: 3 } }`: `ale` (noun), `quest` (noun), `sword`
  (noun), `dragon` (noun), `bard` (noun), `tavern` (noun), `mead` (noun),
  `gold` (noun), `oath` (noun), `blade` (noun), `tankard` (noun), `legend`
  (noun).
- A handful of existing entries gain an additional `tavern` weight alongside
  their existing `kitchen` weight where present, or a new `themeWeights`
  block where absent: `fire`, `ancient`, `stranger`, `journey`, `secret` each
  get `tavern: 2`.
- No changes to `getThemeWeight`, `CATEGORIES`, or `WORDS` mechanics — purely
  additive data.

## Data flow

1. User clicks the scene-switcher control in the HUD → `setActiveScene('tavern')`.
2. Store zooms out (if needed) via existing camera-rig tween, sets
   `activeSceneId = 'tavern'`, lazily initializes
   `magnetLayoutBySceneId.tavern` if not already present.
3. `App.tsx` re-renders, mounting `TavernRoom` + `TavernNoticeboard` instead
   of `Kitchen` + `Fridge`.
4. `MagnetBoard` reads `magnetLayoutBySceneId.tavern` for initial magnet
   positions/words and `SCENES.tavern.wordTheme` for theme-weighted word
   selection on first visit.
5. `HUD.tsx` reads `SCENES.tavern.usesEnvironmentLighting` (`false`) and
   hides the Auto/Manual toggle and preset buttons.
6. User drags magnets in the tavern; positions write back into
   `magnetLayoutBySceneId.tavern` so switching away and back preserves them.

## Error handling

No new error-handling surface. `CanvasErrorBoundary` already wraps the entire
`Canvas` and covers both scenes' geometry and magnet-board components. Scene
lookups (`SCENES[activeSceneId]`) are always valid by construction since
`activeSceneId` is typed as `SceneId` and can only be set via
`setActiveScene`, which only accepts a `SceneId`.

## Testing

Follows existing repo conventions (pure logic fully unit-tested, R3F
components smoke-tested):

- `src/engine/scenes.ts` — unit tests for the `SCENES` registry shape/values
  and `SCENE_IDS` ordering.
- `src/engine/wordBank.test.ts` (existing file, extended) — tests confirming
  new tavern words exist with correct categories/weights, and existing
  reweighted words retain their original `kitchen` weights unchanged.
- `src/state/sceneStore.test.ts` (existing file, extended) — tests for
  `setActiveScene`, per-scene lazy magnet-layout initialization, and layout
  persistence across scene switches.
- `src/scene/MagnetBoard.test.tsx` (new) — smoke test verifying it renders
  the configured `magnetCount` of magnets for a given `sceneId`.
- `src/scene/TavernRoom.test.tsx`, `src/scene/TavernNoticeboard.test.tsx`
  (new) — smoke tests mirroring `Kitchen.test.tsx`/`Fridge.test.tsx` (renders
  without throwing, expected child structure).
- `src/ui/HUD.test.tsx` (existing file, extended) — tests for the scene
  switcher control and for hiding lighting controls when the active scene
  has `usesEnvironmentLighting: false`.
- `src/scene/Lighting.test.tsx` (existing file, extended) — test for the
  fixed warm firelight preset path when environment lighting is disabled for
  the active scene.

## Open questions

None — all scope, UX, and content questions were resolved during
brainstorming (see decisions below).

## Key decisions from brainstorming

1. Scope: this phase = abstraction + exactly one new scene (tavern);
   additional scenes deferred to later sub-phases.
2. Scene switching UX: HUD button/control, not a shared walkable world.
3. Per-scene state: independent, in-memory magnet layouts per scene; fresh
   shuffle on first visit to a scene, preserved thereafter for the session.
4. Tavern lighting: fixed warm firelight, does not participate in the Phase
   3 environment/auto-lighting system.
5. Word bank: reuse the existing `themeWeights` mechanism; add ~12 new
   tavern words plus reweight a handful of existing evocative words for the
   `tavern` theme.
