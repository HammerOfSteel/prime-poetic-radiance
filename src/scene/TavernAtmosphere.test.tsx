import { describe, expect, it } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { TavernAtmosphere } from './TavernAtmosphere';

const HEARTH_POSITION: [number, number, number] = [-6, 2.5, -4.6];

describe('TavernAtmosphere', () => {
  it('mounts without throwing and renders an ember layer and a dust-mote layer', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <TavernAtmosphere hearthPosition={HEARTH_POSITION} />,
    );
    const points = renderer.scene.children.filter((child) => child.type === 'Points');
    expect(points.length).toBe(2);
  });
});
