import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEnvironmentSync } from './useEnvironmentSync';
import { useSceneStore } from './sceneStore';
import * as environmentSync from '../services/environmentSync';

describe('useEnvironmentSync', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('syncs once on mount and applies the snapshot to the store', async () => {
    const snapshot: environmentSync.EnvironmentSnapshot = {
      preset: 'night',
      season: 'winter',
      weatherCode: 3,
      source: 'live',
    };
    vi.spyOn(environmentSync, 'fetchEnvironmentSnapshot').mockResolvedValue(snapshot);

    renderHook(() => useEnvironmentSync());
    await vi.waitFor(() => {
      expect(useSceneStore.getState().lightingPreset).toBe('night');
    });

    expect(environmentSync.fetchEnvironmentSnapshot).toHaveBeenCalledTimes(1);
    expect(useSceneStore.getState().season).toBe('winter');
    expect(useSceneStore.getState().weatherCode).toBe(3);
  });

  it('re-syncs every 15 minutes', async () => {
    const snapshot: environmentSync.EnvironmentSnapshot = {
      preset: 'day',
      season: 'summer',
      weatherCode: 0,
      source: 'live',
    };
    vi.spyOn(environmentSync, 'fetchEnvironmentSnapshot').mockResolvedValue(snapshot);

    renderHook(() => useEnvironmentSync());
    await vi.waitFor(() => {
      expect(environmentSync.fetchEnvironmentSnapshot).toHaveBeenCalledTimes(1);
    });

    await vi.advanceTimersByTimeAsync(15 * 60 * 1000);
    expect(environmentSync.fetchEnvironmentSnapshot).toHaveBeenCalledTimes(2);
  });

  it('stops syncing after unmount', async () => {
    const snapshot: environmentSync.EnvironmentSnapshot = {
      preset: 'day',
      season: 'summer',
      weatherCode: 0,
      source: 'live',
    };
    vi.spyOn(environmentSync, 'fetchEnvironmentSnapshot').mockResolvedValue(snapshot);

    const { unmount } = renderHook(() => useEnvironmentSync());
    await vi.waitFor(() => {
      expect(environmentSync.fetchEnvironmentSnapshot).toHaveBeenCalledTimes(1);
    });

    unmount();
    await vi.advanceTimersByTimeAsync(15 * 60 * 1000);
    expect(environmentSync.fetchEnvironmentSnapshot).toHaveBeenCalledTimes(1);
  });

  it('re-syncs immediately when environmentMode transitions back to auto', async () => {
    const snapshot: environmentSync.EnvironmentSnapshot = {
      preset: 'day',
      season: 'summer',
      weatherCode: 0,
      source: 'live',
    };
    vi.spyOn(environmentSync, 'fetchEnvironmentSnapshot').mockResolvedValue(snapshot);

    renderHook(() => useEnvironmentSync());
    await vi.waitFor(() => {
      expect(environmentSync.fetchEnvironmentSnapshot).toHaveBeenCalledTimes(1);
    });

    // Switch to manual mode
    useSceneStore.getState().setEnvironmentMode('manual');
    // Switch back to auto — should trigger an immediate sync
    useSceneStore.getState().setEnvironmentMode('auto');

    await vi.waitFor(() => {
      expect(environmentSync.fetchEnvironmentSnapshot).toHaveBeenCalledTimes(2);
    });

    // Confirm the interval timer was NOT needed — no 15-minute advance
    expect(environmentSync.fetchEnvironmentSnapshot).toHaveBeenCalledTimes(2);
  });
});
