# Kitchen Atmosphere Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the kitchen scene (the app's default/startup scene) feel cozy and lived-in with more props, ambient particle effects, and a procedural low-poly texture feel, per `docs/superpowers/specs/2026-07-21-phase-6a-kitchen-atmosphere-design.md`.

**Architecture:** Two new files (`src/scene/proceduralTextures.ts` for canvas-generated grain/gradient textures, `src/scene/KitchenAtmosphere.tsx` for particle effects) plus incremental additions to the existing `Kitchen.tsx` (room props) and `Fridge.tsx` (detail pass). Everything is built from three.js primitives and runtime canvas textures — no downloaded images or 3D models.

**Tech Stack:** React Three Fiber, `@react-three/drei` (`RoundedBox`, `Sparkles` — already installed, no new dependency), `three.js` `CanvasTexture`, `gsap` (already used throughout for animation), Vitest + `@react-three/test-renderer` for tests.

## Global Constraints

- No new npm dependencies — `@react-three/drei`'s `Sparkles` (already installed at `^10.7.7`) covers particle needs.
- All textures/gradients must be procedurally generated in code (canvas-based `THREE.CanvasTexture`, same pattern as the existing `src/scene/toonGradient.ts`) — no external image files or 3D model imports.
- Every material stays `MeshToonMaterial` (or `MeshBasicMaterial` for the unlit window glow/sky) with the shared `gradientMap` from `createToonGradientMap()`, consistent with the existing toon-shaded look.
- Canvas 2D context is unavailable in this project's jsdom test environment (`document.createElement('canvas').getContext('2d')` returns `null`) — every canvas-drawing function MUST guard with `if (ctx) { ... }` and still return a valid (blank) texture when `ctx` is null, matching the existing pattern in `src/scene/wordTexture.ts`'s `createWordCanvas`.
- Kitchen-only for this phase — do not touch `TavernRoom.tsx`/`DungeonRoom.tsx`/`TavernNoticeboard.tsx`/`DungeonTablet.tsx`.
- Do not change camera framing, drag/interaction logic (`Magnet.tsx`), the poetry engine (`src/engine/`), or scene-transition (zoom/fade) behavior.
- New props must not visually overlap the fridge door's `magnetBoardBounds` region (`x: [-1.6, 1.6], y: [0.3, 7.7]` in the Fridge's local group space, per `src/engine/scenes.ts`).

---

## Reference: current file contents before this plan's changes

**`src/scene/Kitchen.tsx`** (current, in full):

```tsx
import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
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

      <RoundedBox args={[12, 3, 3]} radius={0.1} smoothness={4} position={[-4, 1.5, -4]} castShadow receiveShadow>
        <meshToonMaterial color="#c96a3e" gradientMap={gradientMap} />
      </RoundedBox>

      <RoundedBox args={[12.2, 0.2, 3.2]} radius={0.06} smoothness={4} position={[-4, 3.1, -4]} castShadow receiveShadow>
        <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
      </RoundedBox>

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

**`src/scene/Fridge.tsx`** (current, in full):

```tsx
import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { MagnetBoard } from './MagnetBoard';
import { SCENES, BOARD_GROUP_POSITION } from '../engine/scenes';
import { createToonGradientMap } from './toonGradient';

export function Fridge() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const doorZ = SCENES.kitchen.magnetSurfaceZ;

  return (
    <group position={BOARD_GROUP_POSITION}>
      <RoundedBox args={[3.5, 8, 3]} radius={0.1} smoothness={4} position={[0, 4, 0]} castShadow receiveShadow>
        <meshToonMaterial color="#f6d98a" gradientMap={gradientMap} />
      </RoundedBox>

      <RoundedBox args={[3.6, 7.8, 0.2]} radius={0.06} smoothness={4} position={[0, 4, 1.55]} receiveShadow>
        <meshToonMaterial color="#f6d98a" gradientMap={gradientMap} />
      </RoundedBox>

      <MagnetBoard
        sceneId="kitchen"
        slamButtonPosition={[1.2, 3.2, doorZ]}
        tesseractButtonPosition={[1.2, 2.5, doorZ]}
      />
    </group>
  );
}
```

`Fridge.test.tsx` currently asserts exactly 39 meshes (body + door + 35 magnets + SlamButton + TesseractButton). This plan's Task 7 adds 1 handle + 1 kick-plate + 3 vent strips = 5 new meshes, so that count must become 44.

`Kitchen.test.tsx` currently asserts `meshes.length >= 3`. This plan adds many meshes; Task 9 updates this to a tighter, still-robust lower bound.

---

### Task 1: Procedural texture helpers

**Files:**
- Create: `src/scene/proceduralTextures.ts`
- Test: `src/scene/proceduralTextures.test.ts`

**Interfaces:**
- Produces: `createSeededRng(seed: number): () => number`, `createGrainTexture(options?: { size?: number; flecks?: number; repeat?: [number, number]; seed?: number }): THREE.CanvasTexture`, `createWoodGrainTexture(options?: { size?: number; streaks?: number; repeat?: [number, number]; seed?: number }): THREE.CanvasTexture`, `createSkyGradientTexture(topColor: string, bottomColor: string, size?: number): THREE.CanvasTexture`, `createSoftCircleTexture(size?: number): THREE.CanvasTexture` — all consumed by `Kitchen.tsx` (Tasks 2, 3) and `KitchenAtmosphere.tsx` (Task 8).

- [ ] **Step 1: Write the failing tests**

Create `src/scene/proceduralTextures.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  createSeededRng,
  createGrainTexture,
  createWoodGrainTexture,
  createSkyGradientTexture,
  createSoftCircleTexture,
} from './proceduralTextures';

