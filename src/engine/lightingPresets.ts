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
    directionalIntensity: 1.2,
    fillIntensity: 0.6,
    directionalPosition: { x: -8, y: 4, z: 8 },
  },
  day: {
    ambientColor: '#ffffff',
    directionalColor: '#ffffff',
    fillColor: '#e0e0ff',
    fogColor: '#2a2a2a',
    directionalIntensity: 1.5,
    fillIntensity: 0.8,
    directionalPosition: { x: 2, y: 12, z: 4 },
  },
  evening: {
    ambientColor: '#6c5ce7',
    directionalColor: '#fdcb6e',
    fillColor: '#d63031',
    fogColor: '#1a1515',
    directionalIntensity: 0.8,
    fillIntensity: 0.5,
    directionalPosition: { x: 8, y: 3, z: 6 },
  },
  night: {
    ambientColor: '#0984e3',
    directionalColor: '#74b9ff',
    fillColor: '#00cec9',
    fogColor: '#050510',
    directionalIntensity: 0.2,
    fillIntensity: 0.3,
    directionalPosition: { x: 0, y: 10, z: 0 },
  },
};
