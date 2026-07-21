# Phase 6a: Kitchen Atmosphere — Design

**Date:** 2026-07-21
**Status:** Approved

## Context

Phases 0-5a shipped the core toy: a kitchen fridge with draggable word magnets,
a grammar-based poetry generator, toon shading, a day/night/season/weather
environment system, and additional tavern/dungeon scenes. Visually, though,
the kitchen scene is still quite bare: a floor, two walls, one window, a plain
cabinet, a two-box fridge, and a crude kettle/pot/plant cluster. It reads as a
"test level," not a lived-in cozy room.

This phase is the first of a new "make it feel alive" pass, starting with the
kitchen only (the default/startup scene). Tavern and dungeon get their own
follow-up passes later.

## Goals

1. Add cozy, lived-in props to the kitchen room and fridge.
2. Add subtle particle/atmosphere effects (dust motes, kettle steam, night
   fireflies) that react to the existing lighting-preset system.
3. Add a procedural "low-poly texture" feel (grain/wood-grain) to flat toon
   surfaces, replacing flat single-color materials on the floor/counter/
   cabinet.
4. Keep everything procedurally generated in code — no downloaded image
   textures or 3D models, consistent with the roadmap's "no external asset
   pipeline" rule. Canvas-generated textures (like the existing
   `toonGradient.ts`) count as procedural.
5. No new npm dependencies: `@react-three/drei`'s `Sparkles` (already
   installed) covers the particle needs.

## Non-Goals

- Tavern/dungeon atmosphere passes (separate future phases).
- Full bloom/postprocessing pipeline (no `@react-three/postprocessing`
  added) — glow is faked via emissive materials only.
- Changing camera framing, drag/interaction logic, or the poetry engine.
- Changing scene-transition (zoom/fade) behavior — untouched.
- A window "outside world" any richer than a flat gradient-sky backdrop
  plane + a few star dots at night (no full outdoor scene/parallax).

## Design

### 1. File structure

- **`src/scene/Kitchen.tsx`** — expanded with new room-level props (rug,
  curtains, shelf, string lights, pendant lamp, improved plant, window
  backdrop). Existing floor/wall/window/cabinet meshes stay, restyled with
  the new grain textures.
- **`src/scene/Fridge.tsx`** — small detail pass: door handle, kick-plate
  legs, vent lines. `MagnetBoard` usage unchanged.
- **`src/scene/KitchenAtmosphere.tsx`** (new) — dust motes (`Sparkles`),
  kettle steam (custom sprite particles), and night fireflies (`Sparkles`,
  conditionally rendered on `lightingPreset`). Mounted as a sibling inside
  `Kitchen.tsx`, kept in its own file so `Kitchen.tsx` doesn't balloon.
- **`src/scene/proceduralTextures.ts`** (new) — `createGrainTexture()` and
  `createWoodGrainTexture()`, canvas-based `THREE.CanvasTexture` generators
  analogous to `toonGradient.ts`'s `createToonGradientMap()`. Both memoized
  per-call-site via `useMemo` (same pattern already used for the gradient
  map), with `wrapS`/`wrapT = THREE.RepeatWrapping` and a `repeat` set per
  surface so the grain tiles at a sensible scale instead of stretching.

### 2. Cozy props (Kitchen.tsx)

- **Pendant lamp**: thin cylinder "cord" from ceiling to a small emissive
  sphere "bulb" above the counter, plus a `pointLight` at the bulb so it
  visibly lights the counter at night (reusing the existing per-preset
  light-intensity pattern, scaled down).
- **String lights**: an array of ~8-10 small emissive spheres positioned
  along a hand-picked catenary-like curve (simple quadratic sag, computed
  once) strung along the back wall's top edge.
- **Braided rug**: 2-3 stacked, slightly-inset flat rounded shapes (via
  `RoundedBox` with a tiny height) in concentric warm tones, replacing bare
  floor in front of the cabinet.
- **Curtains**: two soft, gently-curved vertical shapes (thin `RoundedBox`
  or a lightly-bent plane) flanking the window, in a warm fabric tone.
- **Wall shelf**: a thin `RoundedBox` shelf plank with 2 small cylinder jars
  and a stack of 2-3 flat rounded "books" on top.
- **Plant upgrade**: replace the single crude sphere with a small cluster of
  flattened/elongated spheres or thin cones at varied angles (leaves), plus
  a separate small hanging herb bundle (a few thin cylinders "tied" near the
  window) for variety.
