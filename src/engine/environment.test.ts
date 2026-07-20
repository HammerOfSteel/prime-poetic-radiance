import { describe, expect, it } from 'vitest';
import { seasonFromDate, timeOfDayFromClock, timeOfDayFromSunTimes, applyEnvironmentModifiers } from './environment';
import { LIGHTING_PRESETS } from './lightingPresets';

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
