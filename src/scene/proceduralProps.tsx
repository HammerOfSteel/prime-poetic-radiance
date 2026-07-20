import type { ComponentType } from 'react';
import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import type { PropType } from '../engine/blueprintGenerator';
import { createToonGradientMap } from './toonGradient';

export interface PropProps {
  position: [number, number, number];
  rotationY: number;
  scale: number;
  accentColor: string;
}

export function Crate({ position, rotationY, scale, accentColor }: PropProps) {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  return (
    <RoundedBox
      args={[1, 1, 1]}
      radius={0.05}
      smoothness={4}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
      castShadow
      receiveShadow
    >
      <meshToonMaterial color={accentColor} gradientMap={gradientMap} />
    </RoundedBox>
  );
}

export function Barrel({ position, rotationY, scale, accentColor }: PropProps) {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} scale={scale} castShadow receiveShadow>
      <cylinderGeometry args={[0.4, 0.5, 1, 16]} />
      <meshToonMaterial color={accentColor} gradientMap={gradientMap} />
    </mesh>
  );
}

export function Pillar({ position, rotationY, scale, accentColor }: PropProps) {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} scale={scale} castShadow receiveShadow>
      <cylinderGeometry args={[0.3, 0.3, 3, 12]} />
      <meshToonMaterial color={accentColor} gradientMap={gradientMap} />
    </mesh>
  );
}

export function Rug({ position, rotationY, scale, accentColor }: PropProps) {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  return (
    <mesh
      position={[position[0], position[1] + 0.02, position[2]]}
      rotation={[-Math.PI / 2, 0, rotationY]}
      scale={scale}
      receiveShadow
    >
      <planeGeometry args={[2, 1.4]} />
      <meshToonMaterial color={accentColor} gradientMap={gradientMap} />
    </mesh>
  );
}

export function PottedPlant({ position, rotationY, scale, accentColor }: PropProps) {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.25, 0.6, 12]} />
        <meshToonMaterial color={accentColor} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshToonMaterial color="#7a9e5a" gradientMap={gradientMap} />
      </mesh>
    </group>
  );
}

export function Chest({ position, rotationY, scale, accentColor }: PropProps) {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  return (
    <RoundedBox
      args={[1.2, 0.7, 0.8]}
      radius={0.05}
      smoothness={4}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
      castShadow
      receiveShadow
    >
      <meshToonMaterial color={accentColor} gradientMap={gradientMap} />
    </RoundedBox>
  );
}

export const PROP_COMPONENTS: Record<PropType, ComponentType<PropProps>> = {
  crate: Crate,
  barrel: Barrel,
  pillar: Pillar,
  rug: Rug,
  pottedPlant: PottedPlant,
  chest: Chest,
};
