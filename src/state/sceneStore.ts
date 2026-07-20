import { create } from 'zustand';
import type { LightingPresetName } from '../engine/lightingPresets';

export interface SceneState {
  lightingPreset: LightingPresetName;
  isZoomedIn: boolean;
  draggedMagnetId: string | null;
  setLightingPreset: (name: LightingPresetName) => void;
  zoomToFridge: () => void;
  resetCamera: () => void;
  setDraggedMagnetId: (id: string | null) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  lightingPreset: 'evening',
  isZoomedIn: false,
  draggedMagnetId: null,
  setLightingPreset: (name) => set({ lightingPreset: name }),
  zoomToFridge: () => set({ isZoomedIn: true }),
  resetCamera: () => set({ isZoomedIn: false }),
  setDraggedMagnetId: (id) => set({ draggedMagnetId: id }),
}));
