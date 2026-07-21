# Tavern Atmosphere — Design Spec

**Date:** 2026-07-21
**Status:** Approved (user delegated design judgment; scope confirmed via chat, no per-section review requested)

## Purpose

The tavern scene (`TavernRoom.tsx`) is currently a bare shell: a flat wood
floor, two flat walls, a plain box-shaped hearth with a static flat-plane
"fire" glow, and a single bench. This is the second of three planned
"atmosphere" passes (Kitchen already shipped; Dungeon is next), bringing the
tavern up to the same cozy, lived-in, toy-diorama standard established by
Kitchen Atmosphere (Phase 6a) — reusing that feature's exact patterns
(seeded procedural textures, gsap-animated sprites, drei `Sparkles`
particles) rather than inventing new techniques.

Unlike the kitchen, the tavern uses a **fixed** lighting preset (warm
firelit, `usesEnvironmentLighting: false` — see `scenes.ts`) with no
day/night cycle and no HUD lighting-preset buttons. This simplifies the
design: there's no need for any lighting-preset-conditional behavior (e.g.
Kitchen's evening/night-only fireflies) — everything in this pass is always
on, tuned once for the tavern's single warm/dim mood.

## Scope

Three additions, all inside the tavern scene's own files — no changes to
`App.tsx`, shared state, or other scenes:

1. **Textures & props** (`TavernRoom.tsx`)
2. **Animated hearth fire** (`TavernRoom.tsx`)
3. **Ambient atmosphere particles** (new `TavernAtmosphere.tsx`, mirroring `KitchenAtmosphere.tsx`)

## 1. Textures & Props

- **Floor, bench, and new barrel props** get `createWoodGrainTexture()`
  (already implemented in `proceduralTextures.ts`, used previously for
  Kitchen's counter/floor) applied as their material's `map`, tinted by the
  existing toon material `color`. No new texture-generator code needed —
  straight reuse.
- **Walls** get `createGrainTexture()` (already implemented, used for
  Kitchen's plaster walls) for subtle speckled variation, applied the same
  way.
- **New props**, all built from primitives (`RoundedBox`/`cylinderGeometry`/
  `boxGeometry`), no external model assets:
  - **Barrel cluster**: 3 stacked/grouped cylinders in a back corner of the
    room, wood-grain textured, dark metal-band accents via thin torus or
    short dark cylinder rings.
  - **Wall shelf with bottles**: a thin `RoundedBox` shelf plank with 4-5
    small cylinder "bottles" of varying height/color sitting on top,
    mounted on the wall opposite the hearth.
  - **Wall sconces** (x2): small emissive plane/cone "flame" glued to a
    short dark bracket box, same flat-emissive-plane technique as the
    existing hearth glow (before its own upgrade below), placed flanking
    the back wall for extra warm fill light points.
  - **Tankards/mugs on the bench**: 2-3 small cylinders (mug body) + torus
    (handle) sitting on the existing bench, wood/pewter toon-shaded.

  All new geometry uses the shared `createToonGradientMap()` already used
  throughout the file, so shading style matches the rest of the scene with
  zero new shading code.

## 2. Animated Hearth Fire

The current hearth is a static flat orange `meshBasicMaterial` plane. This
gets replaced with:

- **2-3 layered flame sprites**, gsap-animated on a repeating timeline
  (opacity/scale/slight vertical drift) — the exact same technique already
  used for Kitchen's kettle steam (`KitchenAtmosphere.tsx`'s steam sprite
  timeline), just retuned for a faster, flickering flame instead of a slow
  rising steam wisp (shorter duration, more scale jitter, warmer color
  stops orange→yellow).
- **A flickering point light** (`THREE.PointLight` via `<pointLight>`)
  positioned at the hearth, with its `intensity` driven by a gsap timeline
  (randomized-looking flicker via chained `.to()` steps with varying
  duration/easing) so firelight visibly dances across nearby walls/props —
  this is new to the tavern (kitchen has no equivalent flickering light)
  since fire is the tavern's signature light source.

This logic lives directly in `TavernRoom.tsx` (the flame sprites replace the
existing static plane in place) since it's tightly coupled to the hearth's
fixed position — no separate component needed for this piece.

## 3. `TavernAtmosphere.tsx` (new component)

Mirrors `KitchenAtmosphere.tsx`'s structure/conventions exactly — a small
sibling component mounted once inside `TavernRoom`'s returned fragment,
taking only the props it needs:

```ts
export interface TavernAtmosphereProps {
  hearthPosition: [number, number, number];
}
```

- **Rising embers**: drei `<Sparkles>`, warm orange/red color, small size,
  slow upward drift, positioned at/just above `hearthPosition`, count tuned
  low (mirrors Kitchen's steam being subtle, not a fireworks show).
- **Ambient dust motes**: a second `<Sparkles>` layer, pale warm-white,
  larger scale spanning the room, low opacity — direct equivalent of
  Kitchen's always-on ambient dust layer, just recolored slightly warmer to
  match the tavern's firelit palette instead of the kitchen's daylight
  palette.

Both particle layers are always rendered (no lighting-preset gating, per
the Scope note above) — this is the one meaningful structural
simplification versus `KitchenAtmosphere.tsx`.

## Testing

Same approach as Kitchen Atmosphere and the post-processing pipeline:

- Any new pure/testable logic (none is anticipated beyond what
  `proceduralTextures.ts` already covers, which is already tested) gets a
  unit test if it exists.
- `TavernRoom.tsx` and `TavernAtmosphere.tsx` themselves are R3F components
  containing drei/gsap/Three.js primitives — consistent with this
  project's established pattern (Kitchen Atmosphere shipped the same way),
  these are verified via **manual Playwright/browser visual QA**, not
  automated component-mount tests. No new test-infrastructure limitation is
  expected here (Sparkles/gsap-sprite patterns already mount fine in this
  project's test renderer, per Kitchen Atmosphere's precedent — only
  `@react-three/postprocessing`'s `EffectComposer` had that specific
  mocked-WebGL-context problem).

## Out of Scope

- No changes to `TavernNoticeboard.tsx` (magnet board itself) — this pass
  is room-atmosphere only, matching Kitchen Atmosphere's scope (Fridge.tsx
  detail pass was a separate task within that same plan; an equivalent
  Noticeboard detail task can be included as a plan task if it fits
  naturally, but is not required for this spec to be complete).
- No new global post-processing effects — the already-shipped Phase 6b
  pipeline applies automatically to the tavern scene with zero additional
  work.
- No day/night or lighting-preset variation — out of scope per the fixed
  lighting design already in `scenes.ts`.
