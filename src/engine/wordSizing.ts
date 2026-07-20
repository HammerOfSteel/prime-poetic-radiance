const CHAR_WIDTH_PX = 24;
const PADDING_PX = 30;

/** Canvas pixel width for a word's texture, before the 100px-per-world-unit conversion. */
export function canvasWidthPx(word: string): number {
  return Math.max(64, word.length * CHAR_WIDTH_PX + PADDING_PX);
}

/** World-space width (matches POC_2's `canvas.width / 100` convention). */
export function measureWordTextureWidth(word: string): number {
  return canvasWidthPx(word) / 100;
}
