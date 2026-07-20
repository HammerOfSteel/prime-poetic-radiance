import { create } from 'zustand';
import type { LightingPresetName } from '../engine/lightingPresets';
import type { Season } from '../engine/environment';
import type { EnvironmentSnapshot } from '../services/environmentSync';

export type EnvironmentMode = 'auto' | 'manual';

export interface SceneState {
  lightingPreset: LightingPresetName;
  environmentMode: EnvironmentMode;
  season: Season;
  weatherCode: number | null;
  isZoomedIn: boolean;
  draggedMagnetId: string | null;
  setLightingPreset: (name: LightingPresetName) => void;
  setEnvironmentMode: (mode: EnvironmentMode) => void;
  applyEnvironmentSnapshot: (snapshot: EnvironmentSnapshot) => void;
  zoomToFridge: () => void;
  resetCamera: () => void;
  setDraggedMagnetId: (id: string | null) => void;
}

export const useSceneStore = create<SceneState>((set, get) => ({
  lightingPreset: 'evening',
  environmentMode: 'auto',
  season: 'summer',
  weatherCode: null,
  isZoomedIn: false,
  draggedMagnetId: null,
  setLightingPreset: (name) => set({ lightingPreset: name, environmentMode: 'manual' }),
  setEnvironmentMode: (mode) => set({ environmentMode: mode }),
  applyEnvironmentSnapshot: (snapshot) => {
    if (get().environmentMode !== 'auto') return;
    set({ lightingPreset: snapshot.preset, season: snapshot.season, weatherCode: snapshot.weatherCode });
  },
  zoomToFridge: () => set({ isZoomedIn: true }),
  resetCamera: () => set({ isZoomedIn: false }),
  setDraggedMagnetId: (id) => set({ draggedMagnetId: id }),
}));
