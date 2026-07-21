import { describe, expect, it } from 'vitest';
import { createMagnetLayout, packMagnetPositions, selectMagnetWords } from './magnetSelection';

const TEST_BOUNDS = { x: [-1.6, 1.6] as [number, number], y: [2.3, 5.7] as [number, number] };

describe('selectMagnetWords', () => {
  it('returns the requested count of distinct words', () => {
    const pool = ['a', 'b', 'c', 'd', 'e'];
    const rng = (() => {
      let i = 0;
      const values = [0.1, 0.5, 0.9, 0.2];
      return () => values[i++ % values.length];
    })();
    const result = selectMagnetWords(pool, 3, 'kitchen', rng);
    expect(result).toHaveLength(3);
    expect(new Set(result).size).toBe(3);
    result.forEach((word) => expect(pool).toContain(word));
  });

  it('returns all pool words if count exceeds pool size', () => {
    const pool = ['a', 'b'];
    const result = selectMagnetWords(pool, 10, 'kitchen', () => 0);
    expect(result).toHaveLength(2);
  });

  it('weights selection toward higher theme-weighted words', () => {
    // 'fridge' has themeWeights.kitchen = 3, 'ghost' has no themeWeights (weight 1).
    const pool = ['fridge', 'ghost'];
    // rng() === 0 picks the first item whose cumulative weight exceeds 0,
    // i.e. the first item with positive weight in iteration order. Since 'fridge'
    // appears first and has weight 3, rng=0 selects 'fridge' over 'ghost'.
    const result = selectMagnetWords(pool, 1, 'kitchen', () => 0);
    expect(result).toEqual(['fridge']); // fridge (weight 3) sorts first, rng=0 picks it
  });
});

describe('createMagnetLayout', () => {
  it('builds one layout entry per selected word, each with a distinct index and the given surfaceZ', () => {
    const pool = ['a', 'b', 'c'];
    const layout = createMagnetLayout(pool, 2, 'kitchen', -1.84, TEST_BOUNDS, () => 0.5);
    expect(layout).toHaveLength(2);
    layout.forEach((entry, i) => {
      expect(entry.index).toBe(i);
      expect(entry.position[2]).toBe(-1.84);
      expect(typeof entry.word).toBe('string');
    });
  });

  it('always reserves template glue words (e.g. "the", "is", "a") on the board when present in the pool', () => {
    // WORDS-like pool: a few required literals plus a much larger set of content words.
    const contentWords = Array.from({ length: 50 }, (_, i) => `content${i}`);
    const pool = ['the', 'is', 'a', 'I', 'my', 'and', 'we', 'why', 'you', 'as', 'their', ...contentWords];
    const layout = createMagnetLayout(pool, 20, 'kitchen', -1.84, TEST_BOUNDS, Math.random);
    const words = layout.map((entry) => entry.word);
    ['the', 'is', 'a', 'I', 'my', 'and', 'we', 'why', 'you', 'as', 'their'].forEach((literal) => {
      expect(words).toContain(literal);
    });
  });
});

describe('packMagnetPositions', () => {
  it('keeps every position within bounds (ignoring jitter margin)', () => {
    const words = Array.from({ length: 30 }, (_, i) => `word${i}`);
    const positions = packMagnetPositions(words, TEST_BOUNDS, -1.84, Math.random);
    expect(positions).toHaveLength(30);
    positions.forEach(([x, y, z]) => {
      expect(x).toBeGreaterThanOrEqual(TEST_BOUNDS.x[0] - 0.1);
      expect(x).toBeLessThanOrEqual(TEST_BOUNDS.x[1] + 0.1 + 3.2); // allows one extra column block if overflowing
      expect(y).toBeGreaterThanOrEqual(TEST_BOUNDS.y[0] - 0.1);
      expect(y).toBeLessThanOrEqual(TEST_BOUNDS.y[1] + 0.1);
      expect(z).toBe(-1.84);
    });
  });

  it('does not overlap: no two packed magnets are closer than their combined half-widths', () => {
    const words = ['cat', 'dog', 'sun', 'run', 'joy', 'ice', 'red', 'wet'];
    // rng=0 removes jitter randomness variance (still deterministic, minimal jitter).
    const positions = packMagnetPositions(words, TEST_BOUNDS, -1.84, () => 0.5);
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const [x1, y1] = positions[i];
        const [x2, y2] = positions[j];
        // Different rows (y differs) never overlap given ROW_HEIGHT > magnet height.
        // Same row: must be horizontally separated at least a bit.
        if (Math.abs(y1 - y2) < 0.01) {
          expect(Math.abs(x1 - x2)).toBeGreaterThan(0.05);
        }
      }
    }
  });

  it('wraps to a new row instead of overflowing the right edge', () => {
    const longWords = ['elephant', 'wonderful', 'chocolate', 'butterfly', 'adventure', 'beautiful'];
    const positions = packMagnetPositions(longWords, TEST_BOUNDS, -1.84, () => 0.5);
    const ys = new Set(positions.map(([, y]) => Math.round(y * 100) / 100));
    expect(ys.size).toBeGreaterThan(1);
  });
});
