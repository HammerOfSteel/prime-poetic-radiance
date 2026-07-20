import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';

/** Static tavern interior: wood floor/walls and a warm hearth glow. Mirrors
 * Kitchen.tsx's structure — no props, no per-scene state. */
export function TavernRoom() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshToonMaterial color="#5a3a24" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[0, 7.5, -6]} receiveShadow>
        <boxGeometry args={[30, 15, 1]} />
        <meshToonMaterial color="#3b2415" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-10, 7.5, 0]} receiveShadow>
        <boxGeometry args={[1, 15, 30]} />
        <meshToonMaterial color="#3b2415" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-6, 2, -5.4]} castShadow>
        <boxGeometry args={[3, 4, 1]} />
        <meshToonMaterial color="#2b1a10" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-6, 2, -4.8]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color="#ff8c3c" />
      </mesh>

      <RoundedBox args={[10, 1, 3]} radius={0.08} smoothness={4} position={[-4, 0.5, -2]} castShadow receiveShadow>
        <meshToonMaterial color="#8a5a34" gradientMap={gradientMap} />
      </RoundedBox>
    </>
  );
}
