import * as THREE from 'three';

const raycaster = new THREE.Raycaster();

/**
 * Casts a ray from the camera through the given pointer NDC coordinates and
 * intersects it with the horizontal-normal plane `z = planeZ`. Returns the
 * world-space intersection point, or null if the ray doesn't hit the plane
 * (e.g. it points away from it).
 */
export function computeDragPoint(
  pointerNDC: THREE.Vector2,
  camera: THREE.Camera,
  planeZ: number,
): THREE.Vector3 | null {
  raycaster.setFromCamera(pointerNDC, camera);
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -planeZ);
  const target = new THREE.Vector3();
  const hit = raycaster.ray.intersectPlane(plane, target);
  return hit ? target : null;
}
