import { describe, expect, it, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { TavernNoticeboard } from './TavernNoticeboard';
import { useSceneStore } from '../state/sceneStore';
import { SCENES } from '../engine/scenes';

describe('TavernNoticeboard', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
    useSceneStore.getState().setActiveScene('tavern');
  });

  it('mounts without throwing and renders the tavern magnet count plus the board/buttons', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TavernNoticeboard />);
    const meshes = renderer.scene.children[0].children.filter((child) => child.type === 'Mesh');
    // board backing + magnets + slam + tesseract
    expect(meshes.length).toBe(SCENES.tavern.magnetCount + 3);
  });
});
