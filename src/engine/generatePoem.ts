import { CATEGORIES, WordCategory } from './wordBank';
import { TEMPLATES } from './templates';

export interface GeneratePoemOptions {
  /** Injectable RNG for deterministic tests. Defaults to Math.random. Must return [0, 1). */
  rng?: () => number;
}

function isCategory(token: string): token is WordCategory {
  return token === 'noun' || token === 'verb' || token === 'adj';
}

function pickRandom<T>(items: T[], rng: () => number): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(rng() * items.length)];
}

/**
 * Fills a randomly chosen grammar template with words drawn from
 * `availableWords`, skipping any template slot for which no matching word is
 * currently available. Each returned word is used at most once.
 */
export function generatePoem(availableWords: string[], options: GeneratePoemOptions = {}): string[] {
  const rng = options.rng ?? Math.random;
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
      const chosen = pickRandom(candidates, rng);
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
