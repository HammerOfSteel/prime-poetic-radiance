# Phase 1: Poetry Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grow `src/engine/`'s word bank and grammar templates substantially,
and introduce a scene-theme weighting mechanism, without changing any
rendering/UI code or breaking any existing consumer of `WORDS`/`CATEGORIES`/
`generatePoem`.

**Architecture:** `wordBank.ts` becomes data-driven: a single `WORD_ENTRIES`
array (word + category + optional per-theme weight) is the source of truth,
from which the existing `WORDS`/`CATEGORIES` exports are derived (so
`Fridge.tsx`/`SlamButton.tsx` need zero changes). `templates.ts` grows from 6
to 24 templates using two new categories (`adverb`, `prep`). `generatePoem.ts`
gains an optional `theme` option and a new exported `pickWeightedRandom`
helper that replaces uniform category-word selection with theme-weighted
selection (a no-op today since only one theme with mostly-uniform weights
exists).

**Tech Stack:** TypeScript, Vitest — no new dependencies.

## Global Constraints

- Existing exports `WORDS: string[]`, `CATEGORIES: Record<WordCategory,
  string[]>`, and `generatePoem(availableWords, options?)` must keep their
  current public shape and behavior for existing callers/tests — see
  `docs/superpowers/specs/2026-07-20-phase-1-poetry-engine-design.md`.
- No changes to `src/scene/`, `src/state/`, or `src/ui/` — this phase is
  `engine/`-only.
- Run `npm run lint && npm run typecheck && npm run test && npm run build`
  before the final commit (all must pass with zero errors), matching the
  Phase 0 verification bar.

---

### Task 1: Expand the word bank with categories and theme weights

**Files:**
- Modify: `src/engine/wordBank.ts` (full rewrite)
- Create: `src/engine/wordBank.test.ts`

**Interfaces:**
- Produces: `WordCategory = 'noun' | 'verb' | 'adj' | 'adverb' | 'prep'`,
  `WordTheme = 'kitchen'`, `interface WordEntry { word: string; category:
  WordCategory; themeWeights?: Partial<Record<WordTheme, number>> }`,
  `WORD_ENTRIES: WordEntry[]`, `WORDS: string[]`, `CATEGORIES:
  Record<WordCategory, string[]>`, `getThemeWeight(word: string, theme:
  WordTheme): number`.
- Consumes: nothing (leaf module).

- [ ] **Step 1: Replace `src/engine/wordBank.ts` with the expanded, data-driven word bank**

Replace the entire file content with:

```ts
export type WordCategory = 'noun' | 'verb' | 'adj' | 'adverb' | 'prep';

/** Scene themes words can be weighted for. Only 'kitchen' exists until Phase 4
 * adds more scenes; all Phase 1 weights are tuned for this single theme. */
export type WordTheme = 'kitchen';

export interface WordEntry {
  word: string;
  category: WordCategory;
  /** Per-theme selection weight. A theme with no entry here defaults to 1. */
  themeWeights?: Partial<Record<WordTheme, number>>;
}

/** Single source of truth for every categorized (non-literal) word. */
export const WORD_ENTRIES: WordEntry[] = [
  // --- nouns ---
  { word: 'dog', category: 'noun' },
  { word: 'cat', category: 'noun' },
  { word: 'magic', category: 'noun' },
  { word: 'fridge', category: 'noun', themeWeights: { kitchen: 3 } },
  { word: 'snack', category: 'noun', themeWeights: { kitchen: 3 } },
  { word: 'dream', category: 'noun' },
  { word: 'shadow', category: 'noun' },
  { word: 'light', category: 'noun' },
  { word: 'coffee', category: 'noun', themeWeights: { kitchen: 3 } },
  { word: 'stars', category: 'noun' },
  { word: 'kitchen', category: 'noun', themeWeights: { kitchen: 3 } },
  { word: 'ghost', category: 'noun' },
  { word: 'time', category: 'noun' },
  { word: 'machine', category: 'noun' },
  { word: 'moon', category: 'noun' },
  { word: 'sun', category: 'noun' },
  { word: 'rain', category: 'noun' },
  { word: 'storm', category: 'noun' },
  { word: 'ocean', category: 'noun' },
  { word: 'mountain', category: 'noun' },
  { word: 'river', category: 'noun' },
  { word: 'forest', category: 'noun' },
  { word: 'garden', category: 'noun' },
  { word: 'flower', category: 'noun' },
  { word: 'bird', category: 'noun' },
  { word: 'wolf', category: 'noun' },
  { word: 'fox', category: 'noun' },
  { word: 'bear', category: 'noun' },
  { word: 'snow', category: 'noun' },
  { word: 'ice', category: 'noun' },
  { word: 'fire', category: 'noun' },
  { word: 'ash', category: 'noun' },
  { word: 'smoke', category: 'noun' },
  { word: 'silence', category: 'noun' },
  { word: 'noise', category: 'noun' },
  { word: 'song', category: 'noun' },
  { word: 'melody', category: 'noun' },
  { word: 'echo', category: 'noun' },
  { word: 'mirror', category: 'noun' },
  { word: 'window', category: 'noun' },
  { word: 'door', category: 'noun' },
  { word: 'key', category: 'noun' },
  { word: 'lock', category: 'noun' },
  { word: 'letter', category: 'noun' },
  { word: 'secret', category: 'noun' },
  { word: 'memory', category: 'noun' },
  { word: 'heart', category: 'noun' },
  { word: 'soul', category: 'noun' },
  { word: 'spirit', category: 'noun' },
  { word: 'angel', category: 'noun' },
  { word: 'devil', category: 'noun' },
  { word: 'stranger', category: 'noun' },
  { word: 'friend', category: 'noun' },
  { word: 'family', category: 'noun' },
  { word: 'home', category: 'noun' },
  { word: 'road', category: 'noun' },
  { word: 'journey', category: 'noun' },
  { word: 'map', category: 'noun' },
  { word: 'compass', category: 'noun' },
  { word: 'clock', category: 'noun' },
  { word: 'hour', category: 'noun' },
  { word: 'morning', category: 'noun' },
  { word: 'evening', category: 'noun' },
  { word: 'night', category: 'noun' },
  { word: 'winter', category: 'noun' },
  { word: 'summer', category: 'noun' },
  { word: 'spring', category: 'noun' },
  { word: 'autumn', category: 'noun' },
  { word: 'honey', category: 'noun', themeWeights: { kitchen: 3 } },
  { word: 'sugar', category: 'noun', themeWeights: { kitchen: 3 } },
  { word: 'salt', category: 'noun', themeWeights: { kitchen: 3 } },
  { word: 'bread', category: 'noun', themeWeights: { kitchen: 3 } },
  { word: 'wine', category: 'noun', themeWeights: { kitchen: 3 } },
  { word: 'tea', category: 'noun', themeWeights: { kitchen: 3 } },
  { word: 'milk', category: 'noun', themeWeights: { kitchen: 3 } },
  { word: 'butter', category: 'noun', themeWeights: { kitchen: 3 } },
  { word: 'apple', category: 'noun', themeWeights: { kitchen: 3 } },

  // --- verbs ---
  { word: 'love', category: 'verb' },
  { word: 'hate', category: 'verb' },
  { word: 'sleep', category: 'verb' },
  { word: 'dance', category: 'verb' },
  { word: 'whisper', category: 'verb' },
  { word: 'breathe', category: 'verb' },
  { word: 'sing', category: 'verb' },
  { word: 'run', category: 'verb' },
  { word: 'fly', category: 'verb' },
  { word: 'fall', category: 'verb' },
  { word: 'rise', category: 'verb' },
  { word: 'shine', category: 'verb' },
  { word: 'glow', category: 'verb' },
  { word: 'burn', category: 'verb' },
  { word: 'freeze', category: 'verb' },
  { word: 'melt', category: 'verb' },
  { word: 'break', category: 'verb' },
  { word: 'mend', category: 'verb' },
  { word: 'hold', category: 'verb' },
  { word: 'release', category: 'verb' },
  { word: 'wonder', category: 'verb' },
  { word: 'wander', category: 'verb' },
  { word: 'chase', category: 'verb' },
  { word: 'hide', category: 'verb' },
  { word: 'seek', category: 'verb' },
  { word: 'remember', category: 'verb' },
  { word: 'forget', category: 'verb' },
  { word: 'laugh', category: 'verb' },
  { word: 'cry', category: 'verb' },
  { word: 'smile', category: 'verb' },
  { word: 'frown', category: 'verb' },
  { word: 'kiss', category: 'verb' },
  { word: 'embrace', category: 'verb' },
  { word: 'wait', category: 'verb' },
  { word: 'hope', category: 'verb' },
  { word: 'fear', category: 'verb' },
  { word: 'trust', category: 'verb' },
  { word: 'betray', category: 'verb' },
  { word: 'forgive', category: 'verb' },
  { word: 'listen', category: 'verb' },

  // --- adjectives ---
  { word: 'hot', category: 'adj' },
  { word: 'cold', category: 'adj' },
  { word: 'midnight', category: 'adj', themeWeights: { kitchen: 2 } },
  { word: 'slow', category: 'adj' },
  { word: 'fast', category: 'adj' },
  { word: 'beautiful', category: 'adj' },
  { word: 'broken', category: 'adj' },
  { word: 'quiet', category: 'adj' },
  { word: 'loud', category: 'adj' },
  { word: 'soft', category: 'adj' },
  { word: 'hard', category: 'adj' },
  { word: 'sweet', category: 'adj' },
  { word: 'bitter', category: 'adj' },
  { word: 'sour', category: 'adj' },
  { word: 'warm', category: 'adj' },
  { word: 'cool', category: 'adj' },
  { word: 'bright', category: 'adj' },
  { word: 'dark', category: 'adj' },
  { word: 'pale', category: 'adj' },
  { word: 'golden', category: 'adj' },
  { word: 'silver', category: 'adj' },
  { word: 'silent', category: 'adj' },
  { word: 'wild', category: 'adj' },
  { word: 'gentle', category: 'adj' },
  { word: 'fierce', category: 'adj' },
  { word: 'tender', category: 'adj' },
  { word: 'cruel', category: 'adj' },
  { word: 'kind', category: 'adj' },
  { word: 'strange', category: 'adj' },
  { word: 'familiar', category: 'adj' },
  { word: 'distant', category: 'adj' },
  { word: 'close', category: 'adj' },
  { word: 'empty', category: 'adj' },
  { word: 'full', category: 'adj' },
  { word: 'heavy', category: 'adj' },
  { word: 'ancient', category: 'adj' },
  { word: 'young', category: 'adj' },
  { word: 'old', category: 'adj' },
  { word: 'new', category: 'adj' },
  { word: 'lost', category: 'adj' },
  { word: 'found', category: 'adj' },
  { word: 'sacred', category: 'adj' },
  { word: 'forbidden', category: 'adj' },
  { word: 'endless', category: 'adj' },
  { word: 'fleeting', category: 'adj' },
  { word: 'eternal', category: 'adj' },
  { word: 'fragile', category: 'adj' },
  { word: 'brave', category: 'adj' },
  { word: 'curious', category: 'adj' },
  { word: 'restless', category: 'adj' },

  // --- adverbs ---
  { word: 'always', category: 'adverb' },
  { word: 'never', category: 'adverb' },
  { word: 'softly', category: 'adverb' },
  { word: 'quietly', category: 'adverb' },
  { word: 'slowly', category: 'adverb' },
  { word: 'quickly', category: 'adverb' },
  { word: 'gently', category: 'adverb' },
  { word: 'wildly', category: 'adverb' },
  { word: 'sadly', category: 'adverb' },
  { word: 'brightly', category: 'adverb' },
  { word: 'silently', category: 'adverb' },
  { word: 'forever', category: 'adverb' },
  { word: 'again', category: 'adverb' },
  { word: 'still', category: 'adverb' },
  { word: 'almost', category: 'adverb' },
  { word: 'barely', category: 'adverb' },
  { word: 'deeply', category: 'adverb' },
  { word: 'truly', category: 'adverb' },
  { word: 'simply', category: 'adverb' },
  { word: 'suddenly', category: 'adverb' },

  // --- prepositions ---
  { word: 'in', category: 'prep' },
  { word: 'on', category: 'prep' },
  { word: 'with', category: 'prep' },
  { word: 'for', category: 'prep' },
  { word: 'of', category: 'prep' },
  { word: 'under', category: 'prep' },
  { word: 'beside', category: 'prep' },
  { word: 'through', category: 'prep' },
  { word: 'over', category: 'prep' },
  { word: 'before', category: 'prep' },
  { word: 'after', category: 'prep' },
  { word: 'until', category: 'prep' },
  { word: 'near', category: 'prep' },
  { word: 'without', category: 'prep' },
  { word: 'beyond', category: 'prep' },
];

/** Uncategorized function words (articles, pronouns, copulas) used as
 * literal template tokens rather than drawn from a category. */
const LITERALS: string[] = [
  'the', 'a', 'an', 'is', 'and', 'to', 'you', 'I', 'it', 'that',
  'was', 'are', 'as', 'my', 'his', 'her', 'they', 'why', 'we', 'he',
  'she', 'this', 'our', 'its', 'their', 'not',
];

export const WORDS: string[] = [...LITERALS, ...WORD_ENTRIES.map((entry) => entry.word)];

function wordsForCategory(category: WordCategory): string[] {
  return WORD_ENTRIES.filter((entry) => entry.category === category).map((entry) => entry.word);
}

export const CATEGORIES: Record<WordCategory, string[]> = {
  noun: wordsForCategory('noun'),
  verb: wordsForCategory('verb'),
  adj: wordsForCategory('adj'),
  adverb: wordsForCategory('adverb'),
  prep: wordsForCategory('prep'),
};

const WEIGHT_LOOKUP = new Map<string, Partial<Record<WordTheme, number>>>(
  WORD_ENTRIES.filter((entry) => entry.themeWeights).map((entry) => [entry.word, entry.themeWeights!]),
);

/** Selection weight for `word` under `theme`. Defaults to 1 for words with no
 * configured weight for that theme (including uncategorized literals). */
export function getThemeWeight(word: string, theme: WordTheme): number {
  return WEIGHT_LOOKUP.get(word)?.[theme] ?? 1;
}
```