describe('createSeededRng', () => {
  it('produces the same sequence for the same seed', () => {
    const a = createSeededRng(42);
    const b = createSeededRng(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('produces values in [0, 1)', () => {
    const rng = createSeededRng(7);
    for (let i = 0; i < 20; i += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('createGrainTexture', () => {
  it('returns a repeat-wrapped CanvasTexture at the requested size', () => {
    const texture = createGrainTexture({ size: 32, repeat: [3, 2] });
    expect(texture).toBeInstanceOf(THREE.CanvasTexture);
    expect(texture.image.width).toBe(32);
    expect(texture.image.height).toBe(32);
    expect(texture.wrapS).toBe(THREE.RepeatWrapping);
    expect(texture.wrapT).toBe(THREE.RepeatWrapping);
    expect(texture.repeat.x).toBe(3);
    expect(texture.repeat.y).toBe(2);
  });

  it('defaults to a 64x64 size and 4x4 repeat when no options given', () => {
    const texture = createGrainTexture();
    expect(texture.image.width).toBe(64);
    expect(texture.repeat.x).toBe(4);
    expect(texture.repeat.y).toBe(4);
  });
});

describe('createWoodGrainTexture', () => {
  it('returns a repeat-wrapped CanvasTexture at the requested size', () => {
    const texture = createWoodGrainTexture({ size: 48, repeat: [2, 1] });
    expect(texture).toBeInstanceOf(THREE.CanvasTexture);
    expect(texture.image.width).toBe(48);
    expect(texture.image.height).toBe(48);
    expect(texture.wrapS).toBe(THREE.RepeatWrapping);
    expect(texture.repeat.x).toBe(2);
  });
});

describe('createSkyGradientTexture', () => {
  it('returns a non-tiling CanvasTexture at the requested height', () => {
    const texture = createSkyGradientTexture('#111111', '#eeeeee', 40);
    expect(texture).toBeInstanceOf(THREE.CanvasTexture);
    expect(texture.image.height).toBe(40);
    expect(texture.image.width).toBe(1);
  });
});

describe('createSoftCircleTexture', () => {
  it('returns a square CanvasTexture at the requested size', () => {
    const texture = createSoftCircleTexture(16);
    expect(texture).toBeInstanceOf(THREE.CanvasTexture);
    expect(texture.image.width).toBe(16);
    expect(texture.image.height).toBe(16);
  });

  it('defaults to size 32 when none given', () => {
    const texture = createSoftCircleTexture();
    expect(texture.image.width).toBe(32);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/scene/proceduralTextures.test.ts`
Expected: FAIL with "Cannot find module './proceduralTextures'" (or similar resolution error), since the module doesn't exist yet.

- [ ] **Step 3: Write the implementation**

Create `src/scene/proceduralTextures.ts`:

```ts
import * as THREE from 'three';

/**
 * Small deterministic linear-congruential RNG. Decorative textures/prop
 * scatter in this project need randomness that looks organic but is
 * stable across renders (not reshuffling every mount) — a fixed internal
 * seed achieves that without threading an RNG through every caller.
 */
export function createSeededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function finalizeTileableTexture(canvas: HTMLCanvasElement, repeat: [number, number]): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.needsUpdate = true;
  return texture;
}

export interface GrainTextureOptions {
  size?: number;
  flecks?: number;
  repeat?: [number, number];
  seed?: number;
}

/**
 * Builds a small tileable "grain" texture: a neutral white base speckled
 * with sparse, low-alpha random-brightness flecks. Deliberately neutral
 * (not colored) because three.js multiplies a material's `map` texels by
 * its `color` — a colored base here would double-tint the surface instead
 * of just adding subtle grain variation on top of the material's real
 * color. Canvas 2D context is unavailable in this project's test
 * environment (see wordTexture.ts's createWordCanvas for the same
 * pattern), so drawing is skipped (leaving a blank canvas) when `ctx` is
 * null — the returned texture is still valid, just visually blank.
 */
export function createGrainTexture(options: GrainTextureOptions = {}): THREE.CanvasTexture {
  const size = options.size ?? 64;
  const flecks = options.flecks ?? 260;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const rng = createSeededRng(options.seed ?? 1337);
    for (let i = 0; i < flecks; i += 1) {
      const x = Math.floor(rng() * size);
      const y = Math.floor(rng() * size);
      const shade = rng() > 0.5 ? 255 : 0;
      const alpha = 0.04 + rng() * 0.07;
      ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${alpha})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return finalizeTileableTexture(canvas, options.repeat ?? [4, 4]);
}

export interface WoodGrainTextureOptions {
  size?: number;
  streaks?: number;
  repeat?: [number, number];
  seed?: number;
}

/**
 * Builds a small tileable "wood grain" texture: a neutral white base with
 * a handful of soft horizontal wavy (sine-based) streaks in low-alpha
 * darker/lighter tones. Same neutral-base-for-multiplication reasoning as
 * `createGrainTexture`, but with directional streaks instead of uniform
 * speckle, so wood surfaces (floor/counter/shelf) read differently from
 * the walls' painted-plaster grain.
 */
export function createWoodGrainTexture(options: WoodGrainTextureOptions = {}): THREE.CanvasTexture {
  const size = options.size ?? 64;
  const streaks = options.streaks ?? 6;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const rng = createSeededRng(options.seed ?? 4242);
    for (let i = 0; i < streaks; i += 1) {
      const y = (i + 0.5) * (size / streaks);
      const amplitude = 1 + rng() * 2;
      const frequency = 0.15 + rng() * 0.1;
      const darker = rng() > 0.5;
      ctx.strokeStyle = darker ? 'rgba(60, 35, 15, 0.18)' : 'rgba(255, 250, 240, 0.5)';
      ctx.lineWidth = 1 + rng();
      ctx.beginPath();
      for (let x = 0; x <= size; x += 1) {
        const wave = Math.sin(x * frequency + i) * amplitude;
        const py = y + wave;
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();
    }
  }

  return finalizeTileableTexture(canvas, options.repeat ?? [4, 4]);
}

/**
 * Builds a small vertical sky-gradient texture (top -> bottom color), used
 * as the kitchen window's backdrop so it reflects the active lighting
 * preset instead of a flat fixed color. Rendered once as a single
 * non-repeating plane texture, so no RepeatWrapping is set (default
 * ClampToEdge is correct here).
 */
export function createSkyGradientTexture(topColor: string, bottomColor: string, size = 64): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Builds a small soft white circle (radial gradient fading to transparent)
 * used as the sprite map for kettle-steam particles in KitchenAtmosphere.tsx.
 */
export function createSoftCircleTexture(size = 32): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/scene/proceduralTextures.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit -p . 2>&1 | grep -v '.worktrees'`
Expected: no output (clean).

- [ ] **Step 6: Commit**

```bash
git add src/scene/proceduralTextures.ts src/scene/proceduralTextures.test.ts
git commit -m "Add procedural grain/wood-grain/sky/steam texture helpers"
```

---

### Task 2: Apply grain/wood-grain textures to the floor, walls, and counter

**Files:**
- Modify: `src/scene/Kitchen.tsx`
- Modify: `src/scene/Kitchen.test.tsx`

**Interfaces:**
- Consumes: `createGrainTexture`, `createWoodGrainTexture` from `./proceduralTextures` (Task 1).

- [ ] **Step 1: Write the failing test**

Add to `src/scene/Kitchen.test.tsx` (new `it` block inside the existing `describe('Kitchen', ...)`):

```tsx
import * as THREE from 'three';
```

Add this import at the top of the file alongside the existing imports, then add the test:

```tsx
  it('applies a procedural wood-grain texture to the floor', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Kitchen />);
    const floor = renderer.scene.children[0];
    expect(floor.type).toBe('Mesh');
    const material = (floor.instance as THREE.Mesh).material as THREE.MeshToonMaterial;
    expect(material.map).not.toBeNull();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/scene/Kitchen.test.tsx`
Expected: FAIL — `material.map` is `null` (or `undefined`) because `Kitchen.tsx` doesn't set a `map` yet.

- [ ] **Step 3: Implement**

In `src/scene/Kitchen.tsx`, update the import line and add texture setup, then apply the textures to the floor, both walls, and the cabinet body:

```tsx
import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';
import { createGrainTexture, createWoodGrainTexture } from './proceduralTextures';

export function Kitchen() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const wallGrain = useMemo(() => createGrainTexture({ repeat: [6, 3] }), []);
  const floorWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [8, 8] }), []);
  const counterWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [4, 1] }), []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshToonMaterial color="#8a5a3b" gradientMap={gradientMap} map={floorWoodGrain} />
      </mesh>

      <mesh position={[0, 7.5, -6]} receiveShadow>
        <boxGeometry args={[30, 15, 1]} />
        <meshToonMaterial color="#f2e3c9" gradientMap={gradientMap} map={wallGrain} />
      </mesh>

      <mesh position={[-10, 7.5, 0]} receiveShadow>
        <boxGeometry args={[1, 15, 30]} />
        <meshToonMaterial color="#f2e3c9" gradientMap={gradientMap} map={wallGrain} />
      </mesh>

      <mesh position={[-5, 6, -5.4]}>
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial color="#fff3d6" />
      </mesh>

      <RoundedBox args={[12, 3, 3]} radius={0.1} smoothness={4} position={[-4, 1.5, -4]} castShadow receiveShadow>
        <meshToonMaterial color="#c96a3e" gradientMap={gradientMap} map={counterWoodGrain} />
      </RoundedBox>

      <RoundedBox args={[12.2, 0.2, 3.2]} radius={0.06} smoothness={4} position={[-4, 3.1, -4]} castShadow receiveShadow>
        <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
      </RoundedBox>

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

(Only the floor/wall/wall/cabinet-body `meshToonMaterial` lines gained a `map` prop and the imports/texture `useMemo`s were added — every other line is unchanged from the current file.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/scene/Kitchen.test.tsx`
Expected: PASS (both the existing smoke test and the new texture test).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit -p . 2>&1 | grep -v '.worktrees'`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/scene/Kitchen.tsx src/scene/Kitchen.test.tsx
git commit -m "Apply procedural grain/wood-grain textures to kitchen floor, walls, counter"
```

---

### Task 3: Window backdrop reacts to lighting preset + night stars

**Files:**
- Modify: `src/scene/Kitchen.tsx`
- Modify: `src/scene/Kitchen.test.tsx`

**Interfaces:**
- Consumes: `createSkyGradientTexture`, `createSeededRng` from `./proceduralTextures` (Task 1); `useSceneStore` from `../state/sceneStore` (existing, used the same way as in `src/scene/Lighting.tsx`: `useSceneStore((state) => state.lightingPreset)`); `LIGHTING_PRESETS` from `../engine/lightingPresets` (existing).

- [ ] **Step 1: Write the failing test**

Add to `src/scene/Kitchen.test.tsx` (needs `useSceneStore` imported and reset in a `beforeEach`, matching the pattern in `Fridge.test.tsx`):

```tsx
import { describe, expect, it, beforeEach } from 'vitest';
import * as THREE from 'three';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Kitchen } from './Kitchen';
import { useSceneStore } from '../state/sceneStore';

describe('Kitchen', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
  });

  it('mounts without throwing and renders at least a floor and two walls', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Kitchen />);
    const meshes = renderer.scene.children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBeGreaterThanOrEqual(3);
  });

  it('applies a procedural wood-grain texture to the floor', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Kitchen />);
    const floor = renderer.scene.children[0];
    expect(floor.type).toBe('Mesh');
    const material = (floor.instance as THREE.Mesh).material as THREE.MeshToonMaterial;
    expect(material.map).not.toBeNull();
  });

  it('renders night-star dots only when lightingPreset is night', async () => {
    useSceneStore.setState({ lightingPreset: 'day' });
    const dayRenderer = await ReactThreeTestRenderer.create(<Kitchen />);
    const dayStars = dayRenderer.scene.findAllByProps({ 'data-kind': 'night-star' });
    expect(dayStars.length).toBe(0);

    useSceneStore.setState({ lightingPreset: 'night' });
    const nightRenderer = await ReactThreeTestRenderer.create(<Kitchen />);
    const nightStars = nightRenderer.scene.findAllByProps({ 'data-kind': 'night-star' });
    expect(nightStars.length).toBe(15);
  });
});
```

Note: this replaces the whole top of the test file (the `describe` block gains a `beforeEach`, and the existing smoke test/texture test from Task 2 move inside it unchanged) — the file's full new content is what's shown above plus nothing else needed (no other `it` blocks exist yet at this point in the plan).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/scene/Kitchen.test.tsx`
Expected: FAIL on the new "night-star dots" test — no elements have `data-kind="night-star"` yet since `Kitchen.tsx` doesn't render any.

