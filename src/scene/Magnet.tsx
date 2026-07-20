import { useRef, useState, useMemo } from 'react';
import { ThreeEvent, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createWordTexture, measureWordTextureWidth } from './wordTexture';
import { computeDragPoint } from '../engine/dragPlane';
import { useSceneStore } from '../state/sceneStore';
import { createToonGradientMap } from './toonGradient';

export interface MagnetProps {
  id: string;
  word: string;
  initialPosition: [number, number, number];
  /** Local Z depth of this scene's magnet drag plane (see SceneDefinition.magnetSurfaceZ). */
  surfaceZ: number;
  onMeshReady?: (mesh: THREE.Mesh | null) => void;
  /** Called once with the final position when a drag ends, so callers can persist it. */
  onPositionChange?: (position: [number, number, number]) => void;
}

export function Magnet({ id, word, initialPosition, surfaceZ, onMeshReady, onPositionChange }: MagnetProps) {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState(initialPosition);
  const setDraggedMagnetId = useSceneStore((state) => state.setDraggedMagnetId);
  const draggedMagnetId = useSceneStore((state) => state.draggedMagnetId);

  const width = measureWordTextureWidth(word) * 0.5;
  const texture = useMemo(() => createWordTexture(word), [word]);
  const gradientMap = useMemo(() => createToonGradientMap(), []);

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
    const point = computeDragPoint(ndc, camera, surfaceZ);
    if (point) setPosition([point.x, point.y, surfaceZ]);
  }

  function handlePointerUp() {
    if (draggedMagnetId === id) {
      setDraggedMagnetId(null);
      onPositionChange?.(position);
    }
  }

  return (
    <mesh
      ref={(node) => {
        meshRef.current = node;
        onMeshReady?.(node);
      }}
      position={position}
      castShadow
      receiveShadow
      userData={{ isMagnet: true, word }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <boxGeometry args={[width, 0.22, 0.05]} />
      <meshToonMaterial map={texture} gradientMap={gradientMap} />
    </mesh>
  );
}
