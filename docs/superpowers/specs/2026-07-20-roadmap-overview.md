# Prime Poetic Radiance — Roadmap Overview

**Date:** 2026-07-20
**Status:** Approved

## What This Is

Prime Poetic Radiance is a cozy, low-poly 3D "magnetic fridge poetry" toy: a stylized
scene (starting with a kitchen fridge) covered in draggable word magnets that the
player arranges into poems, with a "Poetry Slam" generator that auto-composes
poems from a themed word bank and grammar templates.

Two HTML/Three.js proof-of-concepts (`docs/poc-archive/POC_1.html`,
`docs/poc-archive/POC_2.html`) validated the core interaction loop. This roadmap
plans the rewrite into a proper, testable, extensible desktop application, plus
a sequence of feature phases building toward a rich, ever-varied toy.

## Target Stack

- **Shell:** Tauri (Rust) — small, fast, modern desktop packaging.
- **Frontend:** React + TypeScript, bundled with Vite.
- **3D rendering:** Three.js via React Three Fiber (R3F).
- **State:** Zustand.
- **Assets:** Procedurally built from primitives in code (no external modeling
  tools/asset pipeline) — consistent with the later procedural blueprint system.
- **Poetry generation:** Expanded rule-based grammar templates (word bank +
  categories + templates + scene-theme weighting). Fully offline, deterministic,
  no LLM/ML dependency.
- **Environment sync:** System clock + IP geolocation + Open-Meteo (free, no API
  key) for real day/night, season, and weather; offline fallback cycles purely
  from system clock/date.
- **Testing:** Vitest (unit), React Testing Library (component smoke tests),
  `cargo test` for any Rust-side logic, GitHub Actions CI.
- **Repo:** `HammerOfSteel/prime-poetic-radiance` (public).

## Phase Plan

Each phase: branches off `main` (`phase-N-<name>`), gets its own short design
note if scope isn't fully covered here, has tests, commits per subtask, and is
merged back to `main` via PR once its tests pass.

| Phase | Name | Summary |
|---|---|---|
| 0 | Foundation | Scaffold Tauri+React+TS+R3F app; port POC_2's kitchen/fridge/magnets/lighting/Poetry-Slam/Tesseract-shuffle 1:1 into the new architecture; CI; test harness. |
| 1 | Poetry Engine | Grow the word bank substantially; richer grammar templates; categorize/weight words by scene theme; fully unit-tested, rendering-agnostic `engine/` module. |
| 2 | Visual Style Pass | Cozy low-poly "toy" look: refined primitive shapes, toon/flat shading, warmer material palette, polished lighting; scene-transition effects (e.g. camera swoop + wipe/dissolve) when switching scenes. |
| 3 | Environment System | Real-world-aligned day/night cycle, season, and weather (via geolocation + Open-Meteo), affecting lighting/skybox/props, with graceful offline fallback. |
| 4 | Scene Variety | Multiple hand-authored scenes beyond the apartment fridge (e.g. fantasy tavern board, RPG dungeon board, other mundane objects) sharing a common "magnet surface" abstraction so the poetry/drag mechanic is scene-agnostic. |
| 5 | Procedural Blueprint System | Modular, composable scene "blueprints" (rooms, props, palettes, word themes as data) enabling algorithmic/emergent random scene generation — the long-term "infinite variety" goal. |

## Non-Goals (for now)

- No online multiplayer/sharing.
- No LLM-based poem generation (may be revisited as a later, opt-in phase).
- No external 3D asset pipeline (Blender/GLTF authoring) — everything stays
  code-generated primitives, at least through Phase 5.

## Next Step

Phase 0 has its own detailed spec: `2026-07-20-phase-0-foundation-design.md`.
Implementation proceeds via the `writing-plans` skill once that spec is
approved.
