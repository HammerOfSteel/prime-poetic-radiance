import { describe, expect, it, vi } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Magnet } from './Magnet';

describe('Magnet', () => {
  it('renders at the given surfaceZ, not a hardcoded constant', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Magnet id="magnet-0" word="dog" initialPosition={[0, 4, -9.5]} surfaceZ={-9.5} />,
    );
    const mesh = renderer.scene.children[0];
    expect(mesh.instance.position.z).toBe(-9.5);
  });

  it('calls onMeshReady with the mounted mesh', async () => {
    const onMeshReady = vi.fn();
    await ReactThreeTestRenderer.create(
      <Magnet id="magnet-0" word="dog" initialPosition={[0, 4, -1.84]} surfaceZ={-1.84} onMeshReady={onMeshReady} />,
    );
    expect(onMeshReady).toHaveBeenCalled();
    expect(onMeshReady.mock.calls[0][0]).not.toBeNull();
  });
});
