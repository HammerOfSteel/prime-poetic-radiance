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
  /**
   * Immutable snapshot of each scene's magnet layout taken at creation
   * time, never touched by `updateMagnetPosition`. Used to look up a
   * word's original, guaranteed-empty grid slot so slammed poem words that
   * get replaced by a later slam can be sent back exactly where they
   * started, instead of overlapping whatever else is on the board.
   */
  homeLayoutBySceneId: Partial<Record<SceneId, MagnetLayoutEntry[]>>;
  /** Words currently placed in the reserved poem band by the most recent
   * slam, per scene (empty if the board hasn't been slammed yet, or after
   * a reset/regenerate). See `SlamButton.tsx`. */
  slamActiveWordsBySceneId: Partial<Record<SceneId, string[]>>;
  setLightingPreset: (name: LightingPresetName) => void;
  setEnvironmentMode: (mode: EnvironmentMode) => void;
  applyEnvironmentSnapshot: (snapshot: EnvironmentSnapshot) => void;
  zoomIn: () => void;
  resetCamera: () => void;
  setDraggedMagnetId: (id: string | null) => void;
  setActiveScene: (id: SceneId) => void;
  updateMagnetPosition: (sceneId: SceneId, index: number, position: [number, number, number]) => void;
  regenerateMagnetLayout: (sceneId: SceneId) => void;
  setSlamActiveWords: (sceneId: SceneId, words: string[]) => void;
}

function layoutForScene(id: SceneId): MagnetLayoutEntry[] {
  const scene = SCENES[id];
  return createMagnetLayout(WORDS, scene.magnetCount, scene.wordTheme, scene.magnetSurfaceZ, scene.magnetBoardBounds);
}

const initialKitchenLayout = layoutForScene('kitchen');

export const useSceneStore = create<SceneState>((set, get) => ({
  lightingPreset: 'evening',
  environmentMode: 'auto',
  season: 'summer',
  weatherCode: null,
  isZoomedIn: false,
  draggedMagnetId: null,
  activeSceneId: 'kitchen',
  magnetLayoutBySceneId: { kitchen: initialKitchenLayout },
  homeLayoutBySceneId: { kitchen: initialKitchenLayout },
  slamActiveWordsBySceneId: {},
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
    set((state) => {
      if (state.magnetLayoutBySceneId[id]) return { activeSceneId: id, isZoomedIn: false };
      const layout = layoutForScene(id);
      return {
        activeSceneId: id,
        isZoomedIn: false,
        magnetLayoutBySceneId: { ...state.magnetLayoutBySceneId, [id]: layout },
        homeLayoutBySceneId: { ...state.homeLayoutBySceneId, [id]: layout },
        slamActiveWordsBySceneId: { ...state.slamActiveWordsBySceneId, [id]: [] },
      };
    }),
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
   * its explode-out animation finishes. Also resets the home-layout
   * snapshot and clears the active poem, since the old ones no longer
   * correspond to any word actually on the (freshly-regenerated) board. */
  regenerateMagnetLayout: (sceneId) =>
    set((state) => {
      const layout = layoutForScene(sceneId);
      return {
        magnetLayoutBySceneId: { ...state.magnetLayoutBySceneId, [sceneId]: layout },
        homeLayoutBySceneId: { ...state.homeLayoutBySceneId, [sceneId]: layout },
        slamActiveWordsBySceneId: { ...state.slamActiveWordsBySceneId, [sceneId]: [] },
      };
    }),
  setSlamActiveWords: (sceneId, words) =>
    set((state) => ({
      slamActiveWordsBySceneId: { ...state.slamActiveWordsBySceneId, [sceneId]: words },
    })),
}));