- [ ] **Step 2: Write `src/engine/wordBank.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { CATEGORIES, WORD_ENTRIES, WORDS, getThemeWeight } from './wordBank';

describe('wordBank', () => {
  it('has no duplicate words across WORDS', () => {
    expect(new Set(WORDS).size).toBe(WORDS.length);
  });

  it('derives CATEGORIES entries that are all present in WORDS', () => {
    Object.values(CATEGORIES).forEach((words) => {
      words.forEach((word) => {
        expect(WORDS).toContain(word);
      });
    });
  });

  it('has a non-empty word list for every category', () => {
    Object.values(CATEGORIES).forEach((words) => {
      expect(words.length).toBeGreaterThan(0);
    });
  });

  it('has grown substantially past the Phase 0 ~50-word bank', () => {
    expect(WORDS.length).toBeGreaterThanOrEqual(150);
  });

  it('defaults theme weight to 1 for words with no themeWeights entry', () => {
    const plainWord = WORD_ENTRIES.find((entry) => !entry.themeWeights)?.word;
    expect(plainWord).toBeDefined();
    expect(getThemeWeight(plainWord as string, 'kitchen')).toBe(1);
  });

  it('returns the configured weight for words with themeWeights', () => {
    const weightedEntry = WORD_ENTRIES.find((entry) => entry.themeWeights?.kitchen !== undefined);
    expect(weightedEntry).toBeDefined();
    expect(getThemeWeight(weightedEntry!.word, 'kitchen')).toBe(weightedEntry!.themeWeights!.kitchen);
  });

  it('returns 1 for a word that is not a known entry', () => {
    expect(getThemeWeight('not-a-real-word', 'kitchen')).toBe(1);
  });
});
```

