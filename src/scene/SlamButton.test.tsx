import { describe, expect, it, vi } from 'vitest';
import * as generatePoemModule from '../engine/generatePoem';
import { triggerPoetrySlam } from './SlamButton';

describe('triggerPoetrySlam', () => {
  it('passes the given theme through to generatePoem', () => {
    const spy = vi.spyOn(generatePoemModule, 'generatePoem').mockReturnValue([]);
    triggerPoetrySlam(() => undefined, 'tavern');
    expect(spy).toHaveBeenCalledWith(expect.any(Array), { theme: 'tavern' });
    spy.mockRestore();
  });

  it('defaults to the kitchen theme when none is given', () => {
    const spy = vi.spyOn(generatePoemModule, 'generatePoem').mockReturnValue([]);
    triggerPoetrySlam(() => undefined);
    expect(spy).toHaveBeenCalledWith(expect.any(Array), { theme: 'kitchen' });
    spy.mockRestore();
  });
});
