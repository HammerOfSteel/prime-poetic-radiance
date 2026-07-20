import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';

export function Kitchen() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshToonMaterial color="#8a5a3b" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[0, 7.5, -6]} receiveShadow>
        <boxGeometry args={[30, 15, 1]} />
        <meshToonMaterial color="#f2e3c9" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-10, 7.5, 0]} receiveShadow>
        <boxGeometry args={[1, 15, 30]} />
        <meshToonMaterial color="#f2e3c9" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-5, 6, -5.4]}>
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial color="#fff3d6" />
      </mesh>

      <RoundedBox args={[12, 3, 3]} radius={0.1} smoothness={4} position={[-4, 1.5, -4]} castShadow receiveShadow>
        <meshToonMaterial color="#c96a3e" gradientMap={gradientMap} />
      </RoundedBox>

      <RoundedBox args={[12.2, 0.2, 3.2]} radius={0.06} smoothness={4} position={[-4, 3.1, -4]} castShadow receiveShadow>
        <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
      </RoundedBox>

      <mesh position={[-2, 3.4, -3.5]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.4, 16]} />
        <meshToonMaterial color="#e8543f" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-7, 3.5, -4]} castShadow>
        <cylinderGeometry args={[0.4, 0.3, 0.6, 16]} />
        <meshToonMaterial color="#cd6133" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-7, 4.2, -4]} castShadow>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshToonMaterial color="#7a9e5a" gradientMap={gradientMap} />
      </mesh>
    </>
  );
}
