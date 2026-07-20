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

  it('has tavern-themed words with a tavern weight greater than their kitchen weight', () => {
    const tavernWords = ['ale', 'quest', 'sword', 'dragon', 'bard', 'tavern', 'mead', 'gold', 'oath', 'blade', 'tankard', 'legend'];
    tavernWords.forEach((word) => {
      expect(WORDS).toContain(word);
      expect(getThemeWeight(word, 'tavern')).toBeGreaterThan(1);
    });
  });

  it('reweights a handful of existing evocative words for the tavern theme without changing their kitchen weight', () => {
    expect(getThemeWeight('fire', 'tavern')).toBeGreaterThan(1);
    expect(getThemeWeight('ancient', 'tavern')).toBeGreaterThan(1);
    expect(getThemeWeight('stranger', 'tavern')).toBeGreaterThan(1);
    expect(getThemeWeight('journey', 'tavern')).toBeGreaterThan(1);
    expect(getThemeWeight('secret', 'tavern')).toBeGreaterThan(1);
    // kitchen-themed words already weighted for kitchen keep that weight untouched
    expect(getThemeWeight('fridge', 'kitchen')).toBe(3);
    expect(getThemeWeight('coffee', 'kitchen')).toBe(3);
  });

  it('has dungeon-themed words with a dungeon weight greater than their default weight', () => {
    const dungeonWords = ['torch', 'rune', 'skeleton', 'crypt', 'curse', 'treasure', 'abyss', 'chains', 'goblin', 'crumbling', 'stone', 'dagger'];
    dungeonWords.forEach((word) => {
      expect(WORDS).toContain(word);
      expect(getThemeWeight(word, 'dungeon')).toBeGreaterThan(1);
    });
  });

  it('reweights a handful of existing evocative words for the dungeon theme without changing their other weights', () => {
    expect(getThemeWeight('shadow', 'dungeon')).toBeGreaterThan(1);
    expect(getThemeWeight('echo', 'dungeon')).toBeGreaterThan(1);
    expect(getThemeWeight('key', 'dungeon')).toBeGreaterThan(1);
    expect(getThemeWeight('lock', 'dungeon')).toBeGreaterThan(1);
    // ancient and sword are already tavern-weighted; dungeon adds its own
    // weight alongside without disturbing the existing tavern weight
    expect(getThemeWeight('ancient', 'tavern')).toBe(2);
    expect(getThemeWeight('ancient', 'dungeon')).toBeGreaterThan(1);
    expect(getThemeWeight('sword', 'tavern')).toBe(3);
    expect(getThemeWeight('sword', 'dungeon')).toBeGreaterThan(1);
  });
});
