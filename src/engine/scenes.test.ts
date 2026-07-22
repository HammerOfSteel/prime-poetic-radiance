import { describe, expect, it } from 'vitest';
import { SCENES, SCENE_IDS } from './scenes';

describe('scenes', () => {
  it('lists all six scenes in SCENE_IDS', () => {
    expect(SCENE_IDS).toEqual([
      'kitchen',
      'tavern',
      'dungeon',
      'developerHomeOffice',
      'developerCubicle',
      'developerOfficeKitchen',
    ]);
  });

  it('defines a SceneDefinition for every id in SCENE_IDS', () => {
    SCENE_IDS.forEach((id) => {
      expect(SCENES[id]).toBeDefined();
      expect(SCENES[id].id).toBe(id);
    });
  });

  it('gives the kitchen scene the existing fridge-door surface and camera framing', () => {
    expect(SCENES.kitchen.magnetSurfaceZ).toBe(1.75);
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

  it('gives the dungeon scene its own theme and participates in the environment lighting system', () => {
    expect(SCENES.dungeon.wordTheme).toBe('dungeon');
    expect(SCENES.dungeon.usesEnvironmentLighting).toBe(true);
    expect(SCENES.dungeon.fixedLightingPreset).toBeNull();
    expect(SCENES.dungeon.magnetCount).toBeGreaterThan(0);
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

  it('gives the developerHomeOffice scene its own theme and participates in the environment lighting system', () => {
    expect(SCENES.developerHomeOffice.wordTheme).toBe('developer');
    expect(SCENES.developerHomeOffice.usesEnvironmentLighting).toBe(true);
    expect(SCENES.developerHomeOffice.fixedLightingPreset).toBeNull();
    expect(SCENES.developerHomeOffice.magnetCount).toBeGreaterThan(0);
  });

  it('gives the developerCubicle scene a fixed lighting preset and does not participate in environment lighting', () => {
    expect(SCENES.developerCubicle.wordTheme).toBe('developer');
    expect(SCENES.developerCubicle.usesEnvironmentLighting).toBe(false);
    expect(SCENES.developerCubicle.fixedLightingPreset).not.toBeNull();
    expect(SCENES.developerCubicle.magnetCount).toBeGreaterThan(0);
  });

  it('gives the developerOfficeKitchen scene its own theme and participates in environment lighting', () => {
    expect(SCENES.developerOfficeKitchen.wordTheme).toBe('developer');
    expect(SCENES.developerOfficeKitchen.usesEnvironmentLighting).toBe(true);
    expect(SCENES.developerOfficeKitchen.fixedLightingPreset).toBeNull();
    expect(SCENES.developerOfficeKitchen.magnetCount).toBeGreaterThan(0);
  });

  it('gives every scene a "Day in the Life" role label and tagline', () => {
    SCENE_IDS.forEach((id) => {
      const scene = SCENES[id];
      expect(typeof scene.roleLabel).toBe('string');
      expect(scene.roleLabel!.length).toBeGreaterThan(0);
      expect(scene.roleTagline).toContain('A Day in the Life of');
    });
  });
});
