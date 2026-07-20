# Music Visualizer — Overall Design

## Summary

A standalone browser web app, living in `music-visualizer/` at the repo
root, that renders a rotating voxel-art diorama scene above a turntable-style
LP player, synced to a locally-played audio track, with a live audio-reactive
visualizer and time-stamped lyric overlays. Forked from Bloom's rendering
conventions (R3F, Zustand, GSAP, toon shading) but otherwise fully
independent — separate `package.json`, dev server, and test suite.

This spec covers the whole-app design; implementation is split into phases
(see `2026-07-20-roadmap-overview.md`), each with its own plan.

## Goals

- Play local audio tracks with full transport controls (play/pause, seek,
  volume, next/prev) from a track-selection menu.
- Render each track as a distinct, hand-authored 3D diorama scene that sits
  above a rotating LP/turntable, tilted-camera composition.
- Diorama + LP rotate continuously and slowly while a track plays.
- Drive a live, audio-reactive visualizer ring (three selectable styles)
  from real-time FFT analysis of the currently playing track.
- Display time-synced lyrics that soft fade in/out at the right moment,
  plus a persistent title/artist/album header.
- Make adding a new track's visualization primarily a matter of authoring
  one new `scene.config.ts` + diorama content — not rebuilding the app.

## Non-goals

- No in-app visual scene builder / drag-and-drop editor. Scenes are
  hand-authored in code (by the assistant), not built through a GUI.
- No external voxel-modeling tool import pipeline (e.g. `.vox` files).
  Voxel props are authored as instanced/primitive geometry in React/R3F.
- No Tauri packaging — this is a plain browser web app.
- No drag-and-drop or ad-hoc file loading UI — tracks are provisioned via a
  local folder structure/manifest, not picked per-session.
- No pre-computed/offline audio analysis pipeline — FFT analysis happens
  live via the Web Audio API while a track plays.
- No shared code coupling back into Bloom (`src/`) — this project may start
  by copying relevant Bloom code, but diverges freely afterward with no
  ongoing dependency.

## Architecture

### Project layout

```
music-visualizer/
  package.json            # own Vite + React + R3F + Zustand + Vitest setup
  index.html
  src/
    engine/                # pure logic: lyrics parsing, FFT bucketing, rotation math
    services/              # audio loading/decoding, track manifest loading
    state/                 # Zustand stores: playback, track list, active track
    scene/                 # R3F components: Turntable, Diorama, VisualizerRing, per-track scenes
    ui/                    # track menu, transport controls, lyrics/header overlay
    tracks/                # per-track scene.config.ts + bespoke diorama components
  public/
    tracks/
      <track-id>/
        audio.mp3
        meta.json          # { title, artist, album }
        lyrics.json        # [{ start, end, text }, ...] seconds
  docs/
    specs/                 # design specs, one per phase
    plans/                 # implementation plans, one per phase
```

### Track manifest & content format

- `meta.json`: `{ "title": string, "artist": string, "album": string }`.
- `lyrics.json`: array of `{ start: number, end: number, text: string }`
  (seconds, relative to track start). No nesting/word-level timing.
- `scene.config.ts` (in `src/tracks/<track-id>/`, hand-authored, not in
  `public/`): per-track visual config — palette, particle type/density,
  light color/intensity, and `visualizerStyle: 'bars' | 'waveform' |
  'pulseRings'` — consumed by the shared diorama/particle/lighting/visualizer
  components. The diorama's actual voxel prop geometry is also authored here
  (or in a co-located component) as hand-written R3F, not data-driven.
- A track registry (`src/tracks/index.ts`) lists available track ids and
  wires each to its `public/tracks/<id>/` assets + its `scene.config.ts`.

### Playback core

- Native `<audio>` element (or `Howler`-free direct Web Audio graph) as the
  playback engine, wired through a `MediaElementAudioSourceNode` →
  `AnalyserNode` → `AudioContext.destination` chain, so the same element
  drives both audible playback and FFT analysis.
- Zustand `playbackStore`: `currentTrackId`, `isPlaying`, `currentTime`,
  `duration`, `volume`, play/pause/seek/next/prev actions.
- Transport UI subscribes to `playbackStore` and drives the `<audio>`
  element; a `requestAnimationFrame` loop reads `currentTime` each frame to
  drive lyrics and rotation (avoiding React re-renders at frame rate for
  those — read directly from the audio element/store in the R3F frame
  loop rather than via prop drilling).

### Turntable & diorama rendering (composition Option B)

- Camera fixed at a tilted-down angle onto a turntable base (LP disc +
  plinth/body), similar to Bloom's zoomed-in fridge framing but angled down.
