import { pickWeightedRandom } from './generatePoem';
import { REQUIRED_LITERALS } from './templates';
import { getThemeWeight, type WordTheme } from './wordBank';

export interface MagnetLayoutEntry {
  word: string;
  index: number;
  position: [number, number, number];
}

/**
 * Selects up to `count` distinct words from `pool`, weighted by theme
 * relevance via `getThemeWeight`, without replacement. If `pool` has fewer
 * than `count` words, returns all of them.
 */
export function selectMagnetWords(
  pool: string[],
  count: number,
  theme: WordTheme,
  rng: () => number = Math.random,
): string[] {
  const remaining = [...pool];
  const selected: string[] = [];
  while (remaining.length > 0 && selected.length < count) {
    const chosen = pickWeightedRandom(remaining, (word) => getThemeWeight(word, theme), rng);
    if (chosen === undefined) break;
    selected.push(chosen);
    remaining.splice(remaining.indexOf(chosen), 1);
  }
  return selected;
}

/**
 * Builds a fresh magnet layout for a scene: selects theme-weighted words via
 * `selectMagnetWords` and scatters them to randomized starting positions
 * above `surfaceZ`, mirroring the placement math previously inline in
 * Fridge.tsx.
 *
 * The template glue words in `REQUIRED_LITERALS` (e.g. "the", "is", "a") are
 * always reserved first (if present in `pool`), since they have no category
 * of their own and would otherwise be heavily diluted by the much larger
 * content-word pool — leaving most poem templates unable to fill their
 * connective tokens. The remaining `count` budget is filled via weighted
 * random selection from the rest of the pool, as before.
 */
export function createMagnetLayout(
  pool: string[],
  count: number,
  theme: WordTheme,
  surfaceZ: number,
  rng: () => number = Math.random,
): MagnetLayoutEntry[] {
  const guaranteed = REQUIRED_LITERALS.filter((word) => pool.includes(word));
  const remainingPool = pool.filter((word) => !guaranteed.includes(word));
  const remainingCount = Math.max(0, count - guaranteed.length);
  const words = [...guaranteed, ...selectMagnetWords(remainingPool, remainingCount, theme, rng)];

  return words.map((word, index) => ({
    word,
    index,
    position: [
      (rng() - 0.5) * 3,
      4 + (rng() - 0.2) * 3,
      surfaceZ,
    ] as [number, number, number],
  }));
}
