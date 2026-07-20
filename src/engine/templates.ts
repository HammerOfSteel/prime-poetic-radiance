import type { WordCategory } from './wordBank';

/** Each template is a sequence of tokens: either a category name or a literal word. */
export const TEMPLATES: (WordCategory | string)[][] = [
  ['the', 'noun', 'is', 'adj'],
  ['I', 'verb', 'the', 'noun', 'in', 'the', 'noun'],
  ['adj', 'noun', 'verb', 'with', 'noun'],
  ['never', 'verb', 'a', 'adj', 'noun'],
  ['my', 'noun', 'is', 'a', 'adj', 'noun'],
  ['why', 'verb', 'the', 'noun'],
];
