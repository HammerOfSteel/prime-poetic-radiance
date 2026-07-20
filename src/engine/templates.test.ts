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
