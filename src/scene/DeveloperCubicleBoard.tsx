import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { MagnetBoard } from './MagnetBoard';
import { SCENES, BOARD_GROUP_POSITION } from '../engine/scenes';
import { createToonGradientMap } from './toonGradient';

/** Whiteboard-on-a-partition composition of the shared MagnetBoard, themed
 * for the Cubicle. Mirrors DeveloperHomeOfficeBoard.tsx's structure. */
export function DeveloperCubicleBoard() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const surfaceZ = SCENES.developerCubicle.magnetSurfaceZ;

  return (
    <group position={BOARD_GROUP_POSITION}>
      {/* Whiteboard frame */}
      <RoundedBox args={[3.4, 3.8, 0.15]} radius={0.03} smoothness={4} position={[0, 4, 0]} castShadow receiveShadow>
        <meshToonMaterial color="#c8c8c0" gradientMap={gradientMap} />
      </RoundedBox>

      {/* Whiteboard surface */}
      <RoundedBox args={[3.2, 3.6, 0.08]} radius={0.02} smoothness={4} position={[0, 4, surfaceZ - 0.12]} receiveShadow>
        <meshToonMaterial color="#f5f5f0" gradientMap={gradientMap} />
      </RoundedBox>

      <MagnetBoard
        sceneId="developerCubicle"
        slamButtonPosition={[1.1, 3.0, surfaceZ]}
        tesseractButtonPosition={[1.1, 2.4, surfaceZ]}
      />
    </group>
  );
}