import { measureWordTextureWidth } from '../engine/wordSizing';

const START_X = 2.8;
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
