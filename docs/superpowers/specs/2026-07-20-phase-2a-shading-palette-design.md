# Phase 2a: Shading & Palette — Design

**Date:** 2026-07-20
**Status:** Approved

## Context

Phase 1 (Poetry Engine) is merged. Per the roadmap, Phase 2 ("Visual Style
Pass") covers refined shapes, toon/flat shading, a warmer material palette,
and polished lighting + scene-transition effects. That's too much for one
plan/PR, so it's split into two sub-phases:

- **Phase 2a (this spec):** toon shading + warm material palette + retuned
  lighting presets — the "look" of every existing surface.
- **Phase 2b (separate spec, later):** refined/rounded primitive geometry +
  camera swoop/wipe transition polish — the "shape and motion" pass.

This spec covers 2a only.

## Goals

1. Convert every scene material (`Kitchen.tsx`, `Fridge.tsx`, `Magnet.tsx`)
   from `MeshStandardMaterial`/`meshBasicMaterial` to `MeshToonMaterial` with
   a shared cel-shading gradient map, for the strongest "toy" look.
2. Recolor every surface to the "Warm Oak & Butter" palette (chosen via the
   visual companion over two other options).
3. Retune all 4 lighting presets (morning/day/evening/night in
   `lightingPresets.ts`) so none of them read as cool/neutral — each should
   feel warm and cozy while still being visually distinct from the others.
4. Swap the window `RectAreaLight` for a `PointLight`, since
   `RectAreaLight` only affects `MeshStandardMaterial`/`MeshPhysicalMaterial`
   and would have no visible effect on the new toon-shaded scene.

## Non-Goals

- No geometry changes (box/cylinder/sphere primitive shapes, bevels, or
  rounding) — that's Phase 2b.
- No camera-transition/wipe effects — that's Phase 2b.
- No changes to `src/engine/` (word bank, templates, poem generation) or to
  drag/interaction logic in `Magnet.tsx` beyond its material.
- No new scenes/themes — still the single kitchen scene.

## Design

### 1. Shared toon gradient map (`src/scene/toonGradient.ts`)

`MeshToonMaterial` needs a `gradientMap` texture to define its cel bands (it
has no built-in default in three.js — an un-set `gradientMap` renders as a
plain 2-tone material, which looks flat and washed out). This module exports
one function:

```ts
export function createToonGradientMap(): THREE.DataTexture;
```

It builds a 4-texel 1D gradient (dark → mid → light → highlight), using
`THREE.NearestFilter` for both `magFilter`/`minFilter` so the bands stay
crisp (no smoothing between them — this is what gives toon shading its
"stepped" cel look). The texture is created once (module-level singleton,
since all materials share the same lighting bands) and reused across every
`MeshToonMaterial` in the scene via its `gradientMap` prop.

### 2. Palette recolor

Every hardcoded hex color in `Kitchen.tsx`, `Fridge.tsx`, `Magnet.tsx`, and
`wordTexture.ts` is replaced per this mapping (colors chosen via the visual
companion's "Warm Oak & Butter" option):

| Surface | Current | New |
|---|---|---|
| Floor | `#3d2b1f` | `#8a5a3b` |
| Walls (back + side) | `#e0e5ec` | `#f2e3c9` |
| Window plane | `#eef2ff` | `#fff3d6` |
| Cabinet base | `#4a69bd` | `#c96a3e` |
| Cabinet top trim (dark strip) | `#111111` | `#2b1d14` |
| Countertop kettle | `#ff4757` | `#e8543f` |
| Countertop pot | `#cd6133` | `#cd6133` (unchanged — already warm) |
| Countertop plant | `#2ed573` | `#7a9e5a` |
| Fridge body + door | `#f5f6fa` | `#f6d98a` |
| Magnet tile background | `#f8f9fa` | `#fdf6ec` |
| Magnet tile border | `#d1d8e0` | `#e0c9a0` |
| Magnet tile text | `#2d3436` | `#3d2b1f` |

No new colors are introduced beyond this table — every mesh in the three
touched files gets exactly one of these values.

### 3. Material conversion

Every `<meshStandardMaterial>` in `Kitchen.tsx`, `Fridge.tsx`, and
`Magnet.tsx` becomes `<meshToonMaterial>` with `gradientMap={toonGradientMap}`
(the shared singleton from step 1) and the new color from the table above.
`roughness`/`metalness` props are dropped (unsupported by `MeshToonMaterial`
— toon shading doesn't model microfacet roughness). The window plane's
`<meshBasicMaterial>` stays a `meshBasicMaterial` (it represents an
unlit glowing pane, which is intentionally not affected by scene lighting).

### 4. Lighting: RectAreaLight → PointLight

In `Lighting.tsx`, the `<rectAreaLight ref={windowLightRef} .../>` element
and its `RectAreaLightUniformsLib.init()` call are removed. In their place,
a `<pointLight>` is added at the same window position (`[-5, 6, -5.3]`),
warm-tinted (`color="#fff3d6"`), `intensity={3}`, `distance={12}`. This
keeps a warm "sunlight through the window" glow that actually lights the
toon-shaded kitchen surfaces. No other lighting rig elements
(`ambientLight`, `directionalLight`, `pointLight` fill) change structurally
— only their preset color values do (see below).

### 5. Lighting preset retuning (`lightingPresets.ts`)

All 4 presets keep their existing shape
(`ambientColor`/`directionalColor`/`fillColor`/`fogColor`/intensities/
`directionalPosition`) and existing distinctiveness (time-of-day feel), but
every color value is replaced with a warmer equivalent:

| Preset | Field | Current | New |
|---|---|---|---|
| morning | ambientColor | `#ffeaa7` | `#ffeaa7` (unchanged — already warm) |
| morning | directionalColor | `#ffdac1` | `#ffdac1` (unchanged) |
| morning | fillColor | `#ffb8b8` | `#ffb8b8` (unchanged) |
| day | ambientColor | `#ffffff` | `#fff8ec` |
| day | directionalColor | `#ffffff` | `#fff4de` |
| day | fillColor | `#e0e0ff` | `#fff2d9` |
| evening | ambientColor | `#6c5ce7` | `#a8677a` |
| evening | directionalColor | `#fdcb6e` | `#fdcb6e` (unchanged) |
| evening | fillColor | `#d63031` | `#d63031` (unchanged) |
| night | ambientColor | `#0984e3` | `#2c3e6b` |
| night | directionalColor | `#74b9ff` | `#b8c4e0` |
| night | fillColor | `#00cec9` | `#e8a054` |

Fog colors, intensities, and `directionalPosition` values are unchanged —
only hue/temperature shifts, no relighting-angle or brightness changes,
keeping this a pure palette pass.

## Testing

- Extend `src/engine/lightingPresets.test.ts` (already tests preset shape)
  with assertions on the specific new hex values for `day`, `evening`, and
  `night` (to lock in the retune and catch accidental regressions).
- `src/scene/toonGradient.ts` gets a new `toonGradient.test.ts`: asserts the
  returned texture has the expected pixel count/format and that repeated
  calls with no caching still produce a valid texture (covers the
  module-level singleton behavior).
- Existing component smoke tests (`Kitchen.test.tsx`, `Fridge.test.tsx`,
  `Lighting.test.tsx`) must keep passing — they assert mount-without-throw
  and mesh/light counts, not colors, so material/lighting-type changes don't
  need new assertions there beyond confirming they still render.
- Full verification (`npm run lint && npm run typecheck && npm run test &&
  npm run build`) before merge, same bar as prior phases.
