import * as THREE from 'three';

/**
 * Small deterministic linear-congruential RNG. Decorative textures/prop
 * scatter in this project need randomness that looks organic but is
 * stable across renders (not reshuffling every mount) — a fixed internal
 * seed achieves that without threading an RNG through every caller.
 */
export function createSeededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function finalizeTileableTexture(canvas: HTMLCanvasElement, repeat: [number, number]): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.needsUpdate = true;
  return texture;
}

export interface GrainTextureOptions {
  size?: number;
  flecks?: number;
  repeat?: [number, number];
  seed?: number;
}

/**
 * Builds a small tileable "grain" texture: a neutral white base speckled
 * with sparse, low-alpha random-brightness flecks. Deliberately neutral
 * (not colored) because three.js multiplies a material's `map` texels by
 * its `color` — a colored base here would double-tint the surface instead
 * of just adding subtle grain variation on top of the material's real
 * color. Canvas 2D context is unavailable in this project's test
 * environment (see wordTexture.ts's createWordCanvas for the same
 * pattern), so drawing is skipped (leaving a blank canvas) when `ctx` is
 * null — the returned texture is still valid, just visually blank.
 */
export function createGrainTexture(options: GrainTextureOptions = {}): THREE.CanvasTexture {
  const size = options.size ?? 64;
  const flecks = options.flecks ?? 260;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const rng = createSeededRng(options.seed ?? 1337);
    for (let i = 0; i < flecks; i += 1) {
      const x = Math.floor(rng() * size);
      const y = Math.floor(rng() * size);
      const shade = rng() > 0.5 ? 255 : 0;
      const alpha = 0.04 + rng() * 0.07;
      ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${alpha})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return finalizeTileableTexture(canvas, options.repeat ?? [4, 4]);
}

export interface WoodGrainTextureOptions {
  size?: number;
  streaks?: number;
  repeat?: [number, number];
  seed?: number;
}

/**
 * Builds a small tileable "wood grain" texture: a neutral white base with
 * a handful of soft horizontal wavy (sine-based) streaks in low-alpha
 * darker/lighter tones. Same neutral-base-for-multiplication reasoning as
 * `createGrainTexture`, but with directional streaks instead of uniform
 * speckle, so wood surfaces (floor/counter/shelf) read differently from
 * the walls' painted-plaster grain.
 */
export function createWoodGrainTexture(options: WoodGrainTextureOptions = {}): THREE.CanvasTexture {
  const size = options.size ?? 64;
  const streaks = options.streaks ?? 6;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const rng = createSeededRng(options.seed ?? 4242);
    for (let i = 0; i < streaks; i += 1) {
      const y = (i + 0.5) * (size / streaks);
      const amplitude = 1 + rng() * 2;
      const frequency = 0.15 + rng() * 0.1;
      const darker = rng() > 0.5;
      ctx.strokeStyle = darker ? 'rgba(60, 35, 15, 0.18)' : 'rgba(255, 250, 240, 0.5)';
      ctx.lineWidth = 1 + rng();
      ctx.beginPath();
      for (let x = 0; x <= size; x += 1) {
        const wave = Math.sin(x * frequency + i) * amplitude;
        const py = y + wave;
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();
    }
  }

  return finalizeTileableTexture(canvas, options.repeat ?? [4, 4]);
}

/**
 * Builds a small vertical sky-gradient texture (top -> bottom color), used
 * as the kitchen window's backdrop so it reflects the active lighting
 * preset instead of a flat fixed color. Rendered once as a single
 * non-repeating plane texture, so no RepeatWrapping is set (default
 * ClampToEdge is correct here).
 */
export function createSkyGradientTexture(topColor: string, bottomColor: string, size = 64): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Builds a small soft white circle (radial gradient fading to transparent)
 * used as the sprite map for kettle-steam particles in KitchenAtmosphere.tsx.
 */
export function createSoftCircleTexture(size = 32): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
