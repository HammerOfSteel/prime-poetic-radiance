# Phase 4b: RPG Dungeon Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third scene — an RPG dungeon board where magnets sit on a stone rune tablet in a torch-lit dungeon room — reusing 100% of the Phase 4a `SCENES`/`MagnetBoard` abstraction with no new architecture.

**Architecture:** Purely additive content on top of Phase 4a: one new `SceneDefinition` registry entry, ~12 new/reweighted vocabulary words, two new scene-geometry components (`DungeonRoom`, `DungeonTablet`) mirroring the existing `TavernRoom`/`TavernNoticeboard` pair exactly, and a small `App.tsx` refactor from a 2-way ternary to a 3-way scene-component lookup. `sceneStore.ts`, `MagnetBoard.tsx`, and `HUD.tsx` are already fully generic over `SceneId` and need **no changes**.

**Tech Stack:** React + TypeScript, React Three Fiber (R3F) + drei, Zustand, Vitest + `@react-three/test-renderer` + React Testing Library, ESLint, `tsc --noEmit`.

## Global Constraints

- Full `npm test`, `npm run typecheck`, and `npm run lint` must stay 100% clean after every task (same bar as every prior phase in this project).
- Follow strict TDD: write the failing test first, watch it fail, then implement.
- Commit after every task with a Conventional-Commits-style message (`feat: ...`).
- No new npm dependencies are needed for this phase.
- Match the exact visual/material conventions already established: `meshToonMaterial` + `createToonGradientMap()` for all toon-shaded geometry, `RoundedBox` from `@react-three/drei` for rounded panel/slab shapes.
- The dungeon scene's `wordTheme` is `'dungeon'`, `usesEnvironmentLighting` is `true`, `fixedLightingPreset` is `null` — it participates in the same Auto/Manual day/night/season/weather tinting as the kitchen (see `src/scene/Lighting.tsx`'s existing `computeActiveLightingPreset`, unmodified by this phase).

---

### Task 1: Add the dungeon scene definition to the registry

**Files:**
- Modify: `src/engine/scenes.ts`
- Test: `src/engine/scenes.test.ts` (extend)

**Interfaces:**
- Consumes: nothing new (existing `SceneDefinition` interface, unchanged).
- Produces: `SceneId` widens to `'kitchen' | 'tavern' | 'dungeon'`; `SCENE_IDS` gains `'dungeon'`; `SCENES.dungeon: SceneDefinition`. Tasks 2-5 consume `SCENES.dungeon` and the widened `SceneId`.

- [ ] **Step 1: Write the failing test**

Add to `src/engine/scenes.test.ts`, replacing the `SCENE_IDS` equality test and adding a new dungeon-specific test after the existing tavern one:

```ts
  it('lists kitchen, tavern, and dungeon in SCENE_IDS', () => {
    expect(SCENE_IDS).toEqual(['kitchen', 'tavern', 'dungeon']);
  });
```

```ts
  it('gives the dungeon scene its own theme and participates in the environment lighting system', () => {
    expect(SCENES.dungeon.wordTheme).toBe('dungeon');
    expect(SCENES.dungeon.usesEnvironmentLighting).toBe(true);
    expect(SCENES.dungeon.fixedLightingPreset).toBeNull();
    expect(SCENES.dungeon.magnetCount).toBeGreaterThan(0);
  });
```

The existing `'defines a SceneDefinition for every id in SCENE_IDS'` and `'gives every scene a label, camera-zoomed-in position, and camera target'` tests already iterate over `SCENE_IDS` generically — no changes needed there, they'll automatically cover `dungeon` once it's added.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/scenes.test.ts`
Expected: FAIL — `SCENE_IDS` doesn't include `'dungeon'` yet, `SCENES.dungeon` is `undefined`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/engine/scenes.ts — full replacement
import type { WordTheme } from './wordBank';
import type { LightingPreset } from './lightingPresets';

export type SceneId = 'kitchen' | 'tavern' | 'dungeon';

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

export const SCENE_IDS: SceneId[] = ['kitchen', 'tavern', 'dungeon'];

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
  dungeon: {
    id: 'dungeon',
    label: 'Dungeon Tablet',
    wordTheme: 'dungeon',
    magnetSurfaceZ: -1.84,
    magnetCount: 30,
    cameraZoomedIn: [4, 5, 3.5],
    cameraTarget: [4, 5, -1.85],
    usesEnvironmentLighting: true,
    fixedLightingPreset: null,
  },
};
```

