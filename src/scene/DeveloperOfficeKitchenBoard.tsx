import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { MagnetBoard } from './MagnetBoard';
import { SCENES, BOARD_GROUP_POSITION } from '../engine/scenes';
import { createToonGradientMap } from './toonGradient';
import { createWoodGrainTexture } from './proceduralTextures';

/** Small corkboard near the coffee machine — the Office Kitchen's magnet
 * surface. Mirrors DeveloperHomeOfficeBoard.tsx's structure. */
export function DeveloperOfficeKitchenBoard() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const frameWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [2, 4], seed: 801 }), []);
  const surfaceZ = SCENES.developerOfficeKitchen.magnetSurfaceZ;

  return (
    <group position={BOARD_GROUP_POSITION}>
      <RoundedBox args={[3.0, 3.4, 0.15]} radius={0.05} smoothness={4} position={[0, 4, 0]} castShadow receiveShadow>
        <meshToonMaterial color="#8a5a34" gradientMap={gradientMap} map={frameWoodGrain} />
      </RoundedBox>

      <RoundedBox args={[2.8, 3.2, 0.08]} radius={0.04} smoothness={4} position={[0, 4, surfaceZ - 0.12]} receiveShadow>
        <meshToonMaterial color="#c9a06a" gradientMap={gradientMap} />
      </RoundedBox>

      <MagnetBoard
        sceneId="developerOfficeKitchen"
        slamButtonPosition={[1.0, 2.8, surfaceZ]}
        tesseractButtonPosition={[1.0, 2.2, surfaceZ]}
      />
    </group>
  );
}