- [ ] **Step 3: Run the new and existing engine tests**

Run: `npx vitest run src/engine/wordBank.test.ts src/engine/generatePoem.test.ts src/scene/Fridge.test.tsx`
Expected: all PASS. (`Fridge.test.tsx` is included because `Fridge.tsx`
consumes `WORDS` directly — this confirms the derived export still satisfies
its existing consumer.)

- [ ] **Step 4: Commit**

```bash
git add src/engine/wordBank.ts src/engine/wordBank.test.ts
git commit -m "feat: expand word bank to ~230 words with theme weighting

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 2: Expand grammar templates

**Files:**
- Modify: `src/engine/templates.ts` (full rewrite)
- Create: `src/engine/templates.test.ts`

**Interfaces:**
- Consumes: `WordCategory`, `WORDS` from `./wordBank` (Task 1).
- Produces: `TEMPLATES: (WordCategory | string)[][]` (same exported shape as
  before, just more entries) — consumed by `generatePoem.ts` (Task 3,
  unchanged import).

- [ ] **Step 1: Replace `src/engine/templates.ts` with 24 templates**

```ts
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
```

- [ ] **Step 2: Write `src/engine/templates.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { TEMPLATES } from './templates';
import { WORDS, type WordCategory } from './wordBank';

const CATEGORY_NAMES: WordCategory[] = ['noun', 'verb', 'adj', 'adverb', 'prep'];

