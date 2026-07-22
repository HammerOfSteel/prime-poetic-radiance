import { describe, expect, it } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { DeveloperHomeOffice } from './DeveloperHomeOffice';

describe('DeveloperHomeOffice', () => {
  it('mounts without throwing and renders at least a floor and two walls', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DeveloperHomeOffice />);
    const meshes = renderer.scene.children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBeGreaterThanOrEqual(3);
  });

  it('renders the rubber duck and coffee mug busywork props', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DeveloperHomeOffice />);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'rubber-duck-body' }).length).toBe(1);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'mug-body' }).length).toBe(1);
  });

  it('renders a plant with leaves', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DeveloperHomeOffice />);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'plant-leaf' }).length).toBe(3);
  });
});