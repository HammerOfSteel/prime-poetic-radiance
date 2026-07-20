import { describe, expect, it, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { DungeonTablet } from './DungeonTablet';
import { useSceneStore } from '../state/sceneStore';
import { SCENES } from '../engine/scenes';

describe('DungeonTablet', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
    useSceneStore.getState().setActiveScene('dungeon');
  });

  it('mounts without throwing and renders the dungeon magnet count plus the tablet/buttons', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DungeonTablet />);
    const meshes = renderer.scene.children[0].children.filter((child) => child.type === 'Mesh');
    // tablet backing + magnets + slam + tesseract
    expect(meshes.length).toBe(SCENES.dungeon.magnetCount + 3);
  });
});
