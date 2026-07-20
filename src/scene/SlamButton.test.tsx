import { describe, expect, it, vi } from 'vitest';
import * as generatePoemModule from '../engine/generatePoem';
import { triggerPoetrySlam } from './SlamButton';

describe('triggerPoetrySlam', () => {
  it('passes the given theme through to generatePoem', () => {
    const spy = vi.spyOn(generatePoemModule, 'generatePoem').mockReturnValue([]);
    triggerPoetrySlam(() => undefined, ['cat', 'dog'], 'tavern');
    expect(spy).toHaveBeenCalledWith(['cat', 'dog'], { theme: 'tavern' });
    spy.mockRestore();
  });

  it('defaults to the kitchen theme when none is given', () => {
    const spy = vi.spyOn(generatePoemModule, 'generatePoem').mockReturnValue([]);
    triggerPoetrySlam(() => undefined, ['cat', 'dog']);
    expect(spy).toHaveBeenCalledWith(['cat', 'dog'], { theme: 'kitchen' });
    spy.mockRestore();
  });

  it('generates the poem from the currently-placed magnet words, not the full word bank', () => {
    const spy = vi.spyOn(generatePoemModule, 'generatePoem').mockReturnValue([]);
    const boardWords = ['fridge', 'snack', 'magic'];
    triggerPoetrySlam(() => undefined, boardWords);
    expect(spy).toHaveBeenCalledWith(boardWords, expect.any(Object));
    spy.mockRestore();
  });
});
