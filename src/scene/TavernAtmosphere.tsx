import { Sparkles } from '@react-three/drei';

export interface TavernAtmosphereProps {
  hearthPosition: [number, number, number];
}

/**
 * Always-on ambient particles for the tavern scene: rising embers near the
 * hearth and a soft warm dust-mote layer spanning the room. Unlike
 * KitchenAtmosphere, nothing here is gated by lighting preset — the
 * tavern uses a single fixed firelit lighting preset (see scenes.ts), so
 * there's no day/night variation to react to. Kept in its own file/
 * component so TavernRoom.tsx's room-prop JSX doesn't also have to carry
 * particle-tuning details, mirroring KitchenAtmosphere.tsx's separation.
 */
export function TavernAtmosphere({ hearthPosition }: TavernAtmosphereProps) {
  const [hx, hy, hz] = hearthPosition;

  return (
    <>
      <Sparkles
        count={14}
        scale={[1.2, 2, 1.2]}
        size={2.5}
        speed={0.4}
        color="#ff9c4c"
        opacity={0.7}
        position={[hx, hy + 0.8, hz]}
      />
      <Sparkles
        count={20}
        scale={[9, 4, 6]}
        size={1.6}
        speed={0.12}
        color="#ffdca0"
        opacity={0.25}
        position={[-2, 4, -2]}
      />
    </>
  );
}
