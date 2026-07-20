import * as THREE from 'three';

const GRADIENT_STEPS = 4;

let cachedGradientMap: THREE.DataTexture | null = null;

/**
 * Builds (and caches) the shared toon-shading gradient map used by every
 * MeshToonMaterial in the scene. Three.js's toon material renders as a flat
 * 2-tone split without an explicit gradientMap — this provides 4 ascending
 * brightness bands. NearestFilter keeps the bands crisp (no smoothing
 * between them), which is what gives toon shading its stepped "cel" look.
 */
export function createToonGradientMap(): THREE.DataTexture {
  if (cachedGradientMap) return cachedGradientMap;

  const data = new Uint8Array(GRADIENT_STEPS);
  for (let i = 0; i < GRADIENT_STEPS; i += 1) {
    data[i] = Math.round((i / (GRADIENT_STEPS - 1)) * 255);
  }

  const texture = new THREE.DataTexture(data, GRADIENT_STEPS, 1, THREE.RedFormat);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.needsUpdate = true;

  cachedGradientMap = texture;
  return texture;
}
