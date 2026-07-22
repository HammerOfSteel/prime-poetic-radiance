import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';
import { createGrainTexture, createWoodGrainTexture } from './proceduralTextures';
import { InteractiveProp } from './InteractiveProp';

const DUCK_POSITION: [number, number, number] = [-2.2, 3.35, -3.6];
const MUG_POSITION: [number, number, number] = [-1.4, 3.35, -3.6];
const PLANT_POSITION: [number, number, number] = [-7, 0, -4];
const PLANT_LEAF_OFFSETS: Array<{ offset: [number, number, number]; scale: [number, number, number]; color: string }> = [
  { offset: [0, 0.3, 0], scale: [0.5, 0.9, 0.5], color: '#7a9e5a' },
  { offset: [0.3, 0.1, 0.15], scale: [0.45, 0.7, 0.45], color: '#6a8e4a' },
  { offset: [-0.3, 0.05, -0.15], scale: [0.45, 0.75, 0.45], color: '#8aa96a' },
];

/** Cozy work-from-home developer desk: desk, chair, monitor, window, and
 * a couple of "busywork" props (rubber duck, coffee mug). Mirrors
 * Kitchen.tsx/TavernRoom.tsx's structure. */
export function DeveloperHomeOffice() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const wallGrain = useMemo(() => createGrainTexture({ repeat: [6, 3], seed: 601 }), []);
  const floorWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [8, 8], seed: 602 }), []);
  const deskWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [3, 1], seed: 603 }), []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshToonMaterial color="#8a6a4b" gradientMap={gradientMap} map={floorWoodGrain} />
      </mesh>

      <mesh position={[0, 7.5, -6]} receiveShadow>
        <boxGeometry args={[30, 15, 1]} />
        <meshToonMaterial color="#eee3d3" gradientMap={gradientMap} map={wallGrain} />
      </mesh>

      <mesh position={[-10, 7.5, 0]} receiveShadow>
        <boxGeometry args={[1, 15, 30]} />
        <meshToonMaterial color="#eee3d3" gradientMap={gradientMap} map={wallGrain} />
      </mesh>

      {/* Window */}
      <mesh position={[-7, 6, -5.4]}>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial color="#a9d3e8" />
      </mesh>

      {/* Desk */}
      <RoundedBox args={[6, 0.2, 2.4]} radius={0.05} smoothness={4} position={[-2, 3.1, -4]} castShadow receiveShadow>
        <meshToonMaterial color="#c9975f" gradientMap={gradientMap} map={deskWoodGrain} />
      </RoundedBox>
      <RoundedBox args={[0.2, 3, 0.2]} radius={0.03} smoothness={2} position={[-4.7, 1.55, -4.9]} castShadow>
        <meshToonMaterial color="#5a3a24" gradientMap={gradientMap} />
      </RoundedBox>
      <RoundedBox args={[0.2, 3, 0.2]} radius={0.03} smoothness={2} position={[0.7, 1.55, -4.9]} castShadow>
        <meshToonMaterial color="#5a3a24" gradientMap={gradientMap} />
      </RoundedBox>

      {/* Chair */}
      <RoundedBox args={[1.2, 0.15, 1.2]} radius={0.05} smoothness={4} position={[-2, 1.6, -1.5]} castShadow receiveShadow>
        <meshToonMaterial color="#3d3d3d" gradientMap={gradientMap} />
      </RoundedBox>
      <RoundedBox args={[1.2, 1.6, 0.15]} radius={0.05} smoothness={4} position={[-2, 2.4, -0.95]} castShadow>
        <meshToonMaterial color="#3d3d3d" gradientMap={gradientMap} />
      </RoundedBox>
      <mesh position={[-2, 0.75, -1.5]}>
        <cylinderGeometry args={[0.08, 0.08, 1.5, 8]} />
        <meshToonMaterial color="#2b2b2b" gradientMap={gradientMap} />
      </mesh>

      {/* Monitor */}
      <RoundedBox args={[1.6, 1.0, 0.08]} radius={0.03} smoothness={4} position={[-2, 3.9, -4.9]} castShadow>
        <meshToonMaterial color="#1a1a1a" gradientMap={gradientMap} emissive="#3a6ea8" emissiveIntensity={0.6} />
      </RoundedBox>
      <mesh position={[-2, 3.3, -4.9]}>
        <cylinderGeometry args={[0.06, 0.1, 0.3, 8]} />
        <meshToonMaterial color="#2b2b2b" gradientMap={gradientMap} />
      </mesh>

      {/* Keyboard */}
      <RoundedBox args={[1.1, 0.05, 0.4]} radius={0.02} smoothness={2} position={[-2, 3.23, -3.2]} castShadow>
        <meshToonMaterial color="#e0e0e0" gradientMap={gradientMap} />
      </RoundedBox>

      {/* Potted plant */}
      <mesh position={PLANT_POSITION} castShadow>
        <cylinderGeometry args={[0.35, 0.28, 0.5, 12]} />
        <meshToonMaterial color="#b5623a" gradientMap={gradientMap} />
      </mesh>
      {PLANT_LEAF_OFFSETS.map(({ offset, scale, color }, index) => (
        <mesh
          key={index}
          position={[PLANT_POSITION[0] + offset[0], PLANT_POSITION[1] + 0.5 + offset[1], PLANT_POSITION[2] + offset[2]]}
          scale={scale}
          castShadow
          data-kind="plant-leaf"
        >
          <sphereGeometry args={[0.35, 8, 8]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      ))}

      {/* Busywork props: rubber duck ("duck debugging" in-joke) + coffee mug */}
      <InteractiveProp position={DUCK_POSITION} baseScale={[1, 1, 1]}>
        <mesh castShadow data-kind="rubber-duck-body">
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshToonMaterial color="#ffd93d" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, 0.1, 0.09]} castShadow data-kind="rubber-duck-head">
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshToonMaterial color="#ffd93d" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, 0.09, 0.16]} castShadow data-kind="rubber-duck-beak">
          <coneGeometry args={[0.03, 0.06, 8]} />
          <meshToonMaterial color="#ff9d3d" gradientMap={gradientMap} />
        </mesh>
      </InteractiveProp>

      <InteractiveProp position={MUG_POSITION} baseScale={[1, 1, 1]}>
        <mesh position={[0, 0.08, 0]} castShadow data-kind="mug-body">
          <cylinderGeometry args={[0.08, 0.07, 0.16, 12]} />
          <meshToonMaterial color="#e8543f" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0.09, 0.08, 0]} rotation={[0, 0, Math.PI / 2]} data-kind="mug-handle">
          <torusGeometry args={[0.05, 0.015, 8, 12]} />
          <meshToonMaterial color="#e8543f" gradientMap={gradientMap} />
        </mesh>
      </InteractiveProp>
    </>
  );
}