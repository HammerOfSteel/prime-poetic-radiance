import { describe, expect, it, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { DeveloperCubicleBoard } from './DeveloperCubicleBoard';
import { useSceneStore } from '../state/sceneStore';
import { SCENES } from '../engine/scenes';

describe('DeveloperCubicleBoard', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
    useSceneStore.getState().setActiveScene('developerCubicle');
  });

  it('mounts without throwing and renders the magnet count plus the board/buttons', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DeveloperCubicleBoard />);
    const meshes = renderer.scene.children[0].children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBe(SCENES.developerCubicle.magnetCount + 4);
  });
});