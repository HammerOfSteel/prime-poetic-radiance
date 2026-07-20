import { useRef, useState } from 'react';
import { ThreeEvent, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createWordTexture, measureWordTextureWidth } from './wordTexture';
import { computeDragPoint } from '../engine/dragPlane';
import { useSceneStore } from '../state/sceneStore';

export const FRIDGE_DOOR_Z = -1.84;

export interface MagnetProps {
  id: string;
  word: string;
  initialPosition: [number, number, number];
}

export function Magnet({ id, word, initialPosition }: MagnetProps) {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState(initialPosition);
  const setDraggedMagnetId = useSceneStore((state) => state.setDraggedMagnetId);
  const draggedMagnetId = useSceneStore((state) => state.draggedMagnetId);

  const width = measureWordTextureWidth(word) * 0.5;
  const texture = createWordTexture(word);

  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    setDraggedMagnetId(id);
  }

  function handlePointerMove(event: ThreeEvent<PointerEvent>) {
    if (draggedMagnetId !== id) return;
    const ndc = new THREE.Vector2(
      (event.nativeEvent.offsetX / (event.target as HTMLElement).clientWidth) * 2 - 1,
      -(event.nativeEvent.offsetY / (event.target as HTMLElement).clientHeight) * 2 + 1,
    );
    const point = computeDragPoint(ndc, camera, FRIDGE_DOOR_Z);
    if (point) setPosition([point.x, point.y, FRIDGE_DOOR_Z]);
  }

  function handlePointerUp() {
    if (draggedMagnetId === id) setDraggedMagnetId(null);
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      receiveShadow
      userData={{ isMagnet: true, word }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <boxGeometry args={[width, 0.22, 0.05]} />
      <meshStandardMaterial map={texture} roughness={0.6} metalness={0.1} />
    </mesh>
  );
}
