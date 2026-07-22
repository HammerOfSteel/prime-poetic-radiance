import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';
import { InteractiveProp } from './InteractiveProp';

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

      {/* Wizard's alchemy-table busywork props: bubbling cauldron + spellbook */}
      <InteractiveProp position={[1, 0.6, -2]} baseScale={[1, 1, 1]}>
        <mesh castShadow receiveShadow data-kind="cauldron-body">
          <cylinderGeometry args={[0.4, 0.3, 0.5, 16]} />
          <meshToonMaterial color="#2b2b30" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, 0.28, 0]} data-kind="cauldron-glow">
          <cylinderGeometry args={[0.36, 0.36, 0.05, 16]} />
          <meshToonMaterial color="#3a3a42" gradientMap={gradientMap} emissive="#7a3ce8" emissiveIntensity={1.2} />
        </mesh>
      </InteractiveProp>

      <InteractiveProp position={[-3, 0.55, -1.8]} baseScale={[1, 1, 1]}>
        <mesh castShadow data-kind="spellbook-cover">
          <boxGeometry args={[0.4, 0.06, 0.5]} />
          <meshToonMaterial color="#4a1f5a" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, 0.04, 0]} data-kind="spellbook-pages">
          <boxGeometry args={[0.36, 0.03, 0.46]} />
          <meshToonMaterial color="#d9c496" gradientMap={gradientMap} />
        </mesh>
      </InteractiveProp>
    </>
  );
}
