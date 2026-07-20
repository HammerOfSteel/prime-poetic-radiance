# Phase 0: Foundation — Design

**Date:** 2026-07-20
**Status:** Approved
**Depends on:** `2026-07-20-roadmap-overview.md`

## Goal

Stand up the real project (Tauri + React + TypeScript + React Three Fiber) and
port the existing POC_2 functionality into it 1:1, with no new features. This
validates the new architecture end-to-end and gives every later phase a tested
foundation to build on.

## Scope

Port from `docs/poc-archive/POC_2.html`:
- Kitchen room (floor, walls, window, counters/cabinets, clutter props).
- Fridge centerpiece with draggable word magnets.
- 4 lighting presets (morning/day/evening/night).
- Camera zoom-to-fridge / step-back reset flow.
- Poetry Slam button: grammar-template-based poem generator + "unseen hands"
  animation moving magnets into place.
- Tesseract Shuffle button: existing shuffle behavior.

Explicitly out of scope for Phase 0 (later phases): word bank growth, visual
style overhaul, environment/weather sync, additional scenes, procedural
blueprint system.

## Architecture

```
prime-poetic-radiance/
├── src-tauri/            # Rust shell (tauri.conf.json, minimal main.rs — window setup only)
├── src/
│   ├── main.tsx           # entry point
│   ├── App.tsx            # top-level layout: <Canvas> + UI overlay
│   ├── scene/              # React Three Fiber components
│   │   ├── Kitchen.tsx      # room geometry (floor/walls/window/counter/clutter)
│   │   ├── Fridge.tsx        # fridge body + door + magnet mount surface
│   │   ├── Magnet.tsx         # single draggable word magnet mesh
│   │   ├── Lighting.tsx        # ambient/directional/fill/window lights, preset switch
│   │   ├── SlamButton.tsx       # 3D mesh button -> triggers engine.generatePoem
│   │   └── TesseractButton.tsx   # 3D mesh button -> triggers shuffle
│   ├── engine/              # pure TS, no Three.js/React imports
│   │   ├── wordBank.ts        # words + categories (ported as-is from POC_2)
│   │   ├── templates.ts        # grammar templates (ported as-is)
│   │   └── generatePoem.ts      # pure function: (wordBank, templates, rng?) => Token[]
│   ├── state/
│   │   └── sceneStore.ts    # Zustand: camera mode, lighting preset, dragged magnet id
│   └── ui/
│       ├── HUD.tsx           # top-left glass panel (title, instructions, lighting buttons)
│       └── StepBackButton.tsx # DOM "Step Back" button (shown only when zoomed in)
├── tests/
│   ├── engine/generatePoem.test.ts
│   └── ui/HUD.test.tsx
└── .github/workflows/ci.yml
```

## Data Flow

1. **Drag:** pointer-down on a magnet mesh → `sceneStore` records dragged id →
   pointer-move updates mesh position along the fridge-door drag plane →
   pointer-up clears drag state. (Direct port of POC_2's raycasting logic,
   adapted to R3F's `useFrame`/event props instead of manual `THREE.Raycaster`
   wiring where practical.)
2. **Poetry Slam:** button click → `engine.generatePoem(wordBank, templates)`
   (pure, synchronous, unit-testable in isolation) → returns ordered list of
   word tokens with metadata → `Fridge`/`Magnet` components animate the
   corresponding magnet meshes into place using GSAP (kept from POC_2 — proven,
   framework-agnostic, no need to replace in Phase 0).
3. **Lighting:** button click → `sceneStore` sets `lightingPreset` → `Lighting`
   component reacts (via Zustand subscription) and tweens light
   intensities/colors, same values as POC_2.

## Error Handling

- WebGL context-loss listener on the canvas shows a small "Something went
  wrong — reload?" overlay instead of a blank screen.
- R3F's `Canvas` handles resize responsively; no manual `window.resize`
  listener needed (unlike the POC).
- Tauri window/init failures are logged to the console; no dialog needed yet
  since there's no user-facing failure mode at this stage.
- Network/geolocation errors are out of scope (Phase 3).

## Testing

- **Unit (Vitest):** `generatePoem.ts` — template selection, category word
  picking, behavior when a category has no matching magnet available, empty
  word bank edge case, determinism when an RNG seed is supplied.
- **Component (Vitest + React Testing Library):** `HUD` renders title/buttons
  and calls the right store actions on click; `StepBackButton` only renders
  when zoomed in.
- **Build/CI smoke test:** GitHub Actions workflow runs on push/PR to any
  branch and on PRs to `main`: `npm ci`, `npm run lint`, `npm run typecheck`,
  `npm run test`, `npm run build`, and `cargo check` in `src-tauri/`.
- **Manual acceptance checklist** (recorded in the PR description): app
  launches via `npm run tauri dev`; kitchen/fridge render; magnets are
  draggable; all 4 lighting presets work; Poetry Slam produces a laid-out
  poem; Tesseract Shuffle works; camera zoom-in/step-back works.

## Repo & Workflow

- Repo: `HammerOfSteel/prime-poetic-radiance` (public), created via `gh repo
  create`.
- `main` gets the initial scaffold + this doc as the first commit(s).
- Branch `phase-0-foundation` off `main` for all Phase 0 work; one commit per
  subtask (see implementation plan); PR opened once Phase 0's tests pass;
  squash-merge back to `main`.
- The two POC HTML files are preserved under `docs/poc-archive/` for
  reference and are not deleted.

## Open Items Deferred to Later Phases

- Replacing GSAP with `@react-spring/three` (not needed now; revisit only if
  it becomes a friction point).
- Any Rust-side (`src-tauri`) business logic — the backend stays a thin shell
  through Phase 0.
