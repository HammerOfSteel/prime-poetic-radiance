import { describe, expect, it, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { MagnetBoard } from './MagnetBoard';
import { useSceneStore } from '../state/sceneStore';
import { SCENES } from '../engine/scenes';

describe('MagnetBoard', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
  });

  it('renders one mesh per configured magnet plus the slam and tesseract buttons for the kitchen scene', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <MagnetBoard sceneId="kitchen" slamButtonPosition={[1.2, 3.2, -1.84]} tesseractButtonPosition={[1.2, 2.5, -1.84]} />,
    );
    const meshes = renderer.scene.children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBe(SCENES.kitchen.magnetCount + 2); // magnets + slam + tesseract
  });

  it('renders the tavern scene magnet count once its layout is active', async () => {
    useSceneStore.getState().setActiveScene('tavern');
    const renderer = await ReactThreeTestRenderer.create(
      <MagnetBoard sceneId="tavern" slamButtonPosition={[1.2, 3.2, -1.84]} tesseractButtonPosition={[1.2, 2.5, -1.84]} />,
    );
    const meshes = renderer.scene.children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBe(SCENES.tavern.magnetCount + 2);
  });
});