- [ ] **Step 3: Implement**

In `src/scene/Kitchen.tsx`, add the store/lighting imports, the sky texture and night-star position `useMemo`s, and update the window mesh + add the night-star meshes:

```tsx
import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';
import { createGrainTexture, createWoodGrainTexture, createSkyGradientTexture, createSeededRng } from './proceduralTextures';
import { useSceneStore } from '../state/sceneStore';
import { LIGHTING_PRESETS } from '../engine/lightingPresets';

const NIGHT_STAR_COUNT = 15;
const NIGHT_STAR_X_RANGE: [number, number] = [-7.6, -2.4];
const NIGHT_STAR_Y_RANGE: [number, number] = [4.2, 7.6];

export function Kitchen() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const wallGrain = useMemo(() => createGrainTexture({ repeat: [6, 3] }), []);
  const floorWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [8, 8] }), []);
  const counterWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [4, 1] }), []);

  const lightingPreset = useSceneStore((state) => state.lightingPreset);
  const skyTexture = useMemo(() => {
    const preset = LIGHTING_PRESETS[lightingPreset];
    return createSkyGradientTexture(preset.fogColor, preset.ambientColor);
  }, [lightingPreset]);

  const nightStarPositions = useMemo<[number, number, number][]>(() => {
    const rng = createSeededRng(99);
    const [minX, maxX] = NIGHT_STAR_X_RANGE;
    const [minY, maxY] = NIGHT_STAR_Y_RANGE;
    return Array.from({ length: NIGHT_STAR_COUNT }, () => {
      const x = minX + rng() * (maxX - minX);
      const y = minY + rng() * (maxY - minY);
      return [x, y, -5.35] as [number, number, number];
    });
  }, []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshToonMaterial color="#8a5a3b" gradientMap={gradientMap} map={floorWoodGrain} />
      </mesh>

      <mesh position={[0, 7.5, -6]} receiveShadow>
        <boxGeometry args={[30, 15, 1]} />
        <meshToonMaterial color="#f2e3c9" gradientMap={gradientMap} map={wallGrain} />
      </mesh>

      <mesh position={[-10, 7.5, 0]} receiveShadow>
        <boxGeometry args={[1, 15, 30]} />
        <meshToonMaterial color="#f2e3c9" gradientMap={gradientMap} map={wallGrain} />
      </mesh>

      <mesh position={[-5, 6, -5.4]}>
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial map={skyTexture} />
      </mesh>

      {lightingPreset === 'night' &&
        nightStarPositions.map((position, index) => (
          <mesh key={index} position={position} data-kind="night-star">
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}

      <RoundedBox args={[12, 3, 3]} radius={0.1} smoothness={4} position={[-4, 1.5, -4]} castShadow receiveShadow>
        <meshToonMaterial color="#c96a3e" gradientMap={gradientMap} map={counterWoodGrain} />
      </RoundedBox>

      <RoundedBox args={[12.2, 0.2, 3.2]} radius={0.06} smoothness={4} position={[-4, 3.1, -4]} castShadow receiveShadow>
        <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
      </RoundedBox>

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

Note: `data-kind="night-star"` is passed as a plain prop on the `<mesh>` JSX element purely so tests can locate these specific meshes via `findAllByProps` — react-three-fiber passes unrecognized string props through onto the underlying `userData`-less object as an inert/no-op attribute set attempt is NOT what happens; instead, R3F attaches unknown non-three props by setting them directly as object properties, which is harmless for a `Mesh` (three.js objects tolerate extra arbitrary properties) and is exactly what `@react-three/test-renderer`'s `findAllByProps` reads from (it inspects the JSX/fiber props recorded for the node, not the live three.js object) — this matches how other tests in this codebase locate specific nodes (e.g. `SlamButton.tsx`'s `userData={{ isSlamButton: true }}` pattern used elsewhere sets `userData`; here we use a plain prop since `findAllByProps` matches fiber props directly, which is simpler and sufficient for a test-only marker).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/scene/Kitchen.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit -p . 2>&1 | grep -v '.worktrees'`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/scene/Kitchen.tsx src/scene/Kitchen.test.tsx
git commit -m "Window backdrop reflects lighting preset; add night stars"
```

---

### Task 4: Braided rug + curtains

**Files:**
- Modify: `src/scene/Kitchen.tsx`
- Modify: `src/scene/Kitchen.test.tsx`

- [ ] **Step 1: Write the failing test**

Add to `src/scene/Kitchen.test.tsx`, inside the `describe('Kitchen', ...)` block:

```tsx
  it('renders the braided rug and curtain props', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Kitchen />);
    const rugLayers = renderer.scene.findAllByProps({ 'data-kind': 'rug-layer' });
    expect(rugLayers.length).toBe(3);
    const curtains = renderer.scene.findAllByProps({ 'data-kind': 'curtain' });
    expect(curtains.length).toBe(2);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/scene/Kitchen.test.tsx`
Expected: FAIL — 0 rug layers and 0 curtains found.

- [ ] **Step 3: Implement**

In `src/scene/Kitchen.tsx`, add the curtains right after the window/night-star block, and the rug right before the cabinet `RoundedBox`:

```tsx
      {/* Curtains flanking the window */}
      <RoundedBox
        args={[0.6, 4.4, 0.15]}
        radius={0.2}
        smoothness={4}
        position={[-8.4, 6, -5.3]}
        castShadow
        data-kind="curtain"
      >
        <meshToonMaterial color="#a8523a" gradientMap={gradientMap} />
      </RoundedBox>
      <RoundedBox
        args={[0.6, 4.4, 0.15]}
        radius={0.2}
        smoothness={4}
        position={[-1.6, 6, -5.3]}
        castShadow
        data-kind="curtain"
      >
        <meshToonMaterial color="#a8523a" gradientMap={gradientMap} />
      </RoundedBox>

      {/* Braided rug in the open floor area in front of the counter/fridge */}
      <RoundedBox
        args={[5, 0.06, 3.4]}
        radius={0.15}
        smoothness={4}
        position={[0, 0.03, 1]}
        receiveShadow
        data-kind="rug-layer"
      >
        <meshToonMaterial color="#b5502e" gradientMap={gradientMap} />
      </RoundedBox>
      <RoundedBox
        args={[4.2, 0.08, 2.6]}
        radius={0.15}
        smoothness={4}
        position={[0, 0.05, 1]}
        receiveShadow
        data-kind="rug-layer"
      >
        <meshToonMaterial color="#e8c9a0" gradientMap={gradientMap} />
      </RoundedBox>
      <RoundedBox
        args={[3.2, 0.1, 1.8]}
        radius={0.15}
        smoothness={4}
        position={[0, 0.07, 1]}
        receiveShadow
        data-kind="rug-layer"
      >
        <meshToonMaterial color="#7a9e5a" gradientMap={gradientMap} />
      </RoundedBox>
