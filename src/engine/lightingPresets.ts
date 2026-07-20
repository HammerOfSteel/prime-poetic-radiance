export const LIGHTING_PRESET_NAMES = ['morning', 'day', 'evening', 'night'] as const;
export type LightingPresetName = (typeof LIGHTING_PRESET_NAMES)[number];

export interface LightingPreset {
  ambientColor: string;
  directionalColor: string;
  fillColor: string;
  fogColor: string;
  directionalIntensity: number;
  fillIntensity: number;
  directionalPosition: { x: number; y: number; z: number };
}

export const LIGHTING_PRESETS: Record<LightingPresetName, LightingPreset> = {
  morning: {
    ambientColor: '#ffeaa7',
    directionalColor: '#ffdac1',
    fillColor: '#ffb8b8',
    fogColor: '#3a302a',
    directionalIntensity: 2.4,
    fillIntensity: 1.2,
    directionalPosition: { x: -8, y: 4, z: 8 },
  },
  day: {
    ambientColor: '#fff8ec',
    directionalColor: '#fff4de',
    fillColor: '#fff2d9',
    fogColor: '#2a2a2a',
    directionalIntensity: 3,
    fillIntensity: 1.6,
    directionalPosition: { x: 2, y: 12, z: 4 },
  },
  evening: {
    ambientColor: '#a8677a',
    directionalColor: '#fdcb6e',
    fillColor: '#d63031',
    fogColor: '#1a1515',
    directionalIntensity: 1.6,
    fillIntensity: 1.0,
    directionalPosition: { x: 8, y: 3, z: 6 },
  },
  night: {
    ambientColor: '#2c3e6b',
    directionalColor: '#b8c4e0',
    fillColor: '#e8a054',
    fogColor: '#050510',
    directionalIntensity: 0.4,
    fillIntensity: 0.6,
    directionalPosition: { x: 0, y: 10, z: 0 },
  },
};
