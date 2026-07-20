import { useEffect } from 'react';
import { fetchEnvironmentSnapshot } from '../services/environmentSync';
import { useSceneStore } from './sceneStore';

const SYNC_INTERVAL_MS = 15 * 60 * 1000;

/**
 * Syncs the scene store's environment state (time-of-day/season/weather) from
 * `fetchEnvironmentSnapshot` once on mount and every `SYNC_INTERVAL_MS` after.
 * Applying is a no-op while the store is in manual mode (see
 * `applyEnvironmentSnapshot` in `sceneStore.ts`), so this can run unconditionally.
 */
export function useEnvironmentSync(): void {
  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      const snapshot = await fetchEnvironmentSnapshot();
      if (!cancelled) {
        useSceneStore.getState().applyEnvironmentSnapshot(snapshot);
      }
    };

    sync();
    const intervalId = setInterval(sync, SYNC_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);
}
