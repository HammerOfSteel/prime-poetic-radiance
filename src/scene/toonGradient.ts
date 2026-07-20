import * as THREE from 'three';

const GRADIENT_STEPS = 4;

let cachedGradientMap: THREE.DataTexture | null = null;

/**
 * Builds (and caches) the shared toon-shading gradient map used by every
 * MeshToonMaterial in the scene. Three.js's toon material renders as a flat
 * 2-tone split without an explicit gradientMap — this provides 4 ascending
 * brightness bands. NearestFilter keeps the bands crisp (no smoothing
 * between them), which is what gives toon shading its stepped "cel" look.
 *
 * The darkest band is floored well above 0: this project's light
 * intensities were tuned for `MeshStandardMaterial`'s smooth PBR falloff
 * (see POC_2.html), where surfaces facing away from the key light still
 * pick up soft indirect shading. Toon shading's discrete bands have no such
 * falloff, so a 0 floor made any surface not directly hit by the key light
 * collapse to pure black — especially bad for the magnet word tiles, whose
 * text became unreadable. Flooring at 90/255 keeps the "cel-shaded" step
 * look while guaranteeing every surface stays visibly lit.
 */
const GRADIENT_FLOOR = 90;

export function createToonGradientMap(): THREE.DataTexture {
  if (cachedGradientMap) return cachedGradientMap;

  const data = new Uint8Array(GRADIENT_STEPS);
  for (let i = 0; i < GRADIENT_STEPS; i += 1) {
    data[i] = Math.round(GRADIENT_FLOOR + (i / (GRADIENT_STEPS - 1)) * (255 - GRADIENT_FLOOR));
  }

  const texture = new THREE.DataTexture(data, GRADIENT_STEPS, 1, THREE.RedFormat);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.needsUpdate = true;

  cachedGradientMap = texture;
  return texture;
}
