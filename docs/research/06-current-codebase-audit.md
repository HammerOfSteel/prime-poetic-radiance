# 06 — Current Codebase Audit (Ground Truth)

This is a factual audit of what the code *actually does today*, gathered
by reading the real source files (not assumptions), specifically to
verify/diagnose the user's complaints:

> "the fridge cant be in the same room as the other stuff... I cant even
> zoom in or see the computer... doesnt a game have like a main menu and
> UI... its nothing."

## Bug 1 (confirmed, root cause): camera target vs. furniture are on
opposite sides of the room

Evidence, `src/engine/scenes.ts`:
```
export const BOARD_GROUP_POSITION: [number, number, number] = [4, 0, -3.5];
...
developerHomeOffice: {
  cameraZoomedIn: [4, 5, 6.95],
  cameraTarget: [4, 5, -1.85],
  ...
}
```
Evidence, `src/scene/DeveloperHomeOffice.tsx` (actual furniture
positions):
```
desk:        position={[-2, 3.1, -4]}
left leg:     position={[-4.7, 1.55, -4.9]}
right leg:    position={[0.7, 1.55, -4.9]}
chair seat:   position={[-2, 1.6, -1.5]}
chair back:   position={[-2, 2.4, -0.95]}
monitor:      position={[-2, 3.9, -4.9]}
keyboard:     position={[-2, 3.23, -3.2]}
```

**The desk/monitor/chair all sit around x = -2 to -4.9.** The camera's
zoomed-in target (`cameraTarget: [4, 5, -1.85]`) and the corkboard
(`BOARD_GROUP_POSITION = [4, 0, -3.5]`) are both at **x = 4** — the
opposite side of the room. Zooming into the Developer Home Office
therefore frames the floating corkboard and nothing else; **the desk,
monitor, keyboard, and every interactive prop we built are entirely
outside the camera's view.** This is the literal, mechanical cause of
"I can't even zoom in or see the computer."

This is not a one-off mistake — `cameraZoomedIn`/`cameraTarget` values
are effectively **copy-pasted per scene** (confirmed via `grep`, several
scenes share the exact same `[4, 5, 6.95]` / `[4, 5, -1.85]` pair) while
each room's furniture was authored independently with its own arbitrary
coordinate choices, with nobody cross-checking the two against each
other. `BOARD_GROUP_POSITION` is a single, global, shared constant used
by *every* scene's board component (Fridge, TavernNoticeboard,
DungeonTablet, DeveloperHomeOfficeBoard, etc.) — meaning the "goal
object" of every room is rendered at the identical world-space
coordinate regardless of that room's own furniture layout. This is also
the root cause of the "fridge in the same room as other stuff" complaint
if any two scenes' distinct room geometries were ever visible
simultaneously, or more precisely of the disconnect between a room's
board and its furniture — the board was never spatially designed to
belong to any specific room's layout.

## Bug 2 (confirmed): no title screen, no main menu

Evidence, `src/App.tsx`: the component tree renders `<Canvas>` (a live
3D scene) unconditionally from first mount. `useSceneStore`'s
`activeSceneId` defaults directly to `'kitchen'` (checked in
`src/state/sceneStore.ts`). There is no gating screen, no "Play" button,
no role-select screen — the player is dropped straight into a fridge
poetry scene with no ceremony or choice, and no path back to a menu
short of using the HUD's always-on scene-switcher buttons, which are
in-game chrome, not a menu system.

## Bug 3 (fixed during this session): HUD title was hardcoded

`src/ui/HUD.tsx` previously rendered a static `<h1>Magic Fridge</h1>`
regardless of `activeSceneId`. Fixed to `<h1>{activeScene.label}</h1>` —
this was a quick, correct fix but does not address bugs 1 or 2, which are
the actual substance of the complaint.

## Bug 4 (confirmed): interactive props have no discoverability affordance

`src/scene/InteractiveProp.tsx` (read in full) implements hover-scale and
click-bounce via gsap, but does not change cursor style, does not add an
outline/glow, and there is no HUD prompt indicating "this is clickable."
Combined with Bug 1 (props off-camera), this compounds the "I can't even
see the fun stuff" complaint even in scenes where the camera bug doesn't
apply.

## Bug 5 (confirmed): no goal state / consequence system

Every `InteractiveProp` usage in every room (`DeveloperHomeOffice.tsx`,
`DeveloperCubicle.tsx`, `TavernRoom.tsx`, `DungeonRoom.tsx`, `Kitchen.tsx`,
`DeveloperOfficeKitchen.tsx`) either does nothing but the shared bounce,
or (Cubicle only) increments a pure flavor counter with no win/complete
state. There is no room in the game where "doing the thing" leads to any
kind of resolution, checklist, or reward. This matches research findings
02/04: no puzzle-solving, no goals/success state, no "context" in the
game-feel sense.

## What already works and should be preserved

- Toon-shaded procedural room geometry, lighting presets, post-processing
  — visually polished, reasonable base to build on.
  correct pattern per research 01, just needs per-object variation (04)
  and, most importantly, actual on-screen visibility (Bug 1).
- Role label/tagline system (`SceneDefinition.roleLabel`/`roleTagline`)
  is a good, working foundation for the "Day in the Life of X" framing.
- Existing word-bank/magnet/poem-generation engine is a real, working,
  tested system — should remain the core "goal" mechanic for the
  fridge/tavern/dungeon rooms (the poem itself already *is* a
  completion-style goal state, arguably underused/under-surfaced).
- Test suite is comprehensive and green; any redesign work must keep it
  that way.

## Summary: what actually needs to happen (feeds into 07)

1. **Redesign each room's camera framing and board/prop placement as one
   coordinated layout**, not independently-authored numbers. This is the
   single highest-priority fix — nothing else matters if the player
   still can't see the room.
2. **Add a title screen + main menu (role-select) screen**, gating entry
   to any 3D scene, per research 05.
3. **Add hover/discoverability affordances** to `InteractiveProp` per
   research 01/03/04.
4. **Give at least one room a real goal/completion state** as a proof of
   concept before rolling the pattern out further, per research 02/04.