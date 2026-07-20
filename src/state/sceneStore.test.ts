import { describe, expect, it, beforeEach } from 'vitest';
import { useSceneStore } from './sceneStore';

describe('useSceneStore', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
  });

  it('defaults to the evening preset, not zoomed in, and nothing dragged', () => {
    const state = useSceneStore.getState();
    expect(state.lightingPreset).toBe('evening');
    expect(state.isZoomedIn).toBe(false);
    expect(state.draggedMagnetId).toBeNull();
  });

  it('updates the lighting preset', () => {
    useSceneStore.getState().setLightingPreset('night');
    expect(useSceneStore.getState().lightingPreset).toBe('night');
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