describe('TEMPLATES', () => {
  it('has at least 20 templates', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(20);
  });

  it('has no empty templates', () => {
    TEMPLATES.forEach((template) => {
      expect(template.length).toBeGreaterThan(0);
    });
  });

  it('only uses category tokens or literal words present in WORDS', () => {
    TEMPLATES.forEach((template) => {
      template.forEach((token) => {
        const isKnownCategory = (CATEGORY_NAMES as string[]).includes(token);
        const isKnownWord = WORDS.includes(token);
        expect(isKnownCategory || isKnownWord).toBe(true);
      });
    });
  });
});
```

- [ ] **Step 3: Run the new template tests plus the full existing suite**

Run: `npx vitest run src/engine/templates.test.ts src/engine/generatePoem.test.ts`
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add src/engine/templates.ts src/engine/templates.test.ts
git commit -m "feat: expand grammar templates from 6 to 24

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 3: Add theme-weighted word selection to `generatePoem`

**Files:**
- Modify: `src/engine/generatePoem.ts:1-51` (full rewrite)
- Modify: `src/engine/generatePoem.test.ts` (append new `describe` blocks)

**Interfaces:**
- Consumes: `CATEGORIES`, `WordCategory`, `WordTheme`, `getThemeWeight` from
  `./wordBank` (Task 1); `TEMPLATES` from `./templates` (Task 2).
- Produces: `pickWeightedRandom<T>(items: T[], weightFn: (item: T) => number,
  rng: () => number): T | undefined` (newly exported); `generatePoem`'s
  signature grows to `generatePoem(availableWords: string[], options?:
  { rng?: () => number; theme?: WordTheme }): string[]` — return behavior for
  existing callers (no `theme` passed) is unchanged.

- [ ] **Step 1: Write the failing tests for `pickWeightedRandom` and theme weighting**

Append to `src/engine/generatePoem.test.ts` (keep all existing content
above; add these new imports at the top alongside the existing ones, and add
the two new `describe` blocks at the end of the file):

```ts
import { generatePoem, pickWeightedRandom } from './generatePoem';
import { getThemeWeight } from './wordBank';
```

```ts
describe('pickWeightedRandom', () => {
  it('picks the first item when rng returns 0', () => {
    const items = [
      { value: 'a', weight: 1 },
      { value: 'b', weight: 3 },
    ];
    const result = pickWeightedRandom(items, (i) => i.weight, () => 0);
    expect(result?.value).toBe('a');
  });

  it('biases selection toward higher-weight items', () => {
    const items = [
      { value: 'a', weight: 1 },
      { value: 'b', weight: 3 },
    ];
    // total weight = 4; rng() = 0.5 -> remaining = 2, which falls past item
    // 'a' (weight 1) and into item 'b' (weight 3), so 'b' is chosen.
    const result = pickWeightedRandom(items, (i) => i.weight, () => 0.5);
    expect(result?.value).toBe('b');
  });

  it('excludes zero-weight items from the draw', () => {
    const items = [
      { value: 'a', weight: 0 },
      { value: 'b', weight: 1 },
    ];
    const result = pickWeightedRandom(items, (i) => i.weight, () => 0);
    expect(result?.value).toBe('b');
  });

  it('returns undefined when given an empty list', () => {
    const result = pickWeightedRandom<{ value: string; weight: number }>([], (i) => i.weight, () => 0);
    expect(result).toBeUndefined();
  });
});

