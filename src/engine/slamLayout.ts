import { measureWordTextureWidth } from '../engine/wordSizing';

// POC_2.html's original slam layout started words at world-space x=2.8
// (its fridge stood at world x~4, no group wrapper). This app nests the
// board in a group at BOARD_GROUP_POSITION ([4, 0, -3.5]; see scenes.ts),
// so words must be laid out in that group's LOCAL space: 2.8 - 4 = -1.2.
const START_X = -1.2;
const PADDING = 0.1;

export interface SlamLayoutEntry {
  word: string;
  x: number;
}

/** Lays words left-to-right on the fridge door, matching POC_2's cumulative-width placement. */
export function computeSlamLayout(words: string[]): SlamLayoutEntry[] {
  let currentX = START_X;
  return words.map((word) => {
    const width = measureWordTextureWidth(word) * 0.5;
    const x = currentX + width / 2;
    currentX += width + PADDING;
    return { word, x };
  });
}
