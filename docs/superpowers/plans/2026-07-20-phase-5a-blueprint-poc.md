# Phase 5a: Procedural Blueprint Generator (POC) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove that a room (dimensions, palette, and a scatter of props) can be procedurally generated from a numeric seed, viewable via a dev-only debug button that swaps the main 3D view.

**Architecture:** A pure, seeded generator function in `src/engine/blueprintGenerator.ts` produces a `RoomBlueprint` data object; a new `ProceduralRoom` R3F component renders it using a small library of 6 prop components; a `BlueprintDebugPanel` UI component triggers generation and exit; `App.tsx` holds the generated blueprint as local state and swaps the Canvas contents when active. No existing scene (`kitchen`/`tavern`/`dungeon`), `sceneStore.ts`, or `HUD.tsx` is modified.

**Tech Stack:** React + TypeScript, React Three Fiber (R3F) + drei, Vitest + `@react-three/test-renderer` + React Testing Library, ESLint, `tsc --noEmit`.

## Global Constraints

- Full `npm test`, `npm run typecheck`, and `npm run lint` must stay 100% clean after every task.
- Follow strict TDD: write the failing test first, watch it fail, then implement.
- Commit after every task with a Conventional-Commits-style message (`feat: ...`).
- No new npm dependencies are needed for this phase.
- No collision/overlap avoidance between placed props (accepted limitation).
- No persistence of generated rooms across reloads.
- No changes to `src/state/sceneStore.ts`, `src/ui/HUD.tsx`, or any of `Kitchen.tsx`/`Fridge.tsx`/`TavernRoom.tsx`/`TavernNoticeboard.tsx`/`DungeonRoom.tsx`/`DungeonTablet.tsx`.
- Match existing project conventions: `meshToonMaterial` + `createToonGradientMap()` (from `src/scene/toonGradient.ts`) for all toon-shaded geometry; `RoundedBox` from `@react-three/drei` for rounded panel/box shapes.

---

### Task 1: Seeded room blueprint generator

**Files:**
- Create: `src/engine/blueprintGenerator.ts`
- Test: `src/engine/blueprintGenerator.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `PropType` (`'crate' | 'barrel' | 'pillar' | 'rug' | 'pottedPlant' | 'chest'`), `PlacedProp` (`{ type: PropType; position: [number, number, number]; rotationY: number; scale: number }`), `RoomPalette` (`{ floorColor: string; wallColor: string; accentColor: string }`), `RoomBlueprint` (`{ seed: number; width: number; depth: number; height: number; palette: RoomPalette; props: PlacedProp[] }`), `ROOM_PALETTES: RoomPalette[]` (5 presets), `createSeededRandom(seed: number): () => number`, `generateRoomBlueprint(seed: number): RoomBlueprint`. Task 2 consumes `PropType`/`RoomBlueprint`. Task 4 consumes `generateRoomBlueprint`/`RoomBlueprint`.

- [ ] **Step 1: Write the failing test**

Create `src/engine/blueprintGenerator.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createSeededRandom, generateRoomBlueprint, ROOM_PALETTES } from './blueprintGenerator';

