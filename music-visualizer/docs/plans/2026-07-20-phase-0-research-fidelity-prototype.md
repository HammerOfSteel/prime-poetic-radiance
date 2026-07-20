# Music Visualizer Phase 0: Research & Fidelity Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the independent `music-visualizer/` project and prove out, in isolated prototype scenes, the four techniques the whole app depends on: dense subvoxel-style geometry, bloom/glow post-processing, ambient occlusion, and live Web-Audio FFT analysis — plus continuous object rotation performance — before any real per-track scene is built.

**Architecture:** A single new Vite + React 19 + TypeScript + React Three Fiber + Zustand + Vitest project at `music-visualizer/`, scaffolded to mirror the existing Bloom app's conventions (`src/engine` = pure logic, `src/scene` = R3F components, `src/state` = stores) but with its own `package.json`/toolchain and no runtime dependency on Bloom's `src/`. Each research task builds one small, throwaway-quality prototype component rendered on its own route/screen, plus (where the technique has real logic worth keeping, like FFT bucketing) a pure `engine/` module with full unit tests. The phase ends with a written findings doc that Phase 1+ plans will cite for library choices and settings.

**Tech Stack:** React 19, TypeScript ~5.8, Vite ^7, @react-three/fiber ^9, @react-three/drei ^10, @react-three/postprocessing ^3 (new), postprocessing ^6 (new, transitive), three ^0.185, zustand ^5, Vitest ^4, @testing-library/react ^16, @react-three/test-renderer ^9.

## Global Constraints

- Project lives at `music-visualizer/` at the repo root, fully independent `package.json` (own `npm install`/`npm run` from within that folder).
- No shared package/import coupling back to Bloom's `src/` — copy relevant snippets, then diverge freely.
- Plain browser web app: no Tauri, no `src-tauri` references.
- Follow Bloom's existing architecture convention: `engine/` = pure, framework-agnostic, 100% unit-tested logic; `scene/` = R3F components; `state/` = Zustand stores.
- This phase produces prototypes, not shippable UI — components under `src/research/` are allowed to be visually rough, but any pure-logic code they depend on must still be fully unit-tested per the constraints above.
- Every task ends with `npm test`, `npm run typecheck`, and `npm run lint` passing (all three scripts are set up in Task 1).

---

### Task 1: Scaffold the `music-visualizer` project

**Files:**
- Create: `music-visualizer/package.json`
- Create: `music-visualizer/tsconfig.json`
- Create: `music-visualizer/tsconfig.node.json`
- Create: `music-visualizer/vite.config.ts`
- Create: `music-visualizer/vitest.config.ts`
- Create: `music-visualizer/.eslintrc.cjs`
- Create: `music-visualizer/index.html`
- Create: `music-visualizer/src/main.tsx`
- Create: `music-visualizer/src/App.tsx`
- Create: `music-visualizer/src/App.test.tsx`
- Create: `music-visualizer/src/test-setup.ts`
- Create: `music-visualizer/src/vite-env.d.ts`
- Create: `music-visualizer/.gitignore`

