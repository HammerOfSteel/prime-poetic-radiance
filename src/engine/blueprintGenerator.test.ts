import { describe, expect, it } from 'vitest';
import { createSeededRandom, generateRoomBlueprint, ROOM_PALETTES } from './blueprintGenerator';

describe('createSeededRandom', () => {
  it('produces the same sequence for the same seed', () => {
    const a = createSeededRandom(42);
    const b = createSeededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('produces values in [0, 1)', () => {
    const random = createSeededRandom(7);
    for (let i = 0; i < 20; i += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('generateRoomBlueprint', () => {
  it('is deterministic: the same seed always produces an identical blueprint', () => {
    const first = generateRoomBlueprint(123);
    const second = generateRoomBlueprint(123);
    expect(second).toEqual(first);
  });

  it('produces dimensions within their documented ranges across many seeds', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const blueprint = generateRoomBlueprint(seed);
      expect(blueprint.width).toBeGreaterThanOrEqual(8);
      expect(blueprint.width).toBeLessThanOrEqual(16);
      expect(blueprint.depth).toBeGreaterThanOrEqual(8);
      expect(blueprint.depth).toBeLessThanOrEqual(16);
      expect(blueprint.height).toBeGreaterThanOrEqual(6);
      expect(blueprint.height).toBeLessThanOrEqual(10);
    }
  });

  it('produces between 4 and 8 props across many seeds', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const blueprint = generateRoomBlueprint(seed);
      expect(blueprint.props.length).toBeGreaterThanOrEqual(4);
      expect(blueprint.props.length).toBeLessThanOrEqual(8);
    }
  });

  it('keeps every prop position within the wall margin across many seeds', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const blueprint = generateRoomBlueprint(seed);
      blueprint.props.forEach((prop) => {
        const [x, , z] = prop.position;
        expect(x).toBeGreaterThanOrEqual(-blueprint.width / 2 + 1.5);
        expect(x).toBeLessThanOrEqual(blueprint.width / 2 - 1.5);
        expect(z).toBeGreaterThanOrEqual(-blueprint.depth / 2 + 1.5);
        expect(z).toBeLessThanOrEqual(blueprint.depth / 2 - 1.5);
      });
    }
  });

  it('always picks one of the 5 documented palette presets', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const blueprint = generateRoomBlueprint(seed);
      expect(ROOM_PALETTES).toContainEqual(blueprint.palette);
    }
  });

  it('produces different blueprints for different seeds', () => {
    const blueprints = [0, 1, 2, 3, 4].map((seed) => generateRoomBlueprint(seed));
    const uniqueSerialized = new Set(blueprints.map((b) => JSON.stringify(b)));
    expect(uniqueSerialized.size).toBeGreaterThan(1);
  });
});
