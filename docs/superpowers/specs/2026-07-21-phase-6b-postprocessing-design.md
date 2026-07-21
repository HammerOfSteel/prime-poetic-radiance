# Phase 6b: Global Post-Processing Pipeline — Design Spec

## Context

Following the Phase 6a kitchen atmosphere pass (procedural props, particles, textures), the user wants the whole app to read as a cozy, toy-like "diorama" — explicitly referencing the *Link's Awakening* remake's visual style and the general "Nintendo 3DS toy" aesthetic. That look comes almost entirely from camera/renderer-level post-processing (depth of field, bloom, vignette, ambient occlusion, color grading, film grain), not from more props. This is the first of three planned sub-projects for this broader "make it feel alive" request:

1. **This spec: global post-processing pipeline** (camera/renderer level, benefits all three scenes immediately)
2. Tavern atmosphere component (future spec, not covered here)
3. Dungeon atmosphere component (future spec, not covered here)

## Goals

- Apply a consistent, global post-processing effect stack across all three scenes (kitchen, tavern, dungeon) and both zoom states (with depth of field gated by zoom state, see below).
- Achieve the "cozy toy diorama" look via: depth of field (zoomed-out only), bloom, vignette, ambient occlusion, color grading, and subtle chromatic aberration + film grain.
- Add a small, fun, discoverable in-app settings control to toggle each effect independently (and all at once), so the user can tune or disable the look without editing code.
- Keep magnet word-tile text perfectly legible when zoomed into a fridge/board — depth of field must not blur the interactive surface.

## Non-Goals