**Interfaces:**
- Produces: a runnable Vite dev server (`npm run dev` inside `music-visualizer/`), a working `npm test`/`npm run typecheck`/`npm run lint`, and an `App` component rendering a root div with `data-testid="app-root"` that later tasks mount research screens into.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "music-visualizer",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@react-three/drei": "^10.7.7",
    "@react-three/fiber": "^9.6.1",
    "@react-three/postprocessing": "^3.0.4",
    "postprocessing": "^6.39.3",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "three": "^0.185.1",
    "zustand": "^5.0.14"
  },
  "devDependencies": {
    "@react-three/test-renderer": "^9.1.0",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@types/three": "^0.185.1",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "@vitejs/plugin-react": "^4.6.0",
    "eslint": "^8.57.1",
    "eslint-config-prettier": "^9.1.2",
    "eslint-plugin-react-hooks": "^4.6.2",
    "jsdom": "^29.1.1",
    "prettier": "^3.9.5",
    "typescript": "~5.8.3",
    "vite": "^7.0.4",
    "vitest": "^4.1.10"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 4: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 5: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

- [ ] **Step 6: Create `.eslintrc.cjs`**

```js
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {},
  ignorePatterns: ['dist', 'node_modules'],
};
```

- [ ] **Step 7: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Music Visualizer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 9: Create `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 10: Create `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 11: Write the failing test for `App`**

```tsx
// music-visualizer/src/App.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the app root container', () => {
    render(<App />);
    expect(screen.getByTestId('app-root')).toBeInTheDocument();
  });
});
```

- [ ] **Step 12: Create `.gitignore`**

```
node_modules
dist
dist-ssr
*.local
```

- [ ] **Step 13: Install dependencies**

Run: `cd music-visualizer && npm install`
Expected: install completes with no errors (warnings about peer deps are fine).

- [ ] **Step 14: Run the test to verify it fails**

Run: `cd music-visualizer && npm test`
Expected: FAIL — `Cannot find module './App'` (App.tsx doesn't exist yet).

- [ ] **Step 15: Create the minimal `App.tsx`**

```tsx
// music-visualizer/src/App.tsx
function App() {
  return (
    <div data-testid="app-root" style={{ width: '100vw', height: '100vh' }}>
      <h1>Music Visualizer</h1>
    </div>
  );
}

export default App;
```

- [ ] **Step 16: Run the test to verify it passes**

Run: `cd music-visualizer && npm test`
Expected: PASS (1 test).

- [ ] **Step 17: Run typecheck and lint**

Run: `cd music-visualizer && npm run typecheck && npm run lint`
Expected: both succeed with no errors.

- [ ] **Step 18: Verify the dev server starts**

Run: `cd music-visualizer && npm run dev -- --port 5183` (background it, then check `curl -s http://localhost:5183 | grep -o '<title>[^<]*'`, then stop the dev server process)
Expected: output contains `<title>Music Visualizer`.

- [ ] **Step 19: Commit**

```bash
git add music-visualizer/package.json music-visualizer/tsconfig.json music-visualizer/tsconfig.node.json music-visualizer/vite.config.ts music-visualizer/vitest.config.ts music-visualizer/.eslintrc.cjs music-visualizer/index.html music-visualizer/src/main.tsx music-visualizer/src/App.tsx music-visualizer/src/App.test.tsx music-visualizer/src/test-setup.ts music-visualizer/src/vite-env.d.ts music-visualizer/.gitignore
git commit -m "feat(music-visualizer): scaffold independent Vite+React+R3F project"
```

Note: `music-visualizer/package-lock.json` and `node_modules` — `node_modules` is excluded by `.gitignore`; stage `package-lock.json` too if `npm install` created one (`git add music-visualizer/package-lock.json`).

---

### Task 2: Research screen shell and routing-free navigation

**Files:**
- Create: `music-visualizer/src/research/ResearchMenu.tsx`
- Create: `music-visualizer/src/research/ResearchMenu.test.tsx`
- Modify: `music-visualizer/src/App.tsx`
- Modify: `music-visualizer/src/App.test.tsx`

**Interfaces:**
- Produces: `ResearchMenu` component with props `{ screens: { id: string; label: string }[]; activeId: string | null; onSelect: (id: string) => void }`, rendering a button per screen and highlighting the active one via `aria-pressed`.
- Consumes: nothing from earlier tasks.

This phase's four prototype techniques each get their own screen; rather than a router (unnecessary dependency for a throwaway research phase), `App` holds `activeScreenId` in local state and swaps which prototype component renders — this stays in place for Tasks 3-6 to plug into.

- [ ] **Step 1: Write the failing test for `ResearchMenu`**

```tsx
// music-visualizer/src/research/ResearchMenu.test.tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResearchMenu } from './ResearchMenu';

describe('ResearchMenu', () => {
  const screens = [
    { id: 'voxel', label: 'Voxel Density' },
    { id: 'bloom', label: 'Bloom & AO' },
  ];

  it('renders one button per screen', () => {
    render(<ResearchMenu screens={screens} activeId={null} onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Voxel Density' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bloom & AO' })).toBeInTheDocument();
  });

  it('marks the active screen as pressed', () => {
    render(<ResearchMenu screens={screens} activeId="bloom" onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Bloom & AO' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Voxel Density' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onSelect with the clicked screen id', async () => {
    const onSelect = vi.fn();
    render(<ResearchMenu screens={screens} activeId={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Bloom & AO' }));
    expect(onSelect).toHaveBeenCalledWith('bloom');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd music-visualizer && npm test -- ResearchMenu`
Expected: FAIL — `Cannot find module './ResearchMenu'`.

- [ ] **Step 3: Implement `ResearchMenu`**

```tsx
// music-visualizer/src/research/ResearchMenu.tsx
export interface ResearchScreen {
  id: string;
  label: string;
}

export interface ResearchMenuProps {
  screens: ResearchScreen[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function ResearchMenu({ screens, activeId, onSelect }: ResearchMenuProps) {
  return (
    <nav style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem' }}>
      {screens.map((screen) => (
        <button
          key={screen.id}
          type="button"
          aria-pressed={screen.id === activeId}
          onClick={() => onSelect(screen.id)}
        >
          {screen.label}
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd music-visualizer && npm test -- ResearchMenu`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the updated failing test for `App`**

```tsx
// music-visualizer/src/App.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders the app root container and the research menu', () => {
    render(<App />);
    expect(screen.getByTestId('app-root')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voxel Density' })).toBeInTheDocument();
  });

  it('shows a placeholder until a screen is selected, then switches to it', async () => {
    render(<App />);
    expect(screen.getByText(/select a prototype/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Voxel Density' }));
    expect(screen.queryByText(/select a prototype/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `cd music-visualizer && npm test -- App`
Expected: FAIL — no "Voxel Density" button exists yet.

- [ ] **Step 7: Implement the updated `App`**

```tsx
// music-visualizer/src/App.tsx
import { useState } from 'react';
import { ResearchMenu, type ResearchScreen } from './research/ResearchMenu';

const SCREENS: ResearchScreen[] = [
  { id: 'voxel', label: 'Voxel Density' },
  { id: 'bloom', label: 'Bloom & AO' },
  { id: 'audio', label: 'Audio FFT' },
  { id: 'rotation', label: 'Rotation Perf' },
];

function App() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div data-testid="app-root" style={{ width: '100vw', height: '100vh' }}>
      <h1>Music Visualizer — Research Prototypes</h1>
      <ResearchMenu screens={SCREENS} activeId={activeId} onSelect={setActiveId} />
      {activeId === null && <p>Select a prototype above to view it.</p>}
    </div>
  );
}

