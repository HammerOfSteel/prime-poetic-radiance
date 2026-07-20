import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { WORDS } from '../engine/wordBank';
import { Magnet, FRIDGE_DOOR_Z } from './Magnet';
import { SlamButton } from './SlamButton';
import { TesseractButton } from './TesseractButton';
import { createToonGradientMap } from './toonGradient';

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => 0.5 - Math.random());
}

export function Fridge() {
  const magnetData = useMemo(() => {
    return shuffle(WORDS).slice(0, 35).map((word, index) => ({
      word,
      index,
      initialPosition: [
        (Math.random() - 0.5) * 3,
        4 + (Math.random() - 0.2) * 3,
        FRIDGE_DOOR_Z,
      ] as [number, number, number],
    }));
  }, []);

  const gradientMap = useMemo(() => createToonGradientMap(), []);

  const meshRefs = useRef(new Map<string, THREE.Object3D>());

  function registerMesh(word: string, mesh: THREE.Mesh | null) {
    if (mesh) meshRefs.current.set(word, mesh);
    else meshRefs.current.delete(word);
  }

  return (
    <group position={[4, 0, -3.5]}>
      <RoundedBox args={[3.5, 8, 3]} radius={0.1} smoothness={4} position={[0, 4, 0]} castShadow receiveShadow>
        <meshToonMaterial color="#f6d98a" gradientMap={gradientMap} />
      </RoundedBox>

      <RoundedBox args={[3.6, 7.8, 0.2]} radius={0.06} smoothness={4} position={[0, 4, 1.55]} receiveShadow>
        <meshToonMaterial color="#f6d98a" gradientMap={gradientMap} />
      </RoundedBox>

      {magnetData.map(({ word, index, initialPosition }) => (
        <Magnet
          key={`${word}-${index}`}
          id={`magnet-${index}`}
          word={word}
          initialPosition={initialPosition}
          onMeshReady={(mesh) => registerMesh(word, mesh)}
        />
      ))}

      <SlamButton
        position={[1.2, 3.2, FRIDGE_DOOR_Z]}
        getMagnetMesh={(word) => meshRefs.current.get(word)}
      />
      <TesseractButton
        position={[1.2, 2.5, FRIDGE_DOOR_Z]}
        getMagnetMeshes={() => Array.from(meshRefs.current.values())}
      />
    </group>
  );
}
