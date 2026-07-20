import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { MagnetBoard } from './MagnetBoard';
import { SCENES } from '../engine/scenes';
import { createToonGradientMap } from './toonGradient';

/** Corkboard-on-a-wall composition of the shared MagnetBoard, themed for
 * the tavern. Mirrors Fridge.tsx's structure. */
export function TavernNoticeboard() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const surfaceZ = SCENES.tavern.magnetSurfaceZ;

  return (
    <group position={[4, 0, -3.5]}>
      {/* Board sits behind the magnet plane (surfaceZ) so magnets render in
          front of its face rather than embedded inside it. */}
      <RoundedBox args={[3.6, 4, 0.2]} radius={0.06} smoothness={4} position={[0, 4, surfaceZ - 0.15]} receiveShadow>
        <meshToonMaterial color="#7a5230" gradientMap={gradientMap} />
      </RoundedBox>

      <MagnetBoard
        sceneId="tavern"
        slamButtonPosition={[1.2, 3.2, surfaceZ]}
        tesseractButtonPosition={[1.2, 2.5, surfaceZ]}
      />
    </group>
  );
}
