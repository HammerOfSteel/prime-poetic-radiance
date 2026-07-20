# Phase 2a: Shading & Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the kitchen scene's materials to toon (cel) shading with a
shared gradient map, recolor every surface to the "Warm Oak & Butter"
palette, and retune all 4 lighting presets to feel warmer, without changing
any geometry, interaction logic, or the poetry engine.

**Architecture:** A new shared `createToonGradientMap()` utility
(`src/scene/toonGradient.ts`) builds a cached 4-band gradient texture used by
every `MeshToonMaterial` in the scene. `Kitchen.tsx`, `Fridge.tsx`, and
`Magnet.tsx` each call it directly (no prop drilling — it's a module-level
singleton) and swap their `meshStandardMaterial`/hex colors for
`meshToonMaterial` + the new palette. `Lighting.tsx` swaps its
`RectAreaLight` (incompatible with toon materials) for a warm `PointLight`,
and `lightingPresets.ts` gets warmer hex values for `day`, `evening`, and
`night` (morning is already warm).

**Tech Stack:** TypeScript, React Three Fiber, Three.js `MeshToonMaterial`/`DataTexture`, Vitest.

## Global Constraints

- No geometry/shape changes — Phase 2b's scope, per
  `docs/superpowers/specs/2026-07-20-phase-2a-shading-palette-design.md`.
- No camera-transition/wipe effects — also Phase 2b.
- Every hex color used in `Kitchen.tsx`, `Fridge.tsx`, `Magnet.tsx`, and
  `wordTexture.ts` must come from the palette table in the design spec —
  no new/ad-hoc colors.
- Existing component smoke tests (`Kitchen.test.tsx`, `Fridge.test.tsx`)
  must keep passing unchanged (they assert mesh counts, not colors/materials).
- Run `npm run lint && npm run typecheck && npm run test && npm run build`
  before the final commit (all must pass with zero errors).

---

### Task 1: Shared toon gradient map utility

**Files:**
- Create: `src/scene/toonGradient.ts`
- Create: `src/scene/toonGradient.test.ts`

**Interfaces:**
- Produces: `createToonGradientMap(): THREE.DataTexture` — a cached
  singleton, 4 texels wide × 1 tall, `RedFormat`, ascending brightness
  `[0, 85, 170, 255]`, `NearestFilter` for both `magFilter`/`minFilter`.
  Consumed by Task 2 (`Kitchen.tsx`, `Fridge.tsx`, `Magnet.tsx`).

- [ ] **Step 1: Write the failing test**

Create `src/scene/toonGradient.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createToonGradientMap } from './toonGradient';

describe('createToonGradientMap', () => {
  it('returns a DataTexture with 4 texels of ascending brightness', () => {
    const texture = createToonGradientMap();
    expect(texture).toBeInstanceOf(THREE.DataTexture);
    expect(texture.image.width).toBe(4);
    expect(texture.image.height).toBe(1);
    expect(Array.from(texture.image.data as Uint8Array)).toEqual([0, 85, 170, 255]);
  });

  it('uses NearestFilter for both mag and min filters to keep bands crisp', () => {
    const texture = createToonGradientMap();
    expect(texture.magFilter).toBe(THREE.NearestFilter);
    expect(texture.minFilter).toBe(THREE.NearestFilter);
  });

  it('returns the same cached texture instance on repeated calls', () => {
    const first = createToonGradientMap();
    const second = createToonGradientMap();
    expect(second).toBe(first);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/scene/toonGradient.test.ts`
Expected: FAIL — `src/scene/toonGradient.ts` does not exist yet
(`Cannot find module './toonGradient'`).

- [ ] **Step 3: Write `src/scene/toonGradient.ts`**

