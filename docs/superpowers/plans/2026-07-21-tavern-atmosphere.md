# Tavern Atmosphere Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the tavern scene up to the same cozy, lived-in standard as the kitchen (Phase 6a) — procedural wood/plaster textures, new furniture/decor props, an animated flickering hearth fire, and ambient ember/dust particles — per `docs/superpowers/specs/2026-07-21-tavern-atmosphere-design.md`.

**Architecture:** One new file (`src/scene/TavernAtmosphere.tsx`, mirroring `KitchenAtmosphere.tsx`'s structure) plus incremental additions to the existing `TavernRoom.tsx` (textures, props, hearth fire). Everything is built from three.js primitives and the procedural canvas textures already implemented in `src/scene/proceduralTextures.ts` (`createWoodGrainTexture`, `createGrainTexture`, `createSoftCircleTexture`) — no new texture-generator code, no downloaded images, no 3D model imports. Particle effects reuse `@react-three/drei`'s `Sparkles` (already installed). Animation reuses the gsap-timeline-on-sprite pattern already established in `KitchenAtmosphere.tsx`.

**Tech Stack:** React Three Fiber, `@react-three/drei` (`RoundedBox`, `Sparkles`), `three.js` (`CanvasTexture`, `PointLight`), `gsap`, Vitest + `@react-three/test-renderer` for component-mount tests (this project's established pattern — `Kitchen.test.tsx`/`KitchenAtmosphere.test.tsx` both successfully mount full scene components under the test renderer; only `@react-three/postprocessing`'s `EffectComposer` has the documented mocked-WebGL-context limitation, which does not apply here).

## Global Constraints

- No new npm dependencies — `@react-three/drei`'s `Sparkles` (already installed) and `gsap` (already installed) cover every need.
- No new procedural-texture-generator functions — reuse `createWoodGrainTexture`/`createGrainTexture`/`createSoftCircleTexture` from `src/scene/proceduralTextures.ts` exactly as `Kitchen.tsx` does.
- Every material stays `MeshToonMaterial` (or `MeshBasicMaterial` only for unlit emissive glow planes, matching the existing hearth-glow precedent) with the shared `gradientMap` from `createToonGradientMap()`.
- Tavern-only for this phase — do not touch `Kitchen.tsx`, `KitchenAtmosphere.tsx`, `DungeonRoom.tsx`, `DungeonTablet.tsx`, or `TavernNoticeboard.tsx`.
- Do not change camera framing, drag/interaction logic (`Magnet.tsx`), the poetry engine (`src/engine/`), scene-transition (zoom/fade) behavior, or `scenes.ts`'s fixed lighting preset for the tavern.
- No lighting-preset-conditional behavior in this scene — the tavern always uses its single fixed firelit preset (`usesEnvironmentLighting: false` in `scenes.ts`), so nothing here should branch on `lightingPreset`.
- New props must not visually overlap the noticeboard's `magnetBoardBounds` region. Per `src/engine/scenes.ts`, the tavern board group sits at world position `[4, 0, -3.5]` (`BOARD_GROUP_POSITION`) with local bounds `x: [-1.6, 1.6], y: [2.3, 5.7]` — i.e. world x `[2.4, 5.6]`, world y `[2.3, 5.7]`, at world z around `-3.5`. All new props in this plan are placed on the opposite side of the room (x ≤ 0 or along the back/side walls away from x `[2.4, 5.6]`), so no overlap check is needed per-task, but keep this in mind if adjusting positions.
- Every new decorative mesh/prop group gets a `data-kind="..."` attribute (matching `Kitchen.tsx`'s existing convention) so tests can assert on `renderer.scene.findAllByProps({ 'data-kind': '...' })` counts without brittle indexing.

---

## Reference: current file contents before this plan's changes

**`src/scene/TavernRoom.tsx`** (current, in full):

```tsx
import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';

/** Static tavern interior: wood floor/walls and a warm hearth glow. Mirrors
 * Kitchen.tsx's structure — no props, no per-scene state. */
export function TavernRoom() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshToonMaterial color="#5a3a24" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[0, 7.5, -6]} receiveShadow>
        <boxGeometry args={[30, 15, 1]} />
        <meshToonMaterial color="#3b2415" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-10, 7.5, 0]} receiveShadow>
        <boxGeometry args={[1, 15, 30]} />
        <meshToonMaterial color="#3b2415" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-6, 2, -5.4]} castShadow>
        <boxGeometry args={[3, 4, 1]} />
        <meshToonMaterial color="#2b1a10" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-6, 2, -4.8]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color="#ff8c3c" />
      </mesh>

      <RoundedBox args={[10, 1, 3]} radius={0.08} smoothness={4} position={[-4, 0.5, -2]} castShadow receiveShadow>
        <meshToonMaterial color="#8a5a34" gradientMap={gradientMap} />
      </RoundedBox>
    </>
  );
}
```

**`src/scene/TavernRoom.test.tsx`** (current, in full):

```tsx
import { describe, expect, it } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { TavernRoom } from './TavernRoom';

describe('TavernRoom', () => {
  it('mounts without throwing and renders at least a floor and two walls', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TavernRoom />);
    const meshes = renderer.scene.children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBeGreaterThanOrEqual(3);
  });
});
```

**`src/scene/proceduralTextures.ts`** already exports (used by this plan, no changes needed):
- `createSeededRng(seed: number): () => number`
- `createGrainTexture(options?: { size?: number; flecks?: number; repeat?: [number, number]; seed?: number }): THREE.CanvasTexture`
- `createWoodGrainTexture(options?: { size?: number; streaks?: number; repeat?: [number, number]; seed?: number }): THREE.CanvasTexture`
- `createSoftCircleTexture(size?: number): THREE.CanvasTexture`

**`src/scene/KitchenAtmosphere.tsx`** is the direct structural precedent for this plan's new `TavernAtmosphere.tsx` — see Task 7 below for the adapted version.

---

## Task 1: Wood-grain and plaster textures on the floor, walls, and bench

**Files:**
- Modify: `src/scene/TavernRoom.tsx`
- Test: `src/scene/TavernRoom.test.tsx`

**Interfaces:**
- Consumes: `createWoodGrainTexture`, `createGrainTexture` from `./proceduralTextures` (already implemented, no changes).
- Produces: floor/wall/bench meshes now have a non-null `material.map`, matching `Kitchen.tsx`'s existing test pattern (`Kitchen.test.tsx`'s "applies a procedural wood-grain texture to the floor" test).

- [ ] **Step 1: Write the failing test**

Add to `src/scene/TavernRoom.test.tsx`:

```tsx
import * as THREE from 'three';
```

(add this import alongside the existing imports at the top of the file), then add a new test inside the `describe` block:

```tsx
  it('applies procedural wood-grain and plaster textures to the floor, walls, and bench', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TavernRoom />);
    const floor = renderer.scene.children[0];
    const floorMaterial = (floor.instance as THREE.Mesh).material as THREE.MeshToonMaterial;
    expect(floorMaterial.map).not.toBeNull();

    const backWall = renderer.scene.children[1];
    const backWallMaterial = (backWall.instance as THREE.Mesh).material as THREE.MeshToonMaterial;
    expect(backWallMaterial.map).not.toBeNull();

    const bench = renderer.scene.findAllByProps({ 'data-kind': 'bench' })[0];
    const benchMaterial = (bench.instance as THREE.Mesh).material as THREE.MeshToonMaterial;
    expect(benchMaterial.map).not.toBeNull();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/scene/TavernRoom.test.tsx`
Expected: FAIL — floor/wall materials have `map: null`, and the bench query returns `undefined` (no `data-kind="bench"` exists yet).

- [ ] **Step 3: Implement the texture application**

Replace the full contents of `src/scene/TavernRoom.tsx` with:

```tsx
import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';
import { createGrainTexture, createWoodGrainTexture } from './proceduralTextures';

/** Static tavern interior: wood floor/walls, a warm hearth glow, and
 * (from this plan onward) furniture/decor props and procedural textures.
 * Mirrors Kitchen.tsx's structure. */
export function TavernRoom() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const floorWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [8, 8], seed: 501 }), []);
  const wallGrain = useMemo(() => createGrainTexture({ repeat: [6, 3], seed: 502 }), []);
  const benchWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [4, 1], seed: 503 }), []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshToonMaterial color="#5a3a24" gradientMap={gradientMap} map={floorWoodGrain} />
      </mesh>

      <mesh position={[0, 7.5, -6]} receiveShadow>
        <boxGeometry args={[30, 15, 1]} />
        <meshToonMaterial color="#3b2415" gradientMap={gradientMap} map={wallGrain} />
      </mesh>

      <mesh position={[-10, 7.5, 0]} receiveShadow>
        <boxGeometry args={[1, 15, 30]} />
        <meshToonMaterial color="#3b2415" gradientMap={gradientMap} map={wallGrain} />
      </mesh>

      <mesh position={[-6, 2, -5.4]} castShadow>
        <boxGeometry args={[3, 4, 1]} />
        <meshToonMaterial color="#2b1a10" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-6, 2, -4.8]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color="#ff8c3c" />
      </mesh>

      <RoundedBox
        args={[10, 1, 3]}
        radius={0.08}
        smoothness={4}
        position={[-4, 0.5, -2]}
        castShadow
        receiveShadow
        data-kind="bench"
      >
        <meshToonMaterial color="#8a5a34" gradientMap={gradientMap} map={benchWoodGrain} />
      </RoundedBox>
    </>
  );
}
```

(This step only adds textures and the `data-kind="bench"` marker — the hearth plane and barrel/shelf/sconce/tankard props are added in later tasks.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/scene/TavernRoom.test.tsx`
Expected: PASS (all tests in the file, including the pre-existing "mounts without throwing" one).

- [ ] **Step 5: Commit**

```bash
git add src/scene/TavernRoom.tsx src/scene/TavernRoom.test.tsx
git commit -m "feat(tavern): apply procedural wood-grain and plaster textures"
```

---

## Task 2: Barrel cluster prop

**Files:**
- Modify: `src/scene/TavernRoom.tsx`
- Test: `src/scene/TavernRoom.test.tsx`

**Interfaces:**
- Produces: 3 meshes with `data-kind="barrel"`, each a wood-grained cylinder with two thin dark "metal band" torus rings (`data-kind="barrel-band"`, 2 per barrel = 6 total).

- [ ] **Step 1: Write the failing test**

Add to `src/scene/TavernRoom.test.tsx`:

```tsx
  it('renders a 3-barrel cluster with metal bands', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TavernRoom />);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'barrel' }).length).toBe(3);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'barrel-band' }).length).toBe(6);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/scene/TavernRoom.test.tsx`
Expected: FAIL — both counts are 0.

- [ ] **Step 3: Implement the barrel cluster**

In `src/scene/TavernRoom.tsx`, add this constant above the `TavernRoom` function:

```tsx
const BARREL_POSITIONS: [number, number, number][] = [
  [4, 0.6, -5],
  [5.3, 0.6, -5],
  [4.65, 1.8, -5],
];
const BARREL_BAND_Y_OFFSETS = [-0.35, 0.35];
```

Add this JSX block inside the returned fragment, after the bench `RoundedBox` from Task 1:

```tsx
      {/* Barrel cluster stacked against the back wall, opposite the hearth */}
      {BARREL_POSITIONS.map((position, index) => (
        <group key={index} position={position}>
          <mesh castShadow receiveShadow data-kind="barrel">
            <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />
            <meshToonMaterial color="#7a5230" gradientMap={gradientMap} map={benchWoodGrain} />
          </mesh>
          {BARREL_BAND_Y_OFFSETS.map((yOffset) => (
            <mesh key={yOffset} position={[0, yOffset, 0]} data-kind="barrel-band">
              <torusGeometry args={[0.61, 0.04, 8, 16]} />
              <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
            </mesh>
          ))}
        </group>
      ))}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/scene/TavernRoom.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scene/TavernRoom.tsx src/scene/TavernRoom.test.tsx
