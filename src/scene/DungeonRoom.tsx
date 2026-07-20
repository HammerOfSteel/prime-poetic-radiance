import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';

/** Static dungeon interior: rough stone floor/walls, a couple of unlit
 * wall-torch props, and a chain accent for texture. Mirrors Kitchen.tsx's
 * and TavernRoom.tsx's structure — no props, no per-scene state. Actual
 * scene lighting still comes from the shared Lighting rig (this scene
 * participates in the Phase 3 Auto/Manual environment system, unlike the
 * tavern), so the torches here are decorative geometry only. */
export function DungeonRoom() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshToonMaterial color="#4a4a52" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[0, 7.5, -6]} receiveShadow>
        <boxGeometry args={[30, 15, 1]} />
        <meshToonMaterial color="#3a3a42" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-10, 7.5, 0]} receiveShadow>
        <boxGeometry args={[1, 15, 30]} />
        <meshToonMaterial color="#3a3a42" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-6, 2, -5.4]} castShadow>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshToonMaterial color="#2b2b30" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-6, 3.6, -5.2]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshBasicMaterial color="#ff9a3c" />
      </mesh>

      <RoundedBox args={[6, 0.4, 2]} radius={0.05} smoothness={4} position={[-5, 0.2, -1]} castShadow receiveShadow>
        <meshToonMaterial color="#5a5a60" gradientMap={gradientMap} />
      </RoundedBox>
    </>
  );
}