describe('createSeededRandom', () => {
  it('produces the same sequence for the same seed', () => {
    const a = createSeededRandom(42);
    const b = createSeededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('produces values in [0, 1)', () => {
    const random = createSeededRandom(7);
    for (let i = 0; i < 20; i += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('generateRoomBlueprint', () => {
  it('is deterministic: the same seed always produces an identical blueprint', () => {
    const first = generateRoomBlueprint(123);
    const second = generateRoomBlueprint(123);
    expect(second).toEqual(first);
  });

  it('produces dimensions within their documented ranges across many seeds', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const blueprint = generateRoomBlueprint(seed);
      expect(blueprint.width).toBeGreaterThanOrEqual(8);
      expect(blueprint.width).toBeLessThanOrEqual(16);
      expect(blueprint.depth).toBeGreaterThanOrEqual(8);
      expect(blueprint.depth).toBeLessThanOrEqual(16);
      expect(blueprint.height).toBeGreaterThanOrEqual(6);
      expect(blueprint.height).toBeLessThanOrEqual(10);
    }
  });

  it('produces between 4 and 8 props across many seeds', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const blueprint = generateRoomBlueprint(seed);
      expect(blueprint.props.length).toBeGreaterThanOrEqual(4);
      expect(blueprint.props.length).toBeLessThanOrEqual(8);
    }
  });

  it('keeps every prop position within the wall margin across many seeds', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const blueprint = generateRoomBlueprint(seed);
      blueprint.props.forEach((prop) => {
        const [x, , z] = prop.position;
        expect(x).toBeGreaterThanOrEqual(-blueprint.width / 2 + 1.5);
        expect(x).toBeLessThanOrEqual(blueprint.width / 2 - 1.5);
        expect(z).toBeGreaterThanOrEqual(-blueprint.depth / 2 + 1.5);
        expect(z).toBeLessThanOrEqual(blueprint.depth / 2 - 1.5);
      });
    }
  });

  it('always picks one of the 5 documented palette presets', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const blueprint = generateRoomBlueprint(seed);
      expect(ROOM_PALETTES).toContainEqual(blueprint.palette);
    }
  });

  it('produces different blueprints for different seeds', () => {
    const blueprints = [0, 1, 2, 3, 4].map((seed) => generateRoomBlueprint(seed));
    const uniqueSerialized = new Set(blueprints.map((b) => JSON.stringify(b)));
    expect(uniqueSerialized.size).toBeGreaterThan(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/blueprintGenerator.test.ts`
Expected: FAIL with "Cannot find module './blueprintGenerator'".

- [ ] **Step 3: Write minimal implementation**

Create `src/engine/blueprintGenerator.ts`:

```ts
export type PropType = 'crate' | 'barrel' | 'pillar' | 'rug' | 'pottedPlant' | 'chest';

const PROP_TYPES: PropType[] = ['crate', 'barrel', 'pillar', 'rug', 'pottedPlant', 'chest'];

export interface PlacedProp {
  type: PropType;
  position: [number, number, number];
  rotationY: number;
  scale: number;
}

export interface RoomPalette {
  floorColor: string;
  wallColor: string;
  accentColor: string;
}

export interface RoomBlueprint {
  seed: number;
  width: number;
  depth: number;
  height: number;
  palette: RoomPalette;
  props: PlacedProp[];
}

/** 5 curated palette presets, chosen so generated rooms stay in the cozy
 * toy aesthetic rather than producing clashing random RGB combinations. */
export const ROOM_PALETTES: RoomPalette[] = [
  { floorColor: '#8a5a3b', wallColor: '#f2e3c9', accentColor: '#c96a3e' }, // Warm Stone
  { floorColor: '#4a4a52', wallColor: '#3a3a42', accentColor: '#6a6a72' }, // Cool Cellar
  { floorColor: '#7a5230', wallColor: '#a97a4a', accentColor: '#c98a3e' }, // Autumn Wood
  { floorColor: '#5a6e4a', wallColor: '#7a8e6a', accentColor: '#4a5e3a' }, // Moss Green
  { floorColor: '#8a6a6a', wallColor: '#c9a3a3', accentColor: '#a35a5a' }, // Dusty Rose
];

const WALL_MARGIN = 1.5;

/** Deterministic pseudo-random generator (mulberry32 algorithm). The same
 * seed always produces the same sequence of values in [0, 1). */
export function createSeededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randRange(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}

function randInt(random: () => number, min: number, max: number): number {
  return Math.floor(randRange(random, min, max + 1));
}

/** Generates a fully deterministic RoomBlueprint from a numeric seed: room
 * dimensions, a curated color palette, and 4-8 randomly placed props from
 * the 6-shape prop library (see src/scene/proceduralProps.tsx). */
export function generateRoomBlueprint(seed: number): RoomBlueprint {
  const random = createSeededRandom(seed);

  const width = randRange(random, 8, 16);
  const depth = randRange(random, 8, 16);
  const height = randRange(random, 6, 10);
  const palette = ROOM_PALETTES[randInt(random, 0, ROOM_PALETTES.length - 1)];

  const propCount = randInt(random, 4, 8);
  const props: PlacedProp[] = [];
  for (let i = 0; i < propCount; i += 1) {
    const type = PROP_TYPES[randInt(random, 0, PROP_TYPES.length - 1)];
    const x = randRange(random, -width / 2 + WALL_MARGIN, width / 2 - WALL_MARGIN);
    const z = randRange(random, -depth / 2 + WALL_MARGIN, depth / 2 - WALL_MARGIN);
    const rotationY = randRange(random, 0, Math.PI * 2);
    const scale = randRange(random, 0.8, 1.3);
    props.push({ type, position: [x, 0, z], rotationY, scale });
  }

  return { seed, width, depth, height, palette, props };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/blueprintGenerator.test.ts`
Expected: PASS (all 8 tests).

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/engine/blueprintGenerator.ts src/engine/blueprintGenerator.test.ts
git commit -m "feat: add seeded procedural room blueprint generator"
```

---

### Task 2: Prop library and ProceduralRoom rendering

**Files:**
- Create: `src/scene/proceduralProps.tsx`
- Create: `src/scene/ProceduralRoom.tsx`
- Test: `src/scene/ProceduralRoom.test.tsx`

**Interfaces:**
- Consumes: `PropType`, `RoomBlueprint`, `RoomPalette` from `../engine/blueprintGenerator` (Task 1). `createToonGradientMap` from `./toonGradient`.
- Produces: `PropProps` (`{ position: [number, number, number]; rotationY: number; scale: number; accentColor: string }`), `PROP_COMPONENTS: Record<PropType, ComponentType<PropProps>>`, `ProceduralRoom({ blueprint: RoomBlueprint }): JSX.Element`. Task 4 consumes `ProceduralRoom`.

- [ ] **Step 1: Write the failing test**

Create `src/scene/ProceduralRoom.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { ProceduralRoom } from './ProceduralRoom';
import type { RoomBlueprint } from '../engine/blueprintGenerator';

const FIXED_BLUEPRINT: RoomBlueprint = {
  seed: 999,
  width: 10,
  depth: 10,
  height: 8,
  palette: { floorColor: '#8a5a3b', wallColor: '#f2e3c9', accentColor: '#c96a3e' },
  props: [
    { type: 'crate', position: [1, 0, 1], rotationY: 0, scale: 1 },
    { type: 'barrel', position: [-2, 0, 2], rotationY: 0.5, scale: 1 },
    { type: 'pottedPlant', position: [0, 0, -2], rotationY: 1, scale: 1 },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function countMeshes(node: any): number {
  const own = node.type === 'Mesh' ? 1 : 0;
  const children: unknown[] = node.children ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return own + children.reduce((sum: number, child: any) => sum + countMeshes(child), 0);
}

describe('ProceduralRoom', () => {
  it('renders the room shell plus one mesh per prop (two for the potted plant)', async () => {
    const renderer = await ReactThreeTestRenderer.create(<ProceduralRoom blueprint={FIXED_BLUEPRINT} />);
    const meshCount = renderer.scene.children.reduce((sum, child) => sum + countMeshes(child), 0);
    // 3 shell meshes (floor + 2 walls) + crate(1) + barrel(1) + pottedPlant(2) = 7
    expect(meshCount).toBeGreaterThanOrEqual(7);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/scene/ProceduralRoom.test.tsx`
Expected: FAIL with "Cannot find module './ProceduralRoom'".

- [ ] **Step 3: Write minimal implementation**

Create `src/scene/proceduralProps.tsx`:

```tsx
import type { ComponentType } from 'react';
import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import type { PropType } from '../engine/blueprintGenerator';
import { createToonGradientMap } from './toonGradient';

export interface PropProps {
  position: [number, number, number];
  rotationY: number;
  scale: number;
  accentColor: string;
}

export function Crate({ position, rotationY, scale, accentColor }: PropProps) {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  return (
    <RoundedBox
      args={[1, 1, 1]}
      radius={0.05}
      smoothness={4}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
      castShadow
      receiveShadow
    >
      <meshToonMaterial color={accentColor} gradientMap={gradientMap} />
    </RoundedBox>
  );
}

export function Barrel({ position, rotationY, scale, accentColor }: PropProps) {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} scale={scale} castShadow receiveShadow>
      <cylinderGeometry args={[0.4, 0.5, 1, 16]} />
      <meshToonMaterial color={accentColor} gradientMap={gradientMap} />
    </mesh>
  );
}

export function Pillar({ position, rotationY, scale, accentColor }: PropProps) {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} scale={scale} castShadow receiveShadow>
      <cylinderGeometry args={[0.3, 0.3, 3, 12]} />
      <meshToonMaterial color={accentColor} gradientMap={gradientMap} />
    </mesh>
  );
}

export function Rug({ position, rotationY, scale, accentColor }: PropProps) {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  return (
    <mesh
      position={[position[0], position[1] + 0.02, position[2]]}
      rotation={[-Math.PI / 2, 0, rotationY]}
      scale={scale}
      receiveShadow
    >
      <planeGeometry args={[2, 1.4]} />
      <meshToonMaterial color={accentColor} gradientMap={gradientMap} />
    </mesh>
  );
}

export function PottedPlant({ position, rotationY, scale, accentColor }: PropProps) {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.25, 0.6, 12]} />
        <meshToonMaterial color={accentColor} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshToonMaterial color="#7a9e5a" gradientMap={gradientMap} />
      </mesh>
    </group>
  );
}

export function Chest({ position, rotationY, scale, accentColor }: PropProps) {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  return (
    <RoundedBox
      args={[1.2, 0.7, 0.8]}
      radius={0.05}
      smoothness={4}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
      castShadow
      receiveShadow
    >
      <meshToonMaterial color={accentColor} gradientMap={gradientMap} />
    </RoundedBox>
  );
}

export const PROP_COMPONENTS: Record<PropType, ComponentType<PropProps>> = {
  crate: Crate,
  barrel: Barrel,
  pillar: Pillar,
  rug: Rug,
  pottedPlant: PottedPlant,
  chest: Chest,
};
```

Create `src/scene/ProceduralRoom.tsx`:

```tsx
import { useMemo } from 'react';
import type { RoomBlueprint } from '../engine/blueprintGenerator';
import { PROP_COMPONENTS } from './proceduralProps';
import { createToonGradientMap } from './toonGradient';

/** Renders a procedurally generated RoomBlueprint: a floor + 2-wall shell
 * (same convention as Kitchen.tsx/TavernRoom.tsx/DungeonRoom.tsx) sized and
 * colored from the blueprint, plus one component per placed prop. */
export function ProceduralRoom({ blueprint }: { blueprint: RoomBlueprint }) {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const { width, depth, height, palette, props } = blueprint;

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshToonMaterial color={palette.floorColor} gradientMap={gradientMap} />
      </mesh>

      <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, 1]} />
        <meshToonMaterial color={palette.wallColor} gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[1, height, depth]} />
        <meshToonMaterial color={palette.wallColor} gradientMap={gradientMap} />
      </mesh>

      {props.map((prop, index) => {
        const PropComponent = PROP_COMPONENTS[prop.type];
        return (
          <PropComponent
            key={index}
            position={prop.position}
            rotationY={prop.rotationY}
            scale={prop.scale}
            accentColor={palette.accentColor}
          />
        );
      })}
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/scene/ProceduralRoom.test.tsx`
Expected: PASS.

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/scene/proceduralProps.tsx src/scene/ProceduralRoom.tsx src/scene/ProceduralRoom.test.tsx
git commit -m "feat: add procedural prop library and room renderer"
```

---

### Task 3: Blueprint debug panel

**Files:**
- Create: `src/ui/BlueprintDebugPanel.tsx`
- Test: `src/ui/BlueprintDebugPanel.test.tsx`

**Interfaces:**
- Consumes: nothing new (pure UI component).
- Produces: `BlueprintDebugPanelProps` (`{ activeSeed: number | null; onGenerate: () => void; onExit: () => void }`), `BlueprintDebugPanel(props: BlueprintDebugPanelProps): JSX.Element`. Task 4 consumes `BlueprintDebugPanel`.

- [ ] **Step 1: Write the failing test**

Create `src/ui/BlueprintDebugPanel.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlueprintDebugPanel } from './BlueprintDebugPanel';

describe('BlueprintDebugPanel', () => {
  it('shows only the generate button when no blueprint is active', () => {
    render(<BlueprintDebugPanel activeSeed={null} onGenerate={() => {}} onExit={() => {}} />);
    expect(screen.getByRole('button', { name: /generate random room/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /back to scenes/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/seed:/i)).not.toBeInTheDocument();
  });

  it('shows the exit button and seed label when a blueprint is active', () => {
    render(<BlueprintDebugPanel activeSeed={12345} onGenerate={() => {}} onExit={() => {}} />);
    expect(screen.getByRole('button', { name: /back to scenes/i })).toBeInTheDocument();
    expect(screen.getByText('Seed: 12345')).toBeInTheDocument();
  });

  it('calls onGenerate when the generate button is clicked', async () => {
    const onGenerate = vi.fn();
    render(<BlueprintDebugPanel activeSeed={null} onGenerate={onGenerate} onExit={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /generate random room/i }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it('calls onExit when the back button is clicked', async () => {
    const onExit = vi.fn();
    render(<BlueprintDebugPanel activeSeed={999} onGenerate={() => {}} onExit={onExit} />);
    await userEvent.click(screen.getByRole('button', { name: /back to scenes/i }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/BlueprintDebugPanel.test.tsx`
Expected: FAIL with "Cannot find module './BlueprintDebugPanel'".

- [ ] **Step 3: Write minimal implementation**

Create `src/ui/BlueprintDebugPanel.tsx`:

```tsx
export interface BlueprintDebugPanelProps {
  activeSeed: number | null;
  onGenerate: () => void;
  onExit: () => void;
}

/** Dev-only debug panel for Phase 5a's procedural blueprint POC. Fully
 * controlled: no internal state, so App.tsx owns the generated blueprint
 * and this component just reflects it. */
export function BlueprintDebugPanel({ activeSeed, onGenerate, onExit }: BlueprintDebugPanelProps) {
  return (
    <div className="glass-panel interactive-ui blueprint-debug-panel">
      <button type="button" onClick={onGenerate}>
        Generate Random Room
      </button>
      {activeSeed !== null && (
        <>
          <button type="button" onClick={onExit}>
            Back to Scenes
          </button>
          <p>Seed: {activeSeed}</p>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ui/BlueprintDebugPanel.test.tsx`
Expected: PASS (all 4 tests).

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/ui/BlueprintDebugPanel.tsx src/ui/BlueprintDebugPanel.test.tsx
git commit -m "feat: add blueprint debug panel"
```

---

### Task 4: Wire the blueprint POC into App.tsx

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx` (extend)

**Interfaces:**
- Consumes: `ProceduralRoom` from `./scene/ProceduralRoom` (Task 2), `BlueprintDebugPanel` from `./ui/BlueprintDebugPanel` (Task 3), `generateRoomBlueprint`/`RoomBlueprint` from `./engine/blueprintGenerator` (Task 1).
- Produces: no new exports — this is the integration point.

- [ ] **Step 1: Write the failing test**

Add to `src/App.test.tsx`, after the existing dungeon-switch test:

```tsx
  it('generates a procedural room, hides the normal HUD, and returns via Back to Scenes', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /generate random room/i }));
    expect(screen.getByText(/seed:/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /kitchen fridge/i })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /back to scenes/i }));
    expect(screen.getByRole('button', { name: /kitchen fridge/i })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL — no button with the accessible name "Generate Random Room" exists yet.

- [ ] **Step 3: Write minimal implementation**

Replace `src/App.tsx` in full:

```tsx
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
import { ProceduralRoom } from './scene/ProceduralRoom';
import { Lighting } from './scene/Lighting';
import { CanvasErrorBoundary } from './scene/CanvasErrorBoundary';
import { TransitionOverlay } from './scene/TransitionOverlay';
import { HUD } from './ui/HUD';
import { StepBackButton } from './ui/StepBackButton';
import { BlueprintDebugPanel } from './ui/BlueprintDebugPanel';
import { useSceneStore } from './state/sceneStore';
import { useEnvironmentSync } from './state/useEnvironmentSync';
import { SCENES, type SceneId } from './engine/scenes';
import { generateRoomBlueprint, type RoomBlueprint } from './engine/blueprintGenerator';

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
  const [proceduralBlueprint, setProceduralBlueprint] = useState<RoomBlueprint | null>(null);

  const activeScene = SCENES[activeSceneId];
  const cameraTarget = isZoomedIn ? activeScene.cameraTarget : DEFAULT_ZOOMED_OUT_TARGET;
  const { Room: ActiveRoom, Board: ActiveBoard } = SCENE_COMPONENTS[activeSceneId];

  const handleGenerateProceduralRoom = () => {
    const seed = Math.floor(Math.random() * 1e9);
    console.log(`Generated procedural room with seed: ${seed}`);
    setProceduralBlueprint(generateRoomBlueprint(seed));
  };

  const handleExitProceduralRoom = () => {
    setProceduralBlueprint(null);
  };

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
          {proceduralBlueprint ? (
            <ProceduralRoom blueprint={proceduralBlueprint} />
          ) : (
            <>
              <ActiveRoom />
              <ActiveBoard />
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
      {proceduralBlueprint === null && <HUD />}
      <BlueprintDebugPanel
        activeSeed={proceduralBlueprint?.seed ?? null}
        onGenerate={handleGenerateProceduralRoom}
        onExit={handleExitProceduralRoom}
      />
      <StepBackButton />
    </div>
  );
}

export default App;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS (all 5 tests: canvas/HUD render, tavern switch, dungeon switch, procedural room generate/exit).

Run: `npm test`
Expected: PASS — the entire suite is green.

Run: `npm run typecheck && npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: wire the procedural blueprint POC into App.tsx"
```

---

### Task 5: Final verification

**Files:** none created/modified.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: All tests pass, including every test added in Tasks 1-4.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 4: Manual smoke check**

Run: `npm run dev` (use a port that isn't already occupied by an unrelated project's dev server — check with `lsof -i :<port>` first if unsure), then either open the app in a browser or verify via `curl` that `/src/App.tsx` serves and its transformed module references `ProceduralRoom` and `BlueprintDebugPanel`. Confirm:
- Kitchen/tavern/dungeon scene switching still works exactly as before (no regression).
- Clicking "Generate Random Room" swaps the 3D view to a generated room and shows a `Seed: <number>` label; the normal HUD scene-switcher disappears.
- Clicking "Generate Random Room" again while already viewing a generated room produces a *different* room (different seed) without needing to click "Back to Scenes" first.
- Clicking "Back to Scenes" restores the normal HUD and whichever scene (kitchen/tavern/dungeon) was active before.

Stop the dev server when done.

- [ ] **Step 5: No fixes expected**

If any manual check fails, fix the issue, re-run the affected task's tests, and commit the fix (`fix: ...`) before considering Phase 5a done.
