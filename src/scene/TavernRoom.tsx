import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';
import { createGrainTexture, createWoodGrainTexture } from './proceduralTextures';

const BARREL_POSITIONS: [number, number, number][] = [
  [4, 0.6, -5],
  [5.3, 0.6, -5],
  [4.65, 1.8, -5],
];
const BARREL_BAND_Y_OFFSETS = [-0.35, 0.35];
const SHELF_BOTTLES: { x: number; height: number; color: string }[] = [
  { x: -0.7, height: 0.5, color: '#4a7a5a' },
  { x: -0.35, height: 0.6, color: '#6a3a2a' },
  { x: 0, height: 0.45, color: '#4a7a5a' },
  { x: 0.35, height: 0.55, color: '#8a6a3a' },
  { x: 0.7, height: 0.5, color: '#6a3a2a' },
];

/** Static tavern interior: wood floor/walls, a warm hearth glow, and
 * (from this plan onward) furniture/decor props and procedural textures.
 * Mirrors Kitchen.tsx's structure. */
export function TavernRoom() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const floorWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [8, 8], seed: 501 }), []);
  const wallGrain = useMemo(() => createGrainTexture({ repeat: [6, 3], seed: 502 }), []);
  const benchWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [4, 1], seed: 503 }), []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshToonMaterial color="#5a3a24" gradientMap={gradientMap} map={floorWoodGrain} />
      </mesh>

      <mesh position={[0, 7.5, -6]} receiveShadow>
        <boxGeometry args={[30, 15, 1]} />
        <meshToonMaterial color="#3b2415" gradientMap={gradientMap} map={wallGrain} />
      </mesh>

      <mesh position={[-10, 7.5, 0]} receiveShadow>
        <boxGeometry args={[1, 15, 30]} />
        <meshToonMaterial color="#3b2415" gradientMap={gradientMap} map={wallGrain} />
      </mesh>

      <mesh position={[-6, 2, -5.4]} castShadow>
        <boxGeometry args={[3, 4, 1]} />
        <meshToonMaterial color="#2b1a10" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-6, 2, -4.8]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color="#ff8c3c" />
      </mesh>

      <RoundedBox
        args={[10, 1, 3]}
        radius={0.08}
        smoothness={4}
        position={[-4, 0.5, -2]}
        castShadow
        receiveShadow
        data-kind="bench"
      >
        <meshToonMaterial color="#8a5a34" gradientMap={gradientMap} map={benchWoodGrain} />
      </RoundedBox>

      {/* Barrel cluster stacked against the back wall, opposite the hearth */}
      {BARREL_POSITIONS.map((position, index) => (
        <group key={index} position={position}>
          <mesh castShadow receiveShadow data-kind="barrel">
            <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />
            <meshToonMaterial color="#7a5230" gradientMap={gradientMap} map={benchWoodGrain} />
          </mesh>
          {BARREL_BAND_Y_OFFSETS.map((yOffset) => (
            <mesh key={yOffset} position={[0, yOffset, 0]} data-kind="barrel-band">
              <torusGeometry args={[0.61, 0.04, 8, 16]} />
              <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Wall shelf with bottles, mounted on the back wall right of the barrels */}
      <RoundedBox
        args={[2, 0.12, 0.5]}
        radius={0.03}
        smoothness={4}
        position={[7, 3.5, -5.3]}
        castShadow
        receiveShadow
        data-kind="shelf-plank"
      >
        <meshToonMaterial color="#6a4527" gradientMap={gradientMap} map={benchWoodGrain} />
      </RoundedBox>
      {SHELF_BOTTLES.map(({ x, height, color }, index) => (
        <mesh key={index} position={[7 + x, 3.56 + height / 2, -5.3]} castShadow data-kind="shelf-bottle">
          <cylinderGeometry args={[0.09, 0.11, height, 10]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      ))}
    </>
  );
}
