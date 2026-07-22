# Overview TODO — "Day in the Life of X" Concept

**Status:** Draft — concept + phase breakdown
**Created:** 2026-07-22
**Branch:** `feature/day-in-the-life-concept-todos`

## Context

The existing codebase (`prime-poetic-radiance`) is a cozy point-and-click
"room" toy: a single static camera framing per scene, zoom-in/zoom-out
camera rig, a fixed magnet-surface board per room, and a scene switcher.
Three rooms already exist (Kitchen/Fridge, Tavern/Noticeboard,
Dungeon/Tablet), each just a themed backdrop for the same "drag word
magnets, hit Poetry Slam" mechanic (see `docs/superpowers/specs/2026-07-20-roadmap-overview.md`).

This concept reframes that same room-based, point-and-click architecture
as a light narrative/sim game: **"A Day in the Life of X"** — each "X" is a
job/role/archetype, and its "room" is both a themed poetry-magnet board
*and* a small slice-of-life stage with a few extra clickable hotspots,
ambient behaviors, and a loose "beat" of a day (morning routine → task →
evening wind-down) expressed through props, lighting, and optional flavor
interactions — without turning this into a full narrative adventure game
(no branching dialogue trees, no inventory-puzzle chains). Poetry
generation stays the core creative output; the "day in the life" framing
is the wrapper that gives each room a reason to exist and a reason to
explore further scenes.

## Research: Point-and-Click Mechanics That Work

Findings from general point-and-click / adventure-game design research
(Wikipedia: *Point and click*, *Adventure game*; genre convention
knowledge), applied to what fits this codebase's constraints (single
static camera per room, no inventory system today, procedural/primitive
art):

1. **Fitts's Law governs hotspot design** — bigger/closer targets under
   the cursor are faster & more satisfying to click. Existing magnets
   already respect this (large, well-spaced). New hotspots (see below)
   should follow the same rule: generously sized, well-separated,
   clear hover affordance (existing `TesseractButton`/`SlamButton` hover
   states are a good reference pattern).
2. **Hotspot highlighting / hover feedback is critical** in modern
   point-and-click UX (a widely cited pain point in classic adventure
   games is "pixel hunting" — hidden hotspots with no visual cue). This
   project should always give a cursor/glow/outline change on hover for
   any newly-interactive prop, mirroring the existing magnet drag
   affordance rather than requiring hidden discovery.
3. **Single, satisfying core verb beats a verb-menu.** Classic
   SCUMM-style games suffered from multi-verb complexity (look/use/push/
   pull/talk menus). This project should stay single-verb ("click to
   interact/toggle/animate") consistent with its current
   drag-and-drop-plus-click-buttons model — no verb-coin UI.
4. **Environmental storytelling via idle animation** (steam, embers,
   dust motes — already shipped in `KitchenAtmosphere`/
   `TavernAtmosphere`) is what makes a static room feel "lived in"
   without requiring narrative text. Each new "X" room should get an
   equivalent atmosphere layer keyed to that role's signature ambient
   loop (e.g. Developer: monitor glow flicker + coffee steam; Adventurer/
   Tavern: hearth embers, already shipped).
5. **A day/time framing benefits from a light "beat" structure** (many
   cozy/idle sims — e.g. the "coffee talk"/"cozy sim" subgenre — use a
   morning/midday/evening prop or lighting shift rather than a game
   clock/timer) — this maps directly onto this project's existing
   Phase 3 environment/day-night system (`environment.ts`,
   `lightingPresets.ts`), which already varies lighting by real time of
   day. "Day in the life" rooms should lean on that system
   (`usesEnvironmentLighting: true`) wherever the role plausibly has a
   real day/night rhythm (Developer, most mundane jobs), and keep the
   existing fixed-mood override (`usesEnvironmentLighting: false`) for
   rooms whose fantasy setting doesn't track real-world time (Tavern/
   Adventurer, Dungeon).
6. **Small optional micro-interactions ("busywork" props) add
   replay charm without adding complexity** — e.g. clicking a coffee
   machine to trigger a brew animation, clicking a cat to make it
   stretch. These are pure juice: no game-state consequence, just a
   satisfying animated response, which fits this project's "cozy toy"
   ethos (no fail states, no game-over) far better than any systemic
   inventory/puzzle mechanic would.

**Design conclusion:** keep the point-and-click surface area exactly as
it is today (zoom to a room, drag magnets on one board, hit Slam/
Tesseract) and layer in 2-4 secondary hotspot props per room ("busywork"
micro-interactions per finding #6) plus a stronger day/night or fixed-mood
atmosphere pass (per findings #4-5) and consistent hover affordance
(per findings #1-2) — no new core mechanic, no verb menus, no inventory.

## "Day in the Life of X" Roster

| X | Room reuse | New/adjusted |
|---|---|---|
| **Developer** | New room (repurposes/rethemes the existing Kitchen-style "desk" framing, or a new office room) | Desk, monitor(s), coffee mug, rubber duck, sticky notes as extra magnet-adjacent flavor. Word theme: `developer` (code/coffee/bug/deploy vocabulary). |
| **Adventurer** | Existing **Tavern** room | Already closest fit conceptually (fantasy tavern-board is literally an adventurer's quest noticeboard) — this phase mostly *reframes/extends* the existing Tavern Atmosphere work with adventurer-flavored busywork props (whetstone, map table, coin pouch) rather than building a new room from scratch. |
| *(stretch, not required for MVP)* **Wizard** | Existing **Dungeon** room | Dungeon/tablet already reads as an arcane study; reframe as "a day in the life of a dungeon-keeping wizard" with alchemy-table busywork props. |
| *(stretch)* **Cook/Baker** | Existing **Kitchen** room | Kitchen already IS a kitchen; lightest-touch reframe of all three — mostly copy/naming/flavor-text and word-theme tuning, not new geometry. |

This roster lets every existing room keep its geometry/investment while
gaining a job/day framing, and only the **Developer** room needs to be
built from scratch. Adventurer is the other headline new concept
(explicitly requested), reusing the almost-finished Tavern work.

## Phase TODO Folders

- `todo/phase-7-concept-foundation/todo.md` — shared scaffolding: word
  theme system extension, hotspot/"busywork prop" abstraction, per-room
  metadata for the "Day in the Life" framing (title card / role label in
  HUD), research doc.
- `todo/phase-8-developer-day/todo.md` — new Developer room + board +
  atmosphere + busywork props + word bank.
- `todo/phase-9-adventurer-tavern-day/todo.md` — reframe/extend existing
  Tavern room with Adventurer busywork props + HUD role labeling.
- `todo/phase-10-stretch-additional-days/todo.md` — optional Wizard
  (Dungeon reframe) and Cook (Kitchen reframe) passes.

Each phase folder's `todo.md` is self-contained (goal, tasks, testing
notes) and should be worked the same way existing
`docs/superpowers/plans/*.md` phases were: own branch, own commits, tests
passing before merge.

## Master Checklist

- [ ] Phase 7: Concept Foundation (shared abstractions)
- [ ] Phase 8: Developer Day (new room)
- [ ] Phase 9: Adventurer Day (Tavern reframe)
- [ ] Phase 10 (stretch): Wizard Day (Dungeon reframe) + Cook Day (Kitchen reframe)