git commit -m "feat(tavern): add barrel cluster prop"
```

---

## Task 3: Wall shelf with bottles

**Files:**
- Modify: `src/scene/TavernRoom.tsx`
- Test: `src/scene/TavernRoom.test.tsx`

**Interfaces:**
- Produces: 1 mesh with `data-kind="shelf-plank"`, 5 meshes with `data-kind="shelf-bottle"`.

- [ ] **Step 1: Write the failing test**

Add to `src/scene/TavernRoom.test.tsx`:

```tsx
  it('renders a wall shelf with bottles', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TavernRoom />);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'shelf-plank' }).length).toBe(1);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'shelf-bottle' }).length).toBe(5);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/scene/TavernRoom.test.tsx`
Expected: FAIL — both counts are 0.

- [ ] **Step 3: Implement the shelf and bottles**

In `src/scene/TavernRoom.tsx`, add this constant above the `TavernRoom` function:

```tsx
const SHELF_BOTTLES: { x: number; height: number; color: string }[] = [
  { x: -0.7, height: 0.5, color: '#4a7a5a' },
  { x: -0.35, height: 0.6, color: '#6a3a2a' },
  { x: 0, height: 0.45, color: '#4a7a5a' },
  { x: 0.35, height: 0.55, color: '#8a6a3a' },
  { x: 0.7, height: 0.5, color: '#6a3a2a' },
];
```

Add this JSX block inside the returned fragment, after the barrel cluster from Task 2:

```tsx
      {/* Wall shelf with bottles, mounted on the back wall right of the barrels */}
      <RoundedBox
        args={[2, 0.12, 0.5]}
        radius={0.03}
        smoothness={4}
        position={[7, 3.5, -5.3]}
        castShadow
        receiveShadow
        data-kind="shelf-plank"
      >
        <meshToonMaterial color="#6a4527" gradientMap={gradientMap} map={benchWoodGrain} />
      </RoundedBox>
      {SHELF_BOTTLES.map(({ x, height, color }, index) => (
        <mesh key={index} position={[7 + x, 3.56 + height / 2, -5.3]} castShadow data-kind="shelf-bottle">
          <cylinderGeometry args={[0.09, 0.11, height, 10]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      ))}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/scene/TavernRoom.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scene/TavernRoom.tsx src/scene/TavernRoom.test.tsx
git commit -m "feat(tavern): add wall shelf with bottles"
```

---

## Task 4: Wall sconces (flanking warm light points)

**Files:**
- Modify: `src/scene/TavernRoom.tsx`
- Test: `src/scene/TavernRoom.test.tsx`

**Interfaces:**
- Produces: 2 meshes with `data-kind="sconce-flame"` (emissive), 2 meshes with `data-kind="sconce-bracket"`, 2 `<pointLight>` instances added to the scene (in addition to the hearth's, added in Task 6 — so this task alone brings total `PointLight` count to 2, verified via `renderer.scene.findAllByType('PointLight')`).

- [ ] **Step 1: Write the failing test**

Add to `src/scene/TavernRoom.test.tsx`:

```tsx
  it('renders two wall sconces with point lights', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TavernRoom />);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'sconce-bracket' }).length).toBe(2);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'sconce-flame' }).length).toBe(2);
    expect(renderer.scene.findAllByType('PointLight').length).toBe(2);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/scene/TavernRoom.test.tsx`
Expected: FAIL — all counts are 0.

- [ ] **Step 3: Implement the sconces**

In `src/scene/TavernRoom.tsx`, add this constant above the `TavernRoom` function:

```tsx
const SCONCE_POSITIONS: [number, number, number][] = [
  [-1, 4.5, -5.4],
  [9, 4.5, -5.4],
];
```

Add this JSX block inside the returned fragment, after the shelf/bottles from Task 3:

```tsx
      {/* Wall sconces flanking the back wall, adding warm fill light points */}
      {SCONCE_POSITIONS.map((position, index) => (
        <group key={index} position={position}>
          <mesh castShadow data-kind="sconce-bracket">
            <boxGeometry args={[0.25, 0.4, 0.25]} />
            <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0, 0.35, 0.1]} data-kind="sconce-flame">
            <coneGeometry args={[0.12, 0.35, 8]} />
            <meshToonMaterial
              color="#3d2b1f"
              gradientMap={gradientMap}
              emissive="#ffb454"
              emissiveIntensity={1.4}
            />
          </mesh>
          <pointLight color="#ffb454" intensity={0.5} distance={5} decay={2} position={[0, 0.35, 0.2]} />
        </group>
      ))}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/scene/TavernRoom.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scene/TavernRoom.tsx src/scene/TavernRoom.test.tsx
