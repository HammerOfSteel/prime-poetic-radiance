# Phase 3: Environment System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the kitchen scene's lighting automatically reflect real local time-of-day, season, and weather (via IP geolocation + Open-Meteo), with a manual override and a pure-clock offline fallback.

**Architecture:** New pure functions in `src/engine/environment.ts` compute time-of-day/season/weather-tint from dates and coordinates. A new `src/services/environmentSync.ts` is the only module doing network I/O, wrapping IP geolocation + Open-Meteo calls with a 5s timeout and always resolving (never throwing) to an `EnvironmentSnapshot`. `sceneStore` gains `environmentMode`/`season`/`weatherCode` state; a new `useEnvironmentSync` hook polls the service every 15 minutes and feeds the store. `Lighting.tsx` and `HUD.tsx` get small, additive changes to consume/display the new state.

**Tech Stack:** TypeScript, React, Zustand, Vitest, Testing Library, `@react-three/test-renderer`, native `fetch`/`AbortController` (no new dependencies).

## Global Constraints

- Reference spec: `docs/superpowers/specs/2026-07-20-phase-3-environment-system-design.md`.
- No new npm dependencies — use native `fetch`/`AbortController`, no HTTP client library.
- `engine/` modules stay pure (no network I/O, no React, no three.js imports) and 100% unit-tested, per existing project convention (see `src/engine/lightingPresets.ts`).
- Network I/O lives only in `src/services/environmentSync.ts`.
- Fetch timeout: 5000ms (`FETCH_TIMEOUT_MS`).
- Sync interval: 15 minutes (`SYNC_INTERVAL_MS = 15 * 60 * 1000`).
- IP geolocation endpoint: `https://ipapi.co/json/`. Weather endpoint: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=sunrise,sunset&current_weather=true&timezone=auto`.
- The service must never throw — any failure resolves to a clock-only fallback snapshot with `source: 'fallback'`.
- Run `npm run typecheck` and `npm test` after each task; both must pass before committing.

---

### Task 1: Time-of-day and season pure functions

**Files:**
- Create: `src/engine/environment.ts`
- Test: `src/engine/environment.test.ts`

**Interfaces:**
- Consumes: `LightingPresetName` from `src/engine/lightingPresets.ts` (existing).
- Produces: `export type Season = 'spring' | 'summer' | 'autumn' | 'winter'`; `export function timeOfDayFromClock(date: Date): LightingPresetName`; `export function timeOfDayFromSunTimes(date: Date, sunrise: Date, sunset: Date): LightingPresetName`; `export function seasonFromDate(date: Date, latitude: number): Season`. These are consumed by Task 2 (same file) and Task 3 (`services/environmentSync.ts`).

- [ ] **Step 1: Write the failing tests**

Create `src/engine/environment.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { seasonFromDate, timeOfDayFromClock, timeOfDayFromSunTimes } from './environment';

function atHour(hour: number): Date {
  const d = new Date(2026, 5, 15); // June 15, 2026 (a Monday), local time
  d.setHours(hour, 0, 0, 0);
  return d;
}

describe('timeOfDayFromClock', () => {
  it('returns night before 5am', () => {
    expect(timeOfDayFromClock(atHour(4))).toBe('night');
  });

  it('returns morning from 5am up to 10am', () => {
    expect(timeOfDayFromClock(atHour(5))).toBe('morning');
    expect(timeOfDayFromClock(atHour(9))).toBe('morning');
  });

  it('returns day from 10am up to 5pm', () => {
    expect(timeOfDayFromClock(atHour(10))).toBe('day');
    expect(timeOfDayFromClock(atHour(16))).toBe('day');
  });

  it('returns evening from 5pm up to 8pm', () => {
    expect(timeOfDayFromClock(atHour(17))).toBe('evening');
    expect(timeOfDayFromClock(atHour(19))).toBe('evening');
  });

  it('returns night from 8pm onward', () => {
    expect(timeOfDayFromClock(atHour(20))).toBe('night');
    expect(timeOfDayFromClock(atHour(23))).toBe('night');
  });
});

