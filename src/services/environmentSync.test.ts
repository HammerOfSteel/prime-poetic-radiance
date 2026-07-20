import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fetchEnvironmentSnapshot } from './environmentSync';

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response;
}

describe('fetchEnvironmentSnapshot', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a live snapshot when geolocation and weather succeed', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ latitude: 51.5, longitude: -0.1 }))
      .mockResolvedValueOnce(
        jsonResponse({
          daily: { sunrise: ['2026-06-15T04:45'], sunset: ['2026-06-15T21:21'] },
          current_weather: { weathercode: 3 },
        }),
      );

    const snapshot = await fetchEnvironmentSnapshot(fetchImpl);

    expect(snapshot.source).toBe('live');
    expect(snapshot.weatherCode).toBe(3);
    expect(['morning', 'day', 'evening', 'night']).toContain(snapshot.preset);
    expect(['spring', 'summer', 'autumn', 'winter']).toContain(snapshot.season);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[0][0]).toBe('https://ipapi.co/json/');
    expect(fetchImpl.mock.calls[1][0]).toContain('api.open-meteo.com');
  });

  it('falls back to clock-only snapshot when geolocation request fails', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(jsonResponse({}, false, 500));

    const snapshot = await fetchEnvironmentSnapshot(fetchImpl);

    expect(snapshot.source).toBe('fallback');
    expect(snapshot.weatherCode).toBeNull();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('falls back to clock-only snapshot when geolocation response is malformed', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(jsonResponse({ nope: true }));

    const snapshot = await fetchEnvironmentSnapshot(fetchImpl);

    expect(snapshot.source).toBe('fallback');
    expect(snapshot.weatherCode).toBeNull();
  });

  it('falls back to clock-only snapshot when geolocation response has NaN latitude/longitude', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(jsonResponse({ latitude: NaN, longitude: NaN }));

    const snapshot = await fetchEnvironmentSnapshot(fetchImpl);

    expect(snapshot.source).toBe('fallback');
    expect(snapshot.weatherCode).toBeNull();
  });

  it('falls back to clock-only snapshot when weather request fails', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ latitude: 51.5, longitude: -0.1 }))
      .mockResolvedValueOnce(jsonResponse({}, false, 500));

    const snapshot = await fetchEnvironmentSnapshot(fetchImpl);

    expect(snapshot.source).toBe('fallback');
    expect(snapshot.weatherCode).toBeNull();
  });

  it('falls back to clock-only snapshot on timeout', async () => {
    const fetchImpl = vi.fn().mockImplementation(
      (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    );

    const resultPromise = fetchEnvironmentSnapshot(fetchImpl);
    await vi.advanceTimersByTimeAsync(5000);
    const snapshot = await resultPromise;

    expect(snapshot.source).toBe('fallback');
    expect(snapshot.weatherCode).toBeNull();
  });
});
