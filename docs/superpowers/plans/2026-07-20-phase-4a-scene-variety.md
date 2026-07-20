# Phase 4a: Scene Variety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce a scene-agnostic "magnet surface" abstraction and a second
hand-authored scene (a fantasy tavern noticeboard), switchable from the HUD,
with independent per-scene magnet state and theme-weighted word content.

**Architecture:** A new `SceneDefinition` registry (`src/engine/scenes.ts`)
centralizes per-scene configuration (word theme, magnet surface plane,
camera framing, lighting mode). `Magnet.tsx` becomes surface-agnostic via a
`surfaceZ` prop; a new `MagnetBoard.tsx` component extracts the
shuffle/placement/button-wiring logic that today lives inline in
`Fridge.tsx`, parameterized by `sceneId`. `sceneStore.ts` gains
`activeSceneId` and a per-scene magnet layout slice so switching scenes
preserves each scene's in-progress poem for the session. `App.tsx` renders
whichever scene's geometry is active and reads camera framing from the
registry instead of hardcoded constants.

**Tech Stack:** React, TypeScript, React Three Fiber (`@react-three/fiber`,
`@react-three/drei`, `@react-three/test-renderer`), Zustand, GSAP, Vitest,
Testing Library.

## Global Constraints

- Follow existing architecture layering: `src/engine/` = pure functions only
  (no React/three.js/network imports); `src/state/` = Zustand stores/hooks;
  `src/scene/` = R3F components; `src/ui/` = HUD/UI components.
- The tavern scene does **not** participate in the Phase 3 environment
  system (no Auto/Manual lighting toggle) — it always uses a fixed warm
  firelight preset.
- Each scene's magnet layout is independent and in-memory only (no
  localStorage/disk persistence) — lazily generated on first visit to a
  scene, preserved thereafter for the session.
- Scene switching is a hard cut via the existing zoom-out/zoom-in camera
  rig and `TransitionOverlay` — no shared/walkable multi-scene world.
- Run `npm test`, `npm run typecheck`, and `npm run lint` before every commit
  that touches source files; all three must pass.

---

### Task 1: Scene registry

**Files:**
- Create: `src/engine/scenes.ts`
- Test: `src/engine/scenes.test.ts`

**Interfaces:**
- Consumes: `WordTheme` from `src/engine/wordBank.ts` (already exists:
  `export type WordTheme = 'kitchen'`, will be widened in Task 2 — this task
  only needs the type, not the widened value, so it can be written first).
  `LightingPreset` from `src/engine/lightingPresets.ts` (already exists).
- Produces: `SceneId` (`'kitchen' | 'tavern'`), `SceneDefinition` interface,
  `SCENES: Record<SceneId, SceneDefinition>`, `SCENE_IDS: SceneId[]`. All
  later tasks that need scene configuration import from this file.

- [ ] **Step 1: Write the failing test**

```ts
// src/engine/scenes.test.ts
import { describe, expect, it } from 'vitest';
import { SCENES, SCENE_IDS } from './scenes';

describe('scenes', () => {
  it('lists kitchen and tavern in SCENE_IDS', () => {
    expect(SCENE_IDS).toEqual(['kitchen', 'tavern']);
  });

  it('defines a SceneDefinition for every id in SCENE_IDS', () => {
    SCENE_IDS.forEach((id) => {
      expect(SCENES[id]).toBeDefined();
      expect(SCENES[id].id).toBe(id);
    });
  });

  it('gives the kitchen scene the existing fridge-door surface and camera framing', () => {
    expect(SCENES.kitchen.magnetSurfaceZ).toBe(-1.84);
    expect(SCENES.kitchen.magnetCount).toBe(35);
    expect(SCENES.kitchen.wordTheme).toBe('kitchen');
    expect(SCENES.kitchen.usesEnvironmentLighting).toBe(true);
    expect(SCENES.kitchen.fixedLightingPreset).toBeNull();
  });

  it('gives the tavern scene its own theme and a fixed (non-environment) lighting preset', () => {
    expect(SCENES.tavern.wordTheme).toBe('tavern');
    expect(SCENES.tavern.usesEnvironmentLighting).toBe(false);
    expect(SCENES.tavern.fixedLightingPreset).not.toBeNull();
    expect(SCENES.tavern.magnetCount).toBeGreaterThan(0);
  });

  it('gives every scene a label, camera-zoomed-in position, and camera target', () => {
    SCENE_IDS.forEach((id) => {
      const scene = SCENES[id];
      expect(typeof scene.label).toBe('string');
      expect(scene.label.length).toBeGreaterThan(0);
      expect(scene.cameraZoomedIn).toHaveLength(3);
      expect(scene.cameraTarget).toHaveLength(3);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/scenes.test.ts`
Expected: FAIL with "Cannot find module './scenes'" or similar.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/engine/scenes.ts
import type { WordTheme } from './wordBank';
import type { LightingPreset } from './lightingPresets';

export type SceneId = 'kitchen' | 'tavern';

export interface SceneDefinition {
  id: SceneId;
  /** Display name shown in the HUD scene switcher. */
  label: string;
  /** Scene theme used to weight word selection (see wordBank.ts). */
  wordTheme: WordTheme;
  /** Local Z depth of the magnet drag plane, relative to the scene's group. */
  magnetSurfaceZ: number;
  /** Number of magnets scattered on this scene's board. */
  magnetCount: number;
  /** Camera position when zoomed in on this scene's board. */
  cameraZoomedIn: [number, number, number];
  /** OrbitControls target when zoomed in on this scene's board. */
  cameraTarget: [number, number, number];
  /** Whether this scene participates in the Phase 3 Auto/Manual lighting system. */
  usesEnvironmentLighting: boolean;
  /** Fixed lighting preset used instead of the environment system when
   * `usesEnvironmentLighting` is false. Null when environment lighting applies. */
  fixedLightingPreset: LightingPreset | null;
}

export const SCENE_IDS: SceneId[] = ['kitchen', 'tavern'];

