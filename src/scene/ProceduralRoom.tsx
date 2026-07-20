import { useMemo } from 'react';
import type { RoomBlueprint } from '../engine/blueprintGenerator';
import { PROP_COMPONENTS } from './proceduralProps';
import { createToonGradientMap } from './toonGradient';

/** Renders a procedurally generated RoomBlueprint: a floor + 2-wall shell
 * (same convention as Kitchen.tsx/TavernRoom.tsx/DungeonRoom.tsx) sized and
 * colored from the blueprint, plus one component per placed prop. */
export function ProceduralRoom({ blueprint }: { blueprint: RoomBlueprint }) {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const { width, depth, height, palette, props } = blueprint;

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshToonMaterial color={palette.floorColor} gradientMap={gradientMap} />
      </mesh>

      <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, 1]} />
        <meshToonMaterial color={palette.wallColor} gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[1, height, depth]} />
        <meshToonMaterial color={palette.wallColor} gradientMap={gradientMap} />
      </mesh>

      {props.map((prop, index) => {
        const PropComponent = PROP_COMPONENTS[prop.type];
        return (
          <PropComponent
            key={index}
            position={prop.position}
            rotationY={prop.rotationY}
            scale={prop.scale}
            accentColor={palette.accentColor}
          />
        );
      })}
    </>
  );
}
