import gsap from 'gsap';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

export interface TesseractButtonProps {
  getMagnetMeshes: () => THREE.Object3D[];
  position: [number, number, number];
  /** Called once the explode-out animation finishes, so the caller can
   * swap in a fresh set of magnet words/positions (mirrors POC_2's
   * "Render Into Reality" phase, which this port was previously missing —
   * without it, magnets just vanished forever). */
  onShuffleComplete?: () => void;
}

const EXPLODE_DURATION = 0.6;

export function triggerTesseractShuffle(magnetMeshes: THREE.Object3D[], onShuffleComplete?: () => void): void {
  if (magnetMeshes.length === 0) {
    onShuffleComplete?.();
    return;
  }
  magnetMeshes.forEach((mesh) => {
    const tl = gsap.timeline();
    tl.to(mesh.position, {
      x: mesh.position.x + (Math.random() - 0.5) * 6,
      y: mesh.position.y + (Math.random() - 0.5) * 6,
      z: mesh.position.z + 1 + Math.random() * 2,
      duration: EXPLODE_DURATION,
      ease: 'power2.out',
    }, 0);
    tl.to(mesh.rotation, {
      x: (Math.random() - 0.5) * Math.PI * 4,
      y: (Math.random() - 0.5) * Math.PI * 4,
      z: (Math.random() - 0.5) * Math.PI * 4,
      duration: EXPLODE_DURATION,
    }, 0);
    tl.to(mesh.scale, { x: 0, y: 0, z: 0, duration: EXPLODE_DURATION, ease: 'back.in(1.5)' }, 0);
  });

  gsap.delayedCall(EXPLODE_DURATION + 0.1, () => onShuffleComplete?.());
}

export function TesseractButton({ getMagnetMeshes, position, onShuffleComplete }: TesseractButtonProps) {
  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    triggerTesseractShuffle(getMagnetMeshes(), onShuffleComplete);
  }

  return (
    <mesh position={position} castShadow onClick={handleClick} userData={{ isTesseractButton: true }}>
      <cylinderGeometry args={[0.25, 0.25, 0.08, 32]} />
      <meshStandardMaterial color="#0984e3" roughness={0.4} />
    </mesh>
  );
}
