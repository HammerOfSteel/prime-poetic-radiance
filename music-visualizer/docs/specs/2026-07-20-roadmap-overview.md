# Music Visualizer — Roadmap Overview

## Vision

A standalone browser web app that turns your own songs into cozy voxel-art
music videos: a rotating diorama scene sits atop a turntable-style LP player,
lit and animated to match the track's mood, with a live audio-reactive
visualizer ring and time-synced lyrics. Each track gets its own hand-authored
scene (built by the assistant, not the user). The app doubles as a great
local player for your music collection.

This lives in `music-visualizer/` at the repo root as an independent project
(own `package.json`, own Vite dev server, own test suite) — separate from the
"Bloom" fridge-poetry app in `src/`, though it starts from Bloom's rendering
conventions (R3F + Zustand + GSAP) as a fork point.

## Phases

- **Phase 0 — Research & Fidelity Prototype.** Bloom has no true
  voxel/subvoxel renderer or post-processing pipeline today (just toon-shaded
  primitives, no bloom/glow, no AO). Before building any real scene, prototype
  and validate the rendering techniques needed to match the target voxel-art
  fidelity (see reference screenshots in the design spec): subvoxel-density
  instanced geometry, bloom/glow post-processing, ambient occlusion, warm
  point-light treatment. Also validate the two other technically uncertain
  areas: Web Audio `AnalyserNode` real-time FFT driving a Three.js visualizer,
  and continuous smooth object rotation performance. Produces a short
  prototype (not shippable UI) proving each technique works and documenting
  the chosen approach.
- **Phase 1 — App Shell & Playback Core.** Project scaffolding
  (`music-visualizer/` Vite+React+R3F+Zustand app), track manifest loading
  (`public/tracks/<id>/{audio, meta.json, lyrics.json, scene.config.ts}`),
  track-selection menu screen, full playback transport (play/pause, seek,
  volume, next/prev), lyrics timing playback (no visuals yet — text overlay
  only). No 3D diorama yet; a placeholder scene is fine.
- **Phase 2 — Turntable & Diorama Rendering.** The camera-tilted turntable
  composition (Option B): LP disc, rotating base, the diorama "plinth" above
  it, continuous slow rotation while playing, using the fidelity techniques
  validated in Phase 0. First real per-track scene.config.ts-driven scene
  (palette/particles/lighting) for one track, to prove the config-driven
  system end-to-end.
- **Phase 3 — Audio-Reactive Visualizer.** Live FFT analysis wired to the
  three configurable visualizer styles (`bars`, `waveform`, `pulseRings`)
  rendered around/under the LP.
- **Phase 4 — Lyrics Presentation Polish.** Soft fade in/out animation timing
  and placement refinement, title/artist/album header treatment.
- **Phase 5+ — Additional Track Scenes.** Author new `scene.config.ts` +
  bespoke diorama content for each additional song, one at a time, reusing
  the Phase 1-4 systems.

Each phase gets its own design spec (`docs/specs/`) and implementation plan
(`docs/plans/`) inside `music-visualizer/`, following the same
brainstorm → plan → subagent-driven-development → finish pipeline used for
Bloom.
