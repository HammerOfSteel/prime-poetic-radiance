import gsap from 'gsap';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { generatePoem } from '../engine/generatePoem';
import { computeSlamLayout } from '../engine/slamLayout';
import { WORDS } from '../engine/wordBank';

export interface SlamButtonProps {
  /** Maps a word to its live magnet mesh, so the animation can target the right object. */
  getMagnetMesh: (word: string) => THREE.Object3D | undefined;
  position: [number, number, number];
}

export function triggerPoetrySlam(getMagnetMesh: SlamButtonProps['getMagnetMesh']): void {
  const poemWords = generatePoem(WORDS);
  if (poemWords.length === 0) return;
  const layout = computeSlamLayout(poemWords);
  const targetY = 5 + (Math.random() - 0.5);

  layout.forEach(({ word, x }, index) => {
    const mesh = getMagnetMesh(word);
    if (!mesh) return;
    const tl = gsap.timeline({ delay: index * 0.2 });
    tl.to(mesh.position, { z: mesh.position.z + 0.5, duration: 0.3, ease: 'power2.out' }, 0)
      .to(mesh.rotation, { z: (Math.random() - 0.5) * Math.PI, duration: 0.3 }, 0)
      .to(mesh.position, { x, y: targetY, duration: 0.8, ease: 'back.out(1.5)' }, 0.3)
      .to(mesh.rotation, { z: (Math.random() - 0.5) * 0.1, duration: 0.5 }, 0.3)
      .to(mesh.position, { z: mesh.position.z, duration: 0.2, ease: 'bounce.out' }, 1.1);
  });
}

export function SlamButton({ getMagnetMesh, position }: SlamButtonProps) {
  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    triggerPoetrySlam(getMagnetMesh);
  }

  return (
    <mesh position={position} castShadow onClick={handleClick} userData={{ isSlamButton: true }}>
      <cylinderGeometry args={[0.25, 0.25, 0.08, 32]} />
      <meshStandardMaterial color="#ff4757" roughness={0.4} />
    </mesh>
  );
}
