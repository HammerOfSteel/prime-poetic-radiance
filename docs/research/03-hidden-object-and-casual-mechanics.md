# 03 — Hidden Object / Casual Game Mechanics Research

**Source:** Wikipedia, "Hidden object game"
(https://en.wikipedia.org/wiki/Hidden_object_game), retrieved via `curl`
2026-07-22.

## Why this genre, specifically

Our actual gameplay loop — walk into a static, richly detailed room and
click on specific things scattered around it — is structurally much
closer to a **hidden object / casual "point-and-click room" game** than
to a classic long-form inventory adventure. This genre's design lessons
are more directly applicable to us than heavier adventure-game theory.

## Key mechanics identified

- **Core loop**: wander a static scene, find items from an explicit list,
  add them to an inventory; a "hidden object puzzle" screen is one path
  to progress, but the underlying loop generalizes to "click the right
  things in a cluttered scene."
- **Subtypes** (useful vocabulary for scoping our own rooms):
  - **HOG** — classic word-list find.
  - **AHOG** (Adventure-Hidden-Object-Game) — combines hidden-object
    scenes with narrative exploration and puzzles. **This is the closest
    match to our "Day in the Life" rooms**: a themed scene, some
    narrative flavor, some findable/clickable things.
  - **iHOG** — interactive/adventure-like manipulation of objects (not
    just find-and-click, but actually operate them) — matches our
    "coffee machine brews, cauldron glows" interactive props.
  - **HOPA** (Hidden Object Puzzle Adventure) — heavier puzzle content
    layered on top.
- **Boosters and hints**: magnifying glass (highlight item), zoom
  booster (focus on intricate areas), time extensions. These exist
  specifically because "cluttered scene, find the right thing" has a
  built-in discoverability problem — which validates the point-and-click
  research (01) finding that **clickable-target legibility is a genre-
  wide, solved-for problem**, not something we can ignore.

## Actionable takeaways for the redesign plan

1. **Discoverability tooling is expected, not optional** in this genre.
   We should add a lightweight, no-cost equivalent: hover highlight/glow
   on interactive props (a "poor man's magnifying glass") so first-time
   players can tell what's clickable without hunting blindly. This is a
   direct, cheap win against the "I can't even zoom in or see the fun
   stuff" complaint.
2. **Scenes should not visually mix unrelated rooms.** The genre's whole
   premise is "a coherent, readable scene" — clutter is intentional and
   curated, not accidental. This directly confirms the user's complaint:
   a fridge should not share a room with a desk/monitor/rubber-duck set —
   each themed room must be a self-contained readable scene, with its own
   furniture, its own board/goal object, and nothing from another scene
   bleeding in. (See `06-current-codebase-audit.md` for how the current
   camera/board-position bug causes exactly this bleed.)
3. **"AHOG" framing is a good target genre label** for our v1 scope:
   themed static room + narrative flavor (role tagline/overlays) +
   findable/clickable interactive props, without needing full inventory
   or long puzzle chains.