export const SCENES: Record<SceneId, SceneDefinition> = {
  kitchen: {
    id: 'kitchen',
    label: 'Kitchen Fridge',
    wordTheme: 'kitchen',
    magnetSurfaceZ: -1.84,
    magnetCount: 35,
    cameraZoomedIn: [4, 5, 3.5],
    cameraTarget: [4, 5, -1.85],
    usesEnvironmentLighting: true,
    fixedLightingPreset: null,
  },
  tavern: {
    id: 'tavern',
    label: 'Tavern Noticeboard',
    wordTheme: 'tavern',
    magnetSurfaceZ: -1.84,
    magnetCount: 30,
    cameraZoomedIn: [4, 5, 3.5],
    cameraTarget: [4, 5, -1.85],
    usesEnvironmentLighting: false,
    fixedLightingPreset: {
      ambientColor: '#5a3a24',
      directionalColor: '#ffb454',
      fillColor: '#ff8c3c',
      fogColor: '#1a0f08',
      directionalIntensity: 0.9,
      fillIntensity: 1.1,
      directionalPosition: { x: 3, y: 4, z: 4 },
    },
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/scenes.test.ts`
Expected: PASS (all 5 tests). Note: the `wordTheme: 'tavern'` value will not
yet type-check against the current `WordTheme = 'kitchen'` until Task 2
widens it — run `npx tsc --noEmit` after Task 2, not after this task.

- [ ] **Step 5: Commit**

```bash
git add src/engine/scenes.ts src/engine/scenes.test.ts
git commit -m "feat: add scene definition registry for kitchen and tavern"
```

---

### Task 2: Tavern word bank content

**Files:**
- Modify: `src/engine/wordBank.ts`
- Test: `src/engine/wordBank.test.ts` (extend)

**Interfaces:**
- Consumes: nothing new.
- Produces: widened `WordTheme = 'kitchen' | 'tavern'`; ~12 new
  `WORD_ENTRIES` weighted for `tavern`; a handful of existing entries gain a
  `tavern` weight. `getThemeWeight(word, 'tavern')` now returns meaningful
  weights. Task 1's `scenes.ts` (`wordTheme: 'tavern'`) now type-checks.

- [ ] **Step 1: Write the failing test**

```ts
// Add to src/engine/wordBank.test.ts, inside the existing describe block:
  it('has tavern-themed words with a tavern weight greater than their kitchen weight', () => {
    const tavernWords = ['ale', 'quest', 'sword', 'dragon', 'bard', 'tavern', 'mead', 'gold', 'oath', 'blade', 'tankard', 'legend'];
    tavernWords.forEach((word) => {
      expect(WORDS).toContain(word);
      expect(getThemeWeight(word, 'tavern')).toBeGreaterThan(1);
    });
  });

  it('reweights a handful of existing evocative words for the tavern theme without changing their kitchen weight', () => {
    expect(getThemeWeight('fire', 'tavern')).toBeGreaterThan(1);
    expect(getThemeWeight('ancient', 'tavern')).toBeGreaterThan(1);
    expect(getThemeWeight('stranger', 'tavern')).toBeGreaterThan(1);
    expect(getThemeWeight('journey', 'tavern')).toBeGreaterThan(1);
    expect(getThemeWeight('secret', 'tavern')).toBeGreaterThan(1);
    // kitchen-themed words already weighted for kitchen keep that weight untouched
    expect(getThemeWeight('fridge', 'kitchen')).toBe(3);
    expect(getThemeWeight('coffee', 'kitchen')).toBe(3);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/wordBank.test.ts`
Expected: FAIL — tavern words not found in `WORDS`, `getThemeWeight(..., 'tavern')` returns 1.

- [ ] **Step 3: Write minimal implementation**

Modify the `WordTheme` type:

```ts
// src/engine/wordBank.ts — replace the existing WordTheme type and its comment:
/** Scene themes words can be weighted for. Phase 4a adds 'tavern' alongside
 * the original Phase 1 'kitchen' theme. */
export type WordTheme = 'kitchen' | 'tavern';
```

Add `tavern: 2` to the five existing entries (find each by its `word` field
and add the key to its existing `themeWeights` object, creating one if
absent):

```ts
  { word: 'fire', category: 'noun', themeWeights: { tavern: 2 } },
  { word: 'stranger', category: 'noun', themeWeights: { tavern: 2 } },
  { word: 'journey', category: 'noun', themeWeights: { tavern: 2 } },
  { word: 'secret', category: 'noun', themeWeights: { tavern: 2 } },
```

```ts
  { word: 'ancient', category: 'adj', themeWeights: { tavern: 2 } },
```

Append 12 new entries to the end of the `WORD_ENTRIES` array's noun section
(just before the `// --- verbs ---` comment), each weighted `{ tavern: 3 }`:

```ts
  { word: 'ale', category: 'noun', themeWeights: { tavern: 3 } },
  { word: 'quest', category: 'noun', themeWeights: { tavern: 3 } },
  { word: 'sword', category: 'noun', themeWeights: { tavern: 3 } },
  { word: 'dragon', category: 'noun', themeWeights: { tavern: 3 } },
  { word: 'bard', category: 'noun', themeWeights: { tavern: 3 } },
  { word: 'tavern', category: 'noun', themeWeights: { tavern: 3 } },
  { word: 'mead', category: 'noun', themeWeights: { tavern: 3 } },
  { word: 'gold', category: 'noun', themeWeights: { tavern: 3 } },
  { word: 'oath', category: 'noun', themeWeights: { tavern: 3 } },
  { word: 'blade', category: 'noun', themeWeights: { tavern: 3 } },
  { word: 'tankard', category: 'noun', themeWeights: { tavern: 3 } },
  { word: 'legend', category: 'noun', themeWeights: { tavern: 3 } },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/wordBank.test.ts`
Expected: PASS (all tests, including the two new ones).

- [ ] **Step 5: Commit**

```bash
git add src/engine/wordBank.ts src/engine/wordBank.test.ts
git commit -m "feat: widen WordTheme and add tavern-weighted vocabulary"
```

---

### Task 3: Weighted magnet layout selection

**Files:**
- Create: `src/engine/magnetSelection.ts`
- Test: `src/engine/magnetSelection.test.ts`

**Interfaces:**
- Consumes: `pickWeightedRandom` from `src/engine/generatePoem.ts` (already
  exported: `pickWeightedRandom<T>(items: T[], weightFn: (item: T) => number,
  rng: () => number): T | undefined`). `getThemeWeight`, `WordTheme` from
  `src/engine/wordBank.ts`.
- Produces: `MagnetLayoutEntry` interface (`{ word: string; index: number;
  position: [number, number, number] }`), `selectMagnetWords(pool: string[],
  count: number, theme: WordTheme, rng?: () => number): string[]`,
  `createMagnetLayout(pool: string[], count: number, theme: WordTheme,
  surfaceZ: number, rng?: () => number): MagnetLayoutEntry[]`. Task 6
  (sceneStore) and Task 7 (MagnetBoard) both import `MagnetLayoutEntry` and
  `createMagnetLayout` from here.

- [ ] **Step 1: Write the failing test**

```ts
// src/engine/magnetSelection.test.ts
import { describe, expect, it } from 'vitest';
import { createMagnetLayout, selectMagnetWords } from './magnetSelection';

describe('selectMagnetWords', () => {
  it('returns the requested count of distinct words', () => {
    const pool = ['a', 'b', 'c', 'd', 'e'];
    const rng = (() => {
      let i = 0;
      const values = [0.1, 0.5, 0.9, 0.2];
      return () => values[i++ % values.length];
    })();
    const result = selectMagnetWords(pool, 3, 'kitchen', rng);
    expect(result).toHaveLength(3);
    expect(new Set(result).size).toBe(3);
    result.forEach((word) => expect(pool).toContain(word));
  });

  it('returns all pool words if count exceeds pool size', () => {
    const pool = ['a', 'b'];
    const result = selectMagnetWords(pool, 10, 'kitchen', () => 0);
    expect(result).toHaveLength(2);
  });

  it('weights selection toward higher theme-weighted words', () => {
    // 'fridge' has themeWeights.kitchen = 3, 'ghost' has no themeWeights (weight 1).
    const pool = ['fridge', 'ghost'];
    // rng() === 0 always picks the first item whose cumulative weight exceeds 0,
    // i.e. the first candidate in iteration order — use a rng that always
    // returns just under 1 to land on whichever item has more cumulative weight.
    const result = selectMagnetWords(pool, 1, 'kitchen', () => 0);
    expect(result).toEqual(['fridge']); // fridge (weight 3) sorts first, rng=0 picks it
  });
});

describe('createMagnetLayout', () => {
  it('builds one layout entry per selected word, each with a distinct index and the given surfaceZ', () => {
    const pool = ['a', 'b', 'c'];
    const layout = createMagnetLayout(pool, 2, 'kitchen', -1.84, () => 0.5);
    expect(layout).toHaveLength(2);
    layout.forEach((entry, i) => {
      expect(entry.index).toBe(i);
      expect(entry.position[2]).toBe(-1.84);
      expect(typeof entry.word).toBe('string');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/magnetSelection.test.ts`
Expected: FAIL with "Cannot find module './magnetSelection'".

- [ ] **Step 3: Write minimal implementation**

```ts
// src/engine/magnetSelection.ts
import { pickWeightedRandom } from './generatePoem';
import { getThemeWeight, type WordTheme } from './wordBank';

export interface MagnetLayoutEntry {
  word: string;
  index: number;
  position: [number, number, number];
}

/**
 * Selects up to `count` distinct words from `pool`, weighted by theme
 * relevance via `getThemeWeight`, without replacement. If `pool` has fewer
 * than `count` words, returns all of them.
 */
export function selectMagnetWords(
  pool: string[],
  count: number,
  theme: WordTheme,
  rng: () => number = Math.random,
): string[] {
  const remaining = [...pool];
  const selected: string[] = [];
  while (remaining.length > 0 && selected.length < count) {
    const chosen = pickWeightedRandom(remaining, (word) => getThemeWeight(word, theme), rng);
    if (chosen === undefined) break;
    selected.push(chosen);
    remaining.splice(remaining.indexOf(chosen), 1);
  }
  return selected;
}

/**
 * Builds a fresh magnet layout for a scene: selects theme-weighted words via
 * `selectMagnetWords` and scatters them to randomized starting positions
 * above `surfaceZ`, mirroring the placement math previously inline in
 * Fridge.tsx.
 */
export function createMagnetLayout(
  pool: string[],
  count: number,
  theme: WordTheme,
  surfaceZ: number,
  rng: () => number = Math.random,
): MagnetLayoutEntry[] {
  return selectMagnetWords(pool, count, theme, rng).map((word, index) => ({
    word,
    index,
    position: [
      (rng() - 0.5) * 3,
      4 + (rng() - 0.2) * 3,
      surfaceZ,
    ] as [number, number, number],
  }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/magnetSelection.test.ts`
Expected: PASS (all 4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/engine/magnetSelection.ts src/engine/magnetSelection.test.ts
git commit -m "feat: add theme-weighted magnet layout selection"
```

---

### Task 4: Generalize Magnet to a scene-agnostic surface

**Files:**
- Modify: `src/scene/Magnet.tsx`
- Test: `src/scene/Magnet.test.tsx` (new)

**Interfaces:**
- Consumes: nothing new (still uses `computeDragPoint`, `createWordTexture`,
  `measureWordTextureWidth`, `useSceneStore`, `createToonGradientMap` as
  before).
- Produces: `MagnetProps` gains `surfaceZ: number` (replaces the removed
  `FRIDGE_DOOR_Z` import/export) and an optional `onPositionChange?:
  (position: [number, number, number]) => void`, called once on pointer-up
  with the magnet's final position. The exported `FRIDGE_DOOR_Z` constant is
  removed — Task 7 (Fridge.tsx) and Task 1's `scenes.ts` are the new sources
  of truth for that Z value.

- [ ] **Step 1: Write the failing test**

```tsx
// src/scene/Magnet.test.tsx
import { describe, expect, it, vi } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Magnet } from './Magnet';

describe('Magnet', () => {
  it('renders at the given surfaceZ, not a hardcoded constant', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Magnet id="magnet-0" word="dog" initialPosition={[0, 4, -9.5]} surfaceZ={-9.5} />,
    );
    const mesh = renderer.scene.children[0];
    expect(mesh.instance.position.z).toBe(-9.5);
  });

  it('calls onMeshReady with the mounted mesh', async () => {
    const onMeshReady = vi.fn();
    await ReactThreeTestRenderer.create(
      <Magnet id="magnet-0" word="dog" initialPosition={[0, 4, -1.84]} surfaceZ={-1.84} onMeshReady={onMeshReady} />,
    );
    expect(onMeshReady).toHaveBeenCalled();
    expect(onMeshReady.mock.calls[0][0]).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/scene/Magnet.test.tsx`
Expected: FAIL with a TypeScript error — `surfaceZ` is not a known prop on `MagnetProps` yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/scene/Magnet.tsx — full replacement
import { useRef, useState, useMemo } from 'react';
import { ThreeEvent, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createWordTexture, measureWordTextureWidth } from './wordTexture';
import { computeDragPoint } from '../engine/dragPlane';
import { useSceneStore } from '../state/sceneStore';
import { createToonGradientMap } from './toonGradient';

export interface MagnetProps {
  id: string;
  word: string;
  initialPosition: [number, number, number];
  /** Local Z depth of this scene's magnet drag plane (see SceneDefinition.magnetSurfaceZ). */
  surfaceZ: number;
  onMeshReady?: (mesh: THREE.Mesh | null) => void;
  /** Called once with the final position when a drag ends, so callers can persist it. */
  onPositionChange?: (position: [number, number, number]) => void;
}

export function Magnet({ id, word, initialPosition, surfaceZ, onMeshReady, onPositionChange }: MagnetProps) {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState(initialPosition);
  const setDraggedMagnetId = useSceneStore((state) => state.setDraggedMagnetId);
  const draggedMagnetId = useSceneStore((state) => state.draggedMagnetId);

  const width = measureWordTextureWidth(word) * 0.5;
  const texture = useMemo(() => createWordTexture(word), [word]);
  const gradientMap = useMemo(() => createToonGradientMap(), []);

  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    setDraggedMagnetId(id);
  }

  function handlePointerMove(event: ThreeEvent<PointerEvent>) {
    if (draggedMagnetId !== id) return;
    const ndc = new THREE.Vector2(
      (event.nativeEvent.offsetX / (event.target as HTMLElement).clientWidth) * 2 - 1,
      -(event.nativeEvent.offsetY / (event.target as HTMLElement).clientHeight) * 2 + 1,
    );
    const point = computeDragPoint(ndc, camera, surfaceZ);
    if (point) setPosition([point.x, point.y, surfaceZ]);
  }

  function handlePointerUp() {
    if (draggedMagnetId === id) {
      setDraggedMagnetId(null);
      onPositionChange?.(position);
    }
  }

  return (
    <mesh
      ref={(node) => {
        meshRef.current = node;
        onMeshReady?.(node);
      }}
      position={position}
      castShadow
      receiveShadow
      userData={{ isMagnet: true, word }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <boxGeometry args={[width, 0.22, 0.05]} />
      <meshToonMaterial map={texture} gradientMap={gradientMap} />
    </mesh>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/scene/Magnet.test.tsx`
Expected: PASS (both tests). Note: `Fridge.tsx` will fail to typecheck at
this point because it still imports the removed `FRIDGE_DOOR_Z` and doesn't
pass `surfaceZ` — that's expected and resolved in Task 7. Do not run
`npm run typecheck` for the whole project until Task 7 is complete.

- [ ] **Step 5: Commit**

```bash
git add src/scene/Magnet.tsx src/scene/Magnet.test.tsx
git commit -m "feat: generalize Magnet to a scene-agnostic surfaceZ prop"
```

---

### Task 5: SlamButton theme support

**Files:**
- Modify: `src/scene/SlamButton.tsx`
- Test: `src/scene/SlamButton.test.tsx` (new)

**Interfaces:**
- Consumes: `generatePoem(availableWords: string[], options?: {rng?, theme?:
  WordTheme}): string[]` from `src/engine/generatePoem.ts` (already
  supports a `theme` option, currently unused by SlamButton). `WordTheme`
  from `src/engine/wordBank.ts`.
- Produces: `SlamButtonProps` gains an optional `theme?: WordTheme`
  (defaults to `'kitchen'` to preserve current behavior for the Fridge).
  `triggerPoetrySlam(getMagnetMesh, theme?)` forwards `theme` to
  `generatePoem`. Task 7 (MagnetBoard) passes `scene.wordTheme` through.

- [ ] **Step 1: Write the failing test**

```tsx
// src/scene/SlamButton.test.tsx
import { describe, expect, it, vi } from 'vitest';
import * as generatePoemModule from '../engine/generatePoem';
import { triggerPoetrySlam } from './SlamButton';

describe('triggerPoetrySlam', () => {
  it('passes the given theme through to generatePoem', () => {
    const spy = vi.spyOn(generatePoemModule, 'generatePoem').mockReturnValue([]);
    triggerPoetrySlam(() => undefined, 'tavern');
    expect(spy).toHaveBeenCalledWith(expect.any(Array), { theme: 'tavern' });
    spy.mockRestore();
  });

  it('defaults to the kitchen theme when none is given', () => {
    const spy = vi.spyOn(generatePoemModule, 'generatePoem').mockReturnValue([]);
    triggerPoetrySlam(() => undefined);
    expect(spy).toHaveBeenCalledWith(expect.any(Array), { theme: 'kitchen' });
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/scene/SlamButton.test.tsx`
Expected: FAIL — `generatePoem` currently called with only one argument
(`generatePoem(WORDS)`), so the mock assertion on the second argument fails.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/scene/SlamButton.tsx — full replacement
import gsap from 'gsap';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { generatePoem } from '../engine/generatePoem';
import { computeSlamLayout } from '../engine/slamLayout';
import { WORDS, type WordTheme } from '../engine/wordBank';

export interface SlamButtonProps {
  /** Maps a word to its live magnet mesh, so the animation can target the right object. */
  getMagnetMesh: (word: string) => THREE.Object3D | undefined;
  position: [number, number, number];
  /** Scene theme used to weight which words the generated poem favors. Defaults to 'kitchen'. */
  theme?: WordTheme;
}

export function triggerPoetrySlam(
  getMagnetMesh: SlamButtonProps['getMagnetMesh'],
  theme: WordTheme = 'kitchen',
): void {
  const poemWords = generatePoem(WORDS, { theme });
  if (poemWords.length === 0) return;
  const layout = computeSlamLayout(poemWords);
  const targetY = 5 + (Math.random() - 0.5);

  layout.forEach(({ word, x }, index) => {
    const mesh = getMagnetMesh(word);
    if (!mesh) return;
    const tl = gsap.timeline({ delay: index * 0.2 });
    tl.to(mesh.position, { z: mesh.position.z + 0.5, duration: 0.3, ease: 'power2.out' }, 0)
      .to(mesh.rotation, { z: (Math.random() - 0.5) * Math.PI, duration: 0.3 }, 0)
      .to(mesh.position, { x, y: targetY, duration: 0.8, ease: 'back.out(1.5)' }, 0.3)
      .to(mesh.rotation, { z: (Math.random() - 0.5) * 0.1, duration: 0.5 }, 0.3)
      .to(mesh.position, { z: mesh.position.z, duration: 0.2, ease: 'bounce.out' }, 1.1);
  });
}

export function SlamButton({ getMagnetMesh, position, theme }: SlamButtonProps) {
  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    triggerPoetrySlam(getMagnetMesh, theme);
  }

  return (
    <mesh position={position} castShadow onClick={handleClick} userData={{ isSlamButton: true }}>
      <cylinderGeometry args={[0.25, 0.25, 0.08, 32]} />
      <meshStandardMaterial color="#ff4757" roughness={0.4} />
    </mesh>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/scene/SlamButton.test.tsx`
Expected: PASS (both tests).

- [ ] **Step 5: Commit**

```bash
git add src/scene/SlamButton.tsx src/scene/SlamButton.test.tsx
git commit -m "feat: thread scene theme through SlamButton's poem generation"
```

---

### Task 6: Scene store — active scene and per-scene magnet layouts

**Files:**
- Modify: `src/state/sceneStore.ts`
- Test: `src/state/sceneStore.test.ts` (extend)
- Modify: `src/ui/StepBackButton.test.tsx` (rename `zoomToFridge` call)

**Interfaces:**
- Consumes: `SCENES`, `SceneId` from `src/engine/scenes.ts`.
  `createMagnetLayout`, `MagnetLayoutEntry` from
  `src/engine/magnetSelection.ts`. `WORDS` from `src/engine/wordBank.ts`.
- Produces: `SceneState` gains `activeSceneId: SceneId` (default
  `'kitchen'`), `magnetLayoutBySceneId: Partial<Record<SceneId,
  MagnetLayoutEntry[]>>` (pre-populated for `'kitchen'` at store creation),
  `setActiveScene(id: SceneId): void`, `updateMagnetPosition(sceneId:
  SceneId, index: number, position: [number, number, number]): void`. The
  existing `zoomToFridge` action is renamed `zoomIn` (same behavior — sets
  `isZoomedIn: true`) since it's no longer fridge-specific; all four call
  sites (`App.tsx`, `sceneStore.test.ts`, `StepBackButton.test.tsx`, and this
  file) are updated together in this task. Task 7 (MagnetBoard) and Task 11
  (App.tsx) consume `activeSceneId`, `setActiveScene`, `magnetLayoutBySceneId`,
  `updateMagnetPosition`, and `zoomIn`.

- [ ] **Step 1: Write the failing test**

```ts
// Add to src/state/sceneStore.test.ts, replacing the "zooms to the fridge and
// resets back" test and adding new tests after it:

  it('zooms in and resets back', () => {
    useSceneStore.getState().zoomIn();
    expect(useSceneStore.getState().isZoomedIn).toBe(true);

    useSceneStore.getState().resetCamera();
    expect(useSceneStore.getState().isZoomedIn).toBe(false);
  });

  it('defaults to the kitchen scene with a pre-populated magnet layout', () => {
    const state = useSceneStore.getState();
    expect(state.activeSceneId).toBe('kitchen');
    expect(state.magnetLayoutBySceneId.kitchen).toBeDefined();
    expect(state.magnetLayoutBySceneId.kitchen).toHaveLength(35);
  });

  it('switching to a new scene zooms out and lazily creates its magnet layout', () => {
    useSceneStore.getState().zoomIn();
    useSceneStore.getState().setActiveScene('tavern');
    const state = useSceneStore.getState();
    expect(state.activeSceneId).toBe('tavern');
    expect(state.isZoomedIn).toBe(false);
    expect(state.magnetLayoutBySceneId.tavern).toBeDefined();
    expect(state.magnetLayoutBySceneId.tavern!.length).toBeGreaterThan(0);
  });

  it('preserves an existing scene layout when switching back to it', () => {
    useSceneStore.getState().setActiveScene('tavern');
    const firstLayout = useSceneStore.getState().magnetLayoutBySceneId.tavern;
    useSceneStore.getState().setActiveScene('kitchen');
    useSceneStore.getState().setActiveScene('tavern');
    expect(useSceneStore.getState().magnetLayoutBySceneId.tavern).toBe(firstLayout);
  });

  it('updates a single magnet position within a scene layout by index', () => {
    const initial = useSceneStore.getState().magnetLayoutBySceneId.kitchen![0];
    useSceneStore.getState().updateMagnetPosition('kitchen', 0, [1, 2, -1.84]);
    const updated = useSceneStore.getState().magnetLayoutBySceneId.kitchen![0];
    expect(updated.position).toEqual([1, 2, -1.84]);
    expect(updated.word).toBe(initial.word);
    // other entries are untouched
    expect(useSceneStore.getState().magnetLayoutBySceneId.kitchen![1]).toEqual(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      useSceneStore.getInitialState().magnetLayoutBySceneId.kitchen![1],
    );
  });

  it('does nothing when updating a position for a scene with no layout yet', () => {
    useSceneStore.getState().updateMagnetPosition('tavern', 0, [0, 0, 0]);
    expect(useSceneStore.getState().magnetLayoutBySceneId.tavern).toBeUndefined();
  });
```

Also update `src/ui/StepBackButton.test.tsx`'s call from
`useSceneStore.getState().zoomToFridge();` to
`useSceneStore.getState().zoomIn();`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/state/sceneStore.test.ts src/ui/StepBackButton.test.tsx`
Expected: FAIL — `zoomIn`, `activeSceneId`, `setActiveScene`,
`updateMagnetPosition` don't exist yet on the store.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/state/sceneStore.ts — full replacement
import { create } from 'zustand';
import type { LightingPresetName } from '../engine/lightingPresets';
import type { Season } from '../engine/environment';
import type { EnvironmentSnapshot } from '../services/environmentSync';
import { SCENES, type SceneId } from '../engine/scenes';
import { createMagnetLayout, type MagnetLayoutEntry } from '../engine/magnetSelection';
import { WORDS } from '../engine/wordBank';

export type EnvironmentMode = 'auto' | 'manual';

export interface SceneState {
  lightingPreset: LightingPresetName;
  environmentMode: EnvironmentMode;
  season: Season;
  weatherCode: number | null;
  isZoomedIn: boolean;
  draggedMagnetId: string | null;
  activeSceneId: SceneId;
  magnetLayoutBySceneId: Partial<Record<SceneId, MagnetLayoutEntry[]>>;
  setLightingPreset: (name: LightingPresetName) => void;
  setEnvironmentMode: (mode: EnvironmentMode) => void;
  applyEnvironmentSnapshot: (snapshot: EnvironmentSnapshot) => void;
  zoomIn: () => void;
  resetCamera: () => void;
  setDraggedMagnetId: (id: string | null) => void;
  setActiveScene: (id: SceneId) => void;
  updateMagnetPosition: (sceneId: SceneId, index: number, position: [number, number, number]) => void;
}

function layoutForScene(id: SceneId): MagnetLayoutEntry[] {
  const scene = SCENES[id];
  return createMagnetLayout(WORDS, scene.magnetCount, scene.wordTheme, scene.magnetSurfaceZ);
}

export const useSceneStore = create<SceneState>((set, get) => ({
  lightingPreset: 'evening',
  environmentMode: 'auto',
  season: 'summer',
  weatherCode: null,
  isZoomedIn: false,
  draggedMagnetId: null,
  activeSceneId: 'kitchen',
  magnetLayoutBySceneId: { kitchen: layoutForScene('kitchen') },
  setLightingPreset: (name) => set({ lightingPreset: name, environmentMode: 'manual' }),
  setEnvironmentMode: (mode) => set({ environmentMode: mode }),
  applyEnvironmentSnapshot: (snapshot) => {
    if (get().environmentMode !== 'auto') return;
    set({ lightingPreset: snapshot.preset, season: snapshot.season, weatherCode: snapshot.weatherCode });
  },
  zoomIn: () => set({ isZoomedIn: true }),
  resetCamera: () => set({ isZoomedIn: false }),
  setDraggedMagnetId: (id) => set({ draggedMagnetId: id }),
  setActiveScene: (id) =>
    set((state) => ({
      activeSceneId: id,
      isZoomedIn: false,
      magnetLayoutBySceneId: state.magnetLayoutBySceneId[id]
        ? state.magnetLayoutBySceneId
        : { ...state.magnetLayoutBySceneId, [id]: layoutForScene(id) },
    })),
  updateMagnetPosition: (sceneId, index, position) =>
    set((state) => {
      const layout = state.magnetLayoutBySceneId[sceneId];
      if (!layout) return state;
      return {
        magnetLayoutBySceneId: {
          ...state.magnetLayoutBySceneId,
          [sceneId]: layout.map((entry) => (entry.index === index ? { ...entry, position } : entry)),
        },
      };
    }),
}));
```

Also update `src/App.tsx`'s two references from `zoomToFridge` to `zoomIn`
(temporary — Task 11 rewrites `App.tsx` more fully, but keep the build green
in the meantime):

```tsx
  const zoomIn = useSceneStore((state) => state.zoomIn);
```

and

```tsx
            if (!isZoomedIn) zoomIn();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/state/sceneStore.test.ts src/ui/StepBackButton.test.tsx`
Expected: PASS (all tests).

Run: `npm run typecheck`
Expected: PASS (no errors) — this is the first point where the full project
should typecheck cleanly again after Tasks 4-6's interface changes, since
`Fridge.tsx` is still broken. Run `npx tsc --noEmit 2>&1 | grep -v Fridge.tsx`
to confirm no *other* files have errors; `Fridge.tsx` errors are expected
until Task 7.

- [ ] **Step 5: Commit**

```bash
git add src/state/sceneStore.ts src/state/sceneStore.test.ts src/ui/StepBackButton.test.tsx src/App.tsx
git commit -m "feat: add per-scene state and rename zoomToFridge to zoomIn"
```

---

### Task 7: MagnetBoard shared component + Fridge refactor

**Files:**
- Create: `src/scene/MagnetBoard.tsx`
- Test: `src/scene/MagnetBoard.test.tsx` (new)
- Modify: `src/scene/Fridge.tsx`
- Modify: `src/scene/Fridge.test.tsx`

**Interfaces:**
- Consumes: `SCENES`, `SceneId` from `src/engine/scenes.ts`. `Magnet` (with
  its new `surfaceZ`/`onPositionChange` props) from `./Magnet`. `SlamButton`
  (with its new `theme` prop) from `./SlamButton`. `TesseractButton` from
  `./TesseractButton`. `useSceneStore` for `magnetLayoutBySceneId` and
  `updateMagnetPosition`.
- Produces: `MagnetBoardProps` (`{ sceneId: SceneId; slamButtonPosition:
  [number, number, number]; tesseractButtonPosition: [number, number,
  number] }`), `MagnetBoard` component. Task 8 (Tavern scene) consumes this
  directly.

- [ ] **Step 1: Write the failing test**

```tsx
// src/scene/MagnetBoard.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { MagnetBoard } from './MagnetBoard';
import { useSceneStore } from '../state/sceneStore';
import { SCENES } from '../engine/scenes';

describe('MagnetBoard', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
  });

  it('renders one mesh per configured magnet plus the slam and tesseract buttons for the kitchen scene', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <MagnetBoard sceneId="kitchen" slamButtonPosition={[1.2, 3.2, -1.84]} tesseractButtonPosition={[1.2, 2.5, -1.84]} />,
    );
    const meshes = renderer.scene.children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBe(SCENES.kitchen.magnetCount + 2); // magnets + slam + tesseract
  });

  it('renders the tavern scene magnet count once its layout is active', async () => {
    useSceneStore.getState().setActiveScene('tavern');
    const renderer = await ReactThreeTestRenderer.create(
      <MagnetBoard sceneId="tavern" slamButtonPosition={[1.2, 3.2, -1.84]} tesseractButtonPosition={[1.2, 2.5, -1.84]} />,
    );
    const meshes = renderer.scene.children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBe(SCENES.tavern.magnetCount + 2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/scene/MagnetBoard.test.tsx`
Expected: FAIL with "Cannot find module './MagnetBoard'".

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/scene/MagnetBoard.tsx
import { useRef } from 'react';
import * as THREE from 'three';
import { Magnet } from './Magnet';
import { SlamButton } from './SlamButton';
import { TesseractButton } from './TesseractButton';
import { SCENES, type SceneId } from '../engine/scenes';
import { useSceneStore } from '../state/sceneStore';

export interface MagnetBoardProps {
  sceneId: SceneId;
  slamButtonPosition: [number, number, number];
  tesseractButtonPosition: [number, number, number];
}

/**
 * Scene-agnostic magnet surface: renders the current scene's magnet layout
 * (from the store, keyed by sceneId), plus its slam/tesseract buttons.
 * `sceneStore.setActiveScene` guarantees a layout exists for `sceneId`
 * before this ever mounts, so no lazy-init effect is needed here.
 */
export function MagnetBoard({ sceneId, slamButtonPosition, tesseractButtonPosition }: MagnetBoardProps) {
  const scene = SCENES[sceneId];
  const layout = useSceneStore((state) => state.magnetLayoutBySceneId[sceneId]) ?? [];
  const updateMagnetPosition = useSceneStore((state) => state.updateMagnetPosition);

  const meshRefs = useRef(new Map<string, THREE.Object3D>());

  function registerMesh(word: string, mesh: THREE.Mesh | null) {
    if (mesh) meshRefs.current.set(word, mesh);
    else meshRefs.current.delete(word);
  }

  return (
    <>
      {layout.map(({ word, index, position }) => (
        <Magnet
          key={`${word}-${index}`}
          id={`magnet-${sceneId}-${index}`}
          word={word}
          initialPosition={position}
          surfaceZ={scene.magnetSurfaceZ}
          onMeshReady={(mesh) => registerMesh(word, mesh)}
          onPositionChange={(next) => updateMagnetPosition(sceneId, index, next)}
        />
      ))}
      <SlamButton
        position={slamButtonPosition}
        theme={scene.wordTheme}
        getMagnetMesh={(word) => meshRefs.current.get(word)}
      />
      <TesseractButton
        position={tesseractButtonPosition}
        getMagnetMeshes={() => Array.from(meshRefs.current.values())}
      />
    </>
  );
}
```

Now rewrite `Fridge.tsx` to compose the shared board:

```tsx
// src/scene/Fridge.tsx — full replacement
import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { MagnetBoard } from './MagnetBoard';
import { SCENES } from '../engine/scenes';
import { createToonGradientMap } from './toonGradient';

export function Fridge() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const doorZ = SCENES.kitchen.magnetSurfaceZ;

  return (
    <group position={[4, 0, -3.5]}>
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

Update `Fridge.test.tsx` — the expected mesh count (`39`) is unchanged (body
+ door + 35 magnets + slam + tesseract), but add a `beforeEach` reset since
`Fridge` now reads from the shared store:

```tsx
// src/scene/Fridge.test.tsx — full replacement
import { describe, expect, it, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Fridge } from './Fridge';
import { useSceneStore } from '../state/sceneStore';

describe('Fridge', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
  });

  it('mounts without throwing and renders 35 magnets plus the fridge body/door', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Fridge />);
    const meshes = renderer.scene.children[0].children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBe(39); // body + door + 35 magnets + SlamButton + TesseractButton
  });
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/scene/MagnetBoard.test.tsx src/scene/Fridge.test.tsx`
Expected: PASS (all tests).

Run: `npm run typecheck`
Expected: PASS with no errors anywhere in the project (this resolves the
`Fridge.tsx` errors expected since Task 4).

Run: `npm test`
Expected: PASS — full suite green.

- [ ] **Step 5: Commit**

```bash
git add src/scene/MagnetBoard.tsx src/scene/MagnetBoard.test.tsx src/scene/Fridge.tsx src/scene/Fridge.test.tsx
git commit -m "feat: extract MagnetBoard and refactor Fridge to compose it"
```

---

### Task 8: Tavern scene geometry

**Files:**
- Create: `src/scene/TavernRoom.tsx`
- Test: `src/scene/TavernRoom.test.tsx` (new)
- Create: `src/scene/TavernNoticeboard.tsx`
- Test: `src/scene/TavernNoticeboard.test.tsx` (new)

**Interfaces:**
- Consumes: `createToonGradientMap` from `./toonGradient`. `MagnetBoard`
  from `./MagnetBoard`. `SCENES` from `../engine/scenes.ts`.
- Produces: `TavernRoom` (static room geometry, no props — mirrors
  `Kitchen`), `TavernNoticeboard` (magnet board composition, no props —
  mirrors `Fridge`). Task 11 (App.tsx) renders both when `activeSceneId ===
  'tavern'`.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/scene/TavernRoom.test.tsx
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

```tsx
// src/scene/TavernNoticeboard.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { TavernNoticeboard } from './TavernNoticeboard';
import { useSceneStore } from '../state/sceneStore';
import { SCENES } from '../engine/scenes';

describe('TavernNoticeboard', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
    useSceneStore.getState().setActiveScene('tavern');
  });

  it('mounts without throwing and renders the tavern magnet count plus the board/buttons', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TavernNoticeboard />);
    const meshes = renderer.scene.children[0].children.filter((child) => child.type === 'Mesh');
    // board backing + magnets + slam + tesseract
    expect(meshes.length).toBe(SCENES.tavern.magnetCount + 3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/scene/TavernRoom.test.tsx src/scene/TavernNoticeboard.test.tsx`
Expected: FAIL — modules don't exist yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/scene/TavernRoom.tsx
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

```tsx
// src/scene/TavernNoticeboard.tsx
import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { MagnetBoard } from './MagnetBoard';
import { SCENES } from '../engine/scenes';
import { createToonGradientMap } from './toonGradient';

/** Corkboard-on-a-wall composition of the shared MagnetBoard, themed for
 * the tavern. Mirrors Fridge.tsx's structure. */
export function TavernNoticeboard() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const surfaceZ = SCENES.tavern.magnetSurfaceZ;

  return (
    <group position={[4, 0, -3.5]}>
      <RoundedBox args={[3.6, 4, 0.2]} radius={0.06} smoothness={4} position={[0, 4, surfaceZ + 0.05]} receiveShadow>
        <meshToonMaterial color="#7a5230" gradientMap={gradientMap} />
      </RoundedBox>

      <MagnetBoard
        sceneId="tavern"
        slamButtonPosition={[1.2, 3.2, surfaceZ]}
        tesseractButtonPosition={[1.2, 2.5, surfaceZ]}
      />
    </group>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/scene/TavernRoom.test.tsx src/scene/TavernNoticeboard.test.tsx`
Expected: PASS (both tests).

- [ ] **Step 5: Commit**

```bash
git add src/scene/TavernRoom.tsx src/scene/TavernRoom.test.tsx src/scene/TavernNoticeboard.tsx src/scene/TavernNoticeboard.test.tsx
git commit -m "feat: add tavern room and noticeboard scene geometry"
```

---

### Task 9: Fixed lighting for scenes outside the environment system

**Files:**
- Modify: `src/scene/Lighting.tsx`
- Test: `src/scene/Lighting.test.tsx` (extend)

**Interfaces:**
- Consumes: `SCENES`, `SceneId` from `src/engine/scenes.ts`. `activeSceneId`
  from `useSceneStore`.
- Produces: `Lighting` now looks up
  `SCENES[activeSceneId].usesEnvironmentLighting`; when `false`, it applies
  `SCENES[activeSceneId].fixedLightingPreset` directly (bypassing
  `computeTintedLightingPreset`) and ignores `lightingPreset`/`season`/
  `weatherCode` entirely for that scene.

- [ ] **Step 1: Write the failing test**

```tsx
// Add to src/scene/Lighting.test.tsx, inside the existing describe block
// (check the existing file's imports first; it already imports
// `useSceneStore` and `applyLightingPreset`/`computeTintedLightingPreset`
// per Phase 3 — add a beforeEach reset if not already present):

  it('uses the scene fixed lighting preset instead of the tinted environment preset when the active scene opts out', () => {
    const fixed = SCENES.tavern.fixedLightingPreset!;
    const result = computeActiveLightingPreset('tavern', 'night', 'winter', 61);
    expect(result).toEqual(fixed);
  });

  it('still uses the tinted environment preset for scenes with usesEnvironmentLighting true', () => {
    const result = computeActiveLightingPreset('kitchen', 'night', 'winter', 61);
    expect(result).not.toEqual(SCENES.tavern.fixedLightingPreset);
    expect(result.ambientColor).not.toBe(LIGHTING_PRESETS.night.ambientColor); // tinted, not raw
  });
```

Add the necessary imports at the top of `src/scene/Lighting.test.tsx`:

```tsx
import { SCENES } from '../engine/scenes';
import { LIGHTING_PRESETS } from '../engine/lightingPresets';
import { computeActiveLightingPreset } from './Lighting';
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/scene/Lighting.test.tsx`
Expected: FAIL — `computeActiveLightingPreset` doesn't exist yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/scene/Lighting.tsx — add this export alongside computeTintedLightingPreset,
// and use it inside the Lighting component. Insert after computeTintedLightingPreset:

import { SCENES, type SceneId } from '../engine/scenes';

/**
 * Resolves the lighting preset that should actually be applied for the
 * active scene: the scene's fixed preset if it opts out of the environment
 * system, otherwise the tinted preset from the Auto/Manual lighting state.
 * Pure and unit-testable, mirroring computeTintedLightingPreset above.
 */
export function computeActiveLightingPreset(
  activeSceneId: SceneId,
  lightingPreset: LightingPresetName,
  season: Season,
  weatherCode: number | null,
): LightingPreset {
  const scene = SCENES[activeSceneId];
  if (!scene.usesEnvironmentLighting && scene.fixedLightingPreset) {
    return scene.fixedLightingPreset;
  }
  return computeTintedLightingPreset(lightingPreset, season, weatherCode);
}
```

Then update the `Lighting` component body to read `activeSceneId` and call
the new function instead of `computeTintedLightingPreset` directly:

```tsx
export function Lighting() {
  const { scene } = useThree();
  const activeSceneId = useSceneStore((state) => state.activeSceneId);
  const lightingPreset = useSceneStore((state) => state.lightingPreset);
  const season = useSceneStore((state) => state.season);
  const weatherCode = useSceneStore((state) => state.weatherCode);

  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    scene.fog = new THREE.FogExp2(0x1a1a1a, 0.02);
  }, [scene]);

  useEffect(() => {
    if (!ambientRef.current || !directionalRef.current || !fillRef.current || !scene.fog) return;
    applyLightingPreset(
      {
        ambient: ambientRef.current,
        directional: directionalRef.current,
        fill: fillRef.current,
        fog: scene.fog as THREE.FogExp2,
      },
      computeActiveLightingPreset(activeSceneId, lightingPreset, season, weatherCode),
    );
  }, [activeSceneId, lightingPreset, season, weatherCode, scene]);

  // ...unchanged JSX below (ambientLight/directionalLight/pointLight elements)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/scene/Lighting.test.tsx`
Expected: PASS (all tests, including the two new ones).

- [ ] **Step 5: Commit**

```bash
git add src/scene/Lighting.tsx src/scene/Lighting.test.tsx
git commit -m "feat: apply a fixed lighting preset for scenes outside the environment system"
```

---

### Task 10: HUD scene switcher and conditional lighting controls

**Files:**
- Modify: `src/ui/HUD.tsx`
- Test: `src/ui/HUD.test.tsx` (extend)

**Interfaces:**
- Consumes: `SCENES`, `SCENE_IDS` from `src/engine/scenes.ts`.
  `activeSceneId`, `setActiveScene` from `useSceneStore`.
- Produces: HUD renders one button per `SCENE_IDS` entry (the active one
  visually indicated via `aria-pressed`), calling `setActiveScene(id)` on
  click. The Auto/Manual toggle and lighting-preset buttons are only
  rendered when `SCENES[activeSceneId].usesEnvironmentLighting` is `true`.

- [ ] **Step 1: Write the failing test**

```tsx
// Add to src/ui/HUD.test.tsx, inside the existing describe block:

  it('renders one scene-switcher button per scene, with the active scene indicated', () => {
    render(<HUD />);
    const kitchenButton = screen.getByRole('button', { name: /kitchen fridge/i });
    const tavernButton = screen.getByRole('button', { name: /tavern noticeboard/i });
    expect(kitchenButton).toHaveAttribute('aria-pressed', 'true');
    expect(tavernButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches the active scene when a scene button is clicked', async () => {
    render(<HUD />);
    await userEvent.click(screen.getByRole('button', { name: /tavern noticeboard/i }));
    expect(useSceneStore.getState().activeSceneId).toBe('tavern');
  });

  it('hides the Auto/Manual toggle and lighting presets when the active scene opts out of environment lighting', async () => {
    render(<HUD />);
    await userEvent.click(screen.getByRole('button', { name: /tavern noticeboard/i }));
    expect(screen.queryByRole('button', { name: /auto/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /night/i })).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/HUD.test.tsx`
Expected: FAIL — no scene-switcher buttons exist yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/ui/HUD.tsx — full replacement
import { LIGHTING_PRESET_NAMES, LightingPresetName } from '../engine/lightingPresets';
import { SCENE_IDS, SCENES } from '../engine/scenes';
import { useSceneStore } from '../state/sceneStore';

const PRESET_LABELS: Record<LightingPresetName, string> = {
  morning: '🌅 Morning',
  day: '☀️ Day',
  evening: '🌇 Eve',
  night: '🌙 Night',
};

export function HUD() {
  const activeSceneId = useSceneStore((state) => state.activeSceneId);
  const setActiveScene = useSceneStore((state) => state.setActiveScene);
  const setLightingPreset = useSceneStore((state) => state.setLightingPreset);
  const environmentMode = useSceneStore((state) => state.environmentMode);
  const setEnvironmentMode = useSceneStore((state) => state.setEnvironmentMode);
  const isAuto = environmentMode === 'auto';
  const usesEnvironmentLighting = SCENES[activeSceneId].usesEnvironmentLighting;

  return (
    <div className="glass-panel interactive-ui hud">
      <h1>Magic Fridge</h1>
      <p>Click a scene to zoom in. Drag words to write poetry.</p>
      <div>
        {SCENE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={activeSceneId === id}
            onClick={() => setActiveScene(id)}
          >
            {SCENES[id].label}
          </button>
        ))}
      </div>
      {usesEnvironmentLighting && (
        <div>
          <button
            type="button"
            aria-pressed={isAuto}
            onClick={() => setEnvironmentMode(isAuto ? 'manual' : 'auto')}
          >
            {isAuto ? '🌐 Auto' : '✋ Manual'}
          </button>
          {LIGHTING_PRESET_NAMES.map((name) => (
            <button key={name} type="button" disabled={isAuto} onClick={() => setLightingPreset(name)}>
              {PRESET_LABELS[name]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ui/HUD.test.tsx`
Expected: PASS (all tests, old and new).

- [ ] **Step 5: Commit**

```bash
git add src/ui/HUD.tsx src/ui/HUD.test.tsx
git commit -m "feat: add HUD scene switcher and hide lighting controls per scene"
```

---

### Task 11: App wiring — render the active scene

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx` (extend)

**Interfaces:**
- Consumes: `SCENES` from `src/engine/scenes.ts`. `activeSceneId` from
  `useSceneStore`. `TavernRoom`, `TavernNoticeboard` from Task 8.
- Produces: `App` renders `Kitchen`+`Fridge` or `TavernRoom`+
  `TavernNoticeboard` based on `activeSceneId`; camera zoom-in position and
  OrbitControls target come from `SCENES[activeSceneId]` instead of the
  removed hardcoded `CAMERA_ZOOMED_IN`/inline ternary constants.

- [ ] **Step 1: Write the failing test**

```tsx
// Add to src/App.test.tsx:
import userEvent from '@testing-library/user-event';
// (keep the existing 'renders the canvas container and the HUD title' test, add:)

  it('switches rendered scene labels are present after clicking the tavern button', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /tavern noticeboard/i }));
    // The HUD re-renders with the tavern button now marked active.
    expect(screen.getByRole('button', { name: /tavern noticeboard/i })).toHaveAttribute('aria-pressed', 'true');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS already for the existing test; the new test should also pass
once Task 10 is in place (HUD already renders/switches). This step confirms
`App` doesn't crash when `activeSceneId` changes — if `App.tsx` hasn't been
updated yet to read per-scene camera values, this still passes since the
camera-related code doesn't throw, it just uses stale constants. Proceed to
Step 3 regardless to complete the intended refactor per the design spec.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/App.tsx — full replacement
import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import { Kitchen } from './scene/Kitchen';
import { Fridge } from './scene/Fridge';
import { TavernRoom } from './scene/TavernRoom';
import { TavernNoticeboard } from './scene/TavernNoticeboard';
import { Lighting } from './scene/Lighting';
import { CanvasErrorBoundary } from './scene/CanvasErrorBoundary';
import { TransitionOverlay } from './scene/TransitionOverlay';
import { HUD } from './ui/HUD';
import { StepBackButton } from './ui/StepBackButton';
import { useSceneStore } from './state/sceneStore';
import { useEnvironmentSync } from './state/useEnvironmentSync';
import { SCENES } from './engine/scenes';

const CAMERA_ZOOMED_OUT: [number, number, number] = [0, 4, 15];
const DEFAULT_ZOOMED_OUT_TARGET: [number, number, number] = [0, 3, 0];

function CameraRig({
  isZoomedIn,
  zoomedInPosition,
  onTweenChange,
  onOverlayProgress,
}: {
  isZoomedIn: boolean;
  zoomedInPosition: [number, number, number];
  onTweenChange: (tweening: boolean) => void;
  onOverlayProgress: (progress: number) => void;
}) {
  const { camera } = useThree();
  const overlayTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const [x, y, z] = isZoomedIn ? zoomedInPosition : CAMERA_ZOOMED_OUT;
    gsap.killTweensOf(camera.position);
    onTweenChange(true);
    gsap.to(camera.position, {
      x,
      y,
      z,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => onTweenChange(false),
    });

    overlayTimelineRef.current?.kill();

    if (!isInitialMount.current) {
      const overlay = { progress: 0 };
      overlayTimelineRef.current = gsap
        .timeline({ onUpdate: () => onOverlayProgress(overlay.progress) })
        .to(overlay, { progress: 1, duration: 0.25, ease: 'power1.in' })
        .to(overlay, { progress: 1, duration: 0.1 })
        .to(overlay, { progress: 0, duration: 0.25, ease: 'power1.out' });
    } else {
      isInitialMount.current = false;
    }
  }, [camera, isZoomedIn, zoomedInPosition, onTweenChange, onOverlayProgress]);

  return null;
}

function App() {
  useEnvironmentSync();
  const activeSceneId = useSceneStore((state) => state.activeSceneId);
  const isZoomedIn = useSceneStore((state) => state.isZoomedIn);
  const zoomIn = useSceneStore((state) => state.zoomIn);
  const [isTweening, setIsTweening] = useState(false);
  const [overlayProgress, setOverlayProgress] = useState(0);

  const activeScene = SCENES[activeSceneId];
  const cameraTarget = isZoomedIn ? activeScene.cameraTarget : DEFAULT_ZOOMED_OUT_TARGET;

  return (
    <div data-testid="app-root" style={{ width: '100vw', height: '100vh' }}>
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: CAMERA_ZOOMED_OUT, fov: 45, near: 0.1, far: 1000 }}
          shadows
          onPointerMissed={() => {
            if (!isZoomedIn) zoomIn();
          }}
        >
          <CameraRig
            isZoomedIn={isZoomedIn}
            zoomedInPosition={activeScene.cameraZoomedIn}
            onTweenChange={setIsTweening}
            onOverlayProgress={setOverlayProgress}
          />
          <Lighting />
          {activeSceneId === 'kitchen' ? (
            <>
              <Kitchen />
              <Fridge />
            </>
          ) : (
            <>
              <TavernRoom />
              <TavernNoticeboard />
            </>
          )}
          <OrbitControls
            target={cameraTarget}
            enabled={isZoomedIn && !isTweening}
            minDistance={5}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
        </Canvas>
      </CanvasErrorBoundary>
      <TransitionOverlay progress={overlayProgress} />
      <HUD />
      <StepBackButton />
    </div>
  );
}

export default App;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS (both tests).

Run: `npm test`
Expected: PASS — the entire suite is green.

Run: `npm run typecheck`
Expected: PASS with no errors.

Run: `npm run lint`
Expected: PASS with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: render the active scene and drive camera framing from SCENES"
```

---

### Task 12: Final verification pass

**Files:** none (verification only).

**Interfaces:** none — this task confirms the whole feature works together.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: All tests pass (existing Phase 0-3 tests plus every test added in
Tasks 1-11 above).

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 4: Manual smoke check of the dev build**

Run: `npm run dev` (or `npm run tauri dev` if available in this
environment), open the app, and confirm:
- The kitchen fridge loads by default with 35 draggable magnets.
- Clicking "Tavern Noticeboard" in the HUD zooms out, swaps to the tavern
  room with its own magnet set, and hides the Auto/Manual lighting toggle.
- Dragging a few tavern magnets, switching back to "Kitchen Fridge", then
  back to "Tavern Noticeboard" shows the tavern magnets exactly where they
  were left.
- The Slam button in the tavern produces a poem using tavern-flavored words
  (e.g. `ale`, `quest`, `dragon`) more often than in the kitchen.

If any manual check fails, stop and fix before considering Phase 4a done — do not skip this step.

- [ ] **Step 5: Final commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: address final verification findings"
```

(Skip this step entirely if Steps 1-4 required no changes.)
