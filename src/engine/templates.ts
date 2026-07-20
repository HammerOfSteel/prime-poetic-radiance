import type { WordCategory } from './wordBank';

/** Each template is a sequence of tokens: either a category name (drawn
 * randomly from that category) or a literal word (must be present in
 * `WORDS`, used as-is). */
export const TEMPLATES: (WordCategory | string)[][] = [
  ['the', 'noun', 'is', 'adj'],
  ['I', 'verb', 'the', 'noun', 'in', 'the', 'noun'],
  ['adj', 'noun', 'verb', 'with', 'noun'],
  ['never', 'verb', 'a', 'adj', 'noun'],
  ['my', 'noun', 'is', 'a', 'adj', 'noun'],
  ['why', 'verb', 'the', 'noun'],
  ['the', 'adj', 'noun', 'verb', 'adverb'],
  ['I', 'adverb', 'verb', 'you'],
  ['a', 'noun', 'in', 'the', 'noun'],
  ['the', 'noun', 'and', 'the', 'noun'],
  ['adverb', 'verb', 'the', 'adj', 'noun'],
  ['my', 'adj', 'noun', 'verb', 'in', 'the', 'noun'],
  ['the', 'noun', 'is', 'adj', 'and', 'adj'],
  ['I', 'verb', 'you', 'in', 'the', 'noun'],
  ['the', 'noun', 'verb', 'beyond', 'the', 'noun'],
  ['under', 'the', 'noun', 'we', 'verb'],
  ['a', 'adj', 'noun', 'is', 'never', 'adj'],
  ['before', 'the', 'noun', 'I', 'verb'],
  ['after', 'the', 'noun', 'verb', 'the', 'noun'],
  ['through', 'the', 'noun', 'and', 'the', 'noun'],
  ['the', 'noun', 'is', 'as', 'adj', 'as', 'the', 'noun'],
  ['still', 'I', 'verb'],
  ['almost', 'adj', 'always', 'adj'],
  ['their', 'noun', 'is', 'adj', 'my', 'noun', 'is', 'adverb'],
];

const CATEGORY_TOKENS = new Set<string>(['noun', 'verb', 'adj', 'adverb', 'prep']);

/**
 * Literal (non-category) glue words referenced anywhere across `TEMPLATES`,
 * deduped. These are typically small function words (articles, pronouns,
 * copulas) with no category of their own — the pool's random-selection odds
 * (see `magnetSelection.ts`) heavily favor the much larger set of content
 * words, so without a guarantee these are placed as magnets, most templates
 * silently drop their glue tokens and produce fragmented, sub-sentence
 * output. `createMagnetLayout` uses this list to always reserve these words
 * on the board (when present in the source pool) before filling the rest of
 * the magnet count with weighted-random content words.
 */
export const REQUIRED_LITERALS: string[] = Array.from(
  new Set(
    TEMPLATES.flatMap((template) => template.filter((token) => !CATEGORY_TOKENS.has(token))),
  ),
);
