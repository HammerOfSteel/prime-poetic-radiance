import * as THREE from 'three';

const CHAR_WIDTH_PX = 24;
const PADDING_PX = 30;
const CANVAS_HEIGHT_PX = 64;

/** Canvas pixel width for a word's texture, before the 100px-per-world-unit conversion. */
function canvasWidthPx(word: string): number {
  return Math.max(64, word.length * CHAR_WIDTH_PX + PADDING_PX);
}

/** World-space width (matches POC_2's `canvas.width / 100` convention). */
export function measureWordTextureWidth(word: string): number {
  return canvasWidthPx(word) / 100;
}

export function createWordCanvas(word: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidthPx(word);
  canvas.height = CANVAS_HEIGHT_PX;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#d1d8e0';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  ctx.fillStyle = '#2d3436';
  ctx.font = 'bold 36px "Inter", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(word, canvas.width / 2, canvas.height / 2 + 2);

  return canvas;
}

export function createWordTexture(word: string): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(createWordCanvas(word));
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}
