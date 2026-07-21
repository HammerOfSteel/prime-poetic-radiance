import { describe, expect, it } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { KitchenAtmosphere } from './KitchenAtmosphere';

const KETTLE_POSITION: [number, number, number] = [-2, 3.7, -3.3];

describe('KitchenAtmosphere', () => {
  it('mounts without throwing and renders the dust-mote sparkles and steam sprites', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <KitchenAtmosphere lightingPreset="day" kettlePosition={KETTLE_POSITION} />,
    );
    const points = renderer.scene.children.filter((child) => child.type === 'Points');
    // Only the dust-mote Sparkles instance during the day (no fireflies).
    expect(points.length).toBe(1);
    const sprites = renderer.scene.children.filter((child) => child.type === 'Sprite');
    expect(sprites.length).toBe(5);
  });

  it('adds a second (firefly) Sparkles instance when lightingPreset is night', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <KitchenAtmosphere lightingPreset="night" kettlePosition={KETTLE_POSITION} />,
    );
    const points = renderer.scene.children.filter((child) => child.type === 'Points');
    expect(points.length).toBe(2);
  });

  it('adds the firefly Sparkles instance during evening too, not just night', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <KitchenAtmosphere lightingPreset="evening" kettlePosition={KETTLE_POSITION} />,
    );
    const points = renderer.scene.children.filter((child) => child.type === 'Points');
    expect(points.length).toBe(2);
  });

  it('does not add fireflies during morning', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <KitchenAtmosphere lightingPreset="morning" kettlePosition={KETTLE_POSITION} />,
    );
    const points = renderer.scene.children.filter((child) => child.type === 'Points');
    expect(points.length).toBe(1);
  });
});
