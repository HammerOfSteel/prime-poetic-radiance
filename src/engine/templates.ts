import { CATEGORIES, type WordCategory } from './wordBank';

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

/** Every word that already belongs to a category (noun/verb/adj/adverb/prep).
 * Template tokens like 'in', 'under', 'never', 'always' are literal strings
 * (not the category name 'prep'/'adverb'), but they're already members of
 * the `prep`/`adverb` word lists — so they're drawn via the normal weighted
 * category selection, with decent odds since those categories are small.
 * Only tokens that are neither a category name nor already in a category's
 * word list are truly "orphaned" glue words with no other path onto the
 * board, and need to be force-reserved (see `REQUIRED_LITERALS` below). */
const ALL_CATEGORY_WORDS = new Set<string>(Object.values(CATEGORIES).flat());

/**
 * Literal glue words referenced across `TEMPLATES` that belong to no
 * category at all (articles, pronouns, copulas like "the", "is", "a", "I").
 * These have no other path onto the board, so the pool's random-selection
 * odds (see `magnetSelection.ts`) — heavily favoring the much larger set of
 * content words — would otherwise almost never place them, causing most
 * templates to silently drop their glue tokens and produce fragmented,
 * sub-sentence output. `createMagnetLayout` uses this list to always
 * reserve these words on the board (when present in the source pool)
 * before filling the rest of the magnet count with weighted-random words.
 */
export const REQUIRED_LITERALS: string[] = Array.from(
  new Set(
    TEMPLATES.flatMap((template) =>
      template.filter((token) => !CATEGORY_TOKENS.has(token) && !ALL_CATEGORY_WORDS.has(token)),
    ),
  ),
);
