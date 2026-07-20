import type { WordTheme } from './wordBank';
import type { LightingPreset } from './lightingPresets';

export type SceneId = 'kitchen' | 'tavern';

export interface SceneDefinition {
  id: SceneId;
  /** Display name shown in the HUD scene switcher. */
  label: string;
  /** Scene theme used to weight word selection (see wordBank.ts). */
  wordTheme: WordTheme;
  /** Local Z depth of the magnet drag plane, relative to the scene's group. */
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
}

export const SCENE_IDS: SceneId[] = ['kitchen', 'tavern'];

export const SCENES: Record<SceneId, SceneDefinition> = {
  kitchen: {
    id: 'kitchen',
    label: 'Kitchen Fridge',
    wordTheme: 'kitchen',
    magnetSurfaceZ: -1.84,
    magnetCount: 35,
    cameraZoomedIn: [4, 5, 3.5],
    cameraTarget: [4, 5, -1.85],
    usesEnvironmentLighting: true,
    fixedLightingPreset: null,
  },
  tavern: {
    id: 'tavern',
    label: 'Tavern Noticeboard',
    wordTheme: 'tavern',
    magnetSurfaceZ: -1.84,
    magnetCount: 30,
    cameraZoomedIn: [4, 5, 3.5],
    cameraTarget: [4, 5, -1.85],
    usesEnvironmentLighting: false,
    fixedLightingPreset: {
      ambientColor: '#5a3a24',
      directionalColor: '#ffb454',
      fillColor: '#ff8c3c',
      fogColor: '#1a0f08',
      directionalIntensity: 0.9,
      fillIntensity: 1.1,
      directionalPosition: { x: 3, y: 4, z: 4 },
    },
  },
};
