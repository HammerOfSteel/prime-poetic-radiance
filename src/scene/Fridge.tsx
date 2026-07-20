import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { MagnetBoard } from './MagnetBoard';
import { SCENES, BOARD_GROUP_POSITION } from '../engine/scenes';
import { createToonGradientMap } from './toonGradient';

export function Fridge() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const doorZ = SCENES.kitchen.magnetSurfaceZ;

  return (
    <group position={BOARD_GROUP_POSITION}>
      <RoundedBox args={[3.5, 8, 3]} radius={0.1} smoothness={4} position={[0, 4, 0]} castShadow receiveShadow>
        <meshToonMaterial color="#f6d98a" gradientMap={gradientMap} />
      </RoundedBox>

      <RoundedBox args={[3.6, 7.8, 0.2]} radius={0.06} smoothness={4} position={[0, 4, 1.55]} receiveShadow>
        <meshToonMaterial color="#f6d98a" gradientMap={gradientMap} />
      </RoundedBox>

      <MagnetBoard
        sceneId="kitchen"
        slamButtonPosition={[1.2, 3.2, doorZ]}
        tesseractButtonPosition={[1.2, 2.5, doorZ]}
      />
    </group>
  );
}