git commit -m "feat(tavern): add wall sconces with point lights"
```

---

## Task 5: Tankards on the bench

**Files:**
- Modify: `src/scene/TavernRoom.tsx`
- Test: `src/scene/TavernRoom.test.tsx`

**Interfaces:**
- Produces: 3 meshes with `data-kind="tankard-body"`, 3 meshes with `data-kind="tankard-handle"`.

- [ ] **Step 1: Write the failing test**

Add to `src/scene/TavernRoom.test.tsx`:

```tsx
  it('renders tankards on the bench', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TavernRoom />);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'tankard-body' }).length).toBe(3);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'tankard-handle' }).length).toBe(3);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/scene/TavernRoom.test.tsx`
Expected: FAIL — both counts are 0.

- [ ] **Step 3: Implement the tankards**

The bench top sits at world y = 1.0 (`position={[-4, 0.5, -2]}` with height 1, i.e. top face at `0.5 + 1/2 = 1.0`). Bench spans world x from `-9` to `1` and z from `-3.5` to `-0.5`.

In `src/scene/TavernRoom.tsx`, add this constant above the `TavernRoom` function:

```tsx
const TANKARD_POSITIONS: [number, number, number][] = [
  [-6.5, 1.0, -2.3],
  [-5.5, 1.0, -1.7],
  [-2, 1.0, -2],
];
```

Add this JSX block inside the returned fragment, after the sconces from Task 4:

```tsx
      {/* Tankards resting on the bench top */}
      {TANKARD_POSITIONS.map((position, index) => (
        <group key={index} position={position}>
          <mesh position={[0, 0.13, 0]} castShadow data-kind="tankard-body">
            <cylinderGeometry args={[0.13, 0.11, 0.26, 12]} />
            <meshToonMaterial color="#9a9488" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0.15, 0.13, 0]} rotation={[0, 0, Math.PI / 2]} data-kind="tankard-handle">
            <torusGeometry args={[0.08, 0.02, 8, 12]} />
            <meshToonMaterial color="#7a7468" gradientMap={gradientMap} />
          </mesh>
        </group>
      ))}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/scene/TavernRoom.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scene/TavernRoom.tsx src/scene/TavernRoom.test.tsx
