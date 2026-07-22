# 07 — Game Design Plan: Phases, Tasks, Subtasks

This plan is derived directly from research 01–06. Every phase below
exists to fix a specific, cited problem, not invented busywork. **No
implementation should begin on a phase until this plan (or a revision of
it) is reviewed/approved.** This document itself is the deliverable
requested: "a research plan for all this fleshed out and detailed with
phases and tasks and subtasks" — implementation is a separate, later
step.

## Guiding constraints (carried over from research)

- Genre target: **AHOG-leaning point-and-click** (research 03) — themed
  static room + narrative flavor + findable/clickable interactive props
  — not a full inventory/parser adventure game. Keep scope realistic.
- Every phase must end with the existing test suite green
  (`npm run lint && npm run typecheck && npm test`).
- Every phase must include a **manual visibility check** (screenshot or
  description of what's on-screen when zoomed into the room) — this is
  new, and directly answers the "I can't even see it" failure mode from
  this session. A phase that only produces code without confirming
  what's visible on screen does not count as done.

## Phase A — Room Layout Coordination System (blocking, do first)

**Problem addressed:** Bug 1 (06) — camera target, board position, and
furniture are laid out independently and don't line up; this is the
literal reason props are invisible.

- [ ] A1. Design a per-scene **layout contract**: replace the single
  global `BOARD_GROUP_POSITION` with a per-`SceneDefinition` `boardPosition`
  (and `boardRotation` if needed), so every room's board sits in a
  position that was actually chosen relative to that room's furniture.
- [ ] A2. For each existing scene, derive `cameraZoomedIn`/`cameraTarget`
  *from* the real furniture/board bounding box of that room (compute or
  hand-place a target that actually frames the desk/counter/table +
  board together), instead of reusing a shared default triple.
- [ ] A3. Add a lightweight **layout invariant test**: for each scene,
  assert that `cameraTarget` is within some reasonable distance of both
  the scene's `boardPosition` and at least one "hero prop" position
  (e.g. desk/monitor centroid) — this converts Bug 1 into something CI
  catches automatically instead of relying on manual QA forever.
- [ ] A4. Manual check: for every one of the 6 scenes, confirm (via dev
  server + description/screenshot) that zooming in actually shows the
  room's key furniture and board together, not just the board floating
  alone.

## Phase B — Discoverability & Response Polish for Interactive Props

**Problem addressed:** Bugs 4 (06) and research 01/03/04's "clickable
target legibility" and "response variation" findings.

- [ ] B1. Extend `InteractiveProp` with a hover affordance: cursor
  change to a pointer/hand on hover (already implicit via browser
  default for clickable meshes — verify/force it), plus a subtle
  emissive/outline highlight distinct from the existing hover-scale.
- [ ] B2. Add an optional per-prop "response" override so different
  props can have distinguishable reactions instead of one shared
  bounce-tween (e.g. squash-and-stretch for the duck, a brighter glow
  pulse for the cauldron) — small, reusable variants, not bespoke
  one-offs everywhere.
- [ ] B3. Add a minimal on-screen contextual prompt (HUD-level, not
  per-mesh) that shows a short label like "Coffee Machine" when hovering
  a named interactive prop, mirroring the HUD research's "A – open door"
  precedent (05).

## Phase C — Title Screen & Main Menu

**Problem addressed:** Bug 2 (06) and research 05's screen-flow
convention gap.

- [ ] C1. Add a `TitleScreen` component: game title/logo text, a
  "Start"/"Play" button, gates all Canvas/3D mounting until dismissed.
- [ ] C2. Add a `RoleSelectMenu` (the thematically-appropriate "main
  menu" for this concept): choose "Developer / Adventurer / Wizard /
  Cook" day, replacing the current hardcoded `kitchen` default entry
  point. Selecting a role routes into that role's first room.
- [ ] C3. Add a simple pause/settings overlay reachable from any
  in-game scene (rehome the existing `PostFxSettingsPanel` + lighting
  controls into it), with a "Return to Main Menu" action that unmounts
  back to `RoleSelectMenu`.
- [ ] C4. Tests: mount/unmount flow (title → role select → scene → back
  to menu) covered by a new integration test in `App.test.tsx` or a
  dedicated flow test file.

## Phase D — One Room, One Real Goal (proof of concept)

**Problem addressed:** Bug 5 (06) and research 02/04's "no puzzle-
solving, no goal/context" finding — prove the pattern on one room before
expanding.

- [ ] D1. Pick the **Developer Home Office** as the pilot room (it
  already has the richest prop set: duck, mug, desk, monitor).
- [ ] D2. Design one small, real goal: e.g. "write today's stand-up
  update" — click the monitor to open a short canned-text overlay,
  select one of 3 pre-written lines (reuse the existing
  `standupLines.ts` pattern), confirm it, room marks a visible
  "Day complete ✓" state in the HUD for that room/session. This should
  replace/supersede the Cubicle's existing meeting-tally-only framing
  (currently the player can just click it repeatedly with no end state)
  unless a clear reason to keep both is found while re-reviewing 02/04.
- [ ] D3. Persist "day complete" state in `sceneStore` (session-only,
  no localStorage needed for v1) and surface it in the HUD.
- [ ] D4. Tests for the new goal state (unit test store actions,
  component test for the overlay + completion flag).
- [ ] D5. Manual check + written note on whether this pattern feels
  "fun"/worth repeating before rolling out to other rooms (explicit
  go/no-go decision point, not an assumption).

## Phase E — Roll Out Goal Pattern to Remaining Rooms (conditional)

**Gated on Phase D's go/no-go.** Only proceed if Phase D's pilot is
judged successful.

- [ ] E1. Cubicle: turn the existing mock PR-review overlay into a real
  goal (approve/request-changes actually changes tracked state, e.g. a
  "PRs reviewed today" count with a defined session target).
- [ ] E2. Tavern/Dungeon/Kitchen/Office Kitchen: one small goal each,
  reusing the Phase D pattern (do not invent a new pattern per room).

## Phase F — Regression, Docs, Wrap-up

- [ ] F1. Full lint/typecheck/test pass.
- [ ] F2. Update `todo/overview_todo.md` to reflect this new plan
  superseding the old Phase 7–10 busywork-only scope (mark clearly which
  parts of 7–10 remain valid — role labels/taglines and room existence —
  vs. superseded — "prop = fun" framing without goals/camera fixes).
- [ ] F3. Update `docs/research/00-inventory.md` status table if any
  research gaps were found needing a follow-up doc.

## Explicit non-goals (to keep scope sane)

- No full verb/inventory system (look/use/take icon bar) — single-verb
  "interact" click model is sufficient per research 01/03.
- No persistent save-game/localStorage — session-only state is enough
  for a v1 "day in the life" vignette.
- No multiplayer/scoring/leaderboard systems.