- No new procedural props, particles, or scene content (that's the tavern/dungeon atmosphere specs, later).
- No changes to camera movement/orbit behavior — `OrbitControls` stays exactly as configured today (free orbit while zoomed out, disabled while zoomed in/tweening/dragging).
- No per-lighting-preset variation of effect intensities — all six effects use constant, preset-independent settings (per explicit user decision).
- No changes to the drag/interaction logic, poetry engine, or scene-transition (`TransitionOverlay`) behavior.
- No external 3D models, images, or other binary assets — the "no external assets" constraint from prior phases still applies to models/images specifically. New npm packages/libraries ARE allowed for this phase (explicit user decision, loosening the prior phase's blanket "no new deps" rule).

## Global Constraints

- New dependency: `@react-three/postprocessing` (pulls in `postprocessing` and `n8ao` as its own dependencies — no separate installs needed for those).
- No external 3D model/image/binary assets of any kind.
- `<EffectComposer>` and its effect children are the only new rendering nodes — they must sit inside the existing `<Canvas>` in `src/App.tsx`, after the scene content, so they composite the full render.
- Depth of Field must be present in the render tree only when `!isZoomedIn` (from `useSceneStore`) — i.e. conditionally included as JSX, not merely set to a zero-strength value, so magnet text is never blurred by even a negligible amount.
- Every effect must be individually toggleable via a new `postFxStore` (zustand), all defaulting to enabled; toggling only removes/adds that specific effect from `<EffectComposer>`'s children, no other effect is affected.
- New UI (`PostFxSettingsButton`, `PostFxSettingsPanel`) must reuse the existing `glass-panel interactive-ui` CSS class convention already used by `src/ui/HUD.tsx`, for visual consistency.
- No per-preset (morning/day/evening/night) variation in effect parameters — the six effects use one fixed set of settings regardless of `lightingPreset`.

## Architecture

### `src/scene/PostProcessing.tsx` (new)

A single component rendering `<EffectComposer>` from `@react-three/postprocessing`, with each effect as a conditionally-rendered child based on the corresponding `postFxStore` flag AND (for Depth of Field specifically) `!isZoomedIn` from `sceneStore`. Mounted once in `App.tsx`, inside `<Canvas>`, as the last child (after `<ActiveRoom />`/`<ActiveBoard />`/`<OrbitControls />`), so it post-processes the full composited frame.

Effects and their settings (all from the bundled `postprocessing`/`n8ao` packages, no extra deps):

| Effect | Component | Key settings |
|---|---|---|
| Bloom | `Bloom` | `luminanceThreshold={0.6}`, `luminanceSmoothing={0.3}`, `intensity={0.8}`, `mipmapBlur` |
| Depth of Field | `DepthOfField` | `focusDistance` tuned to ~15 units (the zoomed-out camera's distance to its target), `focalLength={0.02}`, `bokehScale={3}` |
| Vignette | `Vignette` | `darkness={0.5}`, `offset={0.3}` |
| Ambient Occlusion | `N8AO` | subtle `intensity` (~1), small `aoRadius` tuned for the scene scale, so it reads as soft contact shadow, not heavy darkening |
| Color grading | `HueSaturation` + `BrightnessContrast` | small positive `saturation` and `contrast` offsets for a punchier, warmer palette |
| Chromatic aberration + grain | `ChromaticAberration` + `Noise` | both near-imperceptible (`offset` tiny for aberration, low `opacity`/`premultiply` for grain) |

### `src/state/postFxStore.ts` (new)

A zustand store mirroring `sceneStore`'s style:

```ts
interface PostFxState {
  bloomEnabled: boolean;
  dofEnabled: boolean;
  vignetteEnabled: boolean;
  aoEnabled: boolean;
  colorGradeEnabled: boolean;
  grainEnabled: boolean;
  isPanelOpen: boolean;
  setBloomEnabled: (value: boolean) => void;
  setDofEnabled: (value: boolean) => void;
  setVignetteEnabled: (value: boolean) => void;
  setAoEnabled: (value: boolean) => void;
  setColorGradeEnabled: (value: boolean) => void;
  setGrainEnabled: (value: boolean) => void;
  togglePanel: () => void;
  resetToDefaults: () => void;
}
```

All six `*Enabled` flags default to `true`; `isPanelOpen` defaults to `false`.

### `src/ui/PostFxSettingsButton.tsx` (new)

A small, fixed-position icon button (e.g. "🧸" or "🎛️" — decided during implementation to fit the HUD's existing emoji-label convention) using the `glass-panel interactive-ui` class, calling `togglePanel()` on click. Positioned so it doesn't overlap the existing `HUD`/`StepBackButton`.

### `src/ui/PostFxSettingsPanel.tsx` (new)

Renders only when `isPanelOpen`. A `glass-panel` checklist: one labeled checkbox per effect (Bloom, Depth of Field, Vignette, Ambient Occlusion, Color Grade, Grain), each bound to its store flag/setter, plus a "Reset to defaults" button calling `resetToDefaults()`.

### `src/App.tsx` (modified)

- Mount `<PostProcessing />` as the last child inside `<Canvas>`.
- Mount `<PostFxSettingsButton />` and `<PostFxSettingsPanel />` as DOM overlay siblings to the existing `<HUD />`/`<StepBackButton />` (outside `<Canvas>`, same as those).

## Data Flow

`isZoomedIn` (existing, from `sceneStore`) and the six `postFxStore` boolean flags are the only two pieces of state `PostProcessing.tsx` reads. Each effect's JSX is included via `{flag && <Effect .../>}` (Depth of Field additionally gated by `!isZoomedIn`). No new state flows into existing components — `sceneStore` is read-only from this feature's perspective.

## Testing Approach

- `PostProcessing.test.tsx`: mount `<PostProcessing />` inside a test `<Canvas>` (via `@react-three/test-renderer`) with various `postFxStore`/`sceneStore` states; assert each effect's underlying node is present/absent by type or a `data-kind`-style marker where the library doesn't expose a distinguishable node type. Specifically verify: (a) Depth of Field node absent when `isZoomedIn` is `true` regardless of `dofEnabled`; (b) each effect's node disappears when its store flag is set to `false`; (c) default mount includes all six effects.
- `postFxStore.test.ts`: unit tests for each setter and `resetToDefaults()`.
- `PostFxSettingsButton.test.tsx` / `PostFxSettingsPanel.test.tsx`: DOM tests (`@testing-library/react` + `vitest`) verifying the button toggles `isPanelOpen`, the panel renders only when open, each checkbox reflects and updates its store flag, and "Reset to defaults" restores all flags to `true`.
- A smoke test confirming the full `<Canvas>` (via `App.tsx`'s existing test setup, if one exists, or a targeted render) still mounts without throwing with `<PostProcessing>` included.

## Open Questions / Risks

- Exact numeric tuning (bloom threshold, DoF bokeh scale, vignette darkness, etc.) is a starting point from design; the implementation plan should include a manual Playwright visual-verification pass (as with Phase 6a) to confirm the look reads correctly and adjust constants if needed, rather than treating the numbers above as final/immutable.
- `N8AO`'s performance cost on lower-end hardware is unknown for this project; if visual verification reveals unacceptable frame drops, the plan should note falling back to a cheaper/simpler SSAO or dropping AO's default to `off` (still implemented, just not defaulted on) — to be decided during implementation if it arises, not blocking this spec.
