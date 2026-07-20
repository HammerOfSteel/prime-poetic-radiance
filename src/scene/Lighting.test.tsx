import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { applyLightingPreset } from './Lighting';
import { LIGHTING_PRESETS } from '../engine/lightingPresets';

describe('applyLightingPreset', () => {
  it('tweens ambient, directional, and fill light colors/intensities and fog color', () => {
    const gsapTo = vi.fn();
    const gsapMock = { to: gsapTo, killTweensOf: vi.fn() } as unknown as typeof import('gsap').default;

    const refs = {
      ambient: new THREE.AmbientLight(),
      directional: new THREE.DirectionalLight(),
      fill: new THREE.PointLight(),
      fog: new THREE.FogExp2(0x000000, 0.02),
    };

    applyLightingPreset(refs, LIGHTING_PRESETS.night, gsapMock);

    // Colors: ambient, directional, fill, fog = 4 color tweens.
    // Plus: directional position, directional intensity, fill intensity = 3 more.
    expect(gsapTo).toHaveBeenCalledTimes(7);
    expect(gsapMock.killTweensOf).toHaveBeenCalledTimes(1);
  });
});