export default App;
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `cd music-visualizer && npm test`
Expected: PASS (all tests, `App` + `ResearchMenu`).

- [ ] **Step 9: Run typecheck and lint**

Run: `cd music-visualizer && npm run typecheck && npm run lint`
Expected: both succeed.

- [ ] **Step 10: Commit**

```bash
git add music-visualizer/src/research/ResearchMenu.tsx music-visualizer/src/research/ResearchMenu.test.tsx music-visualizer/src/App.tsx music-visualizer/src/App.test.tsx
git commit -m "feat(music-visualizer): add research screen menu shell"
```

---

### Task 3: Voxel density prototype

**Files:**
- Create: `music-visualizer/src/engine/voxelGrid.ts`
- Create: `music-visualizer/src/engine/voxelGrid.test.ts`
- Create: `music-visualizer/src/research/VoxelDensityScreen.tsx`
- Create: `music-visualizer/src/research/VoxelDensityScreen.test.tsx`
- Modify: `music-visualizer/src/App.tsx`

**Interfaces:**
- Consumes: `ResearchScreen` type from Task 2.
- Produces: `buildVoxelGrid(dims: {x:number;y:number;z:number}, voxelSize: number): VoxelInstance[]` where `VoxelInstance = { position: [number, number, number] }`, pure and unit-tested. `VoxelDensityScreen` R3F component consuming it via `InstancedMesh`.

