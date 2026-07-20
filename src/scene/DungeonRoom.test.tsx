import { describe, expect, it } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { DungeonRoom } from './DungeonRoom';

describe('DungeonRoom', () => {
  it('mounts without throwing and renders at least a floor and two walls', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DungeonRoom />);
    const meshes = renderer.scene.children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBeGreaterThanOrEqual(3);
  });
});
