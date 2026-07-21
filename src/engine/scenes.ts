import type { WordTheme } from './wordBank';
import type { LightingPreset } from './lightingPresets';

export type SceneId = 'kitchen' | 'tavern' | 'dungeon';

export interface SceneDefinition {
  id: SceneId;
  /** Display name shown in the HUD scene switcher. */
  label: string;
  /** Scene theme used to weight word selection (see wordBank.ts). */
  wordTheme: WordTheme;
  /**
   * Local Z depth of the magnet drag plane, relative to the scene's group.
   * Must sit slightly in front of (larger/closer-to-camera than) the
   * board/door mesh's own front face, or magnets render hidden behind it.
   */
  magnetSurfaceZ: number;
  /** Number of magnets scattered on this scene's board. */
  magnetCount: number;
  /** Camera position when zoomed in on this scene's board. */
  cameraZoomedIn: [number, number, number];
  /** OrbitControls target when zoomed in on this scene's board. */
  cameraTarget: [number, number, number];
  /** Whether this scene participates in the Phase 3 Auto/Manual lighting system. */
  usesEnvironmentLighting: boolean;
  /** Fixed lighting preset used instead of the environment system when
   * `usesEnvironmentLighting` is false. Null when environment lighting applies. */
  fixedLightingPreset: LightingPreset | null;
  /**
   * Local-space [min, max] range magnets may be dragged within, so they
   * can't be dropped off the visible board/door into empty space (mirrors
   * POC_2's `THREE.MathUtils.clamp` on drag position). Sized to each
   * scene's board/door mesh dimensions, with a small margin.
   */
  magnetBoardBounds: { x: [number, number]; y: [number, number] };
}

export const SCENE_IDS: SceneId[] = ['kitchen', 'tavern', 'dungeon'];

/**
 * World-space position of each scene's board/door group (Fridge,
 * TavernNoticeboard, DungeonTablet all render `<group position={...}>`
 * at this same offset). Exported so code that needs to convert between
 * the group's local space (e.g. `magnetSurfaceZ`) and world space (e.g.
 * the drag-plane raycast, which operates in world coordinates) uses one
 * consistent value instead of re-deriving or hardcoding it.
 */
export const BOARD_GROUP_POSITION: [number, number, number] = [4, 0, -3.5];

export const SCENES: Record<SceneId, SceneDefinition> = {
  kitchen: {
    id: 'kitchen',
    label: 'Kitchen Fridge',
    wordTheme: 'kitchen',
    // Door front face is at local z ~1.65 (see Fridge.tsx); magnets need to
    // clear that so they render in front of the door, not behind it.
    magnetSurfaceZ: 1.75,
    magnetCount: 35,
    // Camera pulled back further than tavern/dungeon's [4,5,3.5]: the
    // fridge door sits much closer to the camera (world z ~-1.75) than the
    // tavern/dungeon boards (world z ~-5.2), so using the same camera z
    // over-magnifies the kitchen view and pushes the tesseract/slam
    // buttons off the bottom of the screen. Backed off by the same z
    // difference (~3.45) to match their on-screen framing/scale.
    cameraZoomedIn: [4, 5, 6.95],
    cameraTarget: [4, 5, -1.85],
    usesEnvironmentLighting: true,
    fixedLightingPreset: null,
    // Door is 3.6 wide x 7.8 tall, centered at local (0, 4).
    magnetBoardBounds: { x: [-1.6, 1.6], y: [0.3, 7.7] },
  },
  tavern: {
    id: 'tavern',
    label: 'Tavern Noticeboard',
    wordTheme: 'tavern',
    // Board mesh is positioned at `surfaceZ - 0.15` (see
    // TavernNoticeboard.tsx) so this plane sits just in front of its face.
    magnetSurfaceZ: -1.7,
    // Lower than kitchen's 35: this board is much shorter (see
    // magnetBoardBounds below), and the grid must also leave room for
    // POEM_BAND_HEIGHT reserved at the top (magnetSelection.ts) for the
    // slam-button poem line. 26 keeps the grid comfortably within its
    // shrunk region without overflowing into an off-board column, while
    // leaving enough budget above REQUIRED_LITERALS's 11 forced glue words
    // for a healthy variety of theme content words too.
    magnetCount: 26,
    cameraZoomedIn: [4, 5, 3.5],
    cameraTarget: [4, 5, -1.85],
    usesEnvironmentLighting: false,
    // Brightened aggressively — direct comparison against the actual
    // native app render (not just a browser dev-server preview) showed
    // prior passes still reading as near-black: the room's dark
    // wood-grain/plaster textures multiply against the light color, so
    // this preset needs to exceed even Kitchen's brightest ("day")
    // numbers to read as legible once multiplied by dark base albedos.
    fixedLightingPreset: {
      ambientColor: '#f3ddb8',
      directionalColor: '#ffe6b0',
      fillColor: '#ffb060',
      fogColor: '#6b4a2e',
      directionalIntensity: 5,
      fillIntensity: 3.5,
      directionalPosition: { x: 3, y: 4, z: 4 },
    },
    // Board is 3.6 wide x 4 tall, centered at local (0, 4).
    magnetBoardBounds: { x: [-1.6, 1.6], y: [2.3, 5.7] },
  },
  dungeon: {
    id: 'dungeon',
    label: 'Dungeon Tablet',
    wordTheme: 'dungeon',
    // Board mesh is positioned at `surfaceZ - 0.15` (see DungeonTablet.tsx)
    // so this plane sits just in front of its face.
    magnetSurfaceZ: -1.7,
    // See tavern's magnetCount comment above — same reasoning applies here.
    magnetCount: 26,
    cameraZoomedIn: [4, 5, 3.5],
    cameraTarget: [4, 5, -1.85],
    usesEnvironmentLighting: true,
    fixedLightingPreset: null,
    // Board is 3.6 wide x 4 tall, centered at local (0, 4).
    magnetBoardBounds: { x: [-1.6, 1.6], y: [2.3, 5.7] },
  },
};
