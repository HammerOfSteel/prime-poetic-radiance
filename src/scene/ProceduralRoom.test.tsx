import { describe, expect, it } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { ProceduralRoom } from './ProceduralRoom';
import type { RoomBlueprint } from '../engine/blueprintGenerator';

const FIXED_BLUEPRINT: RoomBlueprint = {
  seed: 999,
  width: 10,
  depth: 10,
  height: 8,
  palette: { floorColor: '#8a5a3b', wallColor: '#f2e3c9', accentColor: '#c96a3e' },
  props: [
    { type: 'crate', position: [1, 0, 1], rotationY: 0, scale: 1 },
    { type: 'barrel', position: [-2, 0, 2], rotationY: 0.5, scale: 1 },
    { type: 'pottedPlant', position: [0, 0, -2], rotationY: 1, scale: 1 },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function countMeshes(node: any): number {
  const own = node.type === 'Mesh' ? 1 : 0;
  const children: unknown[] = node.children ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return own + children.reduce((sum: number, child: any) => sum + countMeshes(child), 0);
}

describe('ProceduralRoom', () => {
  it('renders the room shell plus one mesh per prop (two for the potted plant)', async () => {
    const renderer = await ReactThreeTestRenderer.create(<ProceduralRoom blueprint={FIXED_BLUEPRINT} />);
    const meshCount = renderer.scene.children.reduce((sum, child) => sum + countMeshes(child), 0);
    // 3 shell meshes (floor + 2 walls) + crate(1) + barrel(1) + pottedPlant(2) = 7
    expect(meshCount).toBeGreaterThanOrEqual(7);
  });
});
