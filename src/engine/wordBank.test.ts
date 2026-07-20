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
