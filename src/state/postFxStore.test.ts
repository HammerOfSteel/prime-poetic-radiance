import { describe, expect, it, beforeEach } from 'vitest';
import { usePostFxStore } from './postFxStore';

describe('usePostFxStore', () => {
  beforeEach(() => {
    usePostFxStore.setState(usePostFxStore.getInitialState());
  });

  it('defaults every effect to enabled and the panel to closed', () => {
    const state = usePostFxStore.getState();
    expect(state.bloomEnabled).toBe(true);
    expect(state.dofEnabled).toBe(true);
    expect(state.vignetteEnabled).toBe(true);
    expect(state.aoEnabled).toBe(true);
    expect(state.colorGradeEnabled).toBe(true);
    expect(state.grainEnabled).toBe(true);
    expect(state.isPanelOpen).toBe(false);
  });

  it('toggles each effect flag independently via its setter', () => {
    usePostFxStore.getState().setBloomEnabled(false);
    expect(usePostFxStore.getState().bloomEnabled).toBe(false);
    expect(usePostFxStore.getState().dofEnabled).toBe(true);

    usePostFxStore.getState().setDofEnabled(false);
    usePostFxStore.getState().setVignetteEnabled(false);
    usePostFxStore.getState().setAoEnabled(false);
    usePostFxStore.getState().setColorGradeEnabled(false);
    usePostFxStore.getState().setGrainEnabled(false);

    const state = usePostFxStore.getState();
    expect(state.bloomEnabled).toBe(false);
    expect(state.dofEnabled).toBe(false);
    expect(state.vignetteEnabled).toBe(false);
    expect(state.aoEnabled).toBe(false);
    expect(state.colorGradeEnabled).toBe(false);
    expect(state.grainEnabled).toBe(false);
  });

  it('toggles the settings panel open and closed', () => {
    expect(usePostFxStore.getState().isPanelOpen).toBe(false);
    usePostFxStore.getState().togglePanel();
    expect(usePostFxStore.getState().isPanelOpen).toBe(true);
    usePostFxStore.getState().togglePanel();
    expect(usePostFxStore.getState().isPanelOpen).toBe(false);
  });

  it('resets every effect flag back to enabled, without touching the panel state', () => {
    usePostFxStore.getState().setBloomEnabled(false);
    usePostFxStore.getState().setGrainEnabled(false);
    usePostFxStore.getState().togglePanel();

    usePostFxStore.getState().resetToDefaults();

    const state = usePostFxStore.getState();
    expect(state.bloomEnabled).toBe(true);
    expect(state.grainEnabled).toBe(true);
    expect(state.isPanelOpen).toBe(true);
  });
});
