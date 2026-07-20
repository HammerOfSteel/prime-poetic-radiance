import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { computeDragPoint } from './dragPlane';

describe('computeDragPoint', () => {
  it('projects the pointer onto the target Z plane for an orthographic-like straight-on camera', () => {
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    const pointerNDC = new THREE.Vector2(0, 0); // dead center of the screen
    const point = computeDragPoint(pointerNDC, camera, 0);

    expect(point).not.toBeNull();
    expect(point!.x).toBeCloseTo(0, 5);
    expect(point!.y).toBeCloseTo(0, 5);
    expect(point!.z).toBeCloseTo(0, 5);
  });

  it('returns null when the ray is parallel to the plane and never intersects it', () => {
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.set(0, 0, 10);
    // Looking straight down -Z, plane is also perpendicular to Z at the same
    // depth as the camera's near clip — use a plane at Z equal to camera Z
    // with a ray direction that can't reach it (looking away from the plane).
    camera.lookAt(0, 0, 20); // looking away from origin, plane at z=0 is behind the camera
    camera.updateMatrixWorld();

    const pointerNDC = new THREE.Vector2(0, 0);
    const point = computeDragPoint(pointerNDC, camera, 0);

    expect(point).toBeNull();
  });
});
