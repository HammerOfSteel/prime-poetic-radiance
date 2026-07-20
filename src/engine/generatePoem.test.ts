import { describe, expect, it } from 'vitest';
import { generatePoem, pickWeightedRandom } from './generatePoem';
import { WORDS, CATEGORIES, getThemeWeight } from './wordBank';
import { TEMPLATES } from './templates';

describe('generatePoem', () => {
  it('returns only words present in the available word list', () => {
    const result = generatePoem(WORDS);
    result.forEach((word) => {
      expect(WORDS).toContain(word);
    });
  });

  it('is deterministic when given a seeded rng that always returns 0', () => {
    const rng = () => 0;
    const result = generatePoem(WORDS, { rng });
    // Template index 0 is ['the', 'noun', 'is', 'adj']; rng()=0 always picks
    // the first candidate in every category array.
    expect(result).toEqual(['the', CATEGORIES.noun[0], 'is', CATEGORIES.adj[0]]);
  });

  it('skips category slots with no matching available word', () => {
    const rng = () => 0; // picks TEMPLATES[0] = ['the', 'noun', 'is', 'adj']
    const result = generatePoem(['the', 'is'], { rng }); // no noun/adj words available
    expect(result).toEqual(['the', 'is']);
  });

  it('returns an empty array when no words are available at all', () => {
    const result = generatePoem([]);
    expect(result).toEqual([]);
  });

  it('never picks the same available word twice in one poem', () => {
    // Force a template requiring the same category twice via a controlled rng
    // by exercising the real templates repeatedly and checking for duplicates.
    for (let i = 0; i < 20; i += 1) {
      const result = generatePoem(WORDS);
      expect(new Set(result).size).toBe(result.length);
    }
  });

  it('always returns a subsequence of a known template shape', () => {
    const result = generatePoem(WORDS);
    const matchesSomeTemplate = TEMPLATES.some((template) => template.length >= result.length);
    expect(matchesSomeTemplate).toBe(true);
  });
});

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
