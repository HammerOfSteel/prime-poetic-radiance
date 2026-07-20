import { measureWordTextureWidth } from '../engine/wordSizing';

// POC_2.html's original slam layout started words at world-space x=2.8
// (its fridge stood at world x~4, no group wrapper). This app nests the
// board in a group at BOARD_GROUP_POSITION ([4, 0, -3.5]; see scenes.ts),
// so words must be laid out in that group's LOCAL space: 2.8 - 4 = -1.2.
const START_X = -1.2;
const PADDING = 0.1;
const LINE_HEIGHT = 0.45;

export interface SlamLayoutEntry {
  word: string;
  x: number;
  y: number;
}

/**
 * Lays words left-to-right on the fridge door, matching POC_2's
 * cumulative-width placement, but wraps to a new line (dropping down by
 * `LINE_HEIGHT`) whenever the next word would overflow `maxX`. POC_2 never
 * needed this because its trivially-short templates rarely produced more
 * than 2-3 words that all matched currently-placed magnets; this port's
 * larger word bank means longer poems are common, and without wrapping
 * they'd render past the board's right edge into empty space.
 */
export function computeSlamLayout(
  words: string[],
  options: { maxX?: number; startX?: number; startY?: number } = {},
): SlamLayoutEntry[] {
  const startX = options.startX ?? START_X;
  const maxX = options.maxX ?? 1.6;
  let currentX = startX;
  let currentY = options.startY ?? 5;

  return words.map((word) => {
    const width = measureWordTextureWidth(word) * 0.5;
    if (currentX > startX && currentX + width > maxX) {
      currentX = startX;
      currentY -= LINE_HEIGHT;
    }
    const x = currentX + width / 2;
    currentX += width + PADDING;
    return { word, x, y: currentY };
  });
}
