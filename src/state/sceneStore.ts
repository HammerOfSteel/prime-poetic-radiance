import { create } from 'zustand';
import type { LightingPresetName } from '../engine/lightingPresets';
import type { Season } from '../engine/environment';
import type { EnvironmentSnapshot } from '../services/environmentSync';
import { SCENES, type SceneId } from '../engine/scenes';
import { createMagnetLayout, type MagnetLayoutEntry } from '../engine/magnetSelection';
import { WORDS } from '../engine/wordBank';

export type EnvironmentMode = 'auto' | 'manual';

export interface SceneState {
  lightingPreset: LightingPresetName;
  environmentMode: EnvironmentMode;
  season: Season;
  weatherCode: number | null;
  isZoomedIn: boolean;
  draggedMagnetId: string | null;
  activeSceneId: SceneId;
  magnetLayoutBySceneId: Partial<Record<SceneId, MagnetLayoutEntry[]>>;
  setLightingPreset: (name: LightingPresetName) => void;
  setEnvironmentMode: (mode: EnvironmentMode) => void;
  applyEnvironmentSnapshot: (snapshot: EnvironmentSnapshot) => void;
  zoomIn: () => void;
  resetCamera: () => void;
  setDraggedMagnetId: (id: string | null) => void;
  setActiveScene: (id: SceneId) => void;
  updateMagnetPosition: (sceneId: SceneId, index: number, position: [number, number, number]) => void;
  regenerateMagnetLayout: (sceneId: SceneId) => void;
}

function layoutForScene(id: SceneId): MagnetLayoutEntry[] {
  const scene = SCENES[id];
  return createMagnetLayout(WORDS, scene.magnetCount, scene.wordTheme, scene.magnetSurfaceZ);
}

export const useSceneStore = create<SceneState>((set, get) => ({
  lightingPreset: 'evening',
  environmentMode: 'auto',
  season: 'summer',
  weatherCode: null,
  isZoomedIn: false,
  draggedMagnetId: null,
  activeSceneId: 'kitchen',
  magnetLayoutBySceneId: { kitchen: layoutForScene('kitchen') },
  setLightingPreset: (name) => set({ lightingPreset: name, environmentMode: 'manual' }),
  setEnvironmentMode: (mode) => set({ environmentMode: mode }),
  applyEnvironmentSnapshot: (snapshot) => {
    if (get().environmentMode !== 'auto') return;
    set({ lightingPreset: snapshot.preset, season: snapshot.season, weatherCode: snapshot.weatherCode });
  },
  zoomIn: () => set({ isZoomedIn: true }),
  resetCamera: () => set({ isZoomedIn: false }),
  setDraggedMagnetId: (id) => set({ draggedMagnetId: id }),
  setActiveScene: (id) =>
    set((state) => ({
      activeSceneId: id,
      isZoomedIn: false,
      magnetLayoutBySceneId: state.magnetLayoutBySceneId[id]
        ? state.magnetLayoutBySceneId
        : { ...state.magnetLayoutBySceneId, [id]: layoutForScene(id) },
    })),
  updateMagnetPosition: (sceneId, index, position) =>
    set((state) => {
      const layout = state.magnetLayoutBySceneId[sceneId];
      if (!layout) return state;
      return {
        magnetLayoutBySceneId: {
          ...state.magnetLayoutBySceneId,
          [sceneId]: layout.map((entry) => (entry.index === index ? { ...entry, position } : entry)),
        },
      };
    }),
  /** Replaces a scene's magnet layout with a freshly-picked set of words at
   * new scattered positions. Used by the Tesseract "shuffle" button once
   * its explode-out animation finishes. */
  regenerateMagnetLayout: (sceneId) =>
    set((state) => ({
      magnetLayoutBySceneId: { ...state.magnetLayoutBySceneId, [sceneId]: layoutForScene(sceneId) },
    })),
}));
