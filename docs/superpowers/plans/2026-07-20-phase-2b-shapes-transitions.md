# Phase 2b: Shapes & Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Round the sharp corners on freestanding box-shaped scene objects (cabinet, fridge body/door) and add a fade overlay to the existing camera zoom transition, per the Phase 2b design spec.

**Architecture:** Swap `boxGeometry` for drei's `RoundedBox` on freestanding objects only (walls and magnet tiles stay flat, per the spec's Non-Goals). Add a new presentational `TransitionOverlay` component whose opacity is driven by a `gsap.timeline()` running alongside the existing camera-position tween in `App.tsx`'s `CameraRig`.

**Tech Stack:** React, TypeScript, `@react-three/fiber`, `@react-three/drei` (`RoundedBox`, already installed), `gsap`, Vitest, `@testing-library/react`.

## Global Constraints

- `RoundedBox` radius must stay strictly less than half of every mesh's smallest `args` dimension, or the underlying `extrudeGeometry`'s `depth: depth - radius * 2` goes to zero/negative and the mesh degenerates (verified in `node_modules/@react-three/drei/core/RoundedBox.js`). Two of the four converted meshes are thin slabs (0.2 in their smallest dimension) and need a smaller radius than the others — see Task 1's exact values, do not use a single radius for all four.
- Only these meshes are converted to `RoundedBox`: Kitchen's cabinet base and cabinet top trim; Fridge's body and door. Everything else (floor, walls, window plane, kettle, pot, plant, magnet tiles) stays exactly as-is — walls would show seam gaps if rounded, and magnet tiles would have their word-texture UVs distorted by `RoundedBox`'s extruded geometry.
- The camera's own tween (`duration: 0.8`, `ease: 'power2.inOut'`, targeting `CAMERA_ZOOMED_IN`/`CAMERA_ZOOMED_OUT`) is unchanged. Only a new, separate overlay timeline is added alongside it.
- Overlay color is `#fdf6ec` (warm cream/butter), rendered as a fixed full-viewport div with `pointer-events: none` so it never blocks clicks/drags.
- Overlay timing: fade 0→1 over 0.25s (`power1.in`), hold at 1 for 0.1s, fade 1→0 over 0.25s (`power1.out`) — total ~0.6s, intentionally shorter than the 0.8s camera tween so the overlay clears before the camera fully settles (per spec, avoids a "camera still moving after fade clears" flash — the hold covers the middle of the camera's motion, not its entire duration).

---

### Task 1: Round freestanding box shapes in Kitchen and Fridge

**Files:**
- Modify: `src/scene/Kitchen.tsx` (cabinet base mesh, cabinet top trim mesh)
- Modify: `src/scene/Fridge.tsx` (fridge body mesh, fridge door mesh)
- Test (existing, no changes needed, run to verify no regression): `src/scene/Kitchen.test.tsx`, `src/scene/Fridge.test.tsx`

**Interfaces:**
- Consumes: `RoundedBox` from `@react-three/drei` (already a project dependency — `import { RoundedBox } from '@react-three/drei';`). `createToonGradientMap` from `./toonGradient` (already imported in both files, unchanged).
- Produces: nothing new consumed by later tasks — this task is self-contained.

Current `src/scene/Kitchen.tsx` cabinet meshes (for reference, do not copy verbatim — you're replacing these two blocks):
```tsx
      <mesh position={[-4, 1.5, -4]} castShadow receiveShadow>
        <boxGeometry args={[12, 3, 3]} />
        <meshToonMaterial color="#c96a3e" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-4, 3.1, -4]} castShadow receiveShadow>
        <boxGeometry args={[12.2, 0.2, 3.2]} />
        <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
      </mesh>
```

Current `src/scene/Fridge.tsx` body/door meshes (for reference, do not copy verbatim — you're replacing these two blocks):
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

- [ ] **Step 1: Add the `RoundedBox` import to `src/scene/Kitchen.tsx`**

Change the top of `src/scene/Kitchen.tsx` from:
```tsx
import { useMemo } from 'react';
import { createToonGradientMap } from './toonGradient';
```
to:
```tsx
import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';
```

- [ ] **Step 2: Replace the cabinet base and trim meshes in `src/scene/Kitchen.tsx`**

Replace this block:
```tsx
      <mesh position={[-4, 1.5, -4]} castShadow receiveShadow>
        <boxGeometry args={[12, 3, 3]} />
        <meshToonMaterial color="#c96a3e" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-4, 3.1, -4]} castShadow receiveShadow>
        <boxGeometry args={[12.2, 0.2, 3.2]} />
        <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
      </mesh>
```
with:
```tsx
      <RoundedBox args={[12, 3, 3]} radius={0.1} smoothness={4} position={[-4, 1.5, -4]} castShadow receiveShadow>
        <meshToonMaterial color="#c96a3e" gradientMap={gradientMap} />
      </RoundedBox>

      <RoundedBox args={[12.2, 0.2, 3.2]} radius={0.06} smoothness={4} position={[-4, 3.1, -4]} castShadow receiveShadow>
        <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
      </RoundedBox>
```

Note: the trim's smallest dimension is its height, `0.2` — a `radius` of `0.1` would zero out the geometry's extrude depth (see Global Constraints), so it uses `0.06` instead of the cabinet base's `0.1`.

- [ ] **Step 3: Run the Kitchen test to verify no regression**

Run: `npx vitest run src/scene/Kitchen.test.tsx`
Expected: PASS (1 test) — the mesh-count assertion (`>= 3`) still holds; `RoundedBox` renders as a `Mesh` node in `@react-three/test-renderer`, same as a plain `<mesh>`.

- [ ] **Step 4: Add the `RoundedBox` import to `src/scene/Fridge.tsx`**

Change the top of `src/scene/Fridge.tsx` from:
```tsx
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
```
to:
```tsx
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
```

- [ ] **Step 5: Replace the fridge body and door meshes in `src/scene/Fridge.tsx`**

Replace this block:
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
with:
```tsx
      <RoundedBox args={[3.5, 8, 3]} radius={0.1} smoothness={4} position={[0, 4, 0]} castShadow receiveShadow>
        <meshToonMaterial color="#f6d98a" gradientMap={gradientMap} />
      </RoundedBox>

      <RoundedBox args={[3.6, 7.8, 0.2]} radius={0.06} smoothness={4} position={[0, 4, 1.55]} receiveShadow>
        <meshToonMaterial color="#f6d98a" gradientMap={gradientMap} />
      </RoundedBox>
```

Note: same as the cabinet trim, the door's smallest dimension is its depth, `0.2`, so it uses `radius={0.06}` instead of the body's `0.1`.

- [ ] **Step 6: Run the Fridge test to verify no regression**

Run: `npx vitest run src/scene/Fridge.test.tsx`
Expected: PASS (1 test) — the mesh-count assertion (`=== 39`) still holds.

- [ ] **Step 7: Commit**

```bash
git add src/scene/Kitchen.tsx src/scene/Fridge.tsx
git commit -m "feat: round freestanding cabinet and fridge shapes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 2: Transition fade overlay component

**Files:**
- Create: `src/scene/TransitionOverlay.tsx`
- Test: `src/scene/TransitionOverlay.test.tsx`
- Modify: `src/styles.css` (add `.transition-overlay` class)

**Interfaces:**
- Produces: `TransitionOverlay` React component, exported from `src/scene/TransitionOverlay.tsx`, with props `{ progress: number }` where `progress` is a 0–1 opacity value. Task 3 imports and renders this component from `App.tsx`, passing a `progress` value it drives itself — this component has no animation logic of its own.

- [ ] **Step 1: Write the failing test**

Create `src/scene/TransitionOverlay.test.tsx`:
```tsx
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { TransitionOverlay } from './TransitionOverlay';

describe('TransitionOverlay', () => {
  it('renders fully transparent at progress 0', () => {
    const { container } = render(<TransitionOverlay progress={0} />);
    const overlay = container.querySelector('.transition-overlay');
    expect(overlay).toHaveStyle({ opacity: '0' });
  });

  it('renders fully opaque at progress 1', () => {
    const { container } = render(<TransitionOverlay progress={1} />);
    const overlay = container.querySelector('.transition-overlay');
    expect(overlay).toHaveStyle({ opacity: '1' });
  });

  it('renders partial opacity mid-transition', () => {
    const { container } = render(<TransitionOverlay progress={0.5} />);
    const overlay = container.querySelector('.transition-overlay');
    expect(overlay).toHaveStyle({ opacity: '0.5' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/scene/TransitionOverlay.test.tsx`
Expected: FAIL — `Cannot find module './TransitionOverlay'` (the component doesn't exist yet).

- [ ] **Step 3: Write the component**

Create `src/scene/TransitionOverlay.tsx`:
```tsx
export interface TransitionOverlayProps {
  progress: number;
}

export function TransitionOverlay({ progress }: TransitionOverlayProps) {
  return <div className="transition-overlay" style={{ opacity: progress }} />;
}
```

- [ ] **Step 4: Add the overlay CSS class**

Add to the end of `src/styles.css`:
```css

.transition-overlay {
    position: fixed;
    inset: 0;
    background: #fdf6ec;
    pointer-events: none;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/scene/TransitionOverlay.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/scene/TransitionOverlay.tsx src/scene/TransitionOverlay.test.tsx src/styles.css
git commit -m "feat: add transition fade overlay component

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 3: Wire the overlay into the camera transition

**Files:**
- Modify: `src/App.tsx`
- Test (existing, no changes needed, run to verify no regression): `src/App.test.tsx`

**Interfaces:**
- Consumes: `TransitionOverlay` component and its `TransitionOverlayProps` from `./scene/TransitionOverlay` (Task 2).
- Produces: nothing new consumed by later tasks.

Current `src/App.tsx` in full (for reference — you're modifying this file):
```tsx
import { useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import { Kitchen } from './scene/Kitchen';
import { Fridge } from './scene/Fridge';
import { Lighting } from './scene/Lighting';
import { CanvasErrorBoundary } from './scene/CanvasErrorBoundary';
import { HUD } from './ui/HUD';
import { StepBackButton } from './ui/StepBackButton';
import { useSceneStore } from './state/sceneStore';

const CAMERA_ZOOMED_IN: [number, number, number] = [4, 5, 3.5];
const CAMERA_ZOOMED_OUT: [number, number, number] = [0, 4, 15];

function CameraRig({ isZoomedIn, onTweenChange }: { isZoomedIn: boolean; onTweenChange: (tweening: boolean) => void }) {
  const { camera } = useThree();

  useEffect(() => {
    const [x, y, z] = isZoomedIn ? CAMERA_ZOOMED_IN : CAMERA_ZOOMED_OUT;
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
  }, [camera, isZoomedIn, onTweenChange]);

  return null;
}

function App() {
  const isZoomedIn = useSceneStore((state) => state.isZoomedIn);
  const zoomToFridge = useSceneStore((state) => state.zoomToFridge);
  const [isTweening, setIsTweening] = useState(false);

  const cameraTarget: [number, number, number] = isZoomedIn ? [4, 5, -1.85] : [0, 3, 0];

  return (
    <div data-testid="app-root" style={{ width: '100vw', height: '100vh' }}>
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: CAMERA_ZOOMED_OUT, fov: 45, near: 0.1, far: 1000 }}
          shadows
          onPointerMissed={() => {
            if (!isZoomedIn) zoomToFridge();
          }}
        >
          <CameraRig isZoomedIn={isZoomedIn} onTweenChange={setIsTweening} />
          <Lighting />
          <Kitchen />
          <Fridge />
          <OrbitControls
            target={cameraTarget}
            enabled={isZoomedIn && !isTweening}
            minDistance={5}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
        </Canvas>
      </CanvasErrorBoundary>
      <HUD />
      <StepBackButton />
    </div>
  );
}

export default App;
```

- [ ] **Step 1: Update imports**

Replace:
```tsx
import { useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import { Kitchen } from './scene/Kitchen';
import { Fridge } from './scene/Fridge';
import { Lighting } from './scene/Lighting';
import { CanvasErrorBoundary } from './scene/CanvasErrorBoundary';
import { HUD } from './ui/HUD';
import { StepBackButton } from './ui/StepBackButton';
import { useSceneStore } from './state/sceneStore';
```
with:
```tsx
import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import { Kitchen } from './scene/Kitchen';
import { Fridge } from './scene/Fridge';
import { Lighting } from './scene/Lighting';
import { CanvasErrorBoundary } from './scene/CanvasErrorBoundary';
import { TransitionOverlay } from './scene/TransitionOverlay';
import { HUD } from './ui/HUD';
import { StepBackButton } from './ui/StepBackButton';
import { useSceneStore } from './state/sceneStore';
```

- [ ] **Step 2: Extend `CameraRig` to drive the overlay timeline**

Replace:
```tsx
function CameraRig({ isZoomedIn, onTweenChange }: { isZoomedIn: boolean; onTweenChange: (tweening: boolean) => void }) {
  const { camera } = useThree();

  useEffect(() => {
    const [x, y, z] = isZoomedIn ? CAMERA_ZOOMED_IN : CAMERA_ZOOMED_OUT;
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
  }, [camera, isZoomedIn, onTweenChange]);

  return null;
}
```
with:
```tsx
function CameraRig({
  isZoomedIn,
  onTweenChange,
  onOverlayProgress,
}: {
  isZoomedIn: boolean;
  onTweenChange: (tweening: boolean) => void;
  onOverlayProgress: (progress: number) => void;
}) {
  const { camera } = useThree();
  const overlayTimelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const [x, y, z] = isZoomedIn ? CAMERA_ZOOMED_IN : CAMERA_ZOOMED_OUT;
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
    const overlay = { progress: 0 };
    overlayTimelineRef.current = gsap
      .timeline({ onUpdate: () => onOverlayProgress(overlay.progress) })
      .to(overlay, { progress: 1, duration: 0.25, ease: 'power1.in' })
      .to(overlay, { progress: 1, duration: 0.1 })
      .to(overlay, { progress: 0, duration: 0.25, ease: 'power1.out' });
  }, [camera, isZoomedIn, onTweenChange, onOverlayProgress]);

  return null;
}
```

- [ ] **Step 3: Add overlay state and pass it through in `App`**

Replace:
```tsx
function App() {
  const isZoomedIn = useSceneStore((state) => state.isZoomedIn);
  const zoomToFridge = useSceneStore((state) => state.zoomToFridge);
  const [isTweening, setIsTweening] = useState(false);

  const cameraTarget: [number, number, number] = isZoomedIn ? [4, 5, -1.85] : [0, 3, 0];

  return (
    <div data-testid="app-root" style={{ width: '100vw', height: '100vh' }}>
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: CAMERA_ZOOMED_OUT, fov: 45, near: 0.1, far: 1000 }}
          shadows
          onPointerMissed={() => {
            if (!isZoomedIn) zoomToFridge();
          }}
        >
          <CameraRig isZoomedIn={isZoomedIn} onTweenChange={setIsTweening} />
          <Lighting />
          <Kitchen />
          <Fridge />
          <OrbitControls
            target={cameraTarget}
            enabled={isZoomedIn && !isTweening}
            minDistance={5}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
        </Canvas>
      </CanvasErrorBoundary>
      <HUD />
      <StepBackButton />
    </div>
  );
}
```
with:
```tsx
function App() {
  const isZoomedIn = useSceneStore((state) => state.isZoomedIn);
  const zoomToFridge = useSceneStore((state) => state.zoomToFridge);
  const [isTweening, setIsTweening] = useState(false);
  const [overlayProgress, setOverlayProgress] = useState(0);

  const cameraTarget: [number, number, number] = isZoomedIn ? [4, 5, -1.85] : [0, 3, 0];

  return (
    <div data-testid="app-root" style={{ width: '100vw', height: '100vh' }}>
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: CAMERA_ZOOMED_OUT, fov: 45, near: 0.1, far: 1000 }}
          shadows
          onPointerMissed={() => {
            if (!isZoomedIn) zoomToFridge();
          }}
        >
          <CameraRig isZoomedIn={isZoomedIn} onTweenChange={setIsTweening} onOverlayProgress={setOverlayProgress} />
          <Lighting />
          <Kitchen />
          <Fridge />
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
```

- [ ] **Step 4: Run the App test to verify no regression**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Run the full test suite**

Run: `npx vitest run`
Expected: all test files pass, same count as before this task plus the 3 new `TransitionOverlay` tests from Task 2.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat: fade the screen during the camera zoom transition

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 4: Final verification, spec status update, and PR

**Files:**
- Modify: `docs/superpowers/specs/2026-07-20-phase-2b-shapes-transitions-design.md` (status line only)

**Interfaces:**
- Consumes: nothing new — this task verifies the combined output of Tasks 1–3.
- Produces: nothing — terminal task.

- [ ] **Step 1: Update the spec status**

In `docs/superpowers/specs/2026-07-20-phase-2b-shapes-transitions-design.md`, change:
```
**Status:** Approved
```
to:
```
**Status:** Implemented
```

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Run the full test suite**

Run: `npm run test`
Expected: all test files pass (previous 47 tests + 3 new `TransitionOverlay` tests = 50 tests).

- [ ] **Step 5: Run the production build**

Run: `npm run build`
Expected: build succeeds (pre-existing chunk-size warning is expected and not a regression).

- [ ] **Step 6: Commit the spec status update**

```bash
git add docs/superpowers/specs/2026-07-20-phase-2b-shapes-transitions-design.md
git commit -m "docs: mark Phase 2b spec as implemented

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

- [ ] **Step 7: Push the branch and open a PR**

First write the PR body to a file (avoids shell quoting issues with `gh pr create --body`):

```bash
cat > /tmp/phase-2b-pr-body.md << 'EOF'
## Summary
Implements Phase 2b of the Visual Style Pass: rounded freestanding shapes (cabinet, fridge body/door) and a fade-overlay polish on the existing camera zoom transition, per the design spec.

- Cabinet base/trim and fridge body/door now use drei's `RoundedBox` for softened, toy-like edges. Walls and magnet tiles stay flat (seam gaps / word-texture UV distortion, respectively).
- A new `TransitionOverlay` component fades a warm cream overlay in and out during the existing camera zoom tween, giving the transition a more deliberate, polished feel. Camera easing/duration unchanged.

## Docs
- Design spec: `docs/superpowers/specs/2026-07-20-phase-2b-shapes-transitions-design.md` (status: Implemented)
- Implementation plan: `docs/superpowers/plans/2026-07-20-phase-2b-shapes-transitions.md`

## Verification
- `npm run lint` — clean
- `npm run typecheck` — clean
- `npm run test` — all passing
- `npm run build` — succeeds
EOF
```

Then push and create the PR:

```bash
git push -u origin phase-2b-shapes-transitions
gh pr create --title "Phase 2b: Shapes & Transitions" --body-file /tmp/phase-2b-pr-body.md
```

- [ ] **Step 8: Wait for CI, then merge**

Run: `gh pr checks --watch` (on the PR just opened), then once all checks pass:
```bash
gh pr merge --squash --delete-branch
```
