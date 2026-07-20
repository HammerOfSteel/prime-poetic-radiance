import { describe, expect, it } from 'vitest';
import { createMagnetLayout, selectMagnetWords } from './magnetSelection';

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
    const layout = createMagnetLayout(pool, 2, 'kitchen', -1.84, () => 0.5);
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
    const layout = createMagnetLayout(pool, 20, 'kitchen', -1.84, Math.random);
    const words = layout.map((entry) => entry.word);
    ['the', 'is', 'a', 'I', 'my', 'and', 'we', 'why', 'you', 'as', 'their'].forEach((literal) => {
      expect(words).toContain(literal);
    });
  });
});
