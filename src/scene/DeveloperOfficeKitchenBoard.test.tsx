import { describe, expect, it, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { DeveloperOfficeKitchenBoard } from './DeveloperOfficeKitchenBoard';
import { useSceneStore } from '../state/sceneStore';
import { SCENES } from '../engine/scenes';

describe('DeveloperOfficeKitchenBoard', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
    useSceneStore.getState().setActiveScene('developerOfficeKitchen');
  });

  it('mounts without throwing and renders the magnet count plus the board/buttons', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DeveloperOfficeKitchenBoard />);
    const meshes = renderer.scene.children[0].children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBe(SCENES.developerOfficeKitchen.magnetCount + 4);
  });
});