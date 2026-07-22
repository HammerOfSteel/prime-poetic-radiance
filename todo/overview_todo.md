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

## Research: What Actually Makes a Dev's Day (and Why It's Fun to Sim)

Real developer-day research (Scrum/Agile daily-standup conventions,
common WFH-vs-office culture) surfaces concrete, game-able beats beyond
"stare at code":

- **Daily stand-up** — a short (traditionally ~15 min, deliberately kept
  brief by literally standing) sync: "what I did yesterday / what I'm
  doing today / blockers." A great comedic/cozy micro-scene: a clock
  hotspot or calendar prop that, when clicked, plays a brief "stand-up"
  vignette (a few static avatar silhouettes + a speech-bubble carousel of
  canned stand-up lines, no real dialogue system needed).
- **Code review / PR approval** — the single most universally-relatable
  "office dev" task outside of typing code. A monitor hotspot showing a
  mock diff/PR view; clicking "Approve"/"Request changes" buttons (pure
  flavor, always succeeds, no real logic) triggers a little confetti/
  checkmark burst — satisfying "busywork" payoff per point-and-click best
  practice (juice without consequence).
- **Coffee/break culture** — the office-kitchen coffee run is a genuinely
  loved "cozy sim" beat (see games like *Coffee Talk*, *A Short Hike*'s
  incidental social beats): a separate small **office kitchen** room
  becomes a second playable stage purely for a coffee-break loop (grab a
  mug, hit brew, chat-bubble small talk with an NPC prop), distinct from
  the focused desk room.
- **Cubicle vs. home office contrast** — real dev-life anecdotes
  consistently draw humor from the contrast between cozy WFH (pet on
  desk, personal mug, plants) and sterile open-plan cubicle life
  (beige partitions, motivational poster, standing desk). Presenting
  both as alternate *selectable* room skins for the same Developer
  role (not two separate roles) mirrors how real devs actually
  experience "a day in the life" differently depending on where they
  work, and it's a cheap, high-charm way to 2x the room content by
  reusing the same board/atmosphere/prop architecture with a re-skin.
- **Meeting fatigue as a running gag** — a subtle recurring background
  gag (a "meetings today" sticky-note counter that increments, a
  muted video-call window prop with a frozen "you're on mute" avatar)
  lands well with the target audience (developers) without needing any
  real simulation — it's set dressing, not a system.

**Design conclusion:** the Developer role becomes a **mini multi-room
"day"** rather than a single static room — Home Office, Cubicle (an
alternate skin/room for the same desk-work loop), and Office Kitchen (a
distinct small room for the coffee-break beat) — connected via the
existing scene-switcher pattern (just more `SceneId` entries), each with
its own 1-2 signature busywork props tied to a real, specific developer
ritual (stand-up, PR review, coffee break) rather than generic desk
clutter. This adds replay charm precisely because each room maps to a
relatable, funny, specific daily-life beat instead of being "the same
desk three times."

## "Day in the Life of X" Roster

| X | Room(s) | New/adjusted |
|---|---|---|
| **Developer** | 3 new rooms: **Home Office**, **Cubicle** (alt skin), **Office Kitchen** | See "Developer Sub-Rooms" below — stand-up, PR-review, and coffee-break busywork beats, each in its own small room, all sharing one `developer` word theme. |
| **Adventurer** | Existing **Tavern** room | Already closest fit conceptually (fantasy tavern-board is literally an adventurer's quest noticeboard) — this phase mostly *reframes/extends* the existing Tavern Atmosphere work with adventurer-flavored busywork props (whetstone, map table, coin pouch) rather than building a new room from scratch. |
| *(stretch, not required for MVP)* **Wizard** | Existing **Dungeon** room | Dungeon/tablet already reads as an arcane study; reframe as "a day in the life of a dungeon-keeping wizard" with alchemy-table busywork props. |
| *(stretch)* **Cook/Baker** | Existing **Kitchen** room | Kitchen already IS a kitchen; lightest-touch reframe of all three — mostly copy/naming/flavor-text and word-theme tuning, not new geometry. |

This roster lets every existing room keep its geometry/investment while
gaining a job/day framing. The **Developer** role is the most ambitious
new content (3 small rooms instead of 1), specifically because "office
life" research shows the fun comes from the *contrast and variety* of
daily beats, not from one static desk. Adventurer is the other headline
new concept (explicitly requested), reusing the almost-finished Tavern
work.

### Developer Sub-Rooms (detail)

1. **Home Office** (cozy) — plants, pet bed/cat prop, personal mug,
   warm desk lamp, window with (optional) day/night light. Signature
   busywork prop: **rubber duck** (click → squeak/wiggle, classic
   "rubber duck debugging" in-joke) + **coffee mug** (steam/refill).
2. **Cubicle** (funny/sterile contrast) — beige fabric partition walls,
   motivational poster prop, standing-desk converter, "meetings today"
   sticky-note tally that increments on click (running gag, no real
   state persistence needed — just a fun visual counter that resets on
   scene reload). Signature busywork prop: **video-call window** ("You
   are on mute" frozen avatar, click → muted-mic-shake animation) +
   **calendar/clock prop** → triggers the stand-up vignette (canned
   speech-bubble carousel).
3. **Office Kitchen** (social/break) — coffee machine, mug rack, small
   round table, NPC silhouette prop for incidental small talk. Signature
   busywork prop: **coffee machine** (click → brew animation + steam) +
   **snack jar** (click → lid-pop/jump animation).

All three still center on the same magnet-board poetry mechanic (each
gets its own small board — e.g. a corkboard/monitor/whiteboard — sized
appropriately) and share one `developer` `wordTheme`; the busywork props
are what differentiate the rooms tonally.

## Phase TODO Folders

- `todo/phase-7-concept-foundation/todo.md` — shared scaffolding: word
  theme system extension, hotspot/"busywork prop" abstraction, per-room
  metadata for the "Day in the Life" framing (title card / role label in
  HUD), research doc.
- `todo/phase-8-developer-day/todo.md` — new Developer rooms: Home
  Office (base implementation) + shared word bank/templates.
- `todo/phase-8b-developer-cubicle-and-kitchen/todo.md` — Cubicle
  (alt-skin room) + Office Kitchen room, stand-up vignette, PR-review
  mini-interaction, meeting-tally gag, room-to-room navigation.
- `todo/phase-9-adventurer-tavern-day/todo.md` — reframe/extend existing
  Tavern room with Adventurer busywork props + HUD role labeling.
- `todo/phase-10-stretch-additional-days/todo.md` — optional Wizard
  (Dungeon reframe) and Cook (Kitchen reframe) passes.

Each phase folder's `todo.md` is self-contained (goal, tasks, testing
notes) and should be worked the same way existing
`docs/superpowers/plans/*.md` phases were: own branch, own commits, tests
passing before merge.

## Master Checklist

- [x] Phase 7: Concept Foundation (shared abstractions)
- [x] Phase 8: Developer Day — Home Office (new room)
- [x] Phase 8b: Developer Day — Cubicle + Office Kitchen (new rooms, room nav)
- [x] Phase 9: Adventurer Day (Tavern reframe)
- [x] Phase 10 (stretch): Wizard Day (Dungeon reframe) + Cook Day (Kitchen reframe)
