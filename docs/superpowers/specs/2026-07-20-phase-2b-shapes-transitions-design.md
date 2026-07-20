# Phase 2b: Shapes & Transitions — Design

**Date:** 2026-07-20
**Status:** Implemented

## Context

Phase 2a (Shading & Palette) is merged: every scene mesh uses `MeshToonMaterial`
with a warm "Oak & Butter" palette, and lighting presets are retuned warmer.
Per the roadmap, Phase 2 ("Visual Style Pass") also covers refined primitive
shapes and polished scene-transition effects — the "shape and motion" half,
split out as Phase 2b.

This spec covers 2b only:
- **Shape refinement:** round the sharp box corners on freestanding objects
  (cabinet, fridge body/door) for a softer, toy-like look.
- **Transition polish:** add a fade overlay to the existing camera zoom
  in/out, so switching between the kitchen overview and the fridge close-up
  reads as a deliberate transition rather than an abrupt camera snap.

There is currently only one scene (the kitchen); multiple environments to
transition *between* are Phase 3's concern. This spec only polishes the
existing zoom transition.

## Goals

- Freestanding box-shaped objects (cabinet base/trim, fridge body/door) have
  visibly softened edges, consistent with the cozy low-poly toy aesthetic.
- The camera zoom transition (overview ↔ fridge close-up) is accompanied by
  a brief full-screen fade, masking the camera's motion and giving the
  transition a more polished, deliberate feel.
- No regressions: existing mesh-count tests, drag/interaction behavior, and
  the low-poly organic primitives (cylinders/spheres) are untouched.

## Non-Goals

- Rounding the room walls (they butt against the floor and each other; a
  rounded edge would leave visible seam gaps) — they stay flat `boxGeometry`.
- Rounding magnet tiles (they render a word texture via `map={texture}`,
  relying on standard box UV mapping; `RoundedBox`'s extruded/beveled
  geometry has different UVs and risks distorting the text) — magnets stay
  flat `boxGeometry`.
- Adjusting cylinder/sphere segment counts (kettle, pot, plant) — their low
  segment counts are an intentional low-poly stylistic choice, not something
  this phase touches.
- Building any multi-scene / multi-environment transition — that's Phase 3.
- Changing the camera's easing curve or duration — only a fade overlay is
  added on top of the existing `power2.inOut`, 0.8s tween.

## Design

### 1. Shape Refinement

Replace `<mesh><boxGeometry .../><meshToonMaterial .../></mesh>` with drei's
`<RoundedBox>` (already available via the installed `@react-three/drei`
dependency — no new package needed) for these meshes only:

| File | Mesh(es) |
|---|---|
| `src/scene/Kitchen.tsx` | Cabinet base, cabinet top trim |
| `src/scene/Fridge.tsx` | Fridge body, fridge door |

`RoundedBox` is a drop-in replacement: it forwards refs to the underlying
`Mesh` and accepts the same `position`/`castShadow`/`receiveShadow`/material
children props as a regular `<mesh>`, plus `args` (width/height/depth, same
tuple as `boxGeometry`), `radius`, and `smoothness`.

Standard values for every converted mesh:
- `radius={0.1}`
- `smoothness={4}`

These stay unchanged (not converted, per Non-Goals):
- Floor, back wall, side wall, window plane (`planeGeometry`/flat
  `boxGeometry` walls) — remain plain `boxGeometry`/`planeGeometry`.
- Kettle, pot, plant (`cylinderGeometry`/`sphereGeometry`) — untouched.
- Magnet tiles (`Magnet.tsx`) — remain plain `boxGeometry` with `map={texture}`.

### 2. Transition Fade Overlay

A new `TransitionOverlay` component (`src/scene/TransitionOverlay.tsx`, a
plain HTML component, not a Three.js element — it renders alongside the
`Canvas` in `App.tsx`, not inside it) renders a `position: fixed`, full
viewport (`inset: 0`), `background: #fdf6ec`, `pointer-events: none` div.
Its opacity is controlled by a prop, `progress: number` (0–1), driven by the
parent — the component itself has no animation logic, just renders the
current opacity. This keeps it a pure, easily-testable presentational unit.

`App.tsx`'s `CameraRig` currently tracks tween start/end via `onTweenChange`
or `isTweening`. It's extended to also drive a `gsap.timeline()` that:
1. Fades `overlayOpacity` 0 → 1 over 0.25s (`power1.in`) as the tween starts.
2. Holds at 1 briefly (0.1s) while the camera position updates land.
3. Fades `overlayOpacity` 1 → 0 over 0.25s (`power1.out`).

Total overlay duration (~0.6s) is slightly shorter than the camera's 0.8s
tween so the fade doesn't outlast the motion — the overlay's opaque hold
covers the middle of the camera move, and it's fully transparent again
before the camera settles, avoiding an awkward "overlay clears before
camera stops" flash. The camera's own tween (position, duration, easing)
is unchanged.

`overlayOpacity` is new local state (`useState`) in `App`, updated by the
timeline's `onUpdate` callback, passed to `<TransitionOverlay progress={overlayOpacity} />`
rendered as a sibling after `<Canvas>`.

### 3. Testing

- `TransitionOverlay.test.tsx`: renders with a given `progress` value, asserts
  the rendered div's `opacity` style matches `progress` (e.g. `progress={0}` →
  `opacity: 0`, `progress={1}` → `opacity: 1`, `progress={0.5}` → `opacity: 0.5`).
- `Kitchen.test.tsx` / `Fridge.test.tsx`: existing mesh-count assertions
  should still pass unmodified — `RoundedBox` renders as a `Mesh` in the
  `@react-three/test-renderer` tree, same as a plain `<mesh>`.
- No test currently exercises the camera-tween's fade timing directly
  (`App.test.tsx` only asserts the app shell renders); no new App-level
  timing test is planned — gsap timeline behavior is exercised visually,
  consistent with how the existing camera tween itself is tested today (not
  tested for timing, only smoke-tested via `App.test.tsx`).

## Open Questions

None — all decisions were resolved during brainstorming.
