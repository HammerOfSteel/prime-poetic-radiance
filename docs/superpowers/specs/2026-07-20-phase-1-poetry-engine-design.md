# Phase 1: Poetry Engine — Design

**Date:** 2026-07-20
**Status:** Implemented (see docs/superpowers/plans/2026-07-20-phase-1-poetry-engine.md)

## Context

Phase 0 shipped a minimal, working `src/engine/` (word bank, categories,
grammar templates, `generatePoem`) ported from the POCs: ~50 words, 3
categories (`noun`/`verb`/`adj`), 6 templates. Per the roadmap, Phase 1 grows
this into a substantially richer, rendering-agnostic poetry engine:

- Grow the word bank substantially.
- Add richer grammar templates.
- Categorize/weight words by scene theme (groundwork for Phase 4's multiple
  scenes, even though only one theme — `kitchen` — exists today).
- Keep `engine/` fully unit-tested and independent of rendering/UI.

No user was available to confirm exact scope, so the following decisions were
made autonomously (documented for review):

- Target word bank size: **~200 words** (from ~50).
- Categories expand from 3 to 5: `noun`, `verb`, `adj`, `adverb`, `prep`
  (adverbs/prepositions unlock more natural-sounding templates).
- Templates expand from 6 to **~24**.
- Scene-theme weighting is introduced as a real mechanism now (schema +
  weighted selection), but with only the `kitchen` theme populated — all
  weights default to `1`, so generated output is unchanged until Phase 4 adds
  more themes and non-uniform weights.

## Non-Goals

- No new UI/rendering changes — `Fridge.tsx` and `SlamButton.tsx` already
  consume `WORDS`/`generatePoem` and need no changes.
- No multi-theme content yet (that's Phase 4: Scene Variety). Phase 1 only
  builds the schema and wiring so Phase 4 doesn't need engine rework.
- No changes to `slamLayout.ts`, `wordSizing.ts`, or `lightingPresets.ts`.

## Design

### 1. Word bank (`wordBank.ts`)

Replace the flat `WORDS` array with a structured source of truth:

```ts
export type WordCategory = 'noun' | 'verb' | 'adj' | 'adverb' | 'prep';
export type WordTheme = 'kitchen'; // extended in later phases

interface WordEntry {
  word: string;
  category: WordCategory;
  /** Per-theme selection weight; omitted entries default to weight 1. */
  themeWeights?: Partial<Record<WordTheme, number>>;
}
```

- `WORD_ENTRIES: WordEntry[]` is the single source of truth (~200 entries
  across the 5 categories, all initially tagged `kitchen`-relevant content).
- `WORDS: string[]` and `CATEGORIES: Record<WordCategory, string[]>` remain
  exported (derived from `WORD_ENTRIES`) so existing consumers
  (`Fridge.tsx`, `SlamButton.tsx`, existing tests) keep working unchanged.
- A small set of function/literal words (articles, pronouns, "is", "was",
  "why", etc.) stay uncategorized literal tokens, as today — used directly in
  templates rather than via a category.
- New helper `getThemeWeight(word, theme)` returns the entry's weight for
  that theme, defaulting to `1` if unspecified or the word isn't an
  entry (literal tokens always weight `1`).

### 2. Templates (`templates.ts`)

- Expand `TEMPLATES` from 6 to ~24 entries, using all 5 categories plus
  literals, to produce noticeably more varied poem shapes (e.g. adding
  prepositional phrases, adverb-modified verbs).
- No structural change to the token format (`WordCategory | string`).

### 3. Generation (`generatePoem.ts`)

- Add an optional `theme?: WordTheme` option (default `'kitchen'`).
- Replace uniform `pickRandom` for category slots with a weighted pick using
  `getThemeWeight(word, theme)`. When all candidate weights are equal (the
  common case today, since only one theme with uniform weights exists),
  weighted selection with `rng()` behaves identically to the current uniform
  `pickRandom` — so all existing deterministic tests
  (e.g. `rng = () => 0` picking `CATEGORIES.noun[0]`) keep passing unchanged.
- Literal tokens and the "no candidates available" skip behavior are
  unchanged.

### 4. Testing

- Extend `wordBank.test.ts` (new) to check: `WORDS`/`CATEGORIES` derived
  correctly from `WORD_ENTRIES`, no duplicate words, every category
  non-empty, `getThemeWeight` defaults correctly.
- Extend `generatePoem.test.ts`: existing tests must keep passing unchanged;
  add a test with a synthetic theme/weights to confirm weighted selection
  actually biases output (using a controlled rng and a small fake word set,
  not the full bank, to keep the test deterministic and fast).
- No changes needed to component tests (`Fridge.test.tsx`,
  `SlamButton`-adjacent tests) since public shapes (`WORDS`, `generatePoem`
  signature/behavior for existing callers) are preserved.

## Testing Strategy Summary

Unit tests only (Vitest), consistent with existing `engine/` module — no
rendering involved. Full suite (`npm run lint && npm run typecheck && npm run
test && npm run build`) run before merge, same as Phase 0.
