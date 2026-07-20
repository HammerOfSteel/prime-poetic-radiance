import { describe, expect, it } from 'vitest';
import { measureWordTextureWidth } from './wordTexture';

describe('measureWordTextureWidth', () => {
  it('grows with word length', () => {
    expect(measureWordTextureWidth('cat')).toBeLessThan(measureWordTextureWidth('beautiful'));
  });

  it('never returns less than the minimum canvas width of 64px converted to world units', () => {
    expect(measureWordTextureWidth('a')).toBeGreaterThanOrEqual(0.64);
  });
});
