import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { MagnetBoard } from './MagnetBoard';
import { SCENES, BOARD_GROUP_POSITION } from '../engine/scenes';
import { createToonGradientMap } from './toonGradient';

const VENT_Y_POSITIONS = [7.72, 7.8, 7.88];

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

      {/* Door handle, offset near the door's right edge, outside the
          magnet board's bounds (x max 1.6) so it never overlaps magnets. */}
      <RoundedBox args={[0.12, 2.5, 0.12]} radius={0.04} smoothness={4} position={[1.72, 4, 1.7]} castShadow>
        <meshToonMaterial color="#3d2b1f" gradientMap={gradientMap} />
      </RoundedBox>

      {/* Kick-plate, a recessed dark strip grounding the fridge base. */}
      <RoundedBox args={[3.3, 0.4, 2.8]} radius={0.05} smoothness={4} position={[0, 0.2, 0]} castShadow receiveShadow>
        <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
      </RoundedBox>

      {/* Vent strips near the top of the door, above the magnet board's
          y-max (7.7) so they never overlap the magnet grid. */}
      {VENT_Y_POSITIONS.map((y, index) => (
        <RoundedBox
          key={index}
          args={[3.2, 0.06, 0.04]}
          radius={0.02}
          smoothness={2}
          position={[0, y, 1.68]}
          castShadow
        >
          <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
        </RoundedBox>
      ))}

      <MagnetBoard
        sceneId="kitchen"
        slamButtonPosition={[1.2, 3.2, doorZ]}
        tesseractButtonPosition={[1.2, 2.5, doorZ]}
      />
    </group>
  );
}
