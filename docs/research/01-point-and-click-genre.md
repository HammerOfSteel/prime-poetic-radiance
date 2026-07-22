# 01 — Point-and-Click Genre Research

**Source:** Wikipedia, "Point and click"
(https://en.wikipedia.org/wiki/Point-and-click), retrieved via `curl`
2026-07-22.

## What "point and click" actually means as an interaction model

- The term describes an interface style where the user's whole input is
  reduced to moving a pointer over a target and clicking (or double
  clicking) it — no keyboard commands, no typed parser.
- Two click models exist historically:
  - **Single click**: the click itself performs the action (select,
    activate, move-to). This is the dominant model in modern
    point-and-click adventure games — one click = "do the contextual
    verb here."
  - **Double click**: historically used to disambiguate "select" from
    "activate" (common in desktop OS icons); largely a legacy pattern in
    games, but still shows up for icon-based verb systems (e.g. classic
    SCUMM-style "look/use/take" icon bars where a single click picks the
    verb and a second click on the object executes it).
- **Fitts's Law** is called out explicitly as the underlying human-factors
  model: the time to acquire a target is a function of the distance to
  the target and the target's size. Practically: *bigger, closer-to-cursor
  targets are faster and more comfortable to hit reliably.*

## Why this matters for our project

1. **Clickable-target sizing/placement is a first-class design
   constraint**, not an afterthought. If a busywork prop is a tiny mesh
   tucked behind furniture or far off in room-space, it violates Fitts's
   Law and will just feel bad/undiscoverable — exactly the "I can't even
   zoom in or see the computer" complaint we got. This is a measurable,
   fixable UX bug, not vibes.
2. **Single-click-to-activate matches our existing `InteractiveProp`
   pattern** (click → bounce/react) — that base mechanic is genre-correct.
   What's currently missing is (a) reliable camera framing so the target
   is actually on-screen and comfortably sized, and (b) a legible "this is
   clickable" affordance (hover highlight / cursor change / subtle idle
   animation) so players know where to click before they click.
3. **A verb/cursor system is optional, not required** — many modern
   point-and-click and casual games collapse to a single implicit verb
   ("interact") per hotspot. We should keep our single-verb model (it's
   simpler to build and test) but must invest in cursor/hover feedback so
   "clickable" is unambiguous, since we don't have icon verb menus to lean
   on for affordance.

## Actionable takeaways for the redesign plan

- Every interactive prop needs: (a) guaranteed visibility inside the
  zoomed-in camera frustum for its room, (b) a minimum on-screen size
  when zoomed in, (c) a hover affordance (cursor change and/or outline/
  glow) distinct from decorative geometry.
- Camera framing per room must be treated as a *designed shot*, not a
  copy-pasted numeric default — this directly explains and fixes the
  "can't see the computer" bug.