import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { MagnetBoard } from './MagnetBoard';
import { SCENES } from '../engine/scenes';
import { createToonGradientMap } from './toonGradient';

/** Stone rune tablet mounted on a dungeon wall, composing the shared
 * MagnetBoard, themed for the dungeon. Mirrors Fridge.tsx's and
 * TavernNoticeboard.tsx's structure. */
export function DungeonTablet() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const surfaceZ = SCENES.dungeon.magnetSurfaceZ;

  return (
    <group position={[4, 0, -3.5]}>
      <RoundedBox args={[3.6, 4, 0.2]} radius={0.04} smoothness={4} position={[0, 4, surfaceZ + 0.05]} receiveShadow>
        <meshToonMaterial color="#6a6a72" gradientMap={gradientMap} />
      </RoundedBox>

      <MagnetBoard
        sceneId="dungeon"
        slamButtonPosition={[1.2, 3.2, surfaceZ]}
        tesseractButtonPosition={[1.2, 2.5, surfaceZ]}
      />
    </group>
  );
}
