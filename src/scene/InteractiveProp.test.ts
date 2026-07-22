import { describe, expect, it } from 'vitest';
import { buildPropBounceTimeline } from './InteractiveProp';

describe('buildPropBounceTimeline', () => {
  it('returns the scale target to its base scale once the timeline completes', () => {
    const scaleTarget = { x: 0, y: 0, z: 0 };
    const baseScale: [number, number, number] = [1.5, 1.5, 1.5];
    const timeline = buildPropBounceTimeline(scaleTarget, baseScale);
    timeline.progress(1);
    expect(scaleTarget.x).toBeCloseTo(1.5);
    expect(scaleTarget.y).toBeCloseTo(1.5);
    expect(scaleTarget.z).toBeCloseTo(1.5);
  });

  it('squashes and stretches away from the base scale partway through', () => {
    const scaleTarget = { x: 1, y: 1, z: 1 };
    const timeline = buildPropBounceTimeline(scaleTarget, [1, 1, 1]);
    timeline.progress(0.1);
    // Early in the timeline the prop should be mid-squash (x/z stretched up,
    // y squashed down), not sitting exactly at rest.
    expect(scaleTarget.x).toBeGreaterThan(1);
    expect(scaleTarget.y).toBeLessThan(1);
  });
});