```

Place the curtains block immediately after the `{lightingPreset === 'night' && ...}` night-star block, and the rug block immediately before the `<RoundedBox args={[12, 3, 3]} ... />` (cabinet body).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/scene/Kitchen.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit -p . 2>&1 | grep -v '.worktrees'`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/scene/Kitchen.tsx src/scene/Kitchen.test.tsx
git commit -m "Add braided rug and window curtains to kitchen"
```

---

### Task 5: Wall shelf (jars + books), pendant lamp, string lights

**Files:**
- Modify: `src/scene/Kitchen.tsx`
- Modify: `src/scene/Kitchen.test.tsx`

**Interfaces:**
- Consumes: `createWoodGrainTexture` from `./proceduralTextures` (Task 1, already imported).

- [ ] **Step 1: Write the failing test**

Add to `src/scene/Kitchen.test.tsx`:

```tsx
  it('renders the wall shelf with jars and books, the pendant lamp, and string lights', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Kitchen />);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'shelf-jar' }).length).toBe(2);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'shelf-book' }).length).toBe(3);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'pendant-bulb' }).length).toBe(1);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'string-light' }).length).toBe(9);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/scene/Kitchen.test.tsx`
Expected: FAIL — none of these props exist yet.

- [ ] **Step 3: Implement**

In `src/scene/Kitchen.tsx`, add a `shelfWoodGrain` texture `useMemo` and the `stringLightPositions` `useMemo`, plus the new JSX. Add these constants above the component:

```tsx
const STRING_LIGHT_COUNT = 9;
const STRING_LIGHT_X_RANGE: [number, number] = [-8, 6];
const STRING_LIGHT_TOP_Y = 12.6;
const STRING_LIGHT_SAG = 1.1;
const STRING_LIGHT_Z = -5.35;
```

Add inside the component, alongside the other texture `useMemo`s:

```tsx
  const shelfWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [2, 1] }), []);

  const stringLightPositions = useMemo<[number, number, number][]>(() => {
    const [minX, maxX] = STRING_LIGHT_X_RANGE;
    return Array.from({ length: STRING_LIGHT_COUNT }, (_, i) => {
      const t = i / (STRING_LIGHT_COUNT - 1);
      const x = minX + t * (maxX - minX);
      const sag = STRING_LIGHT_SAG * (1 - (2 * t - 1) ** 2);
      const y = STRING_LIGHT_TOP_Y - sag;
      return [x, y, STRING_LIGHT_Z] as [number, number, number];
    });
  }, []);
