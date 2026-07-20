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

  it('matches the ported values for the night preset', () => {
    expect(LIGHTING_PRESETS.night).toEqual({
      ambientColor: '#0984e3',
      directionalColor: '#74b9ff',
      fillColor: '#00cec9',
      fogColor: '#050510',
      directionalIntensity: 0.2,
      fillIntensity: 0.3,
      directionalPosition: { x: 0, y: 10, z: 0 },
    });
  });
});