describe('timeOfDayFromSunTimes', () => {
  const sunrise = new Date(2026, 5, 15, 6, 0, 0); // 6:00am
  const sunset = new Date(2026, 5, 15, 20, 0, 0); // 8:00pm

  it('returns night more than 1.5h before sunrise', () => {
    const date = new Date(2026, 5, 15, 4, 0, 0);
    expect(timeOfDayFromSunTimes(date, sunrise, sunset)).toBe('night');
  });

  it('returns morning within 1.5h of sunrise', () => {
    const date = new Date(2026, 5, 15, 6, 30, 0);
    expect(timeOfDayFromSunTimes(date, sunrise, sunset)).toBe('morning');
  });

  it('returns day well after sunrise and well before sunset', () => {
    const date = new Date(2026, 5, 15, 13, 0, 0);
    expect(timeOfDayFromSunTimes(date, sunrise, sunset)).toBe('day');
  });

  it('returns evening within 1.5h of sunset', () => {
    const date = new Date(2026, 5, 15, 19, 0, 0);
    expect(timeOfDayFromSunTimes(date, sunrise, sunset)).toBe('evening');
  });

  it('returns night more than 1.5h after sunset', () => {
    const date = new Date(2026, 5, 15, 22, 0, 0);
    expect(timeOfDayFromSunTimes(date, sunrise, sunset)).toBe('night');
  });
});

