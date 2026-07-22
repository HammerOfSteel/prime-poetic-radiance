# 02 — Adventure Game Design Research

**Source:** Wikipedia, "Adventure game"
(https://en.wikipedia.org/wiki/Adventure_game), retrieved via `curl`
2026-07-22.

## Core defining components (per the article's own "components" table)

The article explicitly lists what components define the genre, each with
multiple citations:

1. **Puzzle solving / problem solving**
2. **Exploration**
3. **Narrative**
4. **Player assumes the role of a character or hero**
5. **Collection or manipulation of objects**

## Game design subsections relevant to us

- **Puzzle-solving**: central pillar; puzzles typically gate progress or
  reward optional content.
- **Gathering and using items**: inventory-based object manipulation —
  find X, combine/use X on Y.
- **Story, setting, and themes**: adventure games "draw heavily from
  other narrative media" — setting and theme carry a lot of the
  experience even without deep mechanical complexity.
- **Dialogue and conversation trees**: used for exposition/character, not
  required for every adventure game.
- **Goals, success and failure**: adventure games generally have clear
  win-conditions or session-goals, even if soft (e.g. "solve today's
  puzzle" rather than "beat the final boss").

## Relevance / gap analysis for our project

Our current build has:
- ✅ Narrative/setting: role labels + taglines per room (Developer,
  Adventurer, Wizard, Cook) — good, on genre.
- ✅ Exploration: multiple rooms, camera zoom-in per room.
- ✅ Object manipulation, sort of: `InteractiveProp` click-to-bounce.
- ❌ **Puzzle-solving: absent.** Every prop just bounces on click with no
  puzzle, no combination, no consequence.
- ❌ **Goals, success and failure: absent.** There is no defined "this is
  what you're trying to do in this room" and no completion state, so
  nothing ever resolves — it's all idle-toy busywork with no throughline.
- ⚠️ **Collection/inventory: absent**, and probably fine to skip for a v1
  scope — the genre doesn't strictly require it (see "walking
  simulators" and "puzzle adventure games" subgenres below, which
  de-emphasize inventory).

## Relevant subgenres (lighter-weight than classic SCUMM adventures)

The article's subgenre list includes several forms that are a much closer
match to our small-room, low-friction scope than classic Monkey-Island-
style adventures:

- **Puzzle adventure games**: adventure structure built primarily around
  discrete puzzles per scene rather than long inventory chains.
- **Narrative adventure games**: light/no puzzles, mechanics mostly serve
  the story/vignette.
- **Walking simulators**: minimal-to-no puzzle friction, exploration and
  narrative vignettes are the whole experience.

Our per-room "Day in the Life of X" concept is closest to a hybrid of
**puzzle adventure** (each room could have 1–2 small discrete puzzles/
mini-games tied to its theme) and **narrative adventure** (role tagline,
flavor dialogue/overlays like the stand-up vignette we already built for
the Cubicle).

## Actionable takeaways for the redesign plan

- Each room needs **at least one real goal state**, however small (e.g.
  "answer the mock PR review", "brew the coffee before your break ends",
  "match all the poetry magnets to finish today's poem"). A goal state
  needs: a start condition, a completion condition, and player-visible
  feedback when it's met (not just an animation).
- Props should be split into two honest categories rather than blurred
  together:
  1. **Flavor/ambience props** — decorative, one-shot reaction, no goal
     (rubber duck squeak, coffee brew). Fine as-is, keep low-friction.
  2. **Goal props** — tied to a room's actual mini-objective, need visible
     progress/completion state in the HUD or an overlay.
- We do not need full inventory/combination mechanics for v1 — that would
  be over-scoped for a fridge-poetry-magnet game. Lightweight per-room
  goals are enough to satisfy "puzzle-solving" + "goals/success" without
  a large systems rewrite.