```

Add this JSX block right after the curtains block (before the rug block, order doesn't matter visually but keep curtains/shelf/lamp/strings grouped together as "wall-mounted/hanging" props):

```tsx
      {/* Wall shelf with jars and books, mounted above the fridge */}
      <RoundedBox
        args={[2.4, 0.15, 0.7]}
        radius={0.05}
        smoothness={4}
        position={[4, 8.6, -5.3]}
        castShadow
        receiveShadow
      >
        <meshToonMaterial color="#c9975f" gradientMap={gradientMap} map={shelfWoodGrain} />
      </RoundedBox>
      <mesh position={[3.5, 8.9, -5.2]} castShadow data-kind="shelf-jar">
        <cylinderGeometry args={[0.18, 0.18, 0.5, 12]} />
        <meshToonMaterial color="#dce8e0" gradientMap={gradientMap} />
      </mesh>
      <mesh position={[4.5, 8.9, -5.2]} castShadow data-kind="shelf-jar">
        <cylinderGeometry args={[0.18, 0.18, 0.5, 12]} />
        <meshToonMaterial color="#dce8e0" gradientMap={gradientMap} />
      </mesh>
      <RoundedBox
        args={[0.5, 0.12, 0.35]}
        radius={0.02}
        smoothness={2}
        position={[4.1, 8.74, -5.35]}
        castShadow
        data-kind="shelf-book"
      >
        <meshToonMaterial color="#7a3b3b" gradientMap={gradientMap} />
      </RoundedBox>
      <RoundedBox
        args={[0.5, 0.12, 0.35]}
        radius={0.02}
        smoothness={2}
        position={[4.1, 8.86, -5.35]}
        castShadow
        data-kind="shelf-book"
      >
        <meshToonMaterial color="#3b5a7a" gradientMap={gradientMap} />
      </RoundedBox>
      <RoundedBox
        args={[0.5, 0.12, 0.35]}
        radius={0.02}
        smoothness={2}
        position={[4.1, 8.98, -5.35]}
        castShadow
        data-kind="shelf-book"
      >
        <meshToonMaterial color="#5a7a3b" gradientMap={gradientMap} />
      </RoundedBox>

      {/* Pendant lamp above the counter */}
      <mesh position={[-4, 7.15, -3]}>
        <cylinderGeometry args={[0.03, 0.03, 3.7, 8]} />
        <meshToonMaterial color="#3d2b1f" gradientMap={gradientMap} />
      </mesh>
      <mesh position={[-4, 5.3, -3]} data-kind="pendant-bulb">
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshToonMaterial color="#3d2b1f" gradientMap={gradientMap} emissive="#ffdca0" emissiveIntensity={1.5} />
      </mesh>
      <pointLight position={[-4, 5.3, -3]} color="#ffdca0" intensity={0.6} distance={6} decay={2} />

      {/* String lights along the back wall */}
      {stringLightPositions.map((position, index) => (
        <mesh key={index} position={position} data-kind="string-light">
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshToonMaterial color="#3d2b1f" gradientMap={gradientMap} emissive="#ffd97a" emissiveIntensity={1.2} />
        </mesh>
      ))}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/scene/Kitchen.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit -p . 2>&1 | grep -v '.worktrees'`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/scene/Kitchen.tsx src/scene/Kitchen.test.tsx
git commit -m "Add wall shelf, pendant lamp, and string lights to kitchen"
```

---

### Task 6: Plant leaf cluster + hanging herb bundle

**Files:**
- Modify: `src/scene/Kitchen.tsx`
- Modify: `src/scene/Kitchen.test.tsx`

- [ ] **Step 1: Write the failing test**

Add to `src/scene/Kitchen.test.tsx`:

```tsx
  it('renders a multi-leaf plant cluster and a hanging herb bundle', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Kitchen />);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'plant-leaf' }).length).toBe(5);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'herb-leaf' }).length).toBe(4);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/scene/Kitchen.test.tsx`
