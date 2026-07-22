import { describe, expect, it, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { DeveloperHomeOfficeBoard } from './DeveloperHomeOfficeBoard';
import { useSceneStore } from '../state/sceneStore';
import { SCENES } from '../engine/scenes';

describe('DeveloperHomeOfficeBoard', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
    useSceneStore.getState().setActiveScene('developerHomeOffice');
  });

  it('mounts without throwing and renders the magnet count plus the board/buttons', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DeveloperHomeOfficeBoard />);
    const meshes = renderer.scene.children[0].children.filter((child) => child.type === 'Mesh');
    // frame + cork surface + magnets + slam + tesseract
    expect(meshes.length).toBe(SCENES.developerHomeOffice.magnetCount + 4);
  });
});