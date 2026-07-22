# Phase 8b: "A Day in the Life of a Developer" — Cubicle + Office Kitchen

**Goal:** Add the second and third Developer sub-rooms — **Cubicle**
(sterile open-plan contrast to Home Office) and **Office Kitchen**
(social coffee-break room) — plus the signature Developer set-piece
interactions researched for this role: the daily stand-up vignette, a
mock PR-review mini-interaction, and a running "meetings today" gag.

**Depends on:** Phase 8 (Home Office ships first — establishes the
`developer` word bank, `MagnetBoard`/atmosphere patterns this phase
reuses).
**Branch suggestion:** `phase-8b-developer-cubicle-and-kitchen`.

## Tasks

### Cubicle room

- [ ] Add `'developer-cubicle'` `SceneId` entry in `src/engine/scenes.ts`
  (`wordTheme: 'developer'` — shared with Home Office,
  `usesEnvironmentLighting: true` or a flat fluorescent-lit fixed preset
  — decide based on how "sterile office" reads against the existing
  lighting presets; fixed preset likely reads better for the
  intentionally flat/beige mood), `roleLabel: 'Developer'`,
  `roleTagline: 'A Day in the Life of a Developer — Cubicle'`.
- [ ] `src/scene/DeveloperCubicle.tsx`: beige fabric partition walls,
  motivational poster prop, standing-desk converter, monitor, keyboard —
  intentionally sterile/flat contrast to Home Office's cozy palette.
- [ ] `src/scene/DeveloperCubicleBoard.tsx`: reuse the `MagnetBoard`
  abstraction (e.g. a whiteboard or corkboard surface), sized to this
  room's geometry.
- [ ] **"Meetings today" sticky-note tally** — a small prop (sticky note
  stack or whiteboard tally-mark counter) that increments by 1 each time
  it's clicked, pure visual gag, resets on scene reload (no persistence)
  — running joke per research finding on meeting fatigue.
- [ ] **Video-call window prop** — a flat "frozen webcam" panel showing a
  static muted avatar with a "You are on mute" label; click → a brief
  muted-mic-shake/no-sound animation (visual joke, no audio needed).
- [ ] **Calendar/clock prop → Stand-up vignette**: clicking this prop
  triggers a short scripted vignette: 2-3 simple avatar silhouettes (flat
  toon-shaded humanoid shapes, reusing existing shading conventions)
  appear briefly with a speech-bubble carousel cycling through 3-4 canned
  stand-up lines (e.g. "Yesterday I fixed the flaky test.", "Today: PR
  review + the auth bug.", "Blocked on staging access."). Implement the
  canned-line data as a small pure array in `src/engine/` (testable) with
  the vignette's presentation as an R3F component (manual QA per
  project convention). No real dialogue system, no branching.

### Office Kitchen room

- [ ] Add `'developer-office-kitchen'` `SceneId` entry
  (`wordTheme: 'developer'`, `usesEnvironmentLighting: true`,
  `roleLabel: 'Developer'`,
  `roleTagline: 'A Day in the Life of a Developer — Office Kitchen'`).
- [ ] `src/scene/DeveloperOfficeKitchen.tsx`: coffee machine, mug rack,
  small round table, a seated/standing NPC silhouette prop for
  incidental social-break flavor (no dialogue tree — just presence, or at
  most a single canned speech-bubble line on click, mirroring the
  stand-up vignette's simple approach).
- [ ] `src/scene/DeveloperOfficeKitchenBoard.tsx`: reuse `MagnetBoard`
  (e.g. a corkboard/notice-board surface near the coffee machine, sized
  to this room).
- [ ] **Coffee machine busywork prop** — click → brew animation (steam
  sprite burst, reusing Kitchen's steam-sprite gsap technique) + a short
  "ready" chime-equivalent visual cue (e.g. a light flashing on the
  machine).
- [ ] **Snack jar busywork prop** — click → lid-pop/jump animation.

### PR-review mini-interaction (either Cubicle or Home Office monitor)

- [ ] Add a **PR-review monitor overlay**: clicking the monitor in
  whichever room makes most sense (Cubicle is the natural fit — "real
  work" happens there) shows a simple mock diff/PR panel (static styled
  HTML/CSS overlay via the existing `HUD`-style DOM overlay pattern, not
  3D geometry) with "Approve" / "Request changes" buttons. Both buttons
  are pure flavor (always "succeed") and trigger a small confetti/
  checkmark burst animation — satisfying busywork payoff, no real
  review logic, no persisted state.

### Room-to-room navigation

- [ ] Confirm the existing HUD scene-switcher (`src/ui/HUD.tsx`) lists
  all three Developer sub-rooms clearly grouped/labeled (e.g. a
  sub-heading or visual grouping distinguishing "Developer: Home
  Office / Cubicle / Office Kitchen" from Adventurer/other roles) so
  players understand these three are one role's "day," not three
  unrelated rooms. Add a lightweight test asserting all three appear in
  the switcher.

### Testing & polish

- [ ] Unit tests: `scenes.test.ts` updates for both new scene entries;
  a pure-function test for the stand-up canned-line data/rotation logic
  if implemented as testable engine code.
- [ ] Component smoke tests for both new Room/Board pairs.
- [ ] Manual Playwright/browser visual QA pass covering: tally counter,
  muted video-call animation, stand-up vignette, coffee-machine brew,
  snack-jar pop, PR-review overlay buttons.
- [ ] `npm run lint && npm run typecheck && npm test && npm run build`
  all green before merge.

## Out of Scope

- No real video call, no real PR/diff data, no persisted meeting count
  or approval history — everything here is flavor/juice, not simulation.
- No branching dialogue or player choice consequences.