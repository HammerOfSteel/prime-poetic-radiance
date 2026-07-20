import type { LightingPreset, LightingPresetName } from './lightingPresets';

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
  if ((code >= 51 && code <= 86) || code >= 95) return 'precipitation';
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
