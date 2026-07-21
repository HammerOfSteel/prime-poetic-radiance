import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { TavernRoom } from './TavernRoom';

describe('TavernRoom', () => {
  it('mounts without throwing and renders at least a floor and two walls', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TavernRoom />);
    const meshes = renderer.scene.children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBeGreaterThanOrEqual(3);
  });

  it('applies procedural wood-grain and plaster textures to the floor, walls, and bench', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TavernRoom />);
    const floor = renderer.scene.children[0];
    const floorMaterial = (floor.instance as THREE.Mesh).material as THREE.MeshToonMaterial;
    expect(floorMaterial.map).not.toBeNull();

    const backWall = renderer.scene.children[1];
    const backWallMaterial = (backWall.instance as THREE.Mesh).material as THREE.MeshToonMaterial;
    expect(backWallMaterial.map).not.toBeNull();

    const bench = renderer.scene.findAllByProps({ 'data-kind': 'bench' })[0];
    const benchMaterial = (bench.instance as THREE.Mesh).material as THREE.MeshToonMaterial;
    expect(benchMaterial.map).not.toBeNull();
  });
});
