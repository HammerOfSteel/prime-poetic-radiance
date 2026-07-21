import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Kitchen } from './Kitchen';

describe('Kitchen', () => {
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
});