```ts
import * as THREE from 'three';

const GRADIENT_STEPS = 4;

let cachedGradientMap: THREE.DataTexture | null = null;

/**
 * Builds (and caches) the shared toon-shading gradient map used by every
 * MeshToonMaterial in the scene. Three.js's toon material renders as a flat
 * 2-tone split without an explicit gradientMap — this provides 4 ascending
 * brightness bands. NearestFilter keeps the bands crisp (no smoothing
 * between them), which is what gives toon shading its stepped "cel" look.
 */
export function createToonGradientMap(): THREE.DataTexture {
  if (cachedGradientMap) return cachedGradientMap;

  const data = new Uint8Array(GRADIENT_STEPS);
  for (let i = 0; i < GRADIENT_STEPS; i += 1) {
    data[i] = Math.round((i / (GRADIENT_STEPS - 1)) * 255);
  }

  const texture = new THREE.DataTexture(data, GRADIENT_STEPS, 1, THREE.RedFormat);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.needsUpdate = true;

  cachedGradientMap = texture;
  return texture;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/scene/toonGradient.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/scene/toonGradient.ts src/scene/toonGradient.test.ts
git commit -m "feat: add shared toon shading gradient map utility

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 2: Convert scene materials to toon shading with the warm palette

**Files:**
- Modify: `src/scene/Kitchen.tsx` (full rewrite)
- Modify: `src/scene/Fridge.tsx:1,29-36` (imports + body/door materials)
- Modify: `src/scene/Magnet.tsx:1,72-73` (imports + magnet material)
- Modify: `src/scene/wordTexture.ts:15-24` (tile canvas colors)

**Interfaces:**
- Consumes: `createToonGradientMap()` from `./toonGradient` (Task 1).
- Produces: no new exports — same component signatures as before
  (`Kitchen()`, `Fridge()`, `Magnet(props: MagnetProps)`,
  `createWordCanvas(word: string)`/`createWordTexture(word: string)`
  unchanged).

- [ ] **Step 1: Rewrite `src/scene/Kitchen.tsx`**

```tsx
import { useMemo } from 'react';
import { createToonGradientMap } from './toonGradient';

export function Kitchen() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshToonMaterial color="#8a5a3b" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[0, 7.5, -6]} receiveShadow>
        <boxGeometry args={[30, 15, 1]} />
        <meshToonMaterial color="#f2e3c9" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-10, 7.5, 0]} receiveShadow>
        <boxGeometry args={[1, 15, 30]} />
        <meshToonMaterial color="#f2e3c9" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-5, 6, -5.4]}>
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial color="#fff3d6" />
      </mesh>

      <mesh position={[-4, 1.5, -4]} castShadow receiveShadow>
        <boxGeometry args={[12, 3, 3]} />
        <meshToonMaterial color="#c96a3e" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-4, 3.1, -4]} castShadow receiveShadow>
        <boxGeometry args={[12.2, 0.2, 3.2]} />
        <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-2, 3.4, -3.5]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.4, 16]} />
        <meshToonMaterial color="#e8543f" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-7, 3.5, -4]} castShadow>
        <cylinderGeometry args={[0.4, 0.3, 0.6, 16]} />
        <meshToonMaterial color="#cd6133" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-7, 4.2, -4]} castShadow>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshToonMaterial color="#7a9e5a" gradientMap={gradientMap} />
      </mesh>
    </>
  );
}
```

- [ ] **Step 2: Update `src/scene/Fridge.tsx`'s imports and body/door materials**

Add the import alongside the existing ones at the top of
`src/scene/Fridge.tsx`:

```tsx
import { createToonGradientMap } from './toonGradient';
```

Inside `export function Fridge() {`, add the gradient map right after the
existing `magnetData` declaration (before `const meshRefs = useRef(...)`):

```tsx
  const gradientMap = useMemo(() => createToonGradientMap(), []);
```

Replace the body and door mesh materials:

```tsx
      <mesh position={[0, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 8, 3]} />
        <meshToonMaterial color="#f6d98a" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[0, 4, 1.55]} receiveShadow>
        <boxGeometry args={[3.6, 7.8, 0.2]} />
        <meshToonMaterial color="#f6d98a" gradientMap={gradientMap} />
      </mesh>
```

(replacing the two `<meshStandardMaterial color="#f5f6fa" roughness={0.4}
metalness={0.1} />` blocks that were there before).

- [ ] **Step 3: Update `src/scene/Magnet.tsx`'s import and material**

Add the import alongside the existing ones at the top of
`src/scene/Magnet.tsx`:

```tsx
import { createToonGradientMap } from './toonGradient';
```

Inside `export function Magnet(...) {`, add the gradient map next to the
existing `texture` memo:

```tsx
  const gradientMap = useMemo(() => createToonGradientMap(), []);
```

Replace the mesh's material:

```tsx
      <meshToonMaterial map={texture} gradientMap={gradientMap} />
```

(replacing `<meshStandardMaterial map={texture} roughness={0.6}
metalness={0.1} />`).

- [ ] **Step 4: Update `src/scene/wordTexture.ts`'s tile colors**

In `createWordCanvas`, replace the three color assignments:

```ts
  ctx.fillStyle = '#fdf6ec';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#e0c9a0';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  ctx.fillStyle = '#3d2b1f';
  ctx.font = 'bold 36px "Inter", monospace';
```

(replacing `#f8f9fa`, `#d1d8e0`, and `#2d3436` respectively — the
`ctx.font`/`ctx.textAlign`/`ctx.textBaseline`/`ctx.fillText` lines are
unchanged).