- The diorama (per-track voxel scene) sits elevated above the disc's center
  on a thin visual riser, composed as its own `<group>` that rotates on the
  Y axis continuously while `isPlaying` is true (paused rotation when
  paused), at a slow constant angular speed (tuned during Phase 2, roughly
  one full rotation per 20-30s as a starting point).
- The LP disc beneath rotates in lockstep with the diorama (same rotation
  group, or a synced second group) to sell the "turntable" read.

### Visualizer ring

- `AnalyserNode` (`fftSize` around 2048, frequency-domain data) sampled each
  frame; a small `engine/` module buckets the frequency data into a fixed
  number of bands for the `bars` style, or an overall amplitude envelope for
  `waveform`/`pulseRings`.
- Three interchangeable R3F components sharing one analyser-data interface:
  - `VisualizerBars` — radial bars around the LP edge, per-band height.
  - `VisualizerWaveform` — a smooth deforming/glowing ring driven by
    amplitude.
  - `VisualizerPulseRings` — concentric rings spawned at the outer edge that
    travel inward on detected beats/energy peaks, fading as they converge.
- `scene.config.ts` selects which one mounts for that track.

### Lyrics & header overlay

- `engine/lyrics.ts`: pure function `activeLyricLine(lyrics, currentTime)` →
  the matching `{start,end,text}` entry or `null`, plus a `fadeProgress`
  helper for soft in/out easing near each line's boundaries.
- `ui/LyricsOverlay.tsx`: renders the active line (or nothing) low in frame
  near the disc, cross-fading between lines.
- `ui/TrackHeader.tsx`: persistent title/artist/album display near the top,
  reading from the active track's `meta.json`.

### Error handling

- Track loading failures (missing/corrupt audio, malformed `lyrics.json`/
  `meta.json`) are caught at the track-registry/loading layer and surface a
  clear "couldn't load this track" state in the menu rather than crashing
  the app; other tracks remain selectable.
- A top-level React error boundary (mirroring Bloom's
  `CanvasErrorBoundary`) wraps the 3D canvas so a rendering failure in one
  track's bespoke scene doesn't take down the whole app/menu.
- Missing/unsupported `AnalyserNode` (very old browsers) degrades
  gracefully: visualizer renders a static/idle state rather than throwing.

## Testing

Mirrors Bloom's split between pure-logic unit tests and R3F smoke tests:

- `engine/` modules (lyrics timing, FFT bucketing/band math, rotation angle
  math) — full unit test coverage, no rendering involved.
- `state/` stores (playback, track registry) — unit tests for actions and
  derived state.
- `scene/` R3F components — lightweight smoke tests (renders without
  throwing, expected structure), consistent with Bloom's
  `Kitchen.test.tsx`/`Fridge.test.tsx` pattern.
- Manual verification for actual audio/visual fidelity (FFT responsiveness,
  rotation smoothness, voxel rendering quality) — not meaningfully
  automatable, called out explicitly in each phase's plan as a manual
  verification step.

## Key decisions from brainstorming

1. New top-level folder in this repo (`music-visualizer/`), own toolchain,
   reusing this repo's git/PR/CI workflow.
2. Fork/copy relevant Bloom rendering code as a starting point; diverge
   freely afterward, no shared-package coupling.
3. Plain browser web app, no Tauri.
4. Scene switching is per-track (via a menu), not applicable in the same
   sense as Bloom's HUD toggle — one track = one scene, selected up front.
5. Tracks provisioned via a local folder + manifest
   (`public/tracks/<id>/...`), not drag-and-drop.
6. Scenes are hand-authored in code by the assistant, no in-app builder, no
   external voxel-tool import pipeline.
7. Audio analysis is live via Web Audio `AnalyserNode`, not pre-computed.
8. Lyrics format is a custom JSON array with explicit `start`/`end` per
   line (not `.lrc`).
9. Camera/composition: Option B — tilted turntable view, diorama floats
   above the disc as a raised plinth centerpiece.
10. Diorama + LP rotate continuously and slowly while playing (paused when
    playback is paused).
11. Per-track mood (palette/particles/lighting/visualizer style) is
    config-driven (`scene.config.ts`) against a shared rendering system, not
    fully bespoke code per track — the diorama's actual voxel geometry is
    still hand-authored per track.
12. Visualizer style is itself configurable per track among three
    implemented styles: `bars`, `waveform`, `pulseRings`.
13. Full playback transport UI (play/pause, seek, volume, next/prev).
14. A track-selection menu screen exists (not a single hardcoded track).
15. Voxel rendering fidelity (subvoxel detail, bloom/glow, ambient
    occlusion) is a dedicated Phase 0 research topic before any real scene
    is built, since Bloom's current renderer doesn't yet achieve the target
    look shown in reference screenshots.
