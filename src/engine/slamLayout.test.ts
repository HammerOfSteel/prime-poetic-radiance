import { describe, expect, it } from 'vitest';
import { computeSlamLayout } from './slamLayout';

describe('computeSlamLayout', () => {
  it('returns an empty array for an empty word list', () => {
    expect(computeSlamLayout([])).toEqual([]);
  });

  it('lays words out left to right with increasing x based on cumulative width', () => {
    const layout = computeSlamLayout(['a', 'beautiful']);
    expect(layout).toHaveLength(2);
    expect(layout[1].x).toBeGreaterThan(layout[0].x);
  });

  it('starts the first word at the configured start X', () => {
    const layout = computeSlamLayout(['cat']);
    expect(layout[0].word).toBe('cat');
    expect(layout[0].x).toBeGreaterThanOrEqual(-1.2);
  });

  it('wraps to a new line (lower y) when words would overflow maxX', () => {
    const longWords = ['beautiful', 'wonderful', 'incredible', 'fascinating', 'mysterious'];
    const layout = computeSlamLayout(longWords, { maxX: 1.6 });
    const ys = layout.map((entry) => entry.y);
    expect(new Set(ys).size).toBeGreaterThan(1);
    // Every word's x must stay within the board's visible bounds.
    layout.forEach((entry) => {
      expect(entry.x).toBeLessThanOrEqual(1.6 + 2);
    });
  });
});
