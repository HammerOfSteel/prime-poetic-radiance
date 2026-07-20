import { describe, expect, it } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Fridge } from './Fridge';

describe('Fridge', () => {
  it('mounts without throwing and renders 35 magnets plus the fridge body/door', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Fridge />);
    const meshes = renderer.scene.children[0].children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBe(37); // body + door + 35 magnets
  });
});