git commit -m "feat(tavern): add tankards on the bench"
```

---

## Task 6: Animated flickering hearth fire

**Files:**
- Modify: `src/scene/TavernRoom.tsx`
- Test: `src/scene/TavernRoom.test.tsx`

**Interfaces:**
- Consumes: `gsap` (already a dependency, imported directly — same pattern as `KitchenAtmosphere.tsx`).
- Produces: replaces the static flat-plane fire glow with 3 animated flame `<sprite>` elements (`data-kind="hearth-flame"`) and a flickering `<pointLight>` positioned at the hearth (`data-kind` doesn't apply to lights that aren't found by `findAllByProps` reliably in this renderer for non-mesh types — instead, this task's test counts `PointLight` types, bringing the total from 2 (Task 4's sconces) to 3).
- This task's flame sprites reuse `createSoftCircleTexture` (already implemented in `proceduralTextures.ts`) as their sprite material `map`, exactly like `KitchenAtmosphere.tsx`'s steam sprites.

- [ ] **Step 1: Write the failing test**

Add to `src/scene/TavernRoom.test.tsx`:

```tsx
  it('replaces the static hearth glow with animated flame sprites and a flickering point light', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TavernRoom />);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'hearth-flame' }).length).toBe(3);
    expect(renderer.scene.findAllByType('PointLight').length).toBe(3);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/scene/TavernRoom.test.tsx`
Expected: FAIL — `hearth-flame` count is 0 (only the old static plane exists), `PointLight` count is 2 (only the Task 4 sconces).

- [ ] **Step 3: Implement the animated hearth fire**

In `src/scene/TavernRoom.tsx`, replace the file's import block (everything before the `TavernRoom` function) with:

```tsx
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { RoundedBox } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';
import { createGrainTexture, createWoodGrainTexture, createSoftCircleTexture } from './proceduralTextures';
```

This adds `useEffect`/`useRef` (React), `THREE` (for the sprite/point-light ref types below), `gsap` (for the flicker timelines), and `createSoftCircleTexture` (for the flame sprite material) to the existing import set — everything else (`RoundedBox`, `createToonGradientMap`, `createGrainTexture`, `createWoodGrainTexture`) stays as already established in Task 1.

Add these constants above the `TavernRoom` function:

```tsx
const HEARTH_POSITION: [number, number, number] = [-6, 2.5, -4.6];
const HEARTH_FLAME_COUNT = 3;
const HEARTH_FLICKER_BASE_INTENSITY = 1.1;
```

Inside the `TavernRoom` function, add (alongside the other `useMemo` texture calls from Task 1):

```tsx
  const flameTexture = useMemo(() => createSoftCircleTexture(), []);
  const flameRefs = useRef<(THREE.Sprite | null)[]>([]);
  const flickerLightRef = useRef<THREE.PointLight | null>(null);