describe('generatePoem theme weighting', () => {
  it('weights kitchen-relevant nouns like "fridge" above neutral nouns like "dog"', () => {
    expect(getThemeWeight('fridge', 'kitchen')).toBeGreaterThan(getThemeWeight('dog', 'kitchen'));
  });

  it('accepts an explicit theme option without throwing', () => {
    expect(() => generatePoem(['the', 'is'], { theme: 'kitchen', rng: () => 0 })).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the test file to confirm the new tests fail (function not yet exported)**

Run: `npx vitest run src/engine/generatePoem.test.ts`
Expected: FAIL — `pickWeightedRandom` is not exported from `./generatePoem`.

- [ ] **Step 3: Rewrite `src/engine/generatePoem.ts`**

```ts
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
```

- [ ] **Step 4: Run the full test file again to confirm everything passes**

Run: `npx vitest run src/engine/generatePoem.test.ts`
Expected: PASS (all pre-existing tests plus the new `pickWeightedRandom` and
theme-weighting tests).

- [ ] **Step 5: Commit**

```bash
git add src/engine/generatePoem.ts src/engine/generatePoem.test.ts
git commit -m "feat: weight category-word selection by scene theme

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 4: Full verification, spec status update, and PR

**Files:**
- Modify: `docs/superpowers/specs/2026-07-20-phase-1-poetry-engine-design.md:3`

**Interfaces:**
- Consumes: nothing new — this task only runs verification and finalizes docs.

- [ ] **Step 1: Update the Phase 1 spec status**

Edit `docs/superpowers/specs/2026-07-20-phase-1-poetry-engine-design.md`,
changing the header line:

```markdown
**Status:** Approved (assumptions made autonomously; user to review)
```

to:

```markdown
**Status:** Implemented (see docs/superpowers/plans/2026-07-20-phase-1-poetry-engine.md)
```

- [ ] **Step 2: Run the full verification suite**

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Expected: all four succeed with zero errors.

- [ ] **Step 3: Commit the spec status update**

```bash
git add docs/superpowers/specs/2026-07-20-phase-1-poetry-engine-design.md
git commit -m "docs: mark Phase 1 spec implemented

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

- [ ] **Step 4: Push a branch and open the PR**

```bash
git checkout -b phase-1-poetry-engine
git push -u origin phase-1-poetry-engine
gh pr create --title "Phase 1: Poetry Engine" --body "Grows the word bank from ~50 to ~230 words across 5 categories, expands grammar templates from 6 to 24, and adds scene-theme weighted word selection (kitchen theme only for now, groundwork for Phase 4). See docs/superpowers/specs/2026-07-20-phase-1-poetry-engine-design.md and docs/superpowers/plans/2026-07-20-phase-1-poetry-engine.md.

- [ ] npm run lint / typecheck / test / build all pass
- [ ] Poetry Slam in-app still produces sensible poems with the larger word bank" --base main --head phase-1-poetry-engine
```

- [ ] **Step 5: After CI passes, merge**

```bash
gh pr merge --squash --delete-branch
```