Validates whether per-instance colored 0.05-unit cubes (an order of magnitude denser than Bloom's current largest primitives) render performantly via `THREE.InstancedMesh`, matching the "subvoxel" density in the reference screenshots.

- [ ] **Step 1: Write the failing test for `buildVoxelGrid`**

```ts
// music-visualizer/src/engine/voxelGrid.test.ts
import { describe, expect, it } from 'vitest';
import { buildVoxelGrid } from './voxelGrid';

describe('buildVoxelGrid', () => {
  it('produces dims.x * dims.y * dims.z instances', () => {
    const instances = buildVoxelGrid({ x: 4, y: 3, z: 2 }, 0.1);
    expect(instances).toHaveLength(24);
  });

  it('spaces instances by voxelSize, centered on the origin', () => {
    const instances = buildVoxelGrid({ x: 2, y: 1, z: 1 }, 0.5);
    const xs = instances.map((instance) => instance.position[0]).sort((a, b) => a - b);
    expect(xs).toEqual([-0.25, 0.25]);
  });

  it('returns an empty array for zero-sized dimensions', () => {
    expect(buildVoxelGrid({ x: 0, y: 5, z: 5 }, 0.1)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd music-visualizer && npm test -- voxelGrid`
Expected: FAIL — `Cannot find module './voxelGrid'`.

- [ ] **Step 3: Implement `buildVoxelGrid`**

```ts
// music-visualizer/src/engine/voxelGrid.ts
export interface VoxelInstance {
  position: [number, number, number];
}

export interface VoxelGridDims {
  x: number;
  y: number;
  z: number;
}

/**
 * Builds a dense grid of voxel instance positions, `voxelSize` apart,
 * centered on the origin along every axis. Pure — used both by the
 * research prototype and (in later phases) by real diorama-authoring code.
 */
export function buildVoxelGrid(dims: VoxelGridDims, voxelSize: number): VoxelInstance[] {
  const instances: VoxelInstance[] = [];
  const offsetX = ((dims.x - 1) * voxelSize) / 2;
  const offsetY = ((dims.y - 1) * voxelSize) / 2;
  const offsetZ = ((dims.z - 1) * voxelSize) / 2;

  for (let ix = 0; ix < dims.x; ix += 1) {
    for (let iy = 0; iy < dims.y; iy += 1) {
      for (let iz = 0; iz < dims.z; iz += 1) {
        instances.push({
          position: [ix * voxelSize - offsetX, iy * voxelSize - offsetY, iz * voxelSize - offsetZ],
        });
      }
    }
  }

  return instances;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd music-visualizer && npm test -- voxelGrid`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing test for `VoxelDensityScreen`**

```tsx
// music-visualizer/src/research/VoxelDensityScreen.test.tsx
import { describe, expect, it } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { VoxelDensityScreen } from './VoxelDensityScreen';

describe('VoxelDensityScreen', () => {
  it('mounts without throwing and renders one InstancedMesh', async () => {
    const renderer = await ReactThreeTestRenderer.create(<VoxelDensityScreen />);
    const instancedMeshes = renderer.scene.children.filter((child) => child.type === 'InstancedMesh');
    expect(instancedMeshes.length).toBe(1);
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `cd music-visualizer && npm test -- VoxelDensityScreen`
Expected: FAIL — `Cannot find module './VoxelDensityScreen'`.

- [ ] **Step 7: Implement `VoxelDensityScreen`**

```tsx
// music-visualizer/src/research/VoxelDensityScreen.tsx
import { useMemo, useRef, useLayoutEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { buildVoxelGrid } from '../engine/voxelGrid';

const DIMS = { x: 20, y: 20, z: 20 };
const VOXEL_SIZE = 0.08;

function VoxelBlock() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const instances = useMemo(() => buildVoxelGrid(DIMS, VOXEL_SIZE), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    instances.forEach((instance, index) => {
      matrix.setPosition(...instance.position);
      meshRef.current!.setMatrixAt(index, matrix);
      color.setHSL((instance.position[1] + 1) / 2, 0.5, 0.55);
      meshRef.current!.setColorAt(index, color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [instances]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, instances.length]} castShadow receiveShadow>
      <boxGeometry args={[VOXEL_SIZE * 0.9, VOXEL_SIZE * 0.9, VOXEL_SIZE * 0.9]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
}

export function VoxelDensityScreen() {
  return (
    <Canvas camera={{ position: [2, 2, 2], fov: 45 }} shadows>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 3]} castShadow />
      <VoxelBlock />
      <OrbitControls />
    </Canvas>
  );
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `cd music-visualizer && npm test -- VoxelDensityScreen`
Expected: PASS (1 test).

- [ ] **Step 9: Wire the screen into `App`**

```tsx
// music-visualizer/src/App.tsx
import { useState } from 'react';
import { ResearchMenu, type ResearchScreen } from './research/ResearchMenu';
import { VoxelDensityScreen } from './research/VoxelDensityScreen';

const SCREENS: ResearchScreen[] = [
  { id: 'voxel', label: 'Voxel Density' },
  { id: 'bloom', label: 'Bloom & AO' },
  { id: 'audio', label: 'Audio FFT' },
  { id: 'rotation', label: 'Rotation Perf' },
];

function App() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div data-testid="app-root" style={{ width: '100vw', height: '100vh' }}>
      <h1>Music Visualizer — Research Prototypes</h1>
      <ResearchMenu screens={SCREENS} activeId={activeId} onSelect={setActiveId} />
      {activeId === null && <p>Select a prototype above to view it.</p>}
      {activeId === 'voxel' && <VoxelDensityScreen />}
    </div>
  );
}

export default App;
```

- [ ] **Step 10: Run all tests, typecheck, and lint**

Run: `cd music-visualizer && npm test && npm run typecheck && npm run lint`
Expected: all pass.

- [ ] **Step 11: Manually verify in the browser (render quality + performance)**

Run: `cd music-visualizer && npm run dev` (background it), open `http://localhost:5173`, click "Voxel Density".
Expected: an 8000-cube block (20×20×20) renders with visible per-cube faces and shadows, orbit-controllable, smooth frame rate (no visible stutter). Record your observed FPS/behavior — this goes into the Task 7 findings doc. Stop the dev server when done.

- [ ] **Step 12: Commit**

```bash
git add music-visualizer/src/engine/voxelGrid.ts music-visualizer/src/engine/voxelGrid.test.ts music-visualizer/src/research/VoxelDensityScreen.tsx music-visualizer/src/research/VoxelDensityScreen.test.tsx music-visualizer/src/App.tsx
git commit -m "feat(music-visualizer): add voxel density prototype"
```

---

### Task 4: Bloom + ambient occlusion post-processing prototype

**Files:**
- Create: `music-visualizer/src/research/BloomAOScreen.tsx`
- Create: `music-visualizer/src/research/BloomAOScreen.test.tsx`
- Modify: `music-visualizer/src/App.tsx`

**Interfaces:**
- Consumes: `ResearchScreen` type from Task 2.
- Produces: `BloomAOScreen`, a self-contained R3F scene wrapped in `@react-three/postprocessing`'s `<EffectComposer>` with `<Bloom>` and `<N8AO>`/`<SSAO>` effects, proving the post-processing pipeline works with the existing Three.js version.

`@react-three/postprocessing` bundles standard effects (`Bloom`, `SSAO`) via its `postprocessing` peer dependency (already pinned in Task 1's `package.json`); no extra install needed here.

- [ ] **Step 1: Write the failing test for `BloomAOScreen`**

```tsx
// music-visualizer/src/research/BloomAOScreen.test.tsx
import { describe, expect, it } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { BloomAOScreen } from './BloomAOScreen';

describe('BloomAOScreen', () => {
  it('mounts without throwing and renders at least one emissive mesh', async () => {
    const renderer = await ReactThreeTestRenderer.create(<BloomAOScreen />);
    const meshes = renderer.scene.children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd music-visualizer && npm test -- BloomAOScreen`
Expected: FAIL — `Cannot find module './BloomAOScreen'`.

- [ ] **Step 3: Implement `BloomAOScreen`**

```tsx
// music-visualizer/src/research/BloomAOScreen.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing';

export function BloomAOScreen() {
  return (
    <Canvas camera={{ position: [3, 2, 3], fov: 45 }} shadows>
      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 5, 2]} castShadow />

      <mesh position={[-0.6, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#332211" />
      </mesh>

      <mesh position={[0.6, 0.3, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#ffaa33" emissive="#ffaa33" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      <EffectComposer>
        <SSAO intensity={20} radius={0.2} />
        <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
      </EffectComposer>

      <OrbitControls />
    </Canvas>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd music-visualizer && npm test -- BloomAOScreen`
Expected: PASS (1 test).

- [ ] **Step 5: Wire the screen into `App`**

```tsx
// music-visualizer/src/App.tsx (add import and render branch)
import { BloomAOScreen } from './research/BloomAOScreen';
```

Add `{activeId === 'bloom' && <BloomAOScreen />}` alongside the existing `{activeId === 'voxel' && ...}` line in the JSX.

- [ ] **Step 6: Run all tests, typecheck, and lint**

Run: `cd music-visualizer && npm test && npm run typecheck && npm run lint`
Expected: all pass.

- [ ] **Step 7: Manually verify in the browser**

Run: `cd music-visualizer && npm run dev` (background it), open the app, click "Bloom & AO".
Expected: the emissive sphere shows a soft glow halo (bloom), and the contact area between the box and the ground plane shows visible darkening/occlusion (SSAO). Note whether SSAO is visually worthwhile at this scale vs. its performance cost — record in the Task 7 findings doc. Stop the dev server when done.

- [ ] **Step 8: Commit**

```bash
git add music-visualizer/src/research/BloomAOScreen.tsx music-visualizer/src/research/BloomAOScreen.test.tsx music-visualizer/src/App.tsx
git commit -m "feat(music-visualizer): add bloom and ambient-occlusion prototype"
```

---

### Task 5: Live audio FFT analysis prototype

**Files:**
- Create: `music-visualizer/src/engine/audioBands.ts`
- Create: `music-visualizer/src/engine/audioBands.test.ts`
- Create: `music-visualizer/src/research/AudioFFTScreen.tsx`
- Create: `music-visualizer/src/research/AudioFFTScreen.test.tsx`
- Modify: `music-visualizer/src/App.tsx`

**Interfaces:**
- Consumes: `ResearchScreen` type from Task 2.
- Produces: `bucketFrequencyData(data: Uint8Array, bandCount: number): number[]` — pure, unit-tested, averages a raw FFT frequency-domain array into `bandCount` evenly-sized buckets (0-255 range preserved). `AudioFFTScreen` wires an `<audio>` element through `AudioContext` → `AnalyserNode` and renders bars driven by `bucketFrequencyData`.

- [ ] **Step 1: Write the failing test for `bucketFrequencyData`**

```ts
// music-visualizer/src/engine/audioBands.test.ts
import { describe, expect, it } from 'vitest';
import { bucketFrequencyData } from './audioBands';

describe('bucketFrequencyData', () => {
  it('averages evenly-divisible data into the requested number of bands', () => {
    const data = new Uint8Array([0, 10, 20, 30, 40, 50, 60, 70]);
    const bands = bucketFrequencyData(data, 4);
    expect(bands).toEqual([5, 25, 45, 65]);
  });

  it('handles a single band by averaging everything', () => {
    const data = new Uint8Array([0, 100]);
    expect(bucketFrequencyData(data, 1)).toEqual([50]);
  });

  it('handles band counts that do not evenly divide the data length', () => {
    const data = new Uint8Array([10, 20, 30, 40, 50]);
    const bands = bucketFrequencyData(data, 2);
    expect(bands).toHaveLength(2);
    expect(bands[0]).toBeCloseTo(20, 5); // avg of [10,20,30]
    expect(bands[1]).toBeCloseTo(45, 5); // avg of [40,50]
  });

  it('returns an empty array when bandCount is 0', () => {
    expect(bucketFrequencyData(new Uint8Array([1, 2, 3]), 0)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd music-visualizer && npm test -- audioBands`
Expected: FAIL — `Cannot find module './audioBands'`.

- [ ] **Step 3: Implement `bucketFrequencyData`**

```ts
// music-visualizer/src/engine/audioBands.ts
/**
 * Averages a raw FFT frequency-domain byte array (as produced by
 * `AnalyserNode.getByteFrequencyData`) into `bandCount` evenly-sized
 * buckets, preserving the 0-255 value range. Pure — the visualizer
 * components call this once per animation frame with live analyser data.
 */
export function bucketFrequencyData(data: Uint8Array, bandCount: number): number[] {
  if (bandCount <= 0 || data.length === 0) return [];

  const bands: number[] = [];
  const bandSize = data.length / bandCount;

  for (let band = 0; band < bandCount; band += 1) {
    const start = Math.floor(band * bandSize);
    const end = Math.floor((band + 1) * bandSize);
    let sum = 0;
    let count = 0;
    for (let i = start; i < end && i < data.length; i += 1) {
      sum += data[i];
      count += 1;
    }
    bands.push(count > 0 ? sum / count : 0);
  }

  return bands;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd music-visualizer && npm test -- audioBands`
Expected: PASS (4 tests).

- [ ] **Step 5: Write the failing test for `AudioFFTScreen`**

```tsx
// music-visualizer/src/research/AudioFFTScreen.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AudioFFTScreen } from './AudioFFTScreen';

describe('AudioFFTScreen', () => {
  it('renders a file input for choosing a local audio file to test with', () => {
    render(<AudioFFTScreen />);
    expect(screen.getByLabelText(/choose an audio file/i)).toBeInTheDocument();
  });

  it('renders a play button that is disabled until a file is chosen', () => {
    render(<AudioFFTScreen />);
    expect(screen.getByRole('button', { name: /play/i })).toBeDisabled();
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `cd music-visualizer && npm test -- AudioFFTScreen`
Expected: FAIL — `Cannot find module './AudioFFTScreen'`.

- [ ] **Step 7: Implement `AudioFFTScreen`**

```tsx
// music-visualizer/src/research/AudioFFTScreen.tsx
import { useEffect, useRef, useState } from 'react';
import { bucketFrequencyData } from '../engine/audioBands';

const BAND_COUNT = 24;

export function AudioFFTScreen() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [bands, setBands] = useState<number[]>(new Array(BAND_COUNT).fill(0));

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(URL.createObjectURL(file));
  }

  function ensureAudioGraph() {
    if (!audioRef.current || audioContextRef.current) return;
    const context = new AudioContext();
    const source = context.createMediaElementSource(audioRef.current);
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    analyser.connect(context.destination);
    audioContextRef.current = context;
    analyserRef.current = analyser;
  }

  function handlePlay() {
    ensureAudioGraph();
    audioRef.current?.play();
  }

  useEffect(() => {
    function tick() {
      const analyser = analyserRef.current;
      if (analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        setBands(bucketFrequencyData(data, BAND_COUNT));
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div>
      <label htmlFor="audio-fft-file-input">Choose an audio file</label>
      <input id="audio-fft-file-input" type="file" accept="audio/*" onChange={handleFileChange} />
      {fileUrl && <audio ref={audioRef} src={fileUrl} />}
      <button type="button" disabled={!fileUrl} onClick={handlePlay}>
        Play
      </button>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '2px' }}>
        {bands.map((value, index) => (
          <div
            key={index}
            style={{ width: '8px', height: `${(value / 255) * 100}%`, background: '#ffaa33' }}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `cd music-visualizer && npm test -- AudioFFTScreen`
Expected: PASS (2 tests).

- [ ] **Step 9: Wire the screen into `App`**

```tsx
// music-visualizer/src/App.tsx (add import and render branch)
import { AudioFFTScreen } from './research/AudioFFTScreen';
```

Add `{activeId === 'audio' && <AudioFFTScreen />}` alongside the existing branches.

- [ ] **Step 10: Run all tests, typecheck, and lint**

Run: `cd music-visualizer && npm test && npm run typecheck && npm run lint`
Expected: all pass.

- [ ] **Step 11: Manually verify in the browser**

Run: `cd music-visualizer && npm run dev` (background it), open the app, click "Audio FFT", choose any local audio/mp3 file, click Play.
Expected: the bar graph visibly reacts to the music in real time (bars rise/fall with beats and frequency content) with no audible glitches or dropped frames. Record your observations (responsiveness, any latency) in the Task 7 findings doc. Stop the dev server when done.

- [ ] **Step 12: Commit**

```bash
git add music-visualizer/src/engine/audioBands.ts music-visualizer/src/engine/audioBands.test.ts music-visualizer/src/research/AudioFFTScreen.tsx music-visualizer/src/research/AudioFFTScreen.test.tsx music-visualizer/src/App.tsx
git commit -m "feat(music-visualizer): add live audio FFT prototype"
```

---

### Task 6: Continuous rotation performance prototype

**Files:**
- Create: `music-visualizer/src/engine/rotation.ts`
- Create: `music-visualizer/src/engine/rotation.test.ts`
- Create: `music-visualizer/src/research/RotationPerfScreen.tsx`
- Create: `music-visualizer/src/research/RotationPerfScreen.test.tsx`
- Modify: `music-visualizer/src/App.tsx`

**Interfaces:**
- Consumes: `buildVoxelGrid` from Task 3 (reuses the same dense voxel block to test rotation performance under realistic geometry load, not a trivial single cube).
- Produces: `nextRotationAngle(currentAngle: number, deltaSeconds: number, radiansPerSecond: number): number` — pure, unit-tested, wraps the result into `[0, 2π)`. `RotationPerfScreen` applies it each frame via `useFrame` to a group wrapping the Task 3 voxel block.

- [ ] **Step 1: Write the failing test for `nextRotationAngle`**

```ts
// music-visualizer/src/engine/rotation.test.ts
import { describe, expect, it } from 'vitest';
import { nextRotationAngle } from './rotation';

describe('nextRotationAngle', () => {
  it('advances the angle by radiansPerSecond * deltaSeconds', () => {
    expect(nextRotationAngle(0, 1, Math.PI)).toBeCloseTo(Math.PI, 5);
  });

  it('wraps the angle into [0, 2*PI)', () => {
    const result = nextRotationAngle(Math.PI * 1.9, 1, Math.PI * 0.3);
    expect(result).toBeCloseTo(Math.PI * 0.2, 5);
  });

  it('returns the unchanged angle when deltaSeconds is 0', () => {
    expect(nextRotationAngle(1.23, 0, Math.PI)).toBeCloseTo(1.23, 5);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd music-visualizer && npm test -- rotation`
Expected: FAIL — `Cannot find module './rotation'`.

- [ ] **Step 3: Implement `nextRotationAngle`**

```ts
// music-visualizer/src/engine/rotation.ts
const TWO_PI = Math.PI * 2;

/**
 * Advances a Y-axis rotation angle by `radiansPerSecond * deltaSeconds`,
 * wrapping the result into [0, 2*PI). Pure — called once per frame from the
 * turntable/diorama rotation group.
 */
export function nextRotationAngle(currentAngle: number, deltaSeconds: number, radiansPerSecond: number): number {
  const raw = currentAngle + radiansPerSecond * deltaSeconds;
  const wrapped = raw % TWO_PI;
  return wrapped < 0 ? wrapped + TWO_PI : wrapped;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd music-visualizer && npm test -- rotation`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing test for `RotationPerfScreen`**

```tsx
// music-visualizer/src/research/RotationPerfScreen.test.tsx
import { describe, expect, it } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { RotationPerfScreen } from './RotationPerfScreen';

describe('RotationPerfScreen', () => {
  it('mounts without throwing and renders one InstancedMesh inside a rotating group', async () => {
    const renderer = await ReactThreeTestRenderer.create(<RotationPerfScreen />);
    const instancedMeshes = renderer.scene.children.filter((child) => child.type === 'InstancedMesh');
    expect(instancedMeshes.length).toBe(1);
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `cd music-visualizer && npm test -- RotationPerfScreen`
Expected: FAIL — `Cannot find module './RotationPerfScreen'`.

- [ ] **Step 7: Implement `RotationPerfScreen`**

```tsx
// music-visualizer/src/research/RotationPerfScreen.tsx
import { useMemo, useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildVoxelGrid } from '../engine/voxelGrid';
import { nextRotationAngle } from '../engine/rotation';

const DIMS = { x: 20, y: 20, z: 20 };
const VOXEL_SIZE = 0.08;
const ROTATION_SPEED = (Math.PI * 2) / 24; // one full turn per 24 seconds

function RotatingVoxelBlock() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const instances = useMemo(() => buildVoxelGrid(DIMS, VOXEL_SIZE), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const matrix = new THREE.Matrix4();
    instances.forEach((instance, index) => {
      matrix.setPosition(...instance.position);
      meshRef.current!.setMatrixAt(index, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [instances]);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = nextRotationAngle(groupRef.current.rotation.y, delta, ROTATION_SPEED);
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, instances.length]} castShadow receiveShadow>
        <boxGeometry args={[VOXEL_SIZE * 0.9, VOXEL_SIZE * 0.9, VOXEL_SIZE * 0.9]} />
        <meshStandardMaterial color="#7a9e5a" />
      </instancedMesh>
    </group>
  );
}

export function RotationPerfScreen() {
  return (
    <Canvas camera={{ position: [2, 2, 2], fov: 45 }} shadows>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 3]} castShadow />
      <RotatingVoxelBlock />
    </Canvas>
  );
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `cd music-visualizer && npm test -- RotationPerfScreen`
Expected: PASS (1 test).

- [ ] **Step 9: Wire the screen into `App`**

```tsx
// music-visualizer/src/App.tsx (add import and render branch)
import { RotationPerfScreen } from './research/RotationPerfScreen';
```

Add `{activeId === 'rotation' && <RotationPerfScreen />}` alongside the existing branches.

- [ ] **Step 10: Run all tests, typecheck, and lint**

Run: `cd music-visualizer && npm test && npm run typecheck && npm run lint`
Expected: all pass.

- [ ] **Step 11: Manually verify in the browser**

Run: `cd music-visualizer && npm run dev` (background it), open the app, click "Rotation Perf".
Expected: the 8000-cube block rotates smoothly and continuously with no visible stutter or frame drops over at least one full rotation. Record observed smoothness in the Task 7 findings doc. Stop the dev server when done.

- [ ] **Step 12: Commit**

```bash
git add music-visualizer/src/engine/rotation.ts music-visualizer/src/engine/rotation.test.ts music-visualizer/src/research/RotationPerfScreen.tsx music-visualizer/src/research/RotationPerfScreen.test.tsx music-visualizer/src/App.tsx
git commit -m "feat(music-visualizer): add continuous rotation performance prototype"
```

---

### Task 7: Write research findings doc

**Files:**
- Create: `music-visualizer/docs/specs/2026-07-20-phase-0-research-findings.md`

**Interfaces:**
- Consumes: the manual-verification observations recorded during Tasks 3-6 (voxel density/performance, bloom+AO visual quality, audio FFT responsiveness, rotation smoothness).
- Produces: a findings doc that Phase 1's design/plan will cite when choosing concrete settings (voxel density per diorama, whether to keep SSAO, `fftSize`/band count, rotation speed range).

This is a documentation-only task (no code), capturing the decisions the four prototypes validated so Phase 1 doesn't have to re-derive them.

- [ ] **Step 1: Write the findings doc**

Fill in the template below with your actual observations from Tasks 3-6's manual verification steps (replace the bracketed placeholders with real recorded results before committing — this step is documentation of real findings, not boilerplate):

```markdown
# Phase 0 Research Findings

Prototypes built and manually verified in `music-visualizer/src/research/`.
These findings inform concrete settings/choices for Phase 1+.

## Voxel density (`VoxelDensityScreen`)

- Tested grid: 20×20×20 (8000 cubes), voxel size 0.08 units, via a single
  `THREE.InstancedMesh`.
- Observed: [fill in: frame rate/smoothness observed, whether individual
  cube faces were visibly distinguishable at typical camera distance].
- Decision: [fill in: the voxel size/density Phase 2 dioramas should target,
  e.g. "0.08 units per subvoxel, up to ~10k instances per scene is safe"].

## Bloom + ambient occlusion (`BloomAOScreen`)

- Tested: `@react-three/postprocessing`'s `<EffectComposer>` with `<SSAO>`
  and `<Bloom>` over a simple box + emissive sphere + ground plane scene.
- Observed: [fill in: whether the glow/AO looked convincing, any visible
  artifacts, performance cost].
- Decision: [fill in: which effects to keep for Phase 2 (e.g. "keep Bloom,
  drop SSAO due to cost / keep both"), and starting parameter values].

## Live audio FFT (`AudioFFTScreen`)

- Tested: `AudioContext` → `MediaElementAudioSourceNode` → `AnalyserNode`
  (`fftSize: 2048`) → `bucketFrequencyData` into 24 bands, rendered as bars.
- Observed: [fill in: responsiveness/latency, any audio glitches caused by
  the Web Audio graph, whether 24 bands looked visually rich enough].
- Decision: [fill in: `fftSize` and band count to carry into Phase 3's real
  visualizer styles].

## Continuous rotation (`RotationPerfScreen`)

- Tested: the same 8000-instance voxel block rotating continuously at
  one full turn per 24 seconds via `useFrame` + `nextRotationAngle`.
- Observed: [fill in: smoothness over multiple full rotations, any
  stutter].
- Decision: [fill in: confirmed rotation-speed range for Phase 2's
  turntable, e.g. "20-30s per rotation feels right; implemented via the
  same `nextRotationAngle` pure function"].

## Carried into Phase 1+ specs

- Reuse `buildVoxelGrid`, `bucketFrequencyData`, and `nextRotationAngle`
  as-is from `src/engine/` — they were designed to be production code, not
  throwaway prototype code.
- `@react-three/postprocessing` + `postprocessing` are confirmed compatible
  with this project's `three`/`@react-three/fiber` versions and are kept as
  real dependencies (already in Task 1's `package.json`), not research-only.
```

- [ ] **Step 2: Commit**

```bash
git add music-visualizer/docs/specs/2026-07-20-phase-0-research-findings.md
git commit -m "docs(music-visualizer): record phase 0 research findings"
```

---

## Post-plan verification

After all 7 tasks are complete, run the full suite once more from the project root to confirm nothing regressed:

```bash
cd music-visualizer && npm test && npm run typecheck && npm run lint
```

Expected: all three succeed. This closes out Phase 0; Phase 1 (App Shell & Playback Core) gets its own brainstorm/plan cycle next, informed by the findings doc from Task 7.
