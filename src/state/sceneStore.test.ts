import { describe, expect, it, beforeEach } from 'vitest';
import { useSceneStore } from './sceneStore';

describe('useSceneStore', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
  });

  it('defaults to the evening preset, auto mode, not zoomed in, and nothing dragged', () => {
    const state = useSceneStore.getState();
    expect(state.lightingPreset).toBe('evening');
    expect(state.environmentMode).toBe('auto');
    expect(state.weatherCode).toBeNull();
    expect(state.isZoomedIn).toBe(false);
    expect(state.draggedMagnetId).toBeNull();
  });

  it('updates the lighting preset and switches to manual mode', () => {
    useSceneStore.getState().setLightingPreset('night');
    expect(useSceneStore.getState().lightingPreset).toBe('night');
    expect(useSceneStore.getState().environmentMode).toBe('manual');
  });

  it('sets environment mode directly', () => {
    useSceneStore.getState().setEnvironmentMode('manual');
    expect(useSceneStore.getState().environmentMode).toBe('manual');
    useSceneStore.getState().setEnvironmentMode('auto');
    expect(useSceneStore.getState().environmentMode).toBe('auto');
  });

  it('applies an environment snapshot while in auto mode', () => {
    useSceneStore.getState().applyEnvironmentSnapshot({
      preset: 'night',
      season: 'winter',
      weatherCode: 61,
      source: 'live',
    });
    const state = useSceneStore.getState();
    expect(state.lightingPreset).toBe('night');
    expect(state.season).toBe('winter');
    expect(state.weatherCode).toBe(61);
  });

  it('ignores an environment snapshot while in manual mode', () => {
    useSceneStore.getState().setLightingPreset('day');
    useSceneStore.getState().applyEnvironmentSnapshot({
      preset: 'night',
      season: 'winter',
      weatherCode: 61,
      source: 'live',
    });
    const state = useSceneStore.getState();
    expect(state.lightingPreset).toBe('day');
    expect(state.weatherCode).toBeNull();
  });

  it('zooms to the fridge and resets back', () => {
    useSceneStore.getState().zoomToFridge();
    expect(useSceneStore.getState().isZoomedIn).toBe(true);

    useSceneStore.getState().resetCamera();
    expect(useSceneStore.getState().isZoomedIn).toBe(false);
  });

  it('tracks the currently dragged magnet id', () => {
    useSceneStore.getState().setDraggedMagnetId('magnet-3');
    expect(useSceneStore.getState().draggedMagnetId).toBe('magnet-3');

    useSceneStore.getState().setDraggedMagnetId(null);
    expect(useSceneStore.getState().draggedMagnetId).toBeNull();
  });
});
