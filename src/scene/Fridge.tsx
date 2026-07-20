import { useMemo } from 'react';
import { WORDS } from '../engine/wordBank';
import { Magnet, FRIDGE_DOOR_Z } from './Magnet';

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

  return (
    <group position={[4, 0, -3.5]}>
      <mesh position={[0, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 8, 3]} />
        <meshStandardMaterial color="#f5f6fa" roughness={0.4} metalness={0.1} />
      </mesh>

      <mesh position={[0, 4, 1.55]} receiveShadow>
        <boxGeometry args={[3.6, 7.8, 0.2]} />
        <meshStandardMaterial color="#f5f6fa" roughness={0.4} metalness={0.1} />
      </mesh>

      {magnetData.map(({ word, index, initialPosition }) => (
        <Magnet
          key={`${word}-${index}`}
          id={`magnet-${index}`}
          word={word}
          initialPosition={initialPosition}
        />
      ))}
    </group>
  );
}
