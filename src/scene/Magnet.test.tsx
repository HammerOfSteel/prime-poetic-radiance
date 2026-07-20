import { describe, expect, it, vi } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Magnet } from './Magnet';

describe('Magnet', () => {
  const bounds = { x: [-1.6, 1.6] as [number, number], y: [0.3, 7.7] as [number, number] };

  it('renders at the given surfaceZ, not a hardcoded constant', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Magnet id="magnet-0" word="dog" initialPosition={[0, 4, -9.5]} surfaceZ={-9.5} bounds={bounds} />,
    );
    const mesh = renderer.scene.children[0];
    expect(mesh.instance.position.z).toBe(-9.5);
  });

  it('calls onMeshReady with the mounted mesh', async () => {
    const onMeshReady = vi.fn();
    await ReactThreeTestRenderer.create(
      <Magnet
        id="magnet-0"
        word="dog"
        initialPosition={[0, 4, -1.84]}
        surfaceZ={-1.84}
        bounds={bounds}
        onMeshReady={onMeshReady}
      />,
    );
    expect(onMeshReady).toHaveBeenCalled();
    expect(onMeshReady.mock.calls[0][0]).not.toBeNull();
  });
});
