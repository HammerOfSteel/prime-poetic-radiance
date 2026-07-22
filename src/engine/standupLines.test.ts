import { describe, expect, it } from 'vitest';
import { STANDUP_LINES, getStandupLine } from './standupLines';

describe('standupLines', () => {
  it('has a non-empty fixed script', () => {
    expect(STANDUP_LINES.length).toBeGreaterThan(0);
  });

  it('returns lines in order for in-range indices', () => {
    STANDUP_LINES.forEach((line, index) => {
      expect(getStandupLine(index)).toBe(line);
    });
  });

  it('wraps around for indices beyond the script length', () => {
    expect(getStandupLine(STANDUP_LINES.length)).toBe(STANDUP_LINES[0]);
    expect(getStandupLine(STANDUP_LINES.length + 1)).toBe(STANDUP_LINES[1]);
  });

  it('wraps correctly for negative indices', () => {
    expect(getStandupLine(-1)).toBe(STANDUP_LINES[STANDUP_LINES.length - 1]);
  });
});