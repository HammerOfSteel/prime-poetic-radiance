import { describe, expect, it, vi } from 'vitest';
import type * as THREE from 'three';
import * as generatePoemModule from '../engine/generatePoem';
import { POEM_BAND_HEIGHT } from '../engine/magnetSelection';
import { LINE_HEIGHT } from '../engine/slamLayout';
import { computeSlamStartY, triggerPoetrySlam, type TriggerPoetrySlamOptions } from './SlamButton';

const TEST_BOUNDS = { x: [-1.6, 1.6] as [number, number], y: [2.3, 5.7] as [number, number] };

function options(overrides: Partial<TriggerPoetrySlamOptions> = {}): TriggerPoetrySlamOptions {
  return {
    previousPoemWords: [],
    getHomePosition: () => undefined,
    ...overrides,
  };
}

describe('triggerPoetrySlam', () => {
  it('passes the given theme through to generatePoem', () => {
    const spy = vi.spyOn(generatePoemModule, 'generatePoem').mockReturnValue([]);
    triggerPoetrySlam(() => undefined, ['cat', 'dog'], TEST_BOUNDS, options({ theme: 'tavern' }));
    expect(spy).toHaveBeenCalledWith(['cat', 'dog'], { theme: 'tavern' });
    spy.mockRestore();
  });

  it('defaults to the kitchen theme when none is given', () => {
    const spy = vi.spyOn(generatePoemModule, 'generatePoem').mockReturnValue([]);
    triggerPoetrySlam(() => undefined, ['cat', 'dog'], TEST_BOUNDS, options());
    expect(spy).toHaveBeenCalledWith(['cat', 'dog'], { theme: 'kitchen' });
    spy.mockRestore();
  });

  it('generates the poem from the currently-placed magnet words, not the full word bank', () => {
    const spy = vi.spyOn(generatePoemModule, 'generatePoem').mockReturnValue([]);
    const boardWords = ['fridge', 'snack', 'magic'];
    triggerPoetrySlam(() => undefined, boardWords, TEST_BOUNDS, options());
    expect(spy).toHaveBeenCalledWith(boardWords, expect.any(Object));
    spy.mockRestore();
  });

  it('calls onPoemWordsChange with the new poem word list', () => {
    vi.spyOn(generatePoemModule, 'generatePoem').mockReturnValue(['cat', 'dog']);
    const onPoemWordsChange = vi.fn();
    triggerPoetrySlam(() => undefined, ['cat', 'dog'], TEST_BOUNDS, options({ onPoemWordsChange }));
    expect(onPoemWordsChange).toHaveBeenCalledWith(['cat', 'dog']);
    vi.restoreAllMocks();
  });

  it('sends previously-banded words that are not part of the new poem back to their home position', () => {
    vi.spyOn(generatePoemModule, 'generatePoem').mockReturnValue(['cat']);
    const mesh = { position: { x: 0, y: 5, z: 0.2 }, rotation: { z: 0 } };
    const getMagnetMesh = vi.fn((word: string) => (word === 'dog' ? (mesh as unknown as THREE.Object3D) : undefined));
    const getHomePosition = vi.fn((word: string) => (word === 'dog' ? ([1, 2, 0.1] as [number, number, number]) : undefined));
    triggerPoetrySlam(getMagnetMesh, ['cat', 'dog'], TEST_BOUNDS, options({ previousPoemWords: ['dog'], getHomePosition }));
    expect(getMagnetMesh).toHaveBeenCalledWith('dog');
    expect(getHomePosition).toHaveBeenCalledWith('dog');
  });
});

describe('computeSlamStartY', () => {
  it('targets the reserved poem band near the top of the board, not the middle where the grid sits', () => {
    const startY = computeSlamStartY(TEST_BOUNDS);
    // Must sit within the reserved band (bounds.y[1] - POEM_BAND_HEIGHT .. bounds.y[1]),
    // comfortably above the grid region below it.
    expect(startY).toBeLessThanOrEqual(TEST_BOUNDS.y[1]);
    expect(startY).toBeGreaterThanOrEqual(TEST_BOUNDS.y[1] - POEM_BAND_HEIGHT);
    // Sanity-check against the hand-derived formula.
    expect(startY).toBeCloseTo(TEST_BOUNDS.y[1] - LINE_HEIGHT / 2, 5);
  });
});
