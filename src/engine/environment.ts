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
