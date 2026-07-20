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
    if (!Number.isFinite(geo.latitude) || !Number.isFinite(geo.longitude)) {
      throw new Error('IP geolocation response missing latitude/longitude');
    }
    const lat = geo.latitude as number;
    const lon = geo.longitude as number;

    const weather = (await fetchJsonWithTimeout(
      buildWeatherUrl(lat, lon),
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
      season: seasonFromDate(now, lat),
      weatherCode,
      source: 'live',
    };
  } catch {
    return fallbackSnapshot(now);
  }
}
