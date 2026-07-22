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

  it('zooms in and resets back', () => {
    useSceneStore.getState().zoomIn();
    expect(useSceneStore.getState().isZoomedIn).toBe(true);

    useSceneStore.getState().resetCamera();
    expect(useSceneStore.getState().isZoomedIn).toBe(false);
  });

  it('defaults to the kitchen scene with a pre-populated magnet layout', () => {
    const state = useSceneStore.getState();
    expect(state.activeSceneId).toBe('kitchen');
    expect(state.magnetLayoutBySceneId.kitchen).toBeDefined();
    expect(state.magnetLayoutBySceneId.kitchen).toHaveLength(35);
  });

  it('switching to a new scene zooms out and lazily creates its magnet layout', () => {
    useSceneStore.getState().zoomIn();
    useSceneStore.getState().setActiveScene('tavern');
    const state = useSceneStore.getState();
    expect(state.activeSceneId).toBe('tavern');
    expect(state.isZoomedIn).toBe(false);
    expect(state.magnetLayoutBySceneId.tavern).toBeDefined();
    expect(state.magnetLayoutBySceneId.tavern!.length).toBeGreaterThan(0);
  });

  it('preserves an existing scene layout when switching back to it', () => {
    useSceneStore.getState().setActiveScene('tavern');
    const firstLayout = useSceneStore.getState().magnetLayoutBySceneId.tavern;
    useSceneStore.getState().setActiveScene('kitchen');
    useSceneStore.getState().setActiveScene('tavern');
    expect(useSceneStore.getState().magnetLayoutBySceneId.tavern).toBe(firstLayout);
  });

  it('updates a single magnet position within a scene layout by index', () => {
    const initial = useSceneStore.getState().magnetLayoutBySceneId.kitchen![0];
    useSceneStore.getState().updateMagnetPosition('kitchen', 0, [1, 2, -1.84]);
    const updated = useSceneStore.getState().magnetLayoutBySceneId.kitchen![0];
    expect(updated.position).toEqual([1, 2, -1.84]);
    expect(updated.word).toBe(initial.word);
    // other entries are untouched
    expect(useSceneStore.getState().magnetLayoutBySceneId.kitchen![1]).toEqual(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      useSceneStore.getInitialState().magnetLayoutBySceneId.kitchen![1],
    );
  });

  it('does nothing when updating a position for a scene with no layout yet', () => {
    useSceneStore.getState().updateMagnetPosition('tavern', 0, [0, 0, 0]);
    expect(useSceneStore.getState().magnetLayoutBySceneId.tavern).toBeUndefined();
  });

  it('tracks the currently dragged magnet id', () => {
    useSceneStore.getState().setDraggedMagnetId('magnet-3');
    expect(useSceneStore.getState().draggedMagnetId).toBe('magnet-3');

    useSceneStore.getState().setDraggedMagnetId(null);
    expect(useSceneStore.getState().draggedMagnetId).toBeNull();
  });

  it('increments the cubicle meeting tally from zero', () => {
    expect(useSceneStore.getState().cubicleMeetingTally).toBe(0);
    useSceneStore.getState().incrementCubicleMeetingTally();
    useSceneStore.getState().incrementCubicleMeetingTally();
    expect(useSceneStore.getState().cubicleMeetingTally).toBe(2);
  });

  it('advances and closes the cubicle standup vignette line index', () => {
    expect(useSceneStore.getState().cubicleStandupLineIndex).toBeNull();
    useSceneStore.getState().advanceCubicleStandupLine();
    expect(useSceneStore.getState().cubicleStandupLineIndex).toBe(0);
    useSceneStore.getState().advanceCubicleStandupLine();
    expect(useSceneStore.getState().cubicleStandupLineIndex).toBe(1);
    useSceneStore.getState().closeCubicleStandup();
    expect(useSceneStore.getState().cubicleStandupLineIndex).toBeNull();
  });

  it('toggles the cubicle PR-review overlay', () => {
    expect(useSceneStore.getState().cubiclePrReviewOpen).toBe(false);
    useSceneStore.getState().setCubiclePrReviewOpen(true);
    expect(useSceneStore.getState().cubiclePrReviewOpen).toBe(true);
    useSceneStore.getState().setCubiclePrReviewOpen(false);
    expect(useSceneStore.getState().cubiclePrReviewOpen).toBe(false);
  });
});
