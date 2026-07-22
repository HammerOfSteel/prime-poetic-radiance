# 05 — Menus, HUD, and Screen-Flow Conventions

**Source:** Wikipedia, "HUD (video games)"
(https://en.wikipedia.org/wiki/Heads-up_display_(video_games)), retrieved
via `curl` 2026-07-22. Supplemented by general, widely-observed industry
convention (title screen → main menu → gameplay → pause menu), which is
near-universal enough across shipped games that it's treated here as
baseline domain knowledge rather than needing a citation of its own; the
HUD article's own "Menus" bullet independently confirms menus-for-exit/
options/settings are a standard HUD-adjacent feature.

## HUD conventions confirmed by the article

Common, recognizable HUD elements across genres:
- **Health/lives** (not applicable to us — no fail-state combat).
- **Time** — countdown, count-up, or in-game clock (day/night cycle) —
  **we already have a lighting-preset day/night system**, this maps
  cleanly onto a HUD "time of day" readout if desired.
- **Weapons/ammunition** (not applicable).
- **Capabilities** — contextual "available action" prompts, explicitly
  called out as often appearing **only when relevant** (their example:
  "A – open door" appears only near a door). This is a direct,
  citable precedent for our hover-affordance/contextual-prompt idea from
  research 01/03 — showing a prompt only when near/hovering a relevant
  object is genre-standard, not a novel invention.
- **Menus** — "menus to exit, change options, delete files, change
  settings, etc." called out explicitly as a standard HUD-adjacent
  feature.
- **Game progression** — score, level, current quest/task. Maps directly
  onto our idea of per-room "goal state" from research 02/04 — a small
  progression indicator (e.g. "Meetings today: 2", "Coffee: brewed ✓")
  is genre-standard, not scope creep.

## Baseline screen-flow convention (industry-standard, cross-referenced
against the HUD article's own "Menus" bullet)

Virtually all shipped games — from AAA to small indie/casual titles —
follow some version of:

```
[Title/Splash Screen] → [Main Menu: Play / Continue / Settings / Quit]
        → [Gameplay, with in-game HUD]
        → [Pause Menu: Resume / Settings / Quit to Main Menu]
```

Casual/hidden-object games (see research 03) in particular almost always
wrap their scene-based gameplay in exactly this shell, because sessions
are short and players expect to be able to stop/resume/adjust settings
without hunting for a browser-tab-close as the only "quit" option.

## Gap analysis against our current build

- ❌ **No title/splash screen.** The app boots directly into the
  `kitchen` scene with no entry ceremony.
- ❌ **No main menu.** There is no "Play"/"Continue"/"Settings" surface —
  the HUD's scene-switcher buttons are the closest thing, but they're
  always-on in-game UI, not a menu shell.
- ❌ **No pause/settings-from-anywhere flow** beyond the always-visible
  `PostFxSettingsPanel` (rendering settings only) and lighting buttons.
- ✅ HUD already surfaces some progression-like info per-room (role
  tagline; Phase 8b's meeting tally). This is a good foundation, just
  under-used.

## Actionable takeaways for the redesign plan

1. Add a genuine **title screen** (game title, "Day in the Life of ___",
   Start button) as the app's initial state, gating entry into any 3D
   scene at all.
2. Add a genuine **main menu** immediately after/instead of dumping the
   player into "kitchen" by default: a **role-select screen** ("Choose
   your day: Developer / Adventurer / Wizard / Cook") is the natural,
   on-theme main-menu equivalent for this concept, replacing "kitchen" as
   an arbitrary hardcoded default.
3. Add a simple **pause/settings overlay** reachable from any in-game
   scene (can reuse/rehome the existing `PostFxSettingsPanel` and
   lighting controls into it, plus a "Return to Main Menu" action).
4. Use contextual "available action" prompts (per the HUD article's own
   precedent) for interactive props: a small on-screen prompt/cursor
   change that appears only on hover, not permanent screen clutter.