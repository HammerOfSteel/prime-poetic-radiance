import { describe, expect, it, beforeEach } from 'vitest';
import * as THREE from 'three';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Kitchen } from './Kitchen';
import { useSceneStore } from '../state/sceneStore';

describe('Kitchen', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
  });

  it('mounts without throwing and renders at least a floor and two walls', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Kitchen />);
    const meshes = renderer.scene.children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBeGreaterThanOrEqual(3);
  });

  it('applies a procedural wood-grain texture to the floor', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Kitchen />);
    const floor = renderer.scene.children[0];
    expect(floor.type).toBe('Mesh');
    const material = (floor.instance as THREE.Mesh).material as THREE.MeshToonMaterial;
    expect(material.map).not.toBeNull();
  });

  it('renders night-star dots only when lightingPreset is night', async () => {
    useSceneStore.setState({ lightingPreset: 'day' });
    const dayRenderer = await ReactThreeTestRenderer.create(<Kitchen />);
    const dayStars = dayRenderer.scene.findAllByProps({ 'data-kind': 'night-star' });
    expect(dayStars.length).toBe(0);

    useSceneStore.setState({ lightingPreset: 'night' });
    const nightRenderer = await ReactThreeTestRenderer.create(<Kitchen />);
    const nightStars = nightRenderer.scene.findAllByProps({ 'data-kind': 'night-star' });
    expect(nightStars.length).toBe(15);
  });

  it('renders the braided rug and curtain props', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Kitchen />);
    const rugLayers = renderer.scene.findAllByProps({ 'data-kind': 'rug-layer' });
    expect(rugLayers.length).toBe(3);
    const curtains = renderer.scene.findAllByProps({ 'data-kind': 'curtain' });
    expect(curtains.length).toBe(2);
  });

  it('renders the wall shelf with jars and books, the pendant lamp, and string lights', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Kitchen />);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'shelf-jar' }).length).toBe(2);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'shelf-book' }).length).toBe(3);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'pendant-bulb' }).length).toBe(1);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'string-light' }).length).toBe(9);
  });
});
