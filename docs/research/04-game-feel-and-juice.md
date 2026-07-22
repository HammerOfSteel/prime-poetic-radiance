# 04 — Game Feel & "Juice" Research

**Source:** Wikipedia, "Game feel" (https://en.wikipedia.org/wiki/Game_feel),
retrieved via `curl` 2026-07-22. Cites Steve Swink's game-feel framework
and Sweetser & Wyeth's (2005) adaptation of Csikszentmihalyi's flow
theory to games.

## The framework (Swink's model, as summarized by the article)

Game feel = "realtime control of virtual objects in a simulated space,
with interactions emphasised by polish." Six manipulable areas:

1. **Input** — the physical/logical means of control. Natural mappings
   between the input device and the mechanic improve feel (their
   example: a steering wheel for a racing game vs. a generic gamepad).
2. **Response** — how the game reacts to input; sensitivity/expressiveness
   of that reaction.
3. **Context** — the surrounding rules/state that give an input meaning.
4. **Aesthetic** — visual and sound presentation layered on top of the
   mechanic.
5. **Metaphor** — how the interaction maps to a real-world/familiar
   concept the player already understands.
6. (Rules, referenced but not detailed in the excerpt.)

## A concrete test the article proposes

> "the game should feel engaging to play even after the plot, points,
> level design, music, and graphics are removed; if it is not, then the
> game may suffer from poor game feel."

This is a genuinely useful, falsifiable test we can apply to our own
`InteractiveProp` interactions.

## Applying the "strip it down" test to our current build

If we strip our current busywork props down to their bare mechanic
("click a mesh, it bounces once"), what's left?

- **Input**: mouse click on a 3D mesh via raycasting — appropriate,
  matches point-and-click conventions (see 01).
  Same generic bounce-tween for every prop in every room, regardless of
  what the object represents.
- **Context**: **none.** Nothing changes state, nothing is remembered,
  nothing progresses. This is the single biggest gap per the "strip it
  down" test — remove graphics and there is *nothing* left, because there
  was never any game logic to begin with, only animation.
- **Aesthetic**: fine — toon shading, gradient maps, procedural textures
  are all already reasonably polished.
- **Metaphor**: partially present (coffee machine → steam = "brewing" is
  intuitive), but not reinforced by any actual consequence.

## Actionable takeaways for the redesign plan

1. **"Response" needs per-object variation, not one shared bounce.**
   Different object types should react differently (a duck squeaks and
   waddles, a cauldron bubbles/glows brighter, a spellbook's pages
   flip) — still small, still cheap, but distinguishable, which is what
   "response" polish means in this framework.
2. **"Context" is the actual missing system**, confirmed independently
   from the adventure-game-genre research (02) and the hidden-object
   research (03): every room needs *some* piece of state that an
   interaction changes and that the player can perceive changing (a
   counter, a completion checkmark, a short before/after visual state).
   This is the highest-leverage, most game-feel-relevant fix available to
   us and should be central to the phased plan.
3. Camera framing (already flagged in 01) is itself part of "aesthetic"/
   "context" — a prop that exists but is never on-screen has *zero*
   game feel by definition, because the player never perceives the
   input-response loop at all. This is a blocking prerequisite fix, not
   an optional polish item.