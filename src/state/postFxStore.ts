import { create } from 'zustand';

export interface PostFxState {
  bloomEnabled: boolean;
  dofEnabled: boolean;
  vignetteEnabled: boolean;
  aoEnabled: boolean;
  colorGradeEnabled: boolean;
  grainEnabled: boolean;
  isPanelOpen: boolean;
  setBloomEnabled: (value: boolean) => void;
  setDofEnabled: (value: boolean) => void;
  setVignetteEnabled: (value: boolean) => void;
  setAoEnabled: (value: boolean) => void;
  setColorGradeEnabled: (value: boolean) => void;
  setGrainEnabled: (value: boolean) => void;
  togglePanel: () => void;
  resetToDefaults: () => void;
}

/** Every effect defaults to enabled — the "cozy diorama" look is meant to
 * be on by default, with the settings panel offered as an opt-out, not an
 * opt-in. */
const DEFAULT_EFFECT_FLAGS = {
  bloomEnabled: true,
  dofEnabled: true,
  vignetteEnabled: true,
  aoEnabled: true,
  colorGradeEnabled: true,
  grainEnabled: true,
} as const;

export const usePostFxStore = create<PostFxState>((set) => ({
  ...DEFAULT_EFFECT_FLAGS,
  isPanelOpen: false,
  setBloomEnabled: (value) => set({ bloomEnabled: value }),
  setDofEnabled: (value) => set({ dofEnabled: value }),
  setVignetteEnabled: (value) => set({ vignetteEnabled: value }),
  setAoEnabled: (value) => set({ aoEnabled: value }),
  setColorGradeEnabled: (value) => set({ colorGradeEnabled: value }),
  setGrainEnabled: (value) => set({ grainEnabled: value }),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  resetToDefaults: () => set({ ...DEFAULT_EFFECT_FLAGS }),
}));