- [ ] **Step 5: Run the existing scene smoke tests to confirm nothing broke**

Run: `npx vitest run src/scene/Kitchen.test.tsx src/scene/Fridge.test.tsx src/scene/Lighting.test.tsx src/scene/toonGradient.test.ts`
Expected: all PASS (these tests assert mesh/light counts, not colors or
material types, so they should be unaffected).

- [ ] **Step 6: Commit**

```bash
git add src/scene/Kitchen.tsx src/scene/Fridge.tsx src/scene/Magnet.tsx src/scene/wordTexture.ts
git commit -m "feat: convert scene materials to toon shading with warm palette

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 3: Swap window light and retune lighting presets warmer

**Files:**
- Modify: `src/scene/Lighting.tsx:78` (RectAreaLight → PointLight)
- Modify: `src/engine/lightingPresets.ts` (full rewrite of `LIGHTING_PRESETS`)
- Modify: `src/engine/lightingPresets.test.ts` (update the night exact-match
  test, add day/evening/night value assertions)

**Interfaces:**
- Consumes: nothing new.
- Produces: `LIGHTING_PRESETS` keeps its existing shape
  (`Record<LightingPresetName, LightingPreset>`) — only the hex string
  values inside change. `Lighting.tsx`'s exported `applyLightingPreset` and
  `Lighting` component signatures are unchanged.

- [ ] **Step 1: Replace the RectAreaLight with a PointLight in `src/scene/Lighting.tsx`**

Remove this import (no longer needed):

```tsx
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
```

Remove this line (the module-level init call, only needed for RectAreaLight):

```tsx
// RectAreaLight requires this to be initialized once for correct rendering (three.js requirement).
RectAreaLightUniformsLib.init();
```

Remove the `windowLightRef` declaration and its associated effect:

```tsx
  const windowLightRef = useRef<THREE.RectAreaLight>(null);
```

```tsx
  useEffect(() => {
    windowLightRef.current?.lookAt(-5, 0, 0);
  }, []);
```

Replace the JSX's final light element:

```tsx
      <pointLight color="#fff3d6" intensity={3} distance={12} position={[-5, 6, -5.3]} />
```

(replacing `<rectAreaLight ref={windowLightRef} position={[-5, 6, -5.3]}
color={0xffffff} intensity={2} width={6} height={4} />`).

- [ ] **Step 2: Run the Lighting test to confirm it still passes**

Run: `npx vitest run src/scene/Lighting.test.tsx`
Expected: PASS — `applyLightingPreset` only touches `ambient`/`directional`/
`fill`/`fog` refs, none of which changed.

- [ ] **Step 3: Commit the light swap**

```bash
git add src/scene/Lighting.tsx
git commit -m "feat: replace window RectAreaLight with a toon-compatible PointLight

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

- [ ] **Step 4: Write the failing test for the retuned presets**

Replace the `'matches the ported values for the night preset'` test in
`src/engine/lightingPresets.test.ts` with:

```ts
  it('retunes day, evening, and night to warmer colors for the cozy toy aesthetic', () => {
    expect(LIGHTING_PRESETS.day.ambientColor).toBe('#fff8ec');
    expect(LIGHTING_PRESETS.day.directionalColor).toBe('#fff4de');
    expect(LIGHTING_PRESETS.day.fillColor).toBe('#fff2d9');

    expect(LIGHTING_PRESETS.evening.ambientColor).toBe('#a8677a');

    expect(LIGHTING_PRESETS.night.ambientColor).toBe('#2c3e6b');
    expect(LIGHTING_PRESETS.night.directionalColor).toBe('#b8c4e0');
    expect(LIGHTING_PRESETS.night.fillColor).toBe('#e8a054');
  });
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npx vitest run src/engine/lightingPresets.test.ts`
Expected: FAIL — current preset values don't match the new warmer hex codes yet.

