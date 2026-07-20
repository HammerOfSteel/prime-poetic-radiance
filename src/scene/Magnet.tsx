import { useRef, useState, useMemo, useEffect } from 'react';
import { ThreeEvent, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createWordTexture, measureWordTextureWidth } from './wordTexture';
import { computeDragPoint } from '../engine/dragPlane';
import { useSceneStore } from '../state/sceneStore';
import { createToonGradientMap } from './toonGradient';
import { BOARD_GROUP_POSITION } from '../engine/scenes';

export interface MagnetProps {
  id: string;
  word: string;
  initialPosition: [number, number, number];
  /** Local Z depth of this scene's magnet drag plane (see SceneDefinition.magnetSurfaceZ). */
  surfaceZ: number;
  /** Local-space x/y range this magnet may be dragged within (see
   * SceneDefinition.magnetBoardBounds), so it can't be dropped off the
   * board into empty space. */
  bounds: { x: [number, number]; y: [number, number] };
  onMeshReady?: (mesh: THREE.Mesh | null) => void;
  /** Called once with the final position when a drag ends, so callers can persist it. */
  onPositionChange?: (position: [number, number, number]) => void;
}

export function Magnet({ id, word, initialPosition, surfaceZ, bounds, onMeshReady, onPositionChange }: MagnetProps) {
  const { camera, gl } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState(initialPosition);
  const positionRef = useRef(position);
  positionRef.current = position;
  const setDraggedMagnetId = useSceneStore((state) => state.setDraggedMagnetId);
  const draggedMagnetId = useSceneStore((state) => state.draggedMagnetId);

  const width = measureWordTextureWidth(word) * 0.5;
  const texture = useMemo(() => createWordTexture(word), [word]);
  const gradientMap = useMemo(() => createToonGradientMap(), []);

  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    setDraggedMagnetId(id);
  }

  // Attach native pointermove/pointerup listeners directly to the canvas
  // (mirroring POC_2, which listens on `renderer.domElement` for the whole
  // drag rather than per-mesh) instead of R3F's per-mesh onPointerMove.
  // R3F's per-mesh pointer events only fire while the raycaster still
  // intersects that exact mesh, so once the cursor moves past this magnet's
  // small hitbox (easy to do even a few pixels into a drag), the drag would
  // silently freeze or "lose" the magnet. Canvas-level listeners keep
  // tracking the pointer for the entire drag regardless of what's under it.
  useEffect(() => {
    if (draggedMagnetId !== id) return;
    const canvasEl = gl.domElement;

    function handlePointerMove(event: PointerEvent) {
      const rect = canvasEl.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      // The raycaster/plane intersection is in world space, but this mesh's
      // position is local to its scene's board group (see
      // BOARD_GROUP_POSITION), so the plane depth and the resulting point
      // must be converted between the two spaces or dragged magnets drift
      // off to the side of the board.
      const worldPlaneZ = BOARD_GROUP_POSITION[2] + surfaceZ;
      const point = computeDragPoint(ndc, camera, worldPlaneZ);
      if (point) {
        const x = THREE.MathUtils.clamp(point.x - BOARD_GROUP_POSITION[0], bounds.x[0], bounds.x[1]);
        const y = THREE.MathUtils.clamp(point.y - BOARD_GROUP_POSITION[1], bounds.y[0], bounds.y[1]);
        setPosition([x, y, surfaceZ]);
      }
    }

    function handlePointerUp() {
      setDraggedMagnetId(null);
      onPositionChange?.(positionRef.current);
    }

    canvasEl.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      canvasEl.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggedMagnetId, id, camera, gl, surfaceZ, bounds, setDraggedMagnetId, onPositionChange]);

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
    >
      <boxGeometry args={[width, 0.22, 0.05]} />
      <meshToonMaterial map={texture} gradientMap={gradientMap} />
    </mesh>
  );
}
