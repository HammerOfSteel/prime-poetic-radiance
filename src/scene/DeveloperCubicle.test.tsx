import { describe, expect, it, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { DeveloperCubicle } from './DeveloperCubicle';
import { useSceneStore } from '../state/sceneStore';

describe('DeveloperCubicle', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
  });

  it('mounts without throwing and renders at least a floor and two walls', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DeveloperCubicle />);
    const meshes = renderer.scene.children.filter((child) => child.type === 'Mesh');
    expect(meshes.length).toBeGreaterThanOrEqual(3);
  });

  it('renders the meeting-tally, video-call, and calendar busywork props', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DeveloperCubicle />);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'tally-sticky-note' }).length).toBe(1);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'video-call-panel' }).length).toBe(1);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'calendar-prop' }).length).toBe(1);
  });

  it('renders additional tally marks as the meeting tally increases', async () => {
    useSceneStore.getState().incrementCubicleMeetingTally();
    useSceneStore.getState().incrementCubicleMeetingTally();
    const renderer = await ReactThreeTestRenderer.create(<DeveloperCubicle />);
    expect(renderer.scene.findAllByProps({ 'data-kind': 'tally-mark' }).length).toBe(2);
  });
});