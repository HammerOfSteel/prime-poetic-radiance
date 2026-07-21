import { pickWeightedRandom } from './generatePoem';
import { REQUIRED_LITERALS } from './templates';
import { getThemeWeight, type WordTheme } from './wordBank';
import { measureWordTextureWidth } from './wordSizing';

export interface MagnetLayoutEntry {
  word: string;
  index: number;
  position: [number, number, number];
}

export interface MagnetBoardBounds {
  x: [number, number];
  y: [number, number];
}

/** Horizontal/vertical gaps between packed magnets, and the jitter applied
 * within each cell for a slightly organic (non-perfectly-gridded) look.
 * Jitter is kept well under half a gap so it can never cause an overlap. */
const GAP_X = 0.12;
const ROW_HEIGHT = 0.3;
const JITTER = 0.04;

/**
 * Vertical space reserved at the top of every board, excluded from the
 * initial magnet grid so it stays empty. `SlamButton` targets this same
 * band for its animated poem line, so slammed words land in guaranteed-
 * clear space above the scattered grid instead of on top of already-placed
 * magnets. The initial grid fills the remaining (lower) region instead.
 * See `templates.ts`/`slamLayout.ts` for the matching poem-side layout.
 */
export const POEM_BAND_HEIGHT = 1.1;

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
 * Packs `words` left-to-right, top-to-bottom into `bounds` like a shelf
 * (bin) packing algorithm, wrapping to a new row whenever the next word
 * would exceed the board's right edge, and wrapping back to the top row
 * (shifted right, to start a new "column block") if it runs out of rows —
 * so magnets never overlap regardless of how many are packed in.
 *
 * Replaces the previous pure-random scatter (`x = (rng()-0.5)*3`,
 * `y = 4 + (rng()-0.2)*3`), which had no collision avoidance and routinely
 * left magnets stacked on top of each other, making it hard to read
 * individual words or arrange them into sentences.
 */
export function packMagnetPositions(
  words: string[],
  bounds: MagnetBoardBounds,
  surfaceZ: number,
  rng: () => number = Math.random,
): [number, number, number][] {
  const [minX, maxX] = bounds.x;
  const [minY, maxY] = bounds.y;
  const boardWidth = maxX - minX;

  let cursorX = minX + GAP_X / 2;
  let cursorY = maxY - ROW_HEIGHT / 2;
  let columnBlockOffset = 0;

  return words.map((word) => {
    const width = measureWordTextureWidth(word) * 0.5;

    if (cursorX + width > minX + columnBlockOffset + boardWidth && cursorX > minX + columnBlockOffset + GAP_X / 2) {
      cursorX = minX + columnBlockOffset + GAP_X / 2;
      cursorY -= ROW_HEIGHT;
    }

    if (cursorY < minY) {
      // Ran out of vertical room (more words than the board can neatly fit) —
      // start a fresh column block to the right rather than overlapping.
      columnBlockOffset += boardWidth;
      cursorX = minX + columnBlockOffset + GAP_X / 2;
      cursorY = maxY - ROW_HEIGHT / 2;
    }

    const jitterX = (rng() - 0.5) * JITTER;
    const jitterY = (rng() - 0.5) * JITTER;
    const position: [number, number, number] = [cursorX + width / 2 + jitterX, cursorY + jitterY, surfaceZ];

    cursorX += width + GAP_X;
    return position;
  });
}

/**
 * Builds a fresh magnet layout for a scene: selects theme-weighted words via
 * `selectMagnetWords` and packs them into non-overlapping positions within
 * `bounds` via `packMagnetPositions`.
 *
 * The template glue words in `REQUIRED_LITERALS` (e.g. "the", "is", "a") are
 * always reserved first (if present in `pool`), since they have no category
 * of their own and would otherwise be heavily diluted by the much larger
 * content-word pool — leaving most poem templates unable to fill their
 * connective tokens. The remaining `count` budget is filled via weighted
 * random selection from the rest of the pool, as before.
 *
 * Packing is restricted to `bounds` minus `POEM_BAND_HEIGHT` off the top,
 * reserving that band exclusively for the slam-button poem line (see
 * `SlamButton.tsx`) so it never lands on top of the initial grid, and the
 * initial grid never lands on top of it either.
 */
export function createMagnetLayout(
  pool: string[],
  count: number,
  theme: WordTheme,
  surfaceZ: number,
  bounds: MagnetBoardBounds,
  rng: () => number = Math.random,
): MagnetLayoutEntry[] {
  const guaranteed = REQUIRED_LITERALS.filter((word) => pool.includes(word));
  const remainingPool = pool.filter((word) => !guaranteed.includes(word));
  const remainingCount = Math.max(0, count - guaranteed.length);
  const words = [...guaranteed, ...selectMagnetWords(remainingPool, remainingCount, theme, rng)];
  const gridMaxY = Math.max(bounds.y[1] - POEM_BAND_HEIGHT, bounds.y[0]);
  const gridBounds: MagnetBoardBounds = { x: bounds.x, y: [bounds.y[0], gridMaxY] };
  const positions = packMagnetPositions(words, gridBounds, surfaceZ, rng);

  return words.map((word, index) => ({
    word,
    index,
    position: positions[index],
  }));
}
