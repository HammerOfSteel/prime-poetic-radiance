import * as THREE from 'three';
import { canvasWidthPx, measureWordTextureWidth } from '../engine/wordSizing';

export { measureWordTextureWidth };

const CANVAS_HEIGHT_PX = 64;

export function createWordCanvas(word: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidthPx(word);
  canvas.height = CANVAS_HEIGHT_PX;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#fdf6ec';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#e0c9a0';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  ctx.fillStyle = '#3d2b1f';
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