(`cameraZoomedIn`/`cameraTarget` start identical to kitchen/tavern here, matching the group position convention `DungeonTablet` will use in Task 4 — Task 6's manual verification step re-checks and tunes these numbers once the real geometry exists, rather than leaving them unverified.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/scenes.test.ts`
Expected: PASS (all tests, including the two new ones).

Run: `npx tsc --noEmit 2>&1 | grep -v "wordBank.ts"`
Expected: no output (other files unaffected). `wordBank.ts` itself will show no error yet since `SceneId`/`SCENES` don't reference `WordTheme` value `'dungeon'` — `getThemeWeight`'s `WordTheme` type still only permits `'kitchen' | 'tavern'` at this point, so `SCENES.dungeon.wordTheme` is fine because it's typed as `WordTheme` and Task 2 will widen that type. Confirm this explicitly: if `tsc` reports an error on `wordTheme: 'dungeon'` in `scenes.ts` at this step, that's expected — Task 2 fixes it immediately after. Do not attempt to fix it in this task.

- [ ] **Step 5: Commit**

```bash
git add src/engine/scenes.ts src/engine/scenes.test.ts
git commit -m "feat: add dungeon scene definition to the scene registry"
```

---

### Task 2: Add the dungeon word theme and vocabulary

**Files:**
- Modify: `src/engine/wordBank.ts`
- Test: `src/engine/wordBank.test.ts` (extend)

**Interfaces:**
- Consumes: nothing new.
- Produces: `WordTheme` widens to `'kitchen' | 'tavern' | 'dungeon'`. Tasks 1's `SCENES.dungeon.wordTheme: 'dungeon'` now type-checks. `getThemeWeight(word, 'dungeon')` returns the configured weight for dungeon-flavored words. Task 4 (`DungeonTablet`) and the `sceneStore`'s existing generic `layoutForScene` consume this via `SCENES[id].wordTheme`.

- [ ] **Step 1: Write the failing test**

Add to `src/engine/wordBank.test.ts`, after the existing tavern-reweighting test:

```ts
  it('has dungeon-themed words with a dungeon weight greater than their default weight', () => {
    const dungeonWords = ['torch', 'rune', 'skeleton', 'crypt', 'curse', 'treasure', 'abyss', 'chains', 'goblin', 'crumbling', 'stone', 'dagger'];
    dungeonWords.forEach((word) => {
      expect(WORDS).toContain(word);
      expect(getThemeWeight(word, 'dungeon')).toBeGreaterThan(1);
    });
  });

  it('reweights a handful of existing evocative words for the dungeon theme without changing their other weights', () => {
    expect(getThemeWeight('shadow', 'dungeon')).toBeGreaterThan(1);
    expect(getThemeWeight('echo', 'dungeon')).toBeGreaterThan(1);
    expect(getThemeWeight('key', 'dungeon')).toBeGreaterThan(1);
    expect(getThemeWeight('lock', 'dungeon')).toBeGreaterThan(1);
    // ancient and sword are already tavern-weighted; dungeon adds its own
    // weight alongside without disturbing the existing tavern weight
    expect(getThemeWeight('ancient', 'tavern')).toBe(2);
    expect(getThemeWeight('ancient', 'dungeon')).toBeGreaterThan(1);
    expect(getThemeWeight('sword', 'tavern')).toBe(3);
    expect(getThemeWeight('sword', 'dungeon')).toBeGreaterThan(1);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/wordBank.test.ts`
Expected: FAIL — `getThemeWeight(word, 'dungeon')` doesn't type-check/doesn't return >1 yet (the words don't exist and `'dungeon'` isn't a valid `WordTheme`).

- [ ] **Step 3: Write minimal implementation**

In `src/engine/wordBank.ts`:

1. Widen the `WordTheme` type and its doc comment:

```ts
/** Scene themes words can be weighted for. Phase 4a added 'tavern'; Phase 4b
 * adds 'dungeon' alongside the original Phase 1 'kitchen' theme. */
export type WordTheme = 'kitchen' | 'tavern' | 'dungeon';
```

2. Reweight these four existing noun entries (find and replace each line exactly):

```ts
  { word: 'shadow', category: 'noun', themeWeights: { dungeon: 2 } },
```
(replaces `{ word: 'shadow', category: 'noun' },`)

```ts
  { word: 'echo', category: 'noun', themeWeights: { dungeon: 2 } },
```
(replaces `{ word: 'echo', category: 'noun' },`)

```ts
  { word: 'key', category: 'noun', themeWeights: { dungeon: 2 } },
```
(replaces `{ word: 'key', category: 'noun' },`)

```ts
  { word: 'lock', category: 'noun', themeWeights: { dungeon: 2 } },
```
(replaces `{ word: 'lock', category: 'noun' },`)

3. Add `dungeon: 2` alongside the existing weight on these two already-weighted entries:

```ts
  { word: 'ancient', category: 'adj', themeWeights: { tavern: 2, dungeon: 2 } },
```
(replaces `{ word: 'ancient', category: 'adj', themeWeights: { tavern: 2 } },`)

```ts
  { word: 'sword', category: 'noun', themeWeights: { tavern: 3, dungeon: 2 } },
```
(replaces `{ word: 'sword', category: 'noun', themeWeights: { tavern: 3 } },`)

4. Add these 12 new noun entries at the end of the `// --- nouns ---` block, right after the existing tavern block (`{ word: 'legend', category: 'noun', themeWeights: { tavern: 3 } },`):

```ts
  { word: 'torch', category: 'noun', themeWeights: { dungeon: 3 } },
  { word: 'rune', category: 'noun', themeWeights: { dungeon: 3 } },
  { word: 'skeleton', category: 'noun', themeWeights: { dungeon: 3 } },
  { word: 'crypt', category: 'noun', themeWeights: { dungeon: 3 } },
  { word: 'curse', category: 'noun', themeWeights: { dungeon: 3 } },
  { word: 'treasure', category: 'noun', themeWeights: { dungeon: 3 } },
  { word: 'abyss', category: 'noun', themeWeights: { dungeon: 3 } },
  { word: 'chains', category: 'noun', themeWeights: { dungeon: 3 } },
  { word: 'goblin', category: 'noun', themeWeights: { dungeon: 3 } },
  { word: 'crumbling', category: 'noun', themeWeights: { dungeon: 3 } },
  { word: 'stone', category: 'noun', themeWeights: { dungeon: 3 } },
  { word: 'dagger', category: 'noun', themeWeights: { dungeon: 3 } },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/wordBank.test.ts`
Expected: PASS (all tests, including the two new ones).

Run: `npx tsc --noEmit`
Expected: no errors — `SCENES.dungeon.wordTheme: 'dungeon'` from Task 1 now type-checks against the widened `WordTheme`.

Run: `npx vitest run` (full suite)
Expected: PASS — confirm the wordBank/scenes changes haven't broken any other test (e.g. `magnetSelection.test.ts`, which consumes `getThemeWeight` generically).

- [ ] **Step 5: Commit**

```bash
git add src/engine/wordBank.ts src/engine/wordBank.test.ts
git commit -m "feat: widen WordTheme and add dungeon-weighted vocabulary"
```

---

### Task 3: Add the dungeon room geometry

**Files:**
- Create: `src/scene/DungeonRoom.tsx`
- Test: `src/scene/DungeonRoom.test.tsx` (new)

**Interfaces:**
- Consumes: `createToonGradientMap` from `./toonGradient`.
- Produces: `DungeonRoom` component (static geometry, no props, no state). Task 5 (`App.tsx`) renders it alongside `DungeonTablet` when `activeSceneId === 'dungeon'`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/scene/DungeonRoom.test.tsx
import { describe, expect, it } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { DungeonRoom } from './DungeonRoom';

describe('DungeonRoom', () => {
  it('mounts without throwing and renders at least a floor and two walls', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DungeonRoom />);
    const meshes = renderer.scene.children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/scene/DungeonRoom.test.tsx`
Expected: FAIL with "Cannot find module './DungeonRoom'".

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/scene/DungeonRoom.tsx
import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';

/** Static dungeon interior: rough stone floor/walls, a couple of unlit
 * wall-torch props, and a chain accent for texture. Mirrors Kitchen.tsx's
 * and TavernRoom.tsx's structure — no props, no per-scene state. Actual
 * scene lighting still comes from the shared Lighting rig (this scene
 * participates in the Phase 3 Auto/Manual environment system, unlike the
 * tavern), so the torches here are decorative geometry only. */
export function DungeonRoom() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshToonMaterial color="#4a4a52" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[0, 7.5, -6]} receiveShadow>
        <boxGeometry args={[30, 15, 1]} />
        <meshToonMaterial color="#3a3a42" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-10, 7.5, 0]} receiveShadow>
        <boxGeometry args={[1, 15, 30]} />
        <meshToonMaterial color="#3a3a42" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-6, 2, -5.4]} castShadow>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshToonMaterial color="#2b2b30" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-6, 3.6, -5.2]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshBasicMaterial color="#ff9a3c" />
      </mesh>

      <RoundedBox args={[6, 0.4, 2]} radius={0.05} smoothness={4} position={[-5, 0.2, -1]} castShadow receiveShadow>
        <meshToonMaterial color="#5a5a60" gradientMap={gradientMap} />
      </RoundedBox>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/scene/DungeonRoom.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scene/DungeonRoom.tsx src/scene/DungeonRoom.test.tsx
git commit -m "feat: add dungeon room geometry"
```

---

### Task 4: Add the dungeon tablet (magnet board composition)

**Files:**
- Create: `src/scene/DungeonTablet.tsx`
- Test: `src/scene/DungeonTablet.test.tsx` (new)

**Interfaces:**
- Consumes: `MagnetBoard` from `./MagnetBoard` (unchanged from Phase 4a). `SCENES` from `../engine/scenes.ts` (Task 1's `dungeon` entry). `createToonGradientMap` from `./toonGradient`. `useSceneStore`/`SCENES` in the test, exactly as `TavernNoticeboard.test.tsx` does.
- Produces: `DungeonTablet` component (no props, no state). Task 5 (`App.tsx`) renders it alongside `DungeonRoom` when `activeSceneId === 'dungeon'`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/scene/DungeonTablet.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { DungeonTablet } from './DungeonTablet';
import { useSceneStore } from '../state/sceneStore';
import { SCENES } from '../engine/scenes';

describe('DungeonTablet', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
    useSceneStore.getState().setActiveScene('dungeon');
  });

  it('mounts without throwing and renders the dungeon magnet count plus the tablet/buttons', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DungeonTablet />);
    const meshes = renderer.scene.children[0].children.filter((child) => child.type === 'Mesh');
    // tablet backing + magnets + slam + tesseract
    expect(meshes.length).toBe(SCENES.dungeon.magnetCount + 3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/scene/DungeonTablet.test.tsx`
Expected: FAIL with "Cannot find module './DungeonTablet'".

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/scene/DungeonTablet.tsx
import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { MagnetBoard } from './MagnetBoard';
import { SCENES } from '../engine/scenes';
import { createToonGradientMap } from './toonGradient';

/** Stone rune tablet mounted on a dungeon wall, composing the shared
 * MagnetBoard, themed for the dungeon. Mirrors Fridge.tsx's and
 * TavernNoticeboard.tsx's structure. */
export function DungeonTablet() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const surfaceZ = SCENES.dungeon.magnetSurfaceZ;

  return (
    <group position={[4, 0, -3.5]}>
      <RoundedBox args={[3.6, 4, 0.2]} radius={0.04} smoothness={4} position={[0, 4, surfaceZ + 0.05]} receiveShadow>
        <meshToonMaterial color="#6a6a72" gradientMap={gradientMap} />
      </RoundedBox>

      <MagnetBoard
        sceneId="dungeon"
        slamButtonPosition={[1.2, 3.2, surfaceZ]}
        tesseractButtonPosition={[1.2, 2.5, surfaceZ]}
      />
    </group>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/scene/DungeonTablet.test.tsx`
Expected: PASS.

Run: `npx vitest run` (full suite)
Expected: PASS — confirms `MagnetBoard`/`sceneStore` handle the new `'dungeon'` scene id with zero changes to either file.

- [ ] **Step 5: Commit**

```bash
git add src/scene/DungeonTablet.tsx src/scene/DungeonTablet.test.tsx
git commit -m "feat: add dungeon tablet magnet board composition"
```

---

### Task 5: Wire the dungeon scene into App.tsx

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx` (extend)

**Interfaces:**
- Consumes: `DungeonRoom` from `./scene/DungeonRoom`, `DungeonTablet` from `./scene/DungeonTablet` (Tasks 3-4). `SceneId` from `./engine/scenes`.
- Produces: `App` renders the correct room+board pair for all three scenes via a `SCENE_COMPONENTS` lookup (replacing the old 2-way ternary), so a future fourth scene only needs an entry added here, not a restructured conditional.

- [ ] **Step 1: Write the failing test**

Add to `src/App.test.tsx`, after the existing tavern-switch test:

```tsx
  it('switches to the dungeon scene and marks its button active', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /dungeon tablet/i }));
    expect(screen.getByRole('button', { name: /dungeon tablet/i })).toHaveAttribute('aria-pressed', 'true');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL — no button with the accessible name "Dungeon Tablet" exists yet (the HUD only shows kitchen/tavern until `App.tsx` renders the dungeon scene's components and the store already knows about the `dungeon` id from Task 1 — the HUD button itself comes from `SCENES`/`SCENE_IDS` which already include it, so this may actually already partially work for the button click/aria-pressed assertion since HUD is generic. Proceed to Step 3 regardless to complete the intended `App.tsx` refactor: rendering the correct 3D scene for `dungeon` still requires this task's change, and the test should pass cleanly after it regardless of whether it also happened to pass before).

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
import { DungeonRoom } from './scene/DungeonRoom';
import { DungeonTablet } from './scene/DungeonTablet';
import { Lighting } from './scene/Lighting';
import { CanvasErrorBoundary } from './scene/CanvasErrorBoundary';
import { TransitionOverlay } from './scene/TransitionOverlay';
import { HUD } from './ui/HUD';
import { StepBackButton } from './ui/StepBackButton';
import { useSceneStore } from './state/sceneStore';
import { useEnvironmentSync } from './state/useEnvironmentSync';
import { SCENES, type SceneId } from './engine/scenes';

const CAMERA_ZOOMED_OUT: [number, number, number] = [0, 4, 15];
const DEFAULT_ZOOMED_OUT_TARGET: [number, number, number] = [0, 3, 0];

/** Maps each scene id to its room (static environment) and board (magnet
 * surface) component pair. Adding a future scene only requires an entry
 * here, not a restructured conditional. */
const SCENE_COMPONENTS: Record<SceneId, { Room: () => React.JSX.Element; Board: () => React.JSX.Element }> = {
  kitchen: { Room: Kitchen, Board: Fridge },
  tavern: { Room: TavernRoom, Board: TavernNoticeboard },
  dungeon: { Room: DungeonRoom, Board: DungeonTablet },
};

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
  const { Room: ActiveRoom, Board: ActiveBoard } = SCENE_COMPONENTS[activeSceneId];

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
          <ActiveRoom />
          <ActiveBoard />
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
Expected: PASS (all three tests: canvas/HUD render, tavern switch, dungeon switch).

Run: `npm test`
Expected: PASS — the entire suite is green.

Run: `npm run typecheck`
Expected: PASS with no errors.

Run: `npm run lint`
Expected: PASS with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: render the dungeon scene and generalize scene-component wiring"
```

---

### Task 6: Final verification and camera-framing tuning

**Files:** none created/modified unless the manual check in Step 4 finds a camera-framing issue, in which case: modify `src/engine/scenes.ts` (only the `dungeon.cameraZoomedIn`/`dungeon.cameraTarget` values).

This task mirrors Phase 4a's final verification task (Task 12): it confirms the whole feature works together and, unlike Phase 4a's tavern (which left placeholder camera values unverified), actually tunes the dungeon's camera framing against its real geometry.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: All tests pass (existing tests plus every test added in Tasks 1-5 above).

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 4: Manual smoke check and camera tuning**

Run: `npm run dev`, open the app (or use a headless-browser smoke check against the dev server, the same approach used to verify Phase 4a), and confirm:
- The kitchen fridge and tavern noticeboard still work exactly as before (no regression).
- Clicking "Dungeon Tablet" in the HUD zooms out, swaps to the dungeon room with its own magnet set, and the Auto/Manual lighting toggle **remains visible** (unlike the tavern, since the dungeon uses `usesEnvironmentLighting: true`).
- The camera framing when zoomed into the dungeon tablet actually centers the tablet and its magnets in view, comparably to how the kitchen fridge and tavern noticeboard are framed. If the tablet appears off-center, cut off, or badly cropped, adjust `SCENES.dungeon.cameraZoomedIn`/`cameraTarget` in `src/engine/scenes.ts` and re-check — do not leave unverified placeholder values as Phase 4a's tavern did.
- Dragging a few dungeon magnets, switching to "Kitchen Fridge", then back to "Dungeon Tablet" shows the dungeon magnets exactly where they were left.
- The Slam button in the dungeon produces a poem using dungeon-flavored words (e.g. `rune`, `crypt`, `torch`) more often than in the kitchen or tavern.
- Switching to the dungeon and changing the lighting preset (e.g. to "Night") via the now-visible Auto/Manual controls visibly changes the dungeon's lighting tint, confirming it correctly participates in the environment system.

If any manual check fails, stop and fix before considering Phase 4b done — do not skip this step.

- [ ] **Step 5: Final commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: tune dungeon camera framing after manual verification"
```

(Skip this step entirely if Steps 1-4 required no changes.)
