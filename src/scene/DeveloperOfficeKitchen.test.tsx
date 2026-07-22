import { describe, expect, it } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { DeveloperOfficeKitchen } from './DeveloperOfficeKitchen';

describe('DeveloperOfficeKitchen', () => {
  it('mounts without throwing and renders at least a floor and two walls', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DeveloperOfficeKitchen />);
    const meshes = renderer.scene.children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBeGreaterThanOrEqual(3);
  });

  it('renders the coffee machine and snack jar busywork props', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DeveloperOfficeKitchen />);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'coffee-machine-body' }).length).toBe(1);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'snack-jar-body' }).length).toBe(1);
  });

  it('renders an NPC silhouette at the round table', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DeveloperOfficeKitchen />);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'npc-silhouette' }).length).toBe(1);
  });
});