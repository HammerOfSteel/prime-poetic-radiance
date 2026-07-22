# Phase 8b: Developer Day — Cubicle + Office Kitchen

**Goal:** Round out the Developer "Day in the Life" with the two
remaining sub-rooms scoped in `todo/overview_todo.md`'s research: the
**Cubicle** (sterile open-plan contrast room, with a stand-up vignette,
mock PR-review overlay, and a running "meetings today" tally gag) and the
**Office Kitchen** (coffee-break social room).

**Depends on:** Phase 8 (Developer Home Office, `developer` word theme,
`InteractiveProp`).
**Branch:** `phase-8b-developer-cubicle-and-kitchen`.
**Status:** Complete.

## Tasks

### Scene registration

- [x] Added `developerCubicle` and `developerOfficeKitchen` to
  `SceneId`/`SCENE_IDS`/`SCENES` in `src/engine/scenes.ts`, each with its
  own `roleTagline` ("...— Cubicle" / "...— Office Kitchen").
- [x] Cubicle uses a fixed, deliberately flat/fluorescent lighting preset
  (`usesEnvironmentLighting: false`) to sell its sterile-office mood;
  Office Kitchen uses the environment lighting system.
- [x] Registered both in `App.tsx`'s `SCENE_COMPONENTS`.

### Room & board components

- [x] `src/scene/DeveloperCubicle.tsx`: beige partitions, motivational
  poster, standing-desk riser, monitor.
- [x] `src/scene/DeveloperCubicleBoard.tsx`: whiteboard magnet surface.
- [x] `src/scene/DeveloperOfficeKitchen.tsx`: counter, coffee machine,
  round table, NPC silhouette prop.
- [x] `src/scene/DeveloperOfficeKitchenBoard.tsx`: small corkboard magnet
  surface.

### Signature busywork interactions

- [x] **Meetings-today tally** (Cubicle): sticky-note prop, click →
  increments a pure visual tally mark count via new
  `cubicleMeetingTally` store state (`incrementCubicleMeetingTally`).
- [x] **Muted video-call window** (Cubicle): panel + avatar prop with the
  shared `InteractiveProp` bounce as its "you're on mute" shake stand-in.
- [x] **Stand-up vignette** (Cubicle): calendar/clock prop → advances
  `cubicleStandupLineIndex`; a new DOM overlay (`CubicleOverlays.tsx`)
  renders the current canned line from `src/engine/standupLines.ts` (a
  small, pure, unit-tested fixed script with wraparound) in a speech
  bubble with a Close button.
- [x] **Mock PR-review** (Cubicle): clicking the monitor opens a DOM
  overlay with "Approve"/"Request changes" buttons — both just close the
  overlay (no real logic), consistent with "busywork, no consequence."
- [x] **Coffee machine** (Office Kitchen): click → brew animation (steam
  sprite drifts/fades via gsap) alongside the shared bounce.
- [x] **Snack jar** (Office Kitchen): click → lid-pop via the shared
  bounce.

### State & testing

- [x] Extended `sceneStore.ts` with `cubicleMeetingTally`,
  `cubicleStandupLineIndex`, `cubiclePrReviewOpen` and their setters —
  all pure UI/flavor state, no persistence, no gameplay consequence.
- [x] `sceneStore.test.ts` covers the new actions.
- [x] `standupLines.test.ts` covers the pure line-rotation helper.
- [x] Component smoke tests: `DeveloperCubicle.test.tsx`,
  `DeveloperCubicleBoard.test.tsx`, `DeveloperOfficeKitchen.test.tsx`,
  `DeveloperOfficeKitchenBoard.test.tsx`, `CubicleOverlays.test.tsx`.
- [x] `npm run lint && npm run typecheck && npm test` all green
  (pre-existing unrelated `music-visualizer` worktree failures excluded).

## Out of Scope

- No room-to-room "walk through a door" navigation model — room
  switching stays via the existing HUD scene-switcher buttons (all 6
  scenes, including the 3 Developer rooms, are listed there
  automatically since `HUD.tsx` iterates `SCENE_IDS`).
- No real PR/code-review logic, no persisted meeting count across
  reloads — all Cubicle state resets on store reinitialization by
  design (pure flavor, not a save-game feature).