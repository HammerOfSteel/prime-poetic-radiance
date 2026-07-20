import { describe, expect, it } from 'vitest';
import { LIGHTING_PRESET_NAMES, LIGHTING_PRESETS } from './lightingPresets';

describe('LIGHTING_PRESETS', () => {
  it('has an entry for every preset name', () => {
    LIGHTING_PRESET_NAMES.forEach((name) => {
      expect(LIGHTING_PRESETS[name]).toBeDefined();
    });
  });

  it('defines valid hex colors and positive intensities for every preset', () => {
    Object.values(LIGHTING_PRESETS).forEach((preset) => {
      expect(preset.ambientColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(preset.directionalColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(preset.fillColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(preset.fogColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(preset.directionalIntensity).toBeGreaterThan(0);
      expect(preset.fillIntensity).toBeGreaterThan(0);
    });
  });

  it('retunes day, evening, and night to warmer colors for the cozy toy aesthetic', () => {
    expect(LIGHTING_PRESETS.day.ambientColor).toBe('#fff8ec');
    expect(LIGHTING_PRESETS.day.directionalColor).toBe('#fff4de');
    expect(LIGHTING_PRESETS.day.fillColor).toBe('#fff2d9');

    expect(LIGHTING_PRESETS.evening.ambientColor).toBe('#a8677a');

    expect(LIGHTING_PRESETS.night.ambientColor).toBe('#2c3e6b');
    expect(LIGHTING_PRESETS.night.directionalColor).toBe('#b8c4e0');
    expect(LIGHTING_PRESETS.night.fillColor).toBe('#e8a054');
  });
});
