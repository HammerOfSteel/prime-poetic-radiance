import { describe, expect, it, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Fridge } from './Fridge';
import { useSceneStore } from '../state/sceneStore';

describe('Fridge', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
  });

  it('mounts without throwing and renders 35 magnets plus the fridge body/door', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Fridge />);
    const meshes = renderer.scene.children[0].children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBe(39); // body + door + 35 magnets + SlamButton + TesseractButton
  });
});
