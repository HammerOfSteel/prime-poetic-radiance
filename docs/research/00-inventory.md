# Research Inventory

Master index of all research documents backing the "Day in the Life of X"
point-and-click game redesign. **Read this file first.** Every other file
in `docs/research/` is sourced from real, cited web research (primarily
Wikipedia as a neutral, link-rich starting point) plus direct inspection
of this codebase's actual runtime behavior. Nothing in here is invented
or assumed without a source.

## Status

| # | Document | Topic | Status |
|---|----------|-------|--------|
| 01 | `01-point-and-click-genre.md` | Point-and-click UI mechanics, history, Fitts's Law | Done |
| 02 | `02-adventure-game-design.md` | Adventure game design: puzzles, inventory, story, dialogue, goals | Done |
| 03 | `03-hidden-object-and-casual-mechanics.md` | Hidden-object/casual-game mechanics closest to our "find & interact" loop | Done |
| 04 | `04-game-feel-and-juice.md` | Game feel / "juice": input, response, context, aesthetic | Done |
| 05 | `05-menu-and-ux-conventions.md` | Title screens, main menus, HUD conventions in shipped games | Done |
| 06 | `06-current-codebase-audit.md` | Ground-truth audit of what this repo *actually* does today, including the concrete bugs the user flagged | Done |
| 07 | `07-game-design-plan.md` | The actual redesign plan: phases/tasks/subtasks, informed by 01–06 | Done |

## Key Findings Digest (one-line summaries)

- **01**: Point-and-click relies on Fitts's Law (bigger/closer targets = faster, more comfortable interaction) and a single-click-or-double-click-driven verb model; clarity of "what is clickable" is the core UX problem to solve.
- **02**: Adventure games are defined by puzzle-solving + exploration + narrative + inventory manipulation — our per-room "busywork props" are inventory-light micro-puzzles/toys, which is a legitimate lightweight subgenre, but currently lack any of the goal/feedback loop that makes them satisfying.
- **03**: Hidden-object/casual games succeed via extremely clear objective lists, hint/booster systems, and short session loops — directly relevant to giving our props actual objectives instead of decorative-only interactions.
- **04**: "Game feel" (Swink) = input + response + context + aesthetic + metaphor. Our props currently have weak "response" (a generic bounce) and zero "context" (no goal, no consequence) — this is the #1 thing to fix structurally.
- **05**: Shipped games almost universally have: title/start screen → main menu (play/continue/settings/quit) → in-game HUD that is legible and scene-relevant. We currently have **no title screen and no main menu at all** — the app boots directly into a scene.
- **06**: Concrete, confirmed bugs in this codebase: (a) every room's magnet-board is rendered at a hardcoded shared world position (`BOARD_GROUP_POSITION`) totally disconnected from that room's own furniture layout, so zooming in only frames the floating board and never the desk/monitor/fridge/etc.; (b) camera zoom targets are copy-pasted between scenes without adjustment per room, so props built off to the side are out of view; (c) HUD title was hardcoded ("Magic Fridge") regardless of active scene (now fixed); (d) no title/menu flow exists.
- **07**: Full phased redesign plan — see that document for the actual roadmap.