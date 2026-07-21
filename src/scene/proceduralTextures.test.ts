import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  createSeededRng,
  createGrainTexture,
  createWoodGrainTexture,
  createSkyGradientTexture,
  createSoftCircleTexture,
} from './proceduralTextures';

describe('createSeededRng', () => {
  it('produces the same sequence for the same seed', () => {
    const a = createSeededRng(42);
    const b = createSeededRng(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('produces values in [0, 1)', () => {
    const rng = createSeededRng(7);
    for (let i = 0; i < 20; i += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('createGrainTexture', () => {
  it('returns a repeat-wrapped CanvasTexture at the requested size', () => {
    const texture = createGrainTexture({ size: 32, repeat: [3, 2] });
    expect(texture).toBeInstanceOf(THREE.CanvasTexture);
    expect(texture.image.width).toBe(32);
    expect(texture.image.height).toBe(32);
    expect(texture.wrapS).toBe(THREE.RepeatWrapping);
    expect(texture.wrapT).toBe(THREE.RepeatWrapping);
    expect(texture.repeat.x).toBe(3);
    expect(texture.repeat.y).toBe(2);
  });

  it('defaults to a 64x64 size and 4x4 repeat when no options given', () => {
    const texture = createGrainTexture();
    expect(texture.image.width).toBe(64);
    expect(texture.repeat.x).toBe(4);
    expect(texture.repeat.y).toBe(4);
  });
});

describe('createWoodGrainTexture', () => {
  it('returns a repeat-wrapped CanvasTexture at the requested size', () => {
    const texture = createWoodGrainTexture({ size: 48, repeat: [2, 1] });
    expect(texture).toBeInstanceOf(THREE.CanvasTexture);
    expect(texture.image.width).toBe(48);
    expect(texture.image.height).toBe(48);
    expect(texture.wrapS).toBe(THREE.RepeatWrapping);
    expect(texture.repeat.x).toBe(2);
  });
});

describe('createSkyGradientTexture', () => {
  it('returns a non-tiling CanvasTexture at the requested height', () => {
    const texture = createSkyGradientTexture('#111111', '#eeeeee', 40);
    expect(texture).toBeInstanceOf(THREE.CanvasTexture);
    expect(texture.image.height).toBe(40);
    expect(texture.image.width).toBe(1);
  });
});

describe('createSoftCircleTexture', () => {
  it('returns a square CanvasTexture at the requested size', () => {
    const texture = createSoftCircleTexture(16);
    expect(texture).toBeInstanceOf(THREE.CanvasTexture);
    expect(texture.image.width).toBe(16);
    expect(texture.image.height).toBe(16);
  });

  it('defaults to size 32 when none given', () => {
    const texture = createSoftCircleTexture();
    expect(texture.image.width).toBe(32);
  });
});
