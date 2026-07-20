import { describe, expect, it } from 'vitest';
import { SCENES, SCENE_IDS } from './scenes';

describe('scenes', () => {
  it('lists kitchen and tavern in SCENE_IDS', () => {
    expect(SCENE_IDS).toEqual(['kitchen', 'tavern']);
  });

  it('defines a SceneDefinition for every id in SCENE_IDS', () => {
    SCENE_IDS.forEach((id) => {
      expect(SCENES[id]).toBeDefined();
      expect(SCENES[id].id).toBe(id);
    });
  });

  it('gives the kitchen scene the existing fridge-door surface and camera framing', () => {
    expect(SCENES.kitchen.magnetSurfaceZ).toBe(-1.84);
    expect(SCENES.kitchen.magnetCount).toBe(35);
    expect(SCENES.kitchen.wordTheme).toBe('kitchen');
    expect(SCENES.kitchen.usesEnvironmentLighting).toBe(true);
    expect(SCENES.kitchen.fixedLightingPreset).toBeNull();
  });

  it('gives the tavern scene its own theme and a fixed (non-environment) lighting preset', () => {
    expect(SCENES.tavern.wordTheme).toBe('tavern');
    expect(SCENES.tavern.usesEnvironmentLighting).toBe(false);
    expect(SCENES.tavern.fixedLightingPreset).not.toBeNull();
    expect(SCENES.tavern.magnetCount).toBeGreaterThan(0);
  });

  it('gives every scene a label, camera-zoomed-in position, and camera target', () => {
    SCENE_IDS.forEach((id) => {
      const scene = SCENES[id];
      expect(typeof scene.label).toBe('string');
      expect(scene.label.length).toBeGreaterThan(0);
      expect(scene.cameraZoomedIn).toHaveLength(3);
      expect(scene.cameraTarget).toHaveLength(3);
    });
  });
});
