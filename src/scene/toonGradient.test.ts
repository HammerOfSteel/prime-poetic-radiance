import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createToonGradientMap } from './toonGradient';

describe('createToonGradientMap', () => {
  it('returns a DataTexture with 4 texels of ascending brightness', () => {
    const texture = createToonGradientMap();
    expect(texture).toBeInstanceOf(THREE.DataTexture);
    expect(texture.image.width).toBe(4);
    expect(texture.image.height).toBe(1);
    expect(Array.from(texture.image.data as Uint8Array)).toEqual([90, 145, 200, 255]);
  });

  it('uses NearestFilter for both mag and min filters to keep bands crisp', () => {
    const texture = createToonGradientMap();
    expect(texture.magFilter).toBe(THREE.NearestFilter);
    expect(texture.minFilter).toBe(THREE.NearestFilter);
  });

  it('returns the same cached texture instance on repeated calls', () => {
    const first = createToonGradientMap();
    const second = createToonGradientMap();
    expect(second).toBe(first);
  });
});