Expected: FAIL — 0 plant leaves, 0 herb leaves (the plant is still a single sphere).

- [ ] **Step 3: Implement**

In `src/scene/Kitchen.tsx`, add these constants above the component:

```tsx
const PLANT_LEAF_OFFSETS: Array<{ offset: [number, number, number]; scale: [number, number, number]; color: string }> = [
  { offset: [0, 0.3, 0], scale: [0.5, 0.9, 0.5], color: '#7a9e5a' },
  { offset: [0.3, 0.1, 0.15], scale: [0.45, 0.7, 0.45], color: '#6a8e4a' },
  { offset: [-0.3, 0.05, -0.15], scale: [0.45, 0.75, 0.45], color: '#8aa96a' },
  { offset: [0.15, 0.2, -0.3], scale: [0.4, 0.65, 0.4], color: '#7a9e5a' },
  { offset: [-0.2, 0.15, 0.3], scale: [0.4, 0.7, 0.4], color: '#6a8e4a' },
];

const HERB_LEAF_OFFSETS: Array<{ x: number; color: string }> = [
  { x: -0.18, color: '#6a8e4a' },
  { x: -0.06, color: '#8aa96a' },
  { x: 0.06, color: '#6a8e4a' },
  { x: 0.18, color: '#8aa96a' },
];
```

Replace the existing single-sphere plant mesh:

```tsx
      <mesh position={[-7, 4.2, -4]} castShadow>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshToonMaterial color="#7a9e5a" gradientMap={gradientMap} />
      </mesh>
```

with the leaf cluster and the new hanging herb bundle:

```tsx
      {PLANT_LEAF_OFFSETS.map(({ offset, scale, color }, index) => (
        <mesh
          key={index}
          position={[-7 + offset[0], 4.2 + offset[1], -4 + offset[2]]}
          scale={scale}
          castShadow
          data-kind="plant-leaf"
        >
          <sphereGeometry args={[0.35, 8, 8]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      ))}

      {/* Hanging herb bundle above the window */}
      <RoundedBox args={[0.5, 0.15, 0.15]} radius={0.04} smoothness={2} position={[-5, 8.3, -5.3]} castShadow>
        <meshToonMaterial color="#5a3a24" gradientMap={gradientMap} />
      </RoundedBox>
      {HERB_LEAF_OFFSETS.map(({ x, color }, index) => (
        <mesh
          key={index}
          position={[-5 + x, 8.0, -5.3]}
          rotation={[Math.PI, 0, 0]}
          castShadow
          data-kind="herb-leaf"
        >
          <coneGeometry args={[0.06, 0.6, 6]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      ))}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/scene/Kitchen.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit -p . 2>&1 | grep -v '.worktrees'`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/scene/Kitchen.tsx src/scene/Kitchen.test.tsx
git commit -m "Upgrade kitchen plant to a leaf cluster; add hanging herb bundle"
```

---

### Task 7: Fridge detail pass — handle, kick-plate, vents

**Files:**
- Modify: `src/scene/Fridge.tsx`
- Modify: `src/scene/Fridge.test.tsx`

- [ ] **Step 1: Write the failing test**

Update `src/scene/Fridge.test.tsx`'s existing assertion (39 → 44):

```tsx
import { describe, expect, it, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Fridge } from './Fridge';
import { useSceneStore } from '../state/sceneStore';

describe('Fridge', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
  });

  it('mounts without throwing and renders 35 magnets plus the fridge body/door/detailing', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Fridge />);
    const meshes = renderer.scene.children[0].children.filter((child) => child.type === 'Mesh');
    // body + door + handle + kick-plate + 3 vents + 35 magnets + SlamButton + TesseractButton
    expect(meshes.length).toBe(44);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/scene/Fridge.test.tsx`
Expected: FAIL — actual count is still 39.

- [ ] **Step 3: Implement**

In `src/scene/Fridge.tsx`, add the handle, kick-plate, and vent strips between the door `RoundedBox` and `<MagnetBoard>`:

```tsx
import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { MagnetBoard } from './MagnetBoard';
import { SCENES, BOARD_GROUP_POSITION } from '../engine/scenes';
import { createToonGradientMap } from './toonGradient';

const VENT_Y_POSITIONS = [7.72, 7.8, 7.88];