```

Add this `useEffect` inside the `TavernRoom` function, after the texture `useMemo` calls:

```tsx
  useEffect(() => {
    const [hx, hy, hz] = HEARTH_POSITION;
    const flameTimelines = flameRefs.current.map((sprite, index) => {
      if (!sprite) return null;
      const material = sprite.material as THREE.SpriteMaterial;
      const drift = index % 2 === 0 ? 0.15 : -0.15;
      const duration = 0.5 + index * 0.15;

      sprite.position.set(hx + drift * 0.5, hy, hz);
      const tl = gsap.timeline({ repeat: -1, yoyo: true, delay: index * 0.1 });
      tl.to(sprite.position, { x: hx + drift, y: hy + 0.3, duration, ease: 'sine.inOut' }, 0)
        .to(sprite.scale, { x: 0.9, y: 1.1, duration, ease: 'sine.inOut' }, 0)
        .to(material, { opacity: 0.55, duration, ease: 'sine.inOut' }, 0);
      return tl;
    });

    const light = flickerLightRef.current;
    const lightTimeline = light
      ? gsap.timeline({ repeat: -1 }).to(light, {
          intensity: HEARTH_FLICKER_BASE_INTENSITY * 1.4,
          duration: 0.18,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      : null;

    return () => {
      flameTimelines.forEach((tl) => tl?.kill());
      lightTimeline?.kill();
    };
  }, []);
```

Replace the old static hearth-glow plane:

```tsx
      <mesh position={[-6, 2, -4.8]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color="#ff8c3c" />
      </mesh>
```

with:

```tsx
      {/* Animated flickering hearth fire: layered flame sprites + a flickering point light */}
      {Array.from({ length: HEARTH_FLAME_COUNT }, (_, index) => (
        <sprite
          key={index}
          position={HEARTH_POSITION}
          scale={[0.7, 0.9, 1]}
          data-kind="hearth-flame"
          ref={(el) => {
            flameRefs.current[index] = el;
          }}
        >
          <spriteMaterial
            map={flameTexture}
            color={index === 0 ? '#ffcf6b' : '#ff8c3c'}
            transparent
            depthWrite={false}
            opacity={0.4}
          />
        </sprite>
      ))}
      <pointLight
        ref={flickerLightRef}
        position={HEARTH_POSITION}
        color="#ff9c4c"
        intensity={HEARTH_FLICKER_BASE_INTENSITY}
        distance={8}
        decay={2}
      />
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/scene/TavernRoom.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scene/TavernRoom.tsx src/scene/TavernRoom.test.tsx
git commit -m "feat(tavern): replace static hearth glow with animated flickering fire"
```

---

## Task 7: `TavernAtmosphere.tsx` — ember and dust-mote particles

**Files:**
- Create: `src/scene/TavernAtmosphere.tsx`
- Test: `src/scene/TavernAtmosphere.test.tsx`

**Interfaces:**
- Produces: `TavernAtmosphere({ hearthPosition: [number, number, number] })` — a component rendering 2 `<Sparkles>` instances (embers + dust motes), always on (no lighting-preset gating, per the Global Constraints).
- Consumes: `Sparkles` from `@react-three/drei` (already installed).

- [ ] **Step 1: Write the failing test**

Create `src/scene/TavernAtmosphere.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { TavernAtmosphere } from './TavernAtmosphere';

const HEARTH_POSITION: [number, number, number] = [-6, 2.5, -4.6];

describe('TavernAtmosphere', () => {
  it('mounts without throwing and renders an ember layer and a dust-mote layer', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <TavernAtmosphere hearthPosition={HEARTH_POSITION} />,
    );
    const points = renderer.scene.children.filter((child) => child.type === 'Points');
    expect(points.length).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/scene/TavernAtmosphere.test.tsx`
Expected: FAIL — `Cannot find module './TavernAtmosphere'`.

- [ ] **Step 3: Implement `TavernAtmosphere.tsx`**

Create `src/scene/TavernAtmosphere.tsx`:

```tsx
import { Sparkles } from '@react-three/drei';

export interface TavernAtmosphereProps {
  hearthPosition: [number, number, number];
}

/**
 * Always-on ambient particles for the tavern scene: rising embers near the
 * hearth and a soft warm dust-mote layer spanning the room. Unlike
 * KitchenAtmosphere, nothing here is gated by lighting preset — the
 * tavern uses a single fixed firelit lighting preset (see scenes.ts), so
 * there's no day/night variation to react to. Kept in its own file/
 * component so TavernRoom.tsx's room-prop JSX doesn't also have to carry
 * particle-tuning details, mirroring KitchenAtmosphere.tsx's separation.
 */
export function TavernAtmosphere({ hearthPosition }: TavernAtmosphereProps) {
  const [hx, hy, hz] = hearthPosition;

  return (
    <>
      <Sparkles
        count={14}
        scale={[1.2, 2, 1.2]}
        size={2.5}
        speed={0.4}
        color="#ff9c4c"
        opacity={0.7}
        position={[hx, hy + 0.8, hz]}
      />
      <Sparkles
        count={20}
        scale={[9, 4, 6]}
        size={1.6}
        speed={0.12}
        color="#ffdca0"
        opacity={0.25}
        position={[-2, 4, -2]}
      />
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/scene/TavernAtmosphere.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scene/TavernAtmosphere.tsx src/scene/TavernAtmosphere.test.tsx
git commit -m "feat(tavern): add TavernAtmosphere ember and dust-mote particles"
```

---

## Task 8: Mount `TavernAtmosphere` inside `TavernRoom`

**Files:**
- Modify: `src/scene/TavernRoom.tsx`
- Test: `src/scene/TavernRoom.test.tsx`

**Interfaces:**
- Consumes: `TavernAtmosphere` from `./TavernAtmosphere` (Task 7), `HEARTH_POSITION` constant already defined in `TavernRoom.tsx` (Task 6).
- Produces: `TavernRoom`'s rendered scene now includes 2 additional `Points` instances from the mounted `TavernAtmosphere`.

- [ ] **Step 1: Write the failing test**

Add to `src/scene/TavernRoom.test.tsx`:

```tsx
  it('mounts TavernAtmosphere, adding the ember and dust-mote particle layers', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TavernRoom />);
    const points = renderer.scene.findAllByType('Points');
    expect(points.length).toBe(2);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/scene/TavernRoom.test.tsx`
Expected: FAIL — `points.length` is 0 (`TavernAtmosphere` isn't mounted yet).

- [ ] **Step 3: Mount `TavernAtmosphere`**

In `src/scene/TavernRoom.tsx`, add this import alongside the other local imports:

```tsx
import { TavernAtmosphere } from './TavernAtmosphere';
```

Add `<TavernAtmosphere hearthPosition={HEARTH_POSITION} />` as the last child inside the returned fragment, immediately before the closing `</>`:

```tsx
      <TavernAtmosphere hearthPosition={HEARTH_POSITION} />
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/scene/TavernRoom.test.tsx`
Expected: PASS (all tests in the file).

- [ ] **Step 5: Commit**

```bash
git add src/scene/TavernRoom.tsx src/scene/TavernRoom.test.tsx
git commit -m "feat(tavern): mount TavernAtmosphere particles inside TavernRoom"
```

---

## Task 9: Full-suite verification and manual visual QA

**Files:** none created/modified — verification only.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: All tests pass (matching this project's known baseline — the only pre-existing failures are 2 unrelated tests inside `.worktrees/music-visualizer-phase-0`, not touched by this plan).

- [ ] **Step 2: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: Both clean, no errors.

- [ ] **Step 3: Manual visual QA via a local dev server**

Run: `npm run dev` (pick an open port if the default is occupied by an unrelated stale process, as happened during the Phase 6b QA pass), then navigate to the tavern scene (via the scene switcher in the HUD) and visually confirm:
- Floor/walls/bench show visible wood-grain/plaster texture variation, not flat colors.
- The barrel cluster, wall shelf with bottles, wall sconces, and tankards on the bench are all present and read clearly as tavern props at the toy-diorama scale.
- The hearth fire visibly flickers/animates (flame sprites moving, point light pulsing) instead of being a static flat orange square.
- Embers rise gently from the hearth; ambient warm dust motes are visible but subtle, not distracting.
- Zooming into the noticeboard (magnet board) still works correctly and none of the new props visually intrude into the magnet play area.
- The already-shipped global post-processing pipeline (bloom/vignette/etc.) still looks correct in this scene with no new visual artifacts introduced by the new emissive sconces/hearth light.

- [ ] **Step 4: Clean up**

Stop the dev server and remove any scratch screenshots/files created during manual QA (none should be committed).

- [ ] **Step 5: Update the subagent-driven-development ledger**

Add a new dated section to `.superpowers/sdd/progress.md` documenting this plan's 9 tasks and their commit hashes, following the exact same format used for the Kitchen Atmosphere and Phase 6b Post-Processing plans' ledger entries.
