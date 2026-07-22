import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { MagnetBoard } from './MagnetBoard';
import { SCENES, BOARD_GROUP_POSITION } from '../engine/scenes';
import { createToonGradientMap } from './toonGradient';
import { createWoodGrainTexture } from './proceduralTextures';

/** Standing corkboard on a wooden frame — the Home Office's magnet surface.
 * Mirrors Fridge.tsx's structure (a freestanding board facing the camera at
 * `BOARD_GROUP_POSITION`, magnets rendered in front of its face at
 * `magnetSurfaceZ`). */
export function DeveloperHomeOfficeBoard() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const frameWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [2, 4], seed: 701 }), []);
  const surfaceZ = SCENES.developerHomeOffice.magnetSurfaceZ;

  return (
    <group position={BOARD_GROUP_POSITION}>
      {/* Wooden frame */}
      <RoundedBox args={[3.4, 3.8, 0.15]} radius={0.05} smoothness={4} position={[0, 4, 0]} castShadow receiveShadow>
        <meshToonMaterial color="#8a5a34" gradientMap={gradientMap} map={frameWoodGrain} />
      </RoundedBox>

      {/* Cork surface, sits in front of the frame so magnets render on top */}
      <RoundedBox args={[3.2, 3.6, 0.08]} radius={0.04} smoothness={4} position={[0, 4, surfaceZ - 0.12]} receiveShadow>
        <meshToonMaterial color="#c9a06a" gradientMap={gradientMap} />
      </RoundedBox>

      <MagnetBoard
        sceneId="developerHomeOffice"
        slamButtonPosition={[1.1, 3.0, surfaceZ]}
        tesseractButtonPosition={[1.1, 2.4, surfaceZ]}
      />
    </group>
  );
}