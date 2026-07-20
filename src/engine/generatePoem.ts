import { CATEGORIES, WordCategory, WordTheme, getThemeWeight } from './wordBank';
import { TEMPLATES } from './templates';

export interface GeneratePoemOptions {
  /** Injectable RNG for deterministic tests. Defaults to Math.random. Must return [0, 1). */
  rng?: () => number;
  /** Scene theme used to weight category-word selection. Defaults to 'kitchen'. */
  theme?: WordTheme;
}

function isCategory(token: string): token is WordCategory {
  return (
    token === 'noun' ||
    token === 'verb' ||
    token === 'adj' ||
    token === 'adverb' ||
    token === 'prep'
  );
}

function pickRandom<T>(items: T[], rng: () => number): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(rng() * items.length)];
}

/**
 * Picks one item from `items`, weighted by `weightFn`. Items with a weight
 * of 0 or less are excluded from the draw. Uses a cumulative-weight sweep:
 * with `rng() === 0`, the first item with positive weight is always chosen,
 * matching `pickRandom`'s behavior when all weights are equal.
 */
export function pickWeightedRandom<T>(
  items: T[],
  weightFn: (item: T) => number,
  rng: () => number,
): T | undefined {
  const weighted = items
    .map((item) => ({ item, weight: weightFn(item) }))
    .filter((entry) => entry.weight > 0);
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return undefined;

  let remaining = rng() * total;
  for (const entry of weighted) {
    if (remaining < entry.weight) return entry.item;
    remaining -= entry.weight;
  }
  return weighted[weighted.length - 1].item;
}

/**
 * Fills a randomly chosen grammar template with words drawn from
 * `availableWords`, skipping any template slot for which no matching word is
 * currently available. Each returned word is used at most once. Category
 * slots are drawn using `options.theme` (default `'kitchen'`) to weight
 * thematically-relevant words more heavily.
 */
export function generatePoem(availableWords: string[], options: GeneratePoemOptions = {}): string[] {
  const rng = options.rng ?? Math.random;
  const theme = options.theme ?? 'kitchen';
  if (availableWords.length === 0) return [];

  const template = pickRandom(TEMPLATES, rng);
  if (!template) return [];

  const used = new Set<string>();
  const result: string[] = [];

  template.forEach((token) => {
    if (isCategory(token)) {
      const candidates = CATEGORIES[token].filter(
        (word) => availableWords.includes(word) && !used.has(word),
      );
      const chosen = pickWeightedRandom(candidates, (word) => getThemeWeight(word, theme), rng);
      if (chosen) {
        used.add(chosen);
        result.push(chosen);
      }
      return;
    }

    // Literal word token — only include it if it's currently available and unused.
    if (availableWords.includes(token) && !used.has(token)) {
      used.add(token);
      result.push(token);
    }
  });

  return result;
}