- **Window backdrop**: a plane behind the window glass colored from the
  active `LightingPreset`'s `fogColor`/`ambientColor` (a soft vertical
  gradient via a small canvas texture) instead of the current flat cream
  fill; a sparse handful of small white dot "stars" (tiny spheres or a
  `Sparkles` instance with `count` ~15) rendered only when
  `lightingPreset === 'night'`.

### 3. Fridge detail pass (Fridge.tsx)

- **Handle**: a thin vertical rounded cylinder or `RoundedBox`, offset near
  the door's edge.
- **Legs/kick-plate**: a short recessed dark `RoundedBox` at the base,
  giving the fridge a visible "standing on the floor" grounding instead of
  meeting the floor with a hard flush edge.
- **Vent lines**: 2-3 thin dark horizontal `RoundedBox` strips near the top,
  suggesting cooling vents.

These are cosmetic-only additions positioned so they never overlap the
`MagnetBoard`'s existing `magnetBoardBounds` region on the door face.

### 4. Atmosphere effects (KitchenAtmosphere.tsx)

- **Dust motes**: one `<Sparkles>` instance, positioned/scaled to sit inside
  the window's light shaft (roughly between the window and the counter),
  small `size`/`count` (~20-30), warm-white color, slow `speed`, so it reads
  as ambient dust catching light rather than a "magic sparkle" effect.
- **Kettle steam**: a small custom `THREE.Points`-based (or a handful of
  billboarded sprite meshes) particle group above the kettle spout. Each
  particle: spawns near the spout, drifts upward with slight horizontal
  sway, scales up and fades out (opacity → 0) over its lifetime, then
  respawns at the bottom (looping), driven by a `useFrame` callback. Uses a
  small soft-circle `CanvasTexture` (radial gradient, generated once) as
  the sprite map with additive-ish (`transparent`, normal blending is fine
  since it's white/pale, no need for real additive) blending.
- **Night fireflies**: a second, sparser `<Sparkles>` instance (~10-15,
  slightly bigger, warm-yellow) near the plant/window, conditionally
  rendered (`{lightingPreset === 'night' || lightingPreset === 'evening' ?
  <Sparkles ... /> : null}`) so the room visibly changes character after
  dark, reusing the `lightingPreset` value already read via `useSceneStore`
  elsewhere in the scene tree.

### 5. Procedural textures (proceduralTextures.ts)

- `createGrainTexture(baseColor?, opts?)`: small (e.g. 64x64) canvas filled
  with the base tone, then speckled with low-alpha random-brightness pixels/
  flecks, returned as a `THREE.CanvasTexture` with `NearestFilter`/
  `RepeatWrapping`. Used as the `map` on the back wall and side wall for a
  faint hand-painted plaster texture.
- `createWoodGrainTexture(baseColor?, opts?)`: small canvas with a few
  horizontal wavy sine-based streaks in a slightly darker/lighter tone over
  the base, returned the same way. Used as the `map` on the floor, counter
  top, cabinet, and shelf for a wood-grain look.
- Both exported functions are pure (deterministic given same inputs would
  still look organic via internal fixed-seed randomness — no need for
  externally-supplied RNG since these are one-time decorative textures, not
  gameplay-affecting).

### 6. Testing

- Update `Kitchen.test.tsx`/`Fridge.test.tsx` smoke tests to still mount
  without throwing and adjust any hard-coded mesh-count assertions for the
  new props.
- Add `proceduralTextures.test.ts`: verify `createGrainTexture`/
  `createWoodGrainTexture` return a `THREE.CanvasTexture` with expected
  `image` dimensions and `RepeatWrapping` set on both wrap axes.
- Add a smoke test for `KitchenAtmosphere.tsx` mounting without throwing,
  and a test confirming the firefly `Sparkles` instance is absent for
  `lightingPreset: 'day'` and present for `'night'`.
- Manual Playwright visual verification (kitchen overview + fridge
  close-up, at least one day preset and one night preset) before
  committing — not an automated test, but a required verification step per
  this project's established workflow.

## Risks / Considerations

- **Performance**: all additions are low-poly primitives and two small
  `Sparkles` instances plus a handful of custom sprite particles — trivial
  GPU/CPU cost, no perf concerns expected for a desktop Tauri app.
- **Visual clutter**: props are placed to avoid the `magnetBoardBounds`
  region and the existing camera framing; verified visually before
  committing rather than assumed correct from code alone.
- **`Sparkles` API surface**: drei version pinned at `^10.7.7`; will confirm
  the exact prop names (`count`, `scale`, `size`, `speed`, `color`,
  `position`) against the installed version's type defs before use.