describe('seasonFromDate', () => {
  it('returns northern-hemisphere winter for January at positive latitude', () => {
    expect(seasonFromDate(new Date(2026, 0, 15), 51.5)).toBe('winter');
  });

  it('returns northern-hemisphere summer for July at positive latitude', () => {
    expect(seasonFromDate(new Date(2026, 6, 15), 51.5)).toBe('summer');
  });

  it('flips to southern-hemisphere summer for January at negative latitude', () => {
    expect(seasonFromDate(new Date(2026, 0, 15), -33.9)).toBe('summer');
  });

  it('flips to southern-hemisphere winter for July at negative latitude', () => {
    expect(seasonFromDate(new Date(2026, 6, 15), -33.9)).toBe('winter');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/engine/environment.test.ts`
Expected: FAIL with "Failed to resolve import" or "Cannot find module './environment'"

- [ ] **Step 3: Write the implementation**

Create `src/engine/environment.ts`:

```ts
import type { LightingPresetName } from './lightingPresets';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

const MORNING_START_HOUR = 5;
const DAY_START_HOUR = 10;
const EVENING_START_HOUR = 17;
const NIGHT_START_HOUR = 20;

/** Clock-only time-of-day banding; used as the offline/fallback path. */
export function timeOfDayFromClock(date: Date): LightingPresetName {
  const hour = date.getHours();
  if (hour >= NIGHT_START_HOUR || hour < MORNING_START_HOUR) return 'night';
  if (hour < DAY_START_HOUR) return 'morning';
  if (hour < EVENING_START_HOUR) return 'day';
  return 'evening';
}

const SUN_TRANSITION_HOURS = 1.5;
const SUN_TRANSITION_MS = SUN_TRANSITION_HOURS * 60 * 60 * 1000;

/** Sunrise/sunset-refined time-of-day banding; used when live sun times are available. */
export function timeOfDayFromSunTimes(date: Date, sunrise: Date, sunset: Date): LightingPresetName {
  const ms = date.getTime();
  const morningStart = sunrise.getTime() - SUN_TRANSITION_MS;
  const dayStart = sunrise.getTime() + SUN_TRANSITION_MS;
  const eveningStart = sunset.getTime() - SUN_TRANSITION_MS;
  const nightStart = sunset.getTime() + SUN_TRANSITION_MS;

  if (ms >= nightStart || ms < morningStart) return 'night';
  if (ms < dayStart) return 'morning';
  if (ms < eveningStart) return 'day';
  return 'evening';
}

const SEASON_FLIP: Record<Season, Season> = {
  winter: 'summer',
  summer: 'winter',
  spring: 'autumn',
  autumn: 'spring',
};

/** Meteorological season from a date and latitude; latitude sign determines hemisphere. */
export function seasonFromDate(date: Date, latitude: number): Season {
  const month = date.getMonth(); // 0-11
  let season: Season;
  if (month === 11 || month === 0 || month === 1) season = 'winter';
  else if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else season = 'autumn';

  return latitude >= 0 ? season : SEASON_FLIP[season];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/engine/environment.test.ts`
Expected: PASS (all 14 tests)

- [ ] **Step 5: Typecheck and commit**

Run: `npm run typecheck`
Expected: no errors

```bash
git add src/engine/environment.ts src/engine/environment.test.ts
git commit -m "feat: add time-of-day and season pure functions"
```

---

### Task 2: Weather/season lighting modifier

**Files:**
- Modify: `src/engine/environment.ts`
- Modify: `src/engine/environment.test.ts`

**Interfaces:**
- Consumes: `LightingPreset` and `LightingPresetName` from `src/engine/lightingPresets.ts`; `Season` from Task 1 (same file).
- Produces: `export function applyEnvironmentModifiers(base: LightingPreset, season: Season, weatherCode: number | null): LightingPreset`. Consumed by Task 3 (`environmentSync.ts` does NOT call this — it only returns preset/season/weatherCode; this is consumed by Task 6, `scene/Lighting.tsx`).

- [ ] **Step 1: Write the failing tests**

Append to `src/engine/environment.test.ts`:

```ts
import { applyEnvironmentModifiers } from './environment';
import { LIGHTING_PRESETS } from './lightingPresets';

describe('applyEnvironmentModifiers', () => {
  it('leaves intensities and colors unchanged for clear weather (code 0)', () => {
    const base = LIGHTING_PRESETS.day;
    const result = applyEnvironmentModifiers(base, 'summer', 0);
    expect(result.directionalIntensity).toBe(base.directionalIntensity);
    expect(result.fillIntensity).toBe(base.fillIntensity);
    expect(result.ambientColor).toBe(base.ambientColor);
    expect(result.directionalColor).toBe(base.directionalColor);
    expect(result.fillColor).toBe(base.fillColor);
  });

  it('leaves intensities and colors unchanged for null weather (fallback/offline)', () => {
    const base = LIGHTING_PRESETS.day;
    const result = applyEnvironmentModifiers(base, 'summer', null);
    expect(result.directionalIntensity).toBe(base.directionalIntensity);
    expect(result.ambientColor).toBe(base.ambientColor);
  });

  it('dims and desaturates for overcast codes (1-3)', () => {
    const base = LIGHTING_PRESETS.day;
    const result = applyEnvironmentModifiers(base, 'summer', 2);
    expect(result.directionalIntensity).toBeLessThan(base.directionalIntensity);
    expect(result.fillIntensity).toBeLessThan(base.fillIntensity);
    expect(result.ambientColor).not.toBe(base.ambientColor);
  });

  it('dims further and shifts fog for precipitation codes (e.g. 61 rain)', () => {
    const base = LIGHTING_PRESETS.day;
    const overcast = applyEnvironmentModifiers(base, 'summer', 2);
    const rain = applyEnvironmentModifiers(base, 'summer', 61);
    expect(rain.directionalIntensity).toBeLessThan(overcast.directionalIntensity);
    expect(rain.fogColor).not.toBe(base.fogColor);
  });

  it('dims and shifts fog for fog codes (45, 48)', () => {
    const base = LIGHTING_PRESETS.day;
    const result = applyEnvironmentModifiers(base, 'summer', 45);
    expect(result.directionalIntensity).toBeLessThan(base.directionalIntensity);
    expect(result.fogColor).not.toBe(base.fogColor);
  });

  it('always tints fog color slightly by season, even in clear weather', () => {
    const base = LIGHTING_PRESETS.day;
    const winter = applyEnvironmentModifiers(base, 'winter', 0);
    const summer = applyEnvironmentModifiers(base, 'summer', 0);
    expect(winter.fogColor).not.toBe(base.fogColor);
    expect(winter.fogColor).not.toBe(summer.fogColor);
  });

  it('preserves directionalPosition unchanged', () => {
    const base = LIGHTING_PRESETS.evening;
    const result = applyEnvironmentModifiers(base, 'autumn', 95);
    expect(result.directionalPosition).toEqual(base.directionalPosition);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/engine/environment.test.ts`
Expected: FAIL with "applyEnvironmentModifiers is not a function" (new tests only; Task 1 tests still pass)

- [ ] **Step 3: Write the implementation**

Append to `src/engine/environment.ts`:

```ts
import type { LightingPreset } from './lightingPresets';

type WeatherBucket = 'clear' | 'overcast' | 'precipitation' | 'fog';

interface WeatherModifier {
  intensityMultiplier: number;
  desaturate: number;
  fogTint?: string;
}

const WEATHER_MODIFIERS: Record<WeatherBucket, WeatherModifier> = {
  clear: { intensityMultiplier: 1, desaturate: 0 },
  overcast: { intensityMultiplier: 0.75, desaturate: 0.25 },
  precipitation: { intensityMultiplier: 0.55, desaturate: 0.4, fogTint: '#333a42' },
  fog: { intensityMultiplier: 0.5, desaturate: 0.5, fogTint: '#555a60' },
};

/** Maps an Open-Meteo WMO weather code to a coarse lighting-relevant bucket. */
function weatherBucketFromCode(code: number): WeatherBucket {
  if (code === 0) return 'clear';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 51 && code <= 82) || code >= 95) return 'precipitation';
  return 'overcast'; // codes 1-3 and any other unmapped code
}

const SEASON_FOG_TINTS: Record<Season, string> = {
  winter: '#dbe9ff',
  spring: '#d8ffd8',
  summer: '#fff3d0',
  autumn: '#ffd9b0',
};

const SEASON_FOG_TINT_WEIGHT = 0.15;
const WEATHER_FOG_TINT_WEIGHT = 0.6;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const toHex = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}

function desaturateHex(hex: string, amount: number): string {
  if (amount <= 0) return hex;
  const [r, g, b] = hexToRgb(hex);
  const gray = (r + g + b) / 3;
  return rgbToHex([r + (gray - r) * amount, g + (gray - g) * amount, b + (gray - b) * amount]);
}

/**
 * Applies season fog tinting (always, subtly) and weather-driven dimming/
 * desaturation (based on Open-Meteo WMO weather codes) to a base lighting
 * preset. Pure and side-effect-free. `weatherCode: null` means "no live
 * weather data" and is treated the same as clear weather.
 */
export function applyEnvironmentModifiers(
  base: LightingPreset,
  season: Season,
  weatherCode: number | null,
): LightingPreset {
  const bucket = weatherCode === null ? 'clear' : weatherBucketFromCode(weatherCode);
  const modifier = WEATHER_MODIFIERS[bucket];

  let fogColor = mixHex(base.fogColor, SEASON_FOG_TINTS[season], SEASON_FOG_TINT_WEIGHT);
  if (modifier.fogTint) {
    fogColor = mixHex(fogColor, modifier.fogTint, WEATHER_FOG_TINT_WEIGHT);
  }

  return {
    ...base,
    ambientColor: desaturateHex(base.ambientColor, modifier.desaturate),
    directionalColor: desaturateHex(base.directionalColor, modifier.desaturate),
    fillColor: desaturateHex(base.fillColor, modifier.desaturate),
    fogColor,
    directionalIntensity: base.directionalIntensity * modifier.intensityMultiplier,
    fillIntensity: base.fillIntensity * modifier.intensityMultiplier,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/engine/environment.test.ts`
Expected: PASS (all 21 tests)

- [ ] **Step 5: Typecheck and commit**

Run: `npm run typecheck`
Expected: no errors

```bash
git add src/engine/environment.ts src/engine/environment.test.ts
git commit -m "feat: add season/weather lighting modifier"
```

---

### Task 3: Environment sync service (network I/O)

**Files:**
- Create: `src/services/environmentSync.ts`
- Test: `src/services/environmentSync.test.ts`

**Interfaces:**
- Consumes: `timeOfDayFromClock`, `timeOfDayFromSunTimes`, `seasonFromDate`, `type Season` from `src/engine/environment.ts` (Task 1); `type LightingPresetName` from `src/engine/lightingPresets.ts`.
- Produces: `export interface EnvironmentSnapshot { preset: LightingPresetName; season: Season; weatherCode: number | null; source: 'live' | 'fallback' }`; `export async function fetchEnvironmentSnapshot(fetchImpl?: typeof fetch): Promise<EnvironmentSnapshot>`. Consumed by Task 5 (`state/useEnvironmentSync.ts`).

- [ ] **Step 1: Write the failing tests**

Create `src/services/environmentSync.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/services/environmentSync.test.ts`
Expected: FAIL with "Cannot find module './environmentSync'"

- [ ] **Step 3: Write the implementation**

Create `src/services/environmentSync.ts`:

```ts
import { seasonFromDate, timeOfDayFromClock, timeOfDayFromSunTimes, type Season } from '../engine/environment';
import type { LightingPresetName } from '../engine/lightingPresets';

export interface EnvironmentSnapshot {
  preset: LightingPresetName;
  season: Season;
  weatherCode: number | null;
  source: 'live' | 'fallback';
}

const FETCH_TIMEOUT_MS = 5000;
const IP_GEOLOCATION_URL = 'https://ipapi.co/json/';

interface IpGeolocationResponse {
  latitude?: unknown;
  longitude?: unknown;
}

interface OpenMeteoResponse {
  daily?: { sunrise?: unknown; sunset?: unknown };
  current_weather?: { weathercode?: unknown };
}

function fallbackSnapshot(now: Date): EnvironmentSnapshot {
  return {
    preset: timeOfDayFromClock(now),
    // No coordinates available offline; assume northern hemisphere as a neutral default.
    season: seasonFromDate(now, 0),
    weatherCode: null,
    source: 'fallback',
  };
}

async function fetchJsonWithTimeout(url: string, fetchImpl: typeof fetch): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request to ${url} failed with status ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildWeatherUrl(latitude: number, longitude: number): string {
  return (
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&daily=sunrise,sunset&current_weather=true&timezone=auto`
  );
}

/**
 * Fetches the current environment (time-of-day preset, season, weather) using
 * IP geolocation + Open-Meteo. Never throws: any network failure, timeout, or
 * malformed response resolves to a clock-only fallback snapshot instead.
 */
export async function fetchEnvironmentSnapshot(fetchImpl: typeof fetch = fetch): Promise<EnvironmentSnapshot> {
  const now = new Date();
  try {
    const geo = (await fetchJsonWithTimeout(IP_GEOLOCATION_URL, fetchImpl)) as IpGeolocationResponse;
    if (typeof geo.latitude !== 'number' || typeof geo.longitude !== 'number') {
      throw new Error('IP geolocation response missing latitude/longitude');
    }

    const weather = (await fetchJsonWithTimeout(
      buildWeatherUrl(geo.latitude, geo.longitude),
      fetchImpl,
    )) as OpenMeteoResponse;

    const sunriseRaw = weather.daily?.sunrise;
    const sunsetRaw = weather.daily?.sunset;
    const weatherCode = weather.current_weather?.weathercode;
    if (
      !Array.isArray(sunriseRaw) ||
      !Array.isArray(sunsetRaw) ||
      typeof sunriseRaw[0] !== 'string' ||
      typeof sunsetRaw[0] !== 'string' ||
      typeof weatherCode !== 'number'
    ) {
      throw new Error('Open-Meteo response missing sunrise/sunset/weathercode');
    }

    const sunrise = new Date(sunriseRaw[0]);
    const sunset = new Date(sunsetRaw[0]);
    if (Number.isNaN(sunrise.getTime()) || Number.isNaN(sunset.getTime())) {
      throw new Error('Open-Meteo response has invalid sunrise/sunset');
    }

    return {
      preset: timeOfDayFromSunTimes(now, sunrise, sunset),
      season: seasonFromDate(now, geo.latitude),
      weatherCode,
      source: 'live',
    };
  } catch {
    return fallbackSnapshot(now);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/services/environmentSync.test.ts`
Expected: PASS (all 6 tests)

- [ ] **Step 5: Typecheck and commit**

Run: `npm run typecheck`
Expected: no errors

```bash
git add src/services/environmentSync.ts src/services/environmentSync.test.ts
git commit -m "feat: add environment sync service with offline fallback"
```

---

### Task 4: Scene store — environment mode, season, weather state

**Files:**
- Modify: `src/state/sceneStore.ts`
- Modify: `src/state/sceneStore.test.ts`

**Interfaces:**
- Consumes: `type EnvironmentSnapshot` from `src/services/environmentSync.ts` (Task 3); `type Season` from `src/engine/environment.ts` (Task 1); existing `type LightingPresetName`.
- Produces: `export type EnvironmentMode = 'auto' | 'manual'`; new `SceneState` fields `environmentMode: EnvironmentMode`, `season: Season`, `weatherCode: number | null`; new actions `setEnvironmentMode(mode: EnvironmentMode): void` and `applyEnvironmentSnapshot(snapshot: EnvironmentSnapshot): void`. `setLightingPreset` now also sets `environmentMode: 'manual'`. Consumed by Task 5 (`useEnvironmentSync`), Task 6 (`Lighting.tsx`), Task 7 (`HUD.tsx`).

- [ ] **Step 1: Write the failing tests**

Replace the contents of `src/state/sceneStore.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/state/sceneStore.test.ts`
Expected: FAIL — `environmentMode`/`setEnvironmentMode`/`applyEnvironmentSnapshot` do not exist on the store

- [ ] **Step 3: Write the implementation**

Replace the contents of `src/state/sceneStore.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/state/sceneStore.test.ts`
Expected: PASS (all 7 tests)

- [ ] **Step 5: Typecheck and commit**

Run: `npm run typecheck`
Expected: no errors

```bash
git add src/state/sceneStore.ts src/state/sceneStore.test.ts
git commit -m "feat: add environment mode/season/weather state to scene store"
```

---

### Task 5: `useEnvironmentSync` hook + wire into App

**Files:**
- Create: `src/state/useEnvironmentSync.ts`
- Test: `src/state/useEnvironmentSync.test.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `fetchEnvironmentSnapshot` from `src/services/environmentSync.ts` (Task 3); `useSceneStore` from `src/state/sceneStore.ts` (Task 4).
- Produces: `export function useEnvironmentSync(): void`. Consumed by `App.tsx`.

- [ ] **Step 1: Write the failing tests**

Create `src/state/useEnvironmentSync.test.ts`:

```ts
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
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/state/useEnvironmentSync.test.ts`
Expected: FAIL with "Cannot find module './useEnvironmentSync'"

- [ ] **Step 3: Write the implementation**

Create `src/state/useEnvironmentSync.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/state/useEnvironmentSync.test.ts`
Expected: PASS (all 3 tests)

- [ ] **Step 5: Wire the hook into `App.tsx`**

In `src/App.tsx`, add the import and call the hook inside `App()`:

```ts
import { useSceneStore } from './state/sceneStore';
import { useEnvironmentSync } from './state/useEnvironmentSync';
```

```ts
function App() {
  useEnvironmentSync();
  const isZoomedIn = useSceneStore((state) => state.isZoomedIn);
```

- [ ] **Step 6: Run the full test suite and typecheck**

Run: `npm test && npm run typecheck`
Expected: all tests PASS, no type errors (App.tsx has no dedicated test file today, so this step only needs to confirm nothing else broke)

- [ ] **Step 7: Commit**

```bash
git add src/state/useEnvironmentSync.ts src/state/useEnvironmentSync.test.ts src/App.tsx
git commit -m "feat: sync environment state on an interval and wire into App"
```

---

### Task 6: Apply environment modifiers in `Lighting.tsx`

**Files:**
- Modify: `src/scene/Lighting.tsx`
- Modify: `src/scene/Lighting.test.tsx`

**Interfaces:**
- Consumes: `applyEnvironmentModifiers`, `type Season` from `src/engine/environment.ts` (Task 2/1); `season`, `weatherCode` fields from `useSceneStore` (Task 4).
- Produces: `export function computeTintedLightingPreset(name: LightingPresetName, season: Season, weatherCode: number | null): LightingPreset`, exported from `Lighting.tsx` for direct unit testing (mirrors the existing `applyLightingPreset` pure-export pattern in this file).

- [ ] **Step 1: Write the failing test**

Append to `src/scene/Lighting.test.tsx`:

```ts
import { computeTintedLightingPreset } from './Lighting';
import { applyEnvironmentModifiers } from '../engine/environment';

describe('computeTintedLightingPreset', () => {
  it('looks up the named preset and applies season/weather modifiers', () => {
    const result = computeTintedLightingPreset('night', 'winter', 61);
    const expected = applyEnvironmentModifiers(LIGHTING_PRESETS.night, 'winter', 61);
    expect(result).toEqual(expected);
  });

  it('returns the unmodified preset for clear weather', () => {
    const result = computeTintedLightingPreset('day', 'summer', 0);
    expect(result.directionalIntensity).toBe(LIGHTING_PRESETS.day.directionalIntensity);
  });
});
```

(This adds a new import of `LIGHTING_PRESETS` alongside the existing one already imported at the top of `Lighting.test.tsx` — no duplicate import needed since it's already there.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/scene/Lighting.test.tsx`
Expected: FAIL with "computeTintedLightingPreset is not a function" (existing `applyLightingPreset` test still passes)

- [ ] **Step 3: Write the implementation**

In `src/scene/Lighting.tsx`, update imports and add the new function, then use it in the effect:

```ts
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsapDefault from 'gsap';
import { useThree } from '@react-three/fiber';
import { useSceneStore } from '../state/sceneStore';
import { LIGHTING_PRESETS, type LightingPreset, type LightingPresetName } from '../engine/lightingPresets';
import { applyEnvironmentModifiers, type Season } from '../engine/environment';
```

Add this exported function after the `LightRefs` interface (before `applyLightingPreset`):

```ts
/**
 * Looks up the named base preset and layers in season/weather tinting via
 * `applyEnvironmentModifiers`. Pure and unit-testable, mirroring
 * `applyLightingPreset` below.
 */
export function computeTintedLightingPreset(
  name: LightingPresetName,
  season: Season,
  weatherCode: number | null,
): LightingPreset {
  return applyEnvironmentModifiers(LIGHTING_PRESETS[name], season, weatherCode);
}
```

Update the `Lighting()` component to read `season`/`weatherCode` and use the new function:

```ts
export function Lighting() {
  const { scene } = useThree();
  const lightingPreset = useSceneStore((state) => state.lightingPreset);
  const season = useSceneStore((state) => state.season);
  const weatherCode = useSceneStore((state) => state.weatherCode);

  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    scene.fog = new THREE.FogExp2(0x1a1a1a, 0.02);
  }, [scene]);

  useEffect(() => {
    if (!ambientRef.current || !directionalRef.current || !fillRef.current || !scene.fog) return;
    applyLightingPreset(
      {
        ambient: ambientRef.current,
        directional: directionalRef.current,
        fill: fillRef.current,
        fog: scene.fog as THREE.FogExp2,
      },
      computeTintedLightingPreset(lightingPreset, season, weatherCode),
    );
  }, [lightingPreset, season, weatherCode, scene]);

  return (
```

(The JSX return block below is unchanged — leave it exactly as-is.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/scene/Lighting.test.tsx`
Expected: PASS (all 3 tests)

- [ ] **Step 5: Typecheck, run full suite, and commit**

Run: `npm run typecheck && npm test`
Expected: no errors, all tests pass

```bash
git add src/scene/Lighting.tsx src/scene/Lighting.test.tsx
git commit -m "feat: apply season/weather lighting modifiers in Lighting"
```

---

### Task 7: HUD Auto/Manual toggle

**Files:**
- Modify: `src/ui/HUD.tsx`
- Modify: `src/ui/HUD.test.tsx`

**Interfaces:**
- Consumes: `environmentMode`, `setEnvironmentMode` from `useSceneStore` (Task 4).
- Produces: no new exports; HUD renders one additional toggle button and disables the 4 preset buttons while `environmentMode === 'auto'`.

- [ ] **Step 1: Write the failing tests**

Replace the contents of `src/ui/HUD.test.tsx`:

```tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HUD } from './HUD';
import { useSceneStore } from '../state/sceneStore';

describe('HUD', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
  });

  it('renders the title, an auto toggle, and one button per lighting preset', () => {
    render(<HUD />);
    expect(screen.getByText('Magic Fridge')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /auto/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /morning/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /day/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /eve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /night/i })).toBeInTheDocument();
  });

  it('disables the preset buttons while in auto mode (the default)', () => {
    render(<HUD />);
    expect(screen.getByRole('button', { name: /night/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /day/i })).toBeDisabled();
  });

  it('clicking Auto switches to manual mode and enables the preset buttons', async () => {
    render(<HUD />);
    await userEvent.click(screen.getByRole('button', { name: /auto/i }));
    expect(useSceneStore.getState().environmentMode).toBe('manual');
    expect(screen.getByRole('button', { name: /night/i })).not.toBeDisabled();
  });

  it('updates the store when a lighting button is clicked in manual mode', async () => {
    render(<HUD />);
    await userEvent.click(screen.getByRole('button', { name: /auto/i }));
    await userEvent.click(screen.getByRole('button', { name: /night/i }));
    expect(useSceneStore.getState().lightingPreset).toBe('night');
    expect(useSceneStore.getState().environmentMode).toBe('manual');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/ui/HUD.test.tsx`
Expected: FAIL — no button matching `/auto/i`, and preset buttons are not disabled by default

- [ ] **Step 3: Write the implementation**

Replace the contents of `src/ui/HUD.tsx`:

```tsx
import { LIGHTING_PRESET_NAMES, LightingPresetName } from '../engine/lightingPresets';
import { useSceneStore } from '../state/sceneStore';

const PRESET_LABELS: Record<LightingPresetName, string> = {
  morning: '🌅 Morning',
  day: '☀️ Day',
  evening: '🌇 Eve',
  night: '🌙 Night',
};

export function HUD() {
  const setLightingPreset = useSceneStore((state) => state.setLightingPreset);
  const environmentMode = useSceneStore((state) => state.environmentMode);
  const setEnvironmentMode = useSceneStore((state) => state.setEnvironmentMode);
  const isAuto = environmentMode === 'auto';

  return (
    <div className="glass-panel interactive-ui hud">
      <h1>Magic Fridge</h1>
      <p>Click the fridge to zoom in. Drag words to write poetry.</p>
      <div>
        <button
          type="button"
          aria-pressed={isAuto}
          onClick={() => setEnvironmentMode(isAuto ? 'manual' : 'auto')}
        >
          {isAuto ? '🌐 Auto' : '✋ Manual'}
        </button>
        {LIGHTING_PRESET_NAMES.map((name) => (
          <button key={name} type="button" disabled={isAuto} onClick={() => setLightingPreset(name)}>
            {PRESET_LABELS[name]}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/ui/HUD.test.tsx`
Expected: PASS (all 4 tests)

- [ ] **Step 5: Run the full suite, typecheck, lint, and commit**

Run: `npm run typecheck && npm run lint && npm test`
Expected: no errors, all tests pass

```bash
git add src/ui/HUD.tsx src/ui/HUD.test.tsx
git commit -m "feat: add Auto/Manual environment toggle to HUD"
```

---

## Final Verification

- [ ] Run the complete check sequence once more from the repo root:

```bash
npm run typecheck && npm run lint && npm test
```

Expected: no type errors, no lint errors, all test files pass (existing Phase 0-2 tests plus the new `environment.test.ts`, `environmentSync.test.ts`, `useEnvironmentSync.test.ts`, and the updated `sceneStore.test.ts`, `Lighting.test.tsx`, `HUD.test.tsx`).

- [ ] Manually smoke-test with `npm run tauri dev`: confirm the HUD shows an "Auto" button, the scene lighting settles into a preset shortly after launch (network permitting) or falls back gracefully offline, and clicking "Auto" reveals working manual preset buttons that still function as before.