- [ ] **Step 6: Rewrite `src/engine/lightingPresets.ts` with the warmer values**

```ts
export const LIGHTING_PRESET_NAMES = ['morning', 'day', 'evening', 'night'] as const;
export type LightingPresetName = (typeof LIGHTING_PRESET_NAMES)[number];

export interface LightingPreset {
  ambientColor: string;
  directionalColor: string;
  fillColor: string;
  fogColor: string;
  directionalIntensity: number;
  fillIntensity: number;
  directionalPosition: { x: number; y: number; z: number };
}

export const LIGHTING_PRESETS: Record<LightingPresetName, LightingPreset> = {
  morning: {
    ambientColor: '#ffeaa7',
    directionalColor: '#ffdac1',
    fillColor: '#ffb8b8',
    fogColor: '#3a302a',
    directionalIntensity: 1.2,
    fillIntensity: 0.6,
    directionalPosition: { x: -8, y: 4, z: 8 },
  },
  day: {
    ambientColor: '#fff8ec',
    directionalColor: '#fff4de',
    fillColor: '#fff2d9',
    fogColor: '#2a2a2a',
    directionalIntensity: 1.5,
    fillIntensity: 0.8,
    directionalPosition: { x: 2, y: 12, z: 4 },
  },
  evening: {
    ambientColor: '#a8677a',
    directionalColor: '#fdcb6e',
    fillColor: '#d63031',
    fogColor: '#1a1515',
    directionalIntensity: 0.8,
    fillIntensity: 0.5,
    directionalPosition: { x: 8, y: 3, z: 6 },
  },
  night: {
    ambientColor: '#2c3e6b',
    directionalColor: '#b8c4e0',
    fillColor: '#e8a054',
    fogColor: '#050510',
    directionalIntensity: 0.2,
    fillIntensity: 0.3,
    directionalPosition: { x: 0, y: 10, z: 0 },
  },
};
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run src/engine/lightingPresets.test.ts`
Expected: PASS (all 3 tests, including the existing "has an entry for every
preset name" and "defines valid hex colors" tests, which still hold since
only color *values* changed, not the shape or format).

- [ ] **Step 8: Commit**

```bash
git add src/engine/lightingPresets.ts src/engine/lightingPresets.test.ts
git commit -m "feat: retune lighting presets warmer for cozy toy aesthetic

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 4: Full verification, spec status update, and PR

**Files:**
- Modify: `docs/superpowers/specs/2026-07-20-phase-2a-shading-palette-design.md:3`

**Interfaces:**
- Consumes: nothing new — this task only runs verification and finalizes docs.

- [ ] **Step 1: Update the Phase 2a spec status**

Edit `docs/superpowers/specs/2026-07-20-phase-2a-shading-palette-design.md`,
changing the header line:

```markdown
**Status:** Approved
```

to:

```markdown
**Status:** Implemented (see docs/superpowers/plans/2026-07-20-phase-2a-shading-palette.md)
```

- [ ] **Step 2: Run the full verification suite**

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Expected: all four succeed with zero errors.

- [ ] **Step 3: Commit the spec status update**

```bash
git add docs/superpowers/specs/2026-07-20-phase-2a-shading-palette-design.md
git commit -m "docs: mark Phase 2a spec implemented

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

- [ ] **Step 4: Push a branch and open the PR**

```bash
git checkout -b phase-2a-shading-palette
git push -u origin phase-2a-shading-palette
gh pr create --title "Phase 2a: Shading & Palette" --body "Converts the kitchen scene to toon (cel) shading with a shared gradient map, recolors every surface to the Warm Oak & Butter palette, swaps the window RectAreaLight for a toon-compatible PointLight, and retunes all 4 lighting presets warmer. See docs/superpowers/specs/2026-07-20-phase-2a-shading-palette-design.md and docs/superpowers/plans/2026-07-20-phase-2a-shading-palette.md.

- [ ] npm run lint / typecheck / test / build all pass
- [ ] Kitchen/fridge scene visually reads as warm and toon-shaded across all 4 lighting presets" --base main --head phase-2a-shading-palette
```

- [ ] **Step 5: After CI passes, merge**

```bash
gh pr merge --squash --delete-branch
```
