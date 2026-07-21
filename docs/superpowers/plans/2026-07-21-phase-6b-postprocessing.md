# Phase 6b: Global Post-Processing Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a global post-processing pipeline (bloom, depth of field, vignette, ambient occlusion, color grading, chromatic aberration + grain) to give the whole app a cozy, toy-diorama look, plus an in-world settings panel to toggle each effect.

**Architecture:** A single `<PostProcessing>` component wraps `@react-three/postprocessing`'s `<EffectComposer>` and is mounted once inside the existing `<Canvas>` in `App.tsx`, after all scene content, so it post-processes the fully composited frame. It reads six boolean flags from a new `postFxStore` (zustand) to decide which effects to include, and separately reads `isZoomedIn` from the existing `sceneStore` to gate Depth of Field so magnet text stays crisp when zoomed in. A new `PostFxSettingsButton`/`PostFxSettingsPanel` pair (styled like the existing `HUD`) lets the user toggle each effect live.

**Tech Stack:** React 19, `@react-three/fiber` 9, `@react-three/postprocessing` (new dependency, pulls in `postprocessing` and `n8ao`), zustand 5, vitest + `@testing-library/react` + `@react-three/test-renderer`.

## Global Constraints

- New dependency `@react-three/postprocessing` is approved; no other new 3D-model or image assets may be added (per project's durable "no external 3D models/images" rule — npm packages/libraries are fine).
- Depth of Field must be excluded from the render tree entirely (not just zero-strength) whenever `isZoomedIn` is `true`.
- All six effects (Bloom, Depth of Field, Vignette, Ambient Occlusion, Color Grade, Grain) default to enabled and are individually toggleable via `postFxStore`; "Color Grade" bundles `HueSaturation`+`BrightnessContrast` behind one flag (`colorGradeEnabled`), and "Grain" bundles `ChromaticAberration`+`Noise` behind one flag (`grainEnabled`), matching the two-effects-per-checkbox rows approved in the design spec.
- No effect's intensity/parameters vary by `lightingPreset` — one fixed set of constants for all presets.
- `OrbitControls`'s existing `enabled={isZoomedIn && !isTweening && !draggedMagnetId}` condition in `App.tsx` must not be touched.
- New UI must reuse the existing `glass-panel interactive-ui` CSS classes from `src/styles.css` for visual consistency with `HUD.tsx`/`StepBackButton.tsx`.
- **Known test-environment limitation (discovered during planning):** `@react-three/postprocessing`'s `EffectComposer` calls `renderer.getContext().getContextAttributes()` internally, which throws (`Cannot read properties of undefined (reading 'alpha')`) under `@react-three/test-renderer`'s mocked WebGL context. This means `<PostProcessing>` (and any component that mounts a real `<EffectComposer>`) **cannot** be mounted in a vitest test. To keep the conditional-inclusion logic testable anyway, that logic is extracted into a plain, dependency-free function (`resolveActiveEffects`) in its own file, unit-tested directly with no React/Three involved. `PostProcessing.tsx` itself is verified only by manual visual QA in a real browser (dev server), not by an automated mount test — every task below reflects this; do not attempt to add a test that mounts `<PostProcessing>` or `<EffectComposer>`.

---

### Task 1: Add the `@react-three/postprocessing` dependency

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: the `@react-three/postprocessing` package (version `^3.0.4`), available for import in later tasks (`EffectComposer`, `Bloom`, `DepthOfField`, `Vignette`, `N8AO`, `HueSaturation`, `BrightnessContrast`, `ChromaticAberration`, `Noise`).

- [ ] **Step 1: Install the package**

Run: `npm install @react-three/postprocessing@^3.0.4`
Expected: `package.json` gains `"@react-three/postprocessing": "^3.0.4"` under `"dependencies"`, and `package-lock.json` updates. `postprocessing` and `n8ao` appear as transitive dependencies in `package-lock.json` (no direct entries needed in `package.json`).

- [ ] **Step 2: Verify the project still builds and type-checks**

Run: `npm run build`
Expected: build succeeds with no new errors (this only adds a dependency, no code changes yet).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add @react-three/postprocessing dependency

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 2: `postFxStore` — zustand store for effect toggles

**Files:**
- Create: `src/state/postFxStore.ts`
- Test: `src/state/postFxStore.test.ts`

**Interfaces:**
- Consumes: nothing new (only `zustand`'s `create`, already a project dependency).
- Produces: `usePostFxStore` hook with state shape:
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
  All six `*Enabled` flags default `true`, `isPanelOpen` defaults `false`. Used by `PostProcessing.tsx` (Task 4) and `PostFxSettingsPanel.tsx` (Task 7).

- [ ] **Step 1: Write the failing test**

```ts
// src/state/postFxStore.test.ts
import { describe, expect, it, beforeEach } from 'vitest';
import { usePostFxStore } from './postFxStore';

describe('usePostFxStore', () => {
  beforeEach(() => {
    usePostFxStore.setState(usePostFxStore.getInitialState());
  });

  it('defaults every effect to enabled and the panel to closed', () => {
    const state = usePostFxStore.getState();
    expect(state.bloomEnabled).toBe(true);
    expect(state.dofEnabled).toBe(true);
    expect(state.vignetteEnabled).toBe(true);
    expect(state.aoEnabled).toBe(true);
    expect(state.colorGradeEnabled).toBe(true);
    expect(state.grainEnabled).toBe(true);
    expect(state.isPanelOpen).toBe(false);
  });

  it('toggles each effect flag independently via its setter', () => {
    usePostFxStore.getState().setBloomEnabled(false);
    expect(usePostFxStore.getState().bloomEnabled).toBe(false);
    expect(usePostFxStore.getState().dofEnabled).toBe(true);

    usePostFxStore.getState().setDofEnabled(false);
    usePostFxStore.getState().setVignetteEnabled(false);
    usePostFxStore.getState().setAoEnabled(false);
    usePostFxStore.getState().setColorGradeEnabled(false);
    usePostFxStore.getState().setGrainEnabled(false);

    const state = usePostFxStore.getState();
    expect(state.bloomEnabled).toBe(false);
    expect(state.dofEnabled).toBe(false);
    expect(state.vignetteEnabled).toBe(false);
    expect(state.aoEnabled).toBe(false);
    expect(state.colorGradeEnabled).toBe(false);
    expect(state.grainEnabled).toBe(false);
  });

  it('toggles the settings panel open and closed', () => {
    expect(usePostFxStore.getState().isPanelOpen).toBe(false);
    usePostFxStore.getState().togglePanel();
    expect(usePostFxStore.getState().isPanelOpen).toBe(true);
    usePostFxStore.getState().togglePanel();
    expect(usePostFxStore.getState().isPanelOpen).toBe(false);
  });

  it('resets every effect flag back to enabled, without touching the panel state', () => {
    usePostFxStore.getState().setBloomEnabled(false);
    usePostFxStore.getState().setGrainEnabled(false);
    usePostFxStore.getState().togglePanel();

    usePostFxStore.getState().resetToDefaults();

    const state = usePostFxStore.getState();
    expect(state.bloomEnabled).toBe(true);
    expect(state.grainEnabled).toBe(true);
    expect(state.isPanelOpen).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/state/postFxStore.test.ts`
Expected: FAIL with "Failed to resolve import './postFxStore'" (file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

```ts
// src/state/postFxStore.ts
import { create } from 'zustand';

export interface PostFxState {
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

/** Every effect defaults to enabled — the "cozy diorama" look is meant to
 * be on by default, with the settings panel offered as an opt-out, not an
 * opt-in. */
const DEFAULT_EFFECT_FLAGS = {
  bloomEnabled: true,
  dofEnabled: true,
  vignetteEnabled: true,
  aoEnabled: true,
  colorGradeEnabled: true,
  grainEnabled: true,
} as const;

export const usePostFxStore = create<PostFxState>((set) => ({
  ...DEFAULT_EFFECT_FLAGS,
  isPanelOpen: false,
  setBloomEnabled: (value) => set({ bloomEnabled: value }),
  setDofEnabled: (value) => set({ dofEnabled: value }),
  setVignetteEnabled: (value) => set({ vignetteEnabled: value }),
  setAoEnabled: (value) => set({ aoEnabled: value }),
  setColorGradeEnabled: (value) => set({ colorGradeEnabled: value }),
  setGrainEnabled: (value) => set({ grainEnabled: value }),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  resetToDefaults: () => set({ ...DEFAULT_EFFECT_FLAGS }),
}));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/state/postFxStore.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/state/postFxStore.ts src/state/postFxStore.test.ts
git commit -m "Add postFxStore for post-processing effect toggles

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 3: `resolveActiveEffects` — pure effect-selection logic

**Files:**
- Create: `src/scene/postFxSelectors.ts`
- Test: `src/scene/postFxSelectors.test.ts`

**Interfaces:**
- Consumes: nothing (pure function, no React/Three/store imports).
- Produces:
  ```ts
  export interface PostFxFlags {
    bloomEnabled: boolean;
    dofEnabled: boolean;
    vignetteEnabled: boolean;
    aoEnabled: boolean;
    colorGradeEnabled: boolean;
    grainEnabled: boolean;
  }

  export interface ActiveEffects {
    bloom: boolean;
    dof: boolean;
    vignette: boolean;
    ao: boolean;
    colorGrade: boolean;
    grain: boolean;
  }

  export function resolveActiveEffects(flags: PostFxFlags, isZoomedIn: boolean): ActiveEffects;
  ```
  Used by `PostProcessing.tsx` (Task 4) to decide which `<EffectComposer>` children to render. This is the one piece of this feature's logic that IS unit-testable in isolation (see the test-environment limitation noted in Global Constraints — the component that consumes this, `PostProcessing.tsx`, cannot itself be mounted in vitest).

- [ ] **Step 1: Write the failing test**

```ts
// src/scene/postFxSelectors.test.ts
import { describe, expect, it } from 'vitest';
import { resolveActiveEffects, type PostFxFlags } from './postFxSelectors';

const ALL_ENABLED: PostFxFlags = {
  bloomEnabled: true,
  dofEnabled: true,
  vignetteEnabled: true,
  aoEnabled: true,
  colorGradeEnabled: true,
  grainEnabled: true,
};

describe('resolveActiveEffects', () => {
  it('activates every effect when all flags are enabled and zoomed out', () => {
    expect(resolveActiveEffects(ALL_ENABLED, false)).toEqual({
      bloom: true,
      dof: true,
      vignette: true,
      ao: true,
      colorGrade: true,
      grain: true,
    });
  });

  it('deactivates depth of field when zoomed in, even though dofEnabled is true', () => {
    const result = resolveActiveEffects(ALL_ENABLED, true);
    expect(result.dof).toBe(false);
  });

  it('leaves every other effect untouched by zoom state', () => {
    const result = resolveActiveEffects(ALL_ENABLED, true);
    expect(result.bloom).toBe(true);
    expect(result.vignette).toBe(true);
    expect(result.ao).toBe(true);
    expect(result.colorGrade).toBe(true);
    expect(result.grain).toBe(true);
  });

  it('keeps depth of field off when zoomed out but dofEnabled is false', () => {
    const flags: PostFxFlags = { ...ALL_ENABLED, dofEnabled: false };
    expect(resolveActiveEffects(flags, false).dof).toBe(false);
  });

  it('passes through each disabled flag as an inactive effect', () => {
    const flags: PostFxFlags = {
      bloomEnabled: false,
      dofEnabled: false,
      vignetteEnabled: false,
      aoEnabled: false,
      colorGradeEnabled: false,
      grainEnabled: false,
    };
    expect(resolveActiveEffects(flags, false)).toEqual({
      bloom: false,
      dof: false,
      vignette: false,
      ao: false,
      colorGrade: false,
      grain: false,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/scene/postFxSelectors.test.ts`
Expected: FAIL with "Failed to resolve import './postFxSelectors'".

- [ ] **Step 3: Write the implementation**

```ts
// src/scene/postFxSelectors.ts

export interface PostFxFlags {
  bloomEnabled: boolean;
  dofEnabled: boolean;
  vignetteEnabled: boolean;
  aoEnabled: boolean;
  colorGradeEnabled: boolean;
  grainEnabled: boolean;
}

export interface ActiveEffects {
  bloom: boolean;
  dof: boolean;
  vignette: boolean;
  ao: boolean;
  colorGrade: boolean;
  grain: boolean;
}

/** Decides which post-processing effects should be mounted right now.
 * Every effect other than Depth of Field is a direct passthrough of its
 * store flag. Depth of Field is additionally gated by `!isZoomedIn`: it
 * must never render while zoomed into the fridge/board, so magnet word
 * tiles stay perfectly legible — this is a hard requirement, not just a
 * default, so it is enforced here regardless of `dofEnabled`. */
export function resolveActiveEffects(flags: PostFxFlags, isZoomedIn: boolean): ActiveEffects {
  return {
    bloom: flags.bloomEnabled,
    dof: flags.dofEnabled && !isZoomedIn,
    vignette: flags.vignetteEnabled,
    ao: flags.aoEnabled,
    colorGrade: flags.colorGradeEnabled,
    grain: flags.grainEnabled,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/scene/postFxSelectors.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/scene/postFxSelectors.ts src/scene/postFxSelectors.test.ts
git commit -m "Add resolveActiveEffects pure selector for post-fx state

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 4: `PostProcessing.tsx` component

**Files:**
- Create: `src/scene/PostProcessing.tsx`

**Interfaces:**
- Consumes: `useSceneStore((state) => state.isZoomedIn)` from `src/state/sceneStore.ts` (existing); `usePostFxStore` from `src/state/postFxStore.ts` (Task 2); `resolveActiveEffects` from `src/scene/postFxSelectors.ts` (Task 3); `EffectComposer`, `Bloom`, `DepthOfField`, `Vignette`, `N8AO`, `HueSaturation`, `BrightnessContrast`, `ChromaticAberration`, `Noise` from `@react-three/postprocessing` (Task 1).
- Produces: `export function PostProcessing(): JSX.Element` — a component with no props, meant to be mounted once as the last child inside `<Canvas>` in `App.tsx` (Task 8). Must be a child of a `<Canvas>` (uses R3F's `useThree` internally via `EffectComposer`), so it cannot be rendered standalone outside a Canvas tree.

No automated test for this file — per the Global Constraints note, `EffectComposer` throws under `@react-three/test-renderer`'s mocked WebGL context, so this component is verified via the manual Playwright visual QA in Task 9 instead. This task's steps are implementation + a manual smoke check via the dev server (not vitest).

- [ ] **Step 1: Write the implementation**

```tsx
// src/scene/PostProcessing.tsx
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  N8AO,
  HueSaturation,
  BrightnessContrast,
  ChromaticAberration,
  Noise,
} from '@react-three/postprocessing';
import { useSceneStore } from '../state/sceneStore';
import { usePostFxStore } from '../state/postFxStore';
import { resolveActiveEffects } from './postFxSelectors';

/** World-space distance from the zoomed-out camera (`CAMERA_ZOOMED_OUT` in
 * App.tsx, [0, 4, 15]) to its look-at target (`DEFAULT_ZOOMED_OUT_TARGET`,
 * [0, 3, 0]) — approximately 15 units. Depth of Field's in-focus band is
 * centered here so the room/fridge stay sharp while the near and far
 * edges soften, producing the tilt-shift "toy diorama" look. */
const DOF_WORLD_FOCUS_DISTANCE = 15;
/** Width (in world units) of the in-focus band around the focus distance
 * above. Tuned during visual QA (Task 9) — wide enough that the whole
 * fridge/board reads sharp, narrow enough that the blur is still visible
 * at the floor/ceiling edges of the zoomed-out view. */
const DOF_WORLD_FOCUS_RANGE = 8;

/** Renders the app-wide post-processing stack: bloom, depth of field
 * (zoomed-out only), vignette, ambient occlusion, color grading, and
 * chromatic aberration + grain. Mounted once inside <Canvas>, after all
 * scene content, so it composites the fully-rendered frame. Every effect
 * is individually toggleable via `postFxStore` (see the settings panel in
 * PostFxSettingsPanel.tsx); intensities are constant across all lighting
 * presets by design. */
export function PostProcessing() {
  const isZoomedIn = useSceneStore((state) => state.isZoomedIn);
  const bloomEnabled = usePostFxStore((state) => state.bloomEnabled);
  const dofEnabled = usePostFxStore((state) => state.dofEnabled);
  const vignetteEnabled = usePostFxStore((state) => state.vignetteEnabled);
  const aoEnabled = usePostFxStore((state) => state.aoEnabled);
  const colorGradeEnabled = usePostFxStore((state) => state.colorGradeEnabled);
  const grainEnabled = usePostFxStore((state) => state.grainEnabled);

  const active = resolveActiveEffects(
    { bloomEnabled, dofEnabled, vignetteEnabled, aoEnabled, colorGradeEnabled, grainEnabled },
    isZoomedIn,
  );

  return (
    <EffectComposer enableNormalPass={false}>
      {active.ao && <N8AO aoRadius={2} distanceFalloff={1} intensity={1} quality="medium" />}
      {active.bloom && (
        <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.3} intensity={0.8} mipmapBlur />
      )}
      {active.dof && (
        <DepthOfField
          worldFocusDistance={DOF_WORLD_FOCUS_DISTANCE}
          worldFocusRange={DOF_WORLD_FOCUS_RANGE}
          bokehScale={3}
        />
      )}
      {active.colorGrade && <HueSaturation saturation={0.15} />}
      {active.colorGrade && <BrightnessContrast brightness={0} contrast={0.08} />}
      {active.grain && <ChromaticAberration offset={[0.0006, 0.0006]} />}
      {active.grain && <Noise opacity={0.035} premultiply />}
      {active.vignette && <Vignette darkness={0.5} offset={0.3} />}
    </EffectComposer>
  );
}
```

- [ ] **Step 2: Run the existing full test suite to confirm nothing else broke**

Run: `npm test`
Expected: PASS, same count as before this task (this file has no test of its own, and isn't wired into `App.tsx` yet, so it can't affect anything else).

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: no new type errors.

- [ ] **Step 4: Commit**

```bash
git add src/scene/PostProcessing.tsx
git commit -m "Add PostProcessing component wrapping EffectComposer

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 5: CSS for the settings button and panel

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Produces: CSS classes `.postfx-settings-button` and `.postfx-settings-panel` (plus a `label` rule scoped under `.postfx-settings-panel`), consumed by `PostFxSettingsButton.tsx` (Task 6) and `PostFxSettingsPanel.tsx` (Task 7).

- [ ] **Step 1: Add the CSS rules**

Append to the end of `src/styles.css`:

```css
.postfx-settings-button {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    width: 3rem;
    height: 3rem;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    color: white;
    cursor: pointer;
}

.postfx-settings-panel {
    position: fixed;
    bottom: 5rem;
    right: 1.5rem;
    padding: 1rem;
    color: white;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 12rem;
}

.postfx-settings-panel label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.95rem;
}

.postfx-settings-panel button {
    margin-top: 0.25rem;
}
```

- [ ] **Step 2: Verify the app still builds**

Run: `npm run build`
Expected: succeeds (pure CSS addition, no logic change).

- [ ] **Step 3: Commit**

```bash
git add src/styles.css
git commit -m "Add CSS for post-fx settings button and panel

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 6: `PostFxSettingsButton.tsx`

**Files:**
- Create: `src/ui/PostFxSettingsButton.tsx`
- Test: `src/ui/PostFxSettingsButton.test.tsx`

**Interfaces:**
- Consumes: `usePostFxStore((state) => state.isPanelOpen)` and `usePostFxStore((state) => state.togglePanel)` from `src/state/postFxStore.ts` (Task 2).
- Produces: `export function PostFxSettingsButton(): JSX.Element` — always rendered (unlike `StepBackButton`, this is not conditional on zoom state), a `glass-panel interactive-ui postfx-settings-button` button with `aria-pressed={isPanelOpen}` and an accessible name of "Toy Settings", calling `togglePanel()` on click. Mounted in `App.tsx` (Task 8) as a sibling to `HUD`/`StepBackButton`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/ui/PostFxSettingsButton.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostFxSettingsButton } from './PostFxSettingsButton';
import { usePostFxStore } from '../state/postFxStore';

describe('PostFxSettingsButton', () => {
  beforeEach(() => {
    usePostFxStore.setState(usePostFxStore.getInitialState());
  });

  it('renders with aria-pressed false when the panel is closed', () => {
    render(<PostFxSettingsButton />);
    const button = screen.getByRole('button', { name: /toy settings/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles the panel open when clicked', async () => {
    render(<PostFxSettingsButton />);
    const button = screen.getByRole('button', { name: /toy settings/i });
    await userEvent.click(button);
    expect(usePostFxStore.getState().isPanelOpen).toBe(true);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles the panel closed again on a second click', async () => {
    render(<PostFxSettingsButton />);
    const button = screen.getByRole('button', { name: /toy settings/i });
    await userEvent.click(button);
    await userEvent.click(button);
    expect(usePostFxStore.getState().isPanelOpen).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/PostFxSettingsButton.test.tsx`
Expected: FAIL with "Failed to resolve import './PostFxSettingsButton'".

- [ ] **Step 3: Write the implementation**

```tsx
// src/ui/PostFxSettingsButton.tsx
import { usePostFxStore } from '../state/postFxStore';

/** Small always-visible fixed button, bottom-right corner, that opens the
 * post-fx settings panel. Uses a toy/gear emoji to match the playful tone
 * the user asked for ("something fun as an asset"). */
export function PostFxSettingsButton() {
  const isPanelOpen = usePostFxStore((state) => state.isPanelOpen);
  const togglePanel = usePostFxStore((state) => state.togglePanel);

  return (
    <button
      type="button"
      className="glass-panel interactive-ui postfx-settings-button"
      aria-pressed={isPanelOpen}
      onClick={togglePanel}
    >
      <span aria-hidden="true">🧸</span>
      <span className="visually-hidden">Toy Settings</span>
    </button>
  );
}
```

Note: this uses a `.visually-hidden` utility class for the accessible name so the visible button stays icon-only. Add it in the same edit to `src/styles.css` this task modifies:

- [ ] **Step 4: Add the visually-hidden utility class**

Append to `src/styles.css` (after the rules added in Task 5):

```css
.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/ui/PostFxSettingsButton.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/ui/PostFxSettingsButton.tsx src/ui/PostFxSettingsButton.test.tsx src/styles.css
git commit -m "Add PostFxSettingsButton

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 7: `PostFxSettingsPanel.tsx`

**Files:**
- Create: `src/ui/PostFxSettingsPanel.tsx`
- Test: `src/ui/PostFxSettingsPanel.test.tsx`

**Interfaces:**
- Consumes: all six `*Enabled`/`set*Enabled` pairs, `isPanelOpen`, and `resetToDefaults` from `usePostFxStore` (Task 2).
- Produces: `export function PostFxSettingsPanel(): JSX.Element | null` — renders `null` when `isPanelOpen` is `false`; otherwise renders a `glass-panel interactive-ui postfx-settings-panel` with one labeled checkbox per effect (Bloom, Depth of Field, Vignette, Ambient Occlusion, Color Grade, Grain) and a "Reset to defaults" button. Mounted in `App.tsx` (Task 8) as a sibling to `PostFxSettingsButton`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/ui/PostFxSettingsPanel.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostFxSettingsPanel } from './PostFxSettingsPanel';
import { usePostFxStore } from '../state/postFxStore';

describe('PostFxSettingsPanel', () => {
  beforeEach(() => {
    usePostFxStore.setState(usePostFxStore.getInitialState());
  });

  it('renders nothing when the panel is closed', () => {
    render(<PostFxSettingsPanel />);
    expect(screen.queryByRole('checkbox', { name: /bloom/i })).not.toBeInTheDocument();
  });

  it('renders a checked checkbox per effect when open, since all default on', () => {
    usePostFxStore.getState().togglePanel();
    render(<PostFxSettingsPanel />);
    for (const label of [/bloom/i, /depth of field/i, /vignette/i, /ambient occlusion/i, /color grade/i, /grain/i]) {
      expect(screen.getByRole('checkbox', { name: label })).toBeChecked();
    }
  });

  it('unchecking a checkbox disables the corresponding store flag', async () => {
    usePostFxStore.getState().togglePanel();
    render(<PostFxSettingsPanel />);
    await userEvent.click(screen.getByRole('checkbox', { name: /bloom/i }));
    expect(usePostFxStore.getState().bloomEnabled).toBe(false);
  });

  it('resets every flag to enabled when "Reset to defaults" is clicked', async () => {
    usePostFxStore.getState().setDofEnabled(false);
    usePostFxStore.getState().setGrainEnabled(false);
    usePostFxStore.getState().togglePanel();
    render(<PostFxSettingsPanel />);

    await userEvent.click(screen.getByRole('button', { name: /reset to defaults/i }));

    const state = usePostFxStore.getState();
    expect(state.dofEnabled).toBe(true);
    expect(state.grainEnabled).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/PostFxSettingsPanel.test.tsx`
Expected: FAIL with "Failed to resolve import './PostFxSettingsPanel'".

- [ ] **Step 3: Write the implementation**

```tsx
// src/ui/PostFxSettingsPanel.tsx
import { usePostFxStore } from '../state/postFxStore';

/** Toggleable settings panel for the post-processing effect stack. Opened
 * via PostFxSettingsButton. Every checkbox maps 1:1 to a postFxStore flag;
 * "Color Grade" and "Grain" each control two underlying effects at once
 * (HueSaturation+BrightnessContrast, and ChromaticAberration+Noise,
 * respectively — see PostProcessing.tsx), matching the approved design's
 * one-checkbox-per-row layout. */
export function PostFxSettingsPanel() {
  const isPanelOpen = usePostFxStore((state) => state.isPanelOpen);
  const bloomEnabled = usePostFxStore((state) => state.bloomEnabled);
  const setBloomEnabled = usePostFxStore((state) => state.setBloomEnabled);
  const dofEnabled = usePostFxStore((state) => state.dofEnabled);
  const setDofEnabled = usePostFxStore((state) => state.setDofEnabled);
  const vignetteEnabled = usePostFxStore((state) => state.vignetteEnabled);
  const setVignetteEnabled = usePostFxStore((state) => state.setVignetteEnabled);
  const aoEnabled = usePostFxStore((state) => state.aoEnabled);
  const setAoEnabled = usePostFxStore((state) => state.setAoEnabled);
  const colorGradeEnabled = usePostFxStore((state) => state.colorGradeEnabled);
  const setColorGradeEnabled = usePostFxStore((state) => state.setColorGradeEnabled);
  const grainEnabled = usePostFxStore((state) => state.grainEnabled);
  const setGrainEnabled = usePostFxStore((state) => state.setGrainEnabled);
  const resetToDefaults = usePostFxStore((state) => state.resetToDefaults);

  if (!isPanelOpen) return null;

  return (
    <div className="glass-panel interactive-ui postfx-settings-panel">
      <label>
        <input type="checkbox" checked={bloomEnabled} onChange={(e) => setBloomEnabled(e.target.checked)} />
        Bloom
      </label>
      <label>
        <input type="checkbox" checked={dofEnabled} onChange={(e) => setDofEnabled(e.target.checked)} />
        Depth of Field
      </label>
      <label>
        <input type="checkbox" checked={vignetteEnabled} onChange={(e) => setVignetteEnabled(e.target.checked)} />
        Vignette
      </label>
      <label>
        <input type="checkbox" checked={aoEnabled} onChange={(e) => setAoEnabled(e.target.checked)} />
        Ambient Occlusion
      </label>
      <label>
        <input
          type="checkbox"
          checked={colorGradeEnabled}
          onChange={(e) => setColorGradeEnabled(e.target.checked)}
        />
        Color Grade
      </label>
      <label>
        <input type="checkbox" checked={grainEnabled} onChange={(e) => setGrainEnabled(e.target.checked)} />
        Grain
      </label>
      <button type="button" onClick={resetToDefaults}>
        Reset to defaults
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ui/PostFxSettingsPanel.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/PostFxSettingsPanel.tsx src/ui/PostFxSettingsPanel.test.tsx
git commit -m "Add PostFxSettingsPanel

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 8: Wire everything into `App.tsx`

**Files:**
- Modify: `src/App.tsx`
- Modify (if it exists): `src/App.test.tsx` (check for this file first; if it exists and asserts on the full rendered tree, it may need updating for the two new always-rendered elements)

**Interfaces:**
- Consumes: `PostProcessing` from `src/scene/PostProcessing.tsx` (Task 4); `PostFxSettingsButton` from `src/ui/PostFxSettingsButton.tsx` (Task 6); `PostFxSettingsPanel` from `src/ui/PostFxSettingsPanel.tsx` (Task 7).
- Produces: updated `App.tsx` render tree — `<PostProcessing />` becomes the last child inside `<Canvas>` (after `<OrbitControls />`), and `<PostFxSettingsButton />`/`<PostFxSettingsPanel />` are added as DOM overlay siblings after `<StepBackButton />`.

- [ ] **Step 1: Check for an existing App-level test**

Run: `ls src/App.test.tsx 2>/dev/null || echo "no App.test.tsx"`

- [ ] **Step 2: Add the imports**

In `src/App.tsx`, add these two import lines near the other local imports (after the `StepBackButton` import):

```tsx
import { PostProcessing } from './scene/PostProcessing';
import { PostFxSettingsButton } from './ui/PostFxSettingsButton';
import { PostFxSettingsPanel } from './ui/PostFxSettingsPanel';
```

- [ ] **Step 3: Mount `<PostProcessing />` inside `<Canvas>`**

Find this block in `src/App.tsx`:

```tsx
          <OrbitControls
            target={cameraTarget}
            // Must stay disabled while a magnet is being dragged: R3F's
            // per-mesh event.stopPropagation() only stops other R3F pointer
            // handlers from firing, it doesn't stop OrbitControls' own
            // native listeners on the canvas element, so without this the
            // camera would orbit at the same time the magnet is dragged
            // (mirrors POC_2's explicit `controls.enabled = false` while
            // dragging a magnet).
            enabled={isZoomedIn && !isTweening && !draggedMagnetId}
            minDistance={5}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
        </Canvas>
```

Replace it with:

```tsx
          <OrbitControls
            target={cameraTarget}
            // Must stay disabled while a magnet is being dragged: R3F's
            // per-mesh event.stopPropagation() only stops other R3F pointer
            // handlers from firing, it doesn't stop OrbitControls' own
            // native listeners on the canvas element, so without this the
            // camera would orbit at the same time the magnet is dragged
            // (mirrors POC_2's explicit `controls.enabled = false` while
            // dragging a magnet).
            enabled={isZoomedIn && !isTweening && !draggedMagnetId}
            minDistance={5}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
          <PostProcessing />
        </Canvas>
```

- [ ] **Step 4: Mount the settings button and panel as DOM overlays**

Find this block in `src/App.tsx`:

```tsx
      <StepBackButton />
    </div>
  );
}
```

Replace it with:

```tsx
      <StepBackButton />
      <PostFxSettingsButton />
      <PostFxSettingsPanel />
    </div>
  );
}
```

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: PASS, same or higher count than before (no existing test should reference `<PostProcessing>`, `<PostFxSettingsButton>`, or `<PostFxSettingsPanel>` yet, and none of the changes alter existing behavior — `<PostFxSettingsButton>` always renders but has its own isolated test coverage from Task 6, and `<PostFxSettingsPanel>` renders `null` by default so it's inert unless the button is clicked). If `src/App.test.tsx` exists and fails because it does a strict child-count assertion on the DOM root, update that specific assertion to account for the two new always-present elements (the button, plus the panel which renders `null`) — do not weaken other assertions.

- [ ] **Step 6: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "Mount PostProcessing pipeline and post-fx settings UI in App

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 9: Manual visual verification and tuning pass

**Files:**
- Potentially modify: `src/scene/PostProcessing.tsx` (constant tuning only — no structural changes)

**Interfaces:**
- Consumes: the running dev server (`npm run dev` or Tauri's dev command — check `package.json`'s `"scripts"` for the exact command used in this project) viewed in a real browser, since `EffectComposer` cannot be exercised under vitest (see Global Constraints).
- Produces: no new files; this task is a verification + constant-tuning pass over the already-committed `PostProcessing.tsx`.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` in the background and open it in a browser (Vite's default dev server, per `package.json`'s `"dev": "vite"` script).

- [ ] **Step 2: Verify the zoomed-out kitchen view**

Confirm, for each of the four lighting presets (morning/day/evening/night, via the HUD buttons):
- Bloom is visible on the pendant lamp/string lights/night stars (a soft glow, not blown-out white).
- Depth of field is visible: the far background (walls/window) and near foreground read softer than the fridge/room center.
- Vignette darkens the corners subtly, not distractingly.
- Ambient occlusion adds soft contact shadows in corners/crevices (shelf, rug edges) without darkening the whole scene.
- The overall color reads slightly warmer/more saturated than before this feature (color grading).
- Grain/chromatic aberration are present but subtle — noticeable only on close inspection, not distracting.

- [ ] **Step 3: Verify the zoomed-in fridge view**

Click into the fridge (zoom in). Confirm:
- Depth of field is completely gone — magnet word tiles are perfectly crisp edge to edge, no blur at any distance.
- Bloom/vignette/AO/color-grade/grain are still present (only DoF is zoom-gated).

- [ ] **Step 4: Verify the settings panel**

Click the new bottom-right settings button. Confirm the panel opens with all six checkboxes checked. Uncheck each one individually and confirm the corresponding effect visibly disappears from the live scene (e.g., unchecking Bloom removes the pendant-lamp glow; unchecking Vignette removes the corner darkening). Click "Reset to defaults" and confirm all six re-enable and the panel stays open (per the store's `resetToDefaults` not touching `isPanelOpen`).

- [ ] **Step 5: Verify the tavern and dungeon scenes**

Switch scenes via the HUD. Confirm the same six effects are visible in both the tavern and dungeon rooms (this is a global pipeline, not kitchen-specific), both zoomed out and zoomed in (DoF gating applies identically in all three scenes since it only depends on `isZoomedIn`, not `activeSceneId`).

- [ ] **Step 6: Tune constants if anything looks wrong**

If any effect reads too strong/weak/absent based on Steps 2-5, adjust the relevant constant(s) directly in `src/scene/PostProcessing.tsx` (e.g. `luminanceThreshold`, `DOF_WORLD_FOCUS_RANGE`, `darkness`, `aoRadius`, `saturation`/`contrast`, `offset`/`opacity`) and re-check in the browser. Do not change the conditional-inclusion logic (`resolveActiveEffects` usage) — only numeric tuning.

- [ ] **Step 7: Run the full automated test suite one more time**

Run: `npm test`
Expected: PASS (confirms any constant tuning in Step 6 didn't touch logic the test suite covers — it shouldn't, since `resolveActiveEffects` and the stores are untouched).

- [ ] **Step 8: Commit any tuning changes** (skip if Step 6 required no changes)

```bash
git add src/scene/PostProcessing.tsx
git commit -m "Tune post-processing effect constants after visual QA

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

- [ ] **Step 9: Push**

```bash
git push origin main
```