export function Fridge() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const doorZ = SCENES.kitchen.magnetSurfaceZ;

  return (
    <group position={BOARD_GROUP_POSITION}>
      <RoundedBox args={[3.5, 8, 3]} radius={0.1} smoothness={4} position={[0, 4, 0]} castShadow receiveShadow>
        <meshToonMaterial color="#f6d98a" gradientMap={gradientMap} />
      </RoundedBox>

      <RoundedBox args={[3.6, 7.8, 0.2]} radius={0.06} smoothness={4} position={[0, 4, 1.55]} receiveShadow>
        <meshToonMaterial color="#f6d98a" gradientMap={gradientMap} />
      </RoundedBox>

      {/* Door handle, offset near the door's right edge, outside the
          magnet board's bounds (x max 1.6) so it never overlaps magnets. */}
      <RoundedBox args={[0.12, 2.5, 0.12]} radius={0.04} smoothness={4} position={[1.72, 4, 1.7]} castShadow>
        <meshToonMaterial color="#3d2b1f" gradientMap={gradientMap} />
      </RoundedBox>

      {/* Kick-plate, a recessed dark strip grounding the fridge base. */}
      <RoundedBox args={[3.3, 0.4, 2.8]} radius={0.05} smoothness={4} position={[0, 0.2, 0]} castShadow receiveShadow>
        <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
      </RoundedBox>

      {/* Vent strips near the top of the door, above the magnet board's
          y-max (7.7) so they never overlap the magnet grid. */}
      {VENT_Y_POSITIONS.map((y, index) => (
        <RoundedBox
          key={index}
          args={[3.2, 0.06, 0.04]}
          radius={0.02}
          smoothness={2}
          position={[0, y, 1.68]}
          castShadow
        >
          <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
        </RoundedBox>
      ))}

      <MagnetBoard
        sceneId="kitchen"
        slamButtonPosition={[1.2, 3.2, doorZ]}
        tesseractButtonPosition={[1.2, 2.5, doorZ]}
      />
    </group>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/scene/Fridge.test.tsx`
Expected: PASS.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit -p . 2>&1 | grep -v '.worktrees'`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/scene/Fridge.tsx src/scene/Fridge.test.tsx
git commit -m "Add fridge door handle, kick-plate, and vent detailing"
```

---

### Task 8: KitchenAtmosphere — dust motes, night fireflies, kettle steam

**Files:**
- Create: `src/scene/KitchenAtmosphere.tsx`
- Create: `src/scene/KitchenAtmosphere.test.tsx`
- Modify: `src/scene/Kitchen.tsx`
- Modify: `src/scene/Kitchen.test.tsx`

**Interfaces:**
- Consumes: `createSoftCircleTexture` from `./proceduralTextures` (Task 1); `LightingPresetName` type from `../engine/lightingPresets` (existing).
- Produces: `KitchenAtmosphere({ lightingPreset, kettlePosition }: { lightingPreset: LightingPresetName; kettlePosition: [number, number, number] }): JSX.Element`, mounted by `Kitchen.tsx`.

- [ ] **Step 1: Write the failing tests**

Create `src/scene/KitchenAtmosphere.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { KitchenAtmosphere } from './KitchenAtmosphere';

const KETTLE_POSITION: [number, number, number] = [-2, 3.7, -3.3];

describe('KitchenAtmosphere', () => {
  it('mounts without throwing and renders the dust-mote sparkles and steam sprites', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <KitchenAtmosphere lightingPreset="day" kettlePosition={KETTLE_POSITION} />,
    );
    const points = renderer.scene.children.filter((child) => child.type === 'Points');
    // Only the dust-mote Sparkles instance during the day (no fireflies).
    expect(points.length).toBe(1);
    const sprites = renderer.scene.children.filter((child) => child.type === 'Sprite');
    expect(sprites.length).toBe(5);
  });

  it('adds a second (firefly) Sparkles instance when lightingPreset is night', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <KitchenAtmosphere lightingPreset="night" kettlePosition={KETTLE_POSITION} />,
    );
    const points = renderer.scene.children.filter((child) => child.type === 'Points');
    expect(points.length).toBe(2);
  });

  it('adds the firefly Sparkles instance during evening too, not just night', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <KitchenAtmosphere lightingPreset="evening" kettlePosition={KETTLE_POSITION} />,
    );
    const points = renderer.scene.children.filter((child) => child.type === 'Points');
    expect(points.length).toBe(2);
  });

  it('does not add fireflies during morning', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <KitchenAtmosphere lightingPreset="morning" kettlePosition={KETTLE_POSITION} />,
    );
    const points = renderer.scene.children.filter((child) => child.type === 'Points');
    expect(points.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/scene/KitchenAtmosphere.test.tsx`
Expected: FAIL with "Cannot find module './KitchenAtmosphere'".

- [ ] **Step 3: Write the implementation**

Create `src/scene/KitchenAtmosphere.tsx`:

```tsx
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { Sparkles } from '@react-three/drei';
import { createSoftCircleTexture } from './proceduralTextures';
import type { LightingPresetName } from '../engine/lightingPresets';

export interface KitchenAtmosphereProps {
  lightingPreset: LightingPresetName;
  kettlePosition: [number, number, number];
}

const STEAM_PARTICLE_COUNT = 5;
const STEAM_LOOP_DURATION = 2.6;
const STEAM_RISE_HEIGHT = 1.4;

/**
 * Ambient dust motes, kettle steam, and (evening/night-only) fireflies for
 * the kitchen scene. Kept in its own file/component so Kitchen.tsx's
 * room-prop JSX doesn't also have to carry all the particle/animation
 * logic — mounted as a plain sibling inside Kitchen.tsx's fragment.
 *
 * Steam is animated via gsap timelines directly on each sprite's
 * position/scale/material.opacity, matching this project's existing
 * animation pattern (see SlamButton.tsx) rather than introducing a new
 * useFrame-based particle system.
 */
export function KitchenAtmosphere({ lightingPreset, kettlePosition }: KitchenAtmosphereProps) {
  const steamTexture = useMemo(() => createSoftCircleTexture(), []);
  const steamRefs = useRef<(THREE.Sprite | null)[]>([]);

  useEffect(() => {
    const [kx, ky, kz] = kettlePosition;
    const timelines = steamRefs.current.map((sprite, index) => {
      if (!sprite) return null;
      const material = sprite.material as THREE.SpriteMaterial;
      const drift = index % 2 === 0 ? 0.3 : -0.3;
      const delay = (index / STEAM_PARTICLE_COUNT) * STEAM_LOOP_DURATION;

      const tl = gsap.timeline({ repeat: -1, delay });
      tl.set(sprite.position, { x: kx, y: ky, z: kz })
        .set(sprite.scale, { x: 0.2, y: 0.2, z: 1 })
        .set(material, { opacity: 0 })
        .to(material, { opacity: 0.35, duration: STEAM_LOOP_DURATION * 0.2, ease: 'sine.out' }, 0)
        .to(
          sprite.position,
          { x: kx + drift, y: ky + STEAM_RISE_HEIGHT, duration: STEAM_LOOP_DURATION, ease: 'sine.inOut' },
          0,
        )
        .to(sprite.scale, { x: 0.6, y: 0.6, duration: STEAM_LOOP_DURATION, ease: 'sine.out' }, 0)
        .to(material, { opacity: 0, duration: STEAM_LOOP_DURATION * 0.3, ease: 'sine.in' }, STEAM_LOOP_DURATION * 0.7);
      return tl;
    });

    return () => {
      timelines.forEach((tl) => tl?.kill());
    };
  }, [kettlePosition]);

  const showFireflies = lightingPreset === 'evening' || lightingPreset === 'night';

  return (
    <>
      <Sparkles
        count={25}
        scale={[3, 3, 2]}
        size={2}
        speed={0.15}
        color="#fff3d6"
        opacity={0.35}
        position={[-5, 5, -3]}
      />
      {showFireflies && (
        <Sparkles
          count={12}
          scale={[4, 2, 3]}
          size={3}
          speed={0.3}
          color="#ffd97a"
          opacity={0.6}
          position={[-7, 4.5, -3]}
        />
      )}
      {Array.from({ length: STEAM_PARTICLE_COUNT }, (_, index) => (
        <sprite
          key={index}
          ref={(el) => {
            steamRefs.current[index] = el;
          }}
        >
          <spriteMaterial map={steamTexture} transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/scene/KitchenAtmosphere.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Mount KitchenAtmosphere in Kitchen.tsx**

In `src/scene/Kitchen.tsx`, add the import and a `KETTLE_STEAM_ORIGIN` constant, then mount `<KitchenAtmosphere>` as the last element in the returned fragment:

```tsx
import { KitchenAtmosphere } from './KitchenAtmosphere';
```

```tsx
const KETTLE_STEAM_ORIGIN: [number, number, number] = [-2, 3.7, -3.3];
```

(Add this constant near the other top-level constants like `NIGHT_STAR_COUNT`. It's a separate constant from the kettle mesh's own `position={[-2, 3.4, -3.5]}` — deliberately offset up and slightly forward so steam appears to rise from the kettle's spout rather than its exact center.)

At the very end of the returned fragment (after the herb bundle from Task 6), add:

```tsx
      <KitchenAtmosphere lightingPreset={lightingPreset} kettlePosition={KETTLE_STEAM_ORIGIN} />
```

- [ ] **Step 6: Update Kitchen.test.tsx for the new child count/behavior**

Add to `src/scene/Kitchen.test.tsx`:

```tsx
  it('mounts KitchenAtmosphere, which adds firefly sparkles only at night', async () => {
    useSceneStore.setState({ lightingPreset: 'day' });
    const dayRenderer = await ReactThreeTestRenderer.create(<Kitchen />);
    const dayPoints = dayRenderer.scene.findAllByType('Points');
    expect(dayPoints.length).toBe(1);

    useSceneStore.setState({ lightingPreset: 'night' });
    const nightRenderer = await ReactThreeTestRenderer.create(<Kitchen />);
    const nightPoints = nightRenderer.scene.findAllByType('Points');
    expect(nightPoints.length).toBe(2);
  });
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx vitest run src/scene/Kitchen.test.tsx src/scene/KitchenAtmosphere.test.tsx`
Expected: PASS (8 total: 7 in Kitchen.test.tsx + ... recount: Task 2 added 1, Task 3 replaced smoke+texture tests and added 1 more within the same `describe` for a running total of 3, Task 4 added 1 (4), Task 5 added 1 (5), Task 6 added 1 (6), this step adds 1 more (7) — expect 7 tests in `Kitchen.test.tsx` and 4 in `KitchenAtmosphere.test.tsx`).

- [ ] **Step 8: Typecheck**

Run: `npx tsc --noEmit -p . 2>&1 | grep -v '.worktrees'`
Expected: no output.

- [ ] **Step 9: Commit**

```bash
git add src/scene/Kitchen.tsx src/scene/Kitchen.test.tsx src/scene/KitchenAtmosphere.tsx src/scene/KitchenAtmosphere.test.tsx
git commit -m "Add kitchen atmosphere: dust motes, night fireflies, kettle steam"
```

---

### Task 9: Full verification, tightened smoke assertion, visual check, final commit

**Files:**
- Modify: `src/scene/Kitchen.test.tsx` (tighten the original loose mesh-count assertion)

- [ ] **Step 1: Tighten the original smoke-test lower bound**

In `src/scene/Kitchen.test.tsx`, update the first test (from `expect(meshes.length).toBeGreaterThanOrEqual(3)`) to reflect the much richer scene, still as a loose lower bound (not a brittle exact count, since exact prop counts are already covered by the more specific tests added in Tasks 2-8):

```tsx
  it('mounts without throwing and renders at least a floor and two walls', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Kitchen />);
    const meshes = renderer.scene.children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBeGreaterThanOrEqual(30);
  });
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test -- --run 2>&1 | tail -30`
Expected: all tests pass except the 2 pre-existing, unrelated failures in `.worktrees/music-visualizer-phase-0/music-visualizer/src/App.test.tsx` (a `useState`/null-React hook error that predates this plan and is out of scope).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p . 2>&1 | grep -v '.worktrees'`
Expected: no output.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Visual verification via Playwright (manual, not an automated test)**

Start the dev server if not already running: `npm run dev -- --port 5199 --strictPort` (background). Then, using a short Playwright script (ad hoc, not committed to the repo):
1. Navigate to the app, confirm the kitchen scene loads by default.
2. Take a screenshot of the overview camera framing (rug, curtains, shelf, string lights, pendant lamp, plant cluster, herb bundle all visible and not clipping through walls/floor, and not overlapping the fridge's magnet area).
3. Zoom into the fridge (click the fridge/canvas per this project's existing zoom interaction) and screenshot the door — confirm the handle/kick-plate/vents look correct and don't overlap any magnets.
4. Use the HUD's lighting/time controls (or `useSceneStore.setState`, if testing via console) to force `lightingPreset: 'night'`, re-screenshot the overview: confirm night stars appear in the window, string lights and pendant lamp read as warm glowing points, and firefly sparkles are visible near the plant/window.
5. Confirm the kettle has a faint rising/fading steam wisp over a couple of seconds (may require two screenshots a second or two apart, or a short screen recording).

If anything looks wrong (clipping, overlap, a prop invisible/miscolored), fix it with a targeted follow-up change before proceeding — do not skip this step or assume the code is correct from source alone.

- [ ] **Step 6: Final commit**

```bash
git add src/scene/Kitchen.test.tsx
git commit -m "Tighten Kitchen smoke test lower bound after atmosphere pass"
git push origin main
```

---

## Self-Review Notes

- **Spec coverage:** Pendant lamp/string lights/rug/curtains/shelf (Tasks 4-5), particle effects — dust motes/steam/fireflies (Task 8), procedural grain/wood-grain textures (Tasks 1-2), window backdrop tied to lighting + night stars (Task 3), plant/herb upgrade (Task 6), fridge detail pass (Task 7) — all spec sections have a corresponding task.
- **Placeholder scan:** No TBD/TODO markers; every step has literal, complete code.
- **Type consistency:** `KitchenAtmosphereProps` (`lightingPreset: LightingPresetName`, `kettlePosition: [number, number, number]`) matches the call site added in Task 8 Step 5. `createGrainTexture`/`createWoodGrainTexture`/`createSkyGradientTexture`/`createSoftCircleTexture`/`createSeededRng` signatures from Task 1 are used identically (same parameter names/shapes) everywhere they're consumed in Tasks 2, 3, 5, 8.
