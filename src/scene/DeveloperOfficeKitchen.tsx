import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { RoundedBox, Sparkles } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';
import { createGrainTexture, createWoodGrainTexture, createSoftCircleTexture } from './proceduralTextures';
import { InteractiveProp } from './InteractiveProp';

const COFFEE_MACHINE_POSITION: [number, number, number] = [-2, 3.35, -4.7];
const SNACK_JAR_POSITION: [number, number, number] = [-0.8, 3.35, -4.7];

/** Small social/break room: coffee machine, mug rack, round table, and an
 * NPC silhouette for incidental "who's in the break room" flavor. Mirrors
 * DeveloperHomeOffice.tsx's structure. */
export function DeveloperOfficeKitchen() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const wallGrain = useMemo(() => createGrainTexture({ repeat: [6, 3], seed: 901 }), []);
  const floorWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [8, 8], seed: 902 }), []);
  const counterWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [3, 1], seed: 903 }), []);
  const steamTexture = useMemo(() => createSoftCircleTexture(), []);
  const steamRef = useRef<THREE.Sprite | null>(null);

  function handleBrew() {
    const sprite = steamRef.current;
    if (!sprite) return;
    const material = sprite.material as THREE.SpriteMaterial;
    gsap.killTweensOf([sprite.position, sprite.scale, material]);
    sprite.position.set(COFFEE_MACHINE_POSITION[0], COFFEE_MACHINE_POSITION[1] + 0.2, COFFEE_MACHINE_POSITION[2]);
    material.opacity = 0.6;
    gsap.to(sprite.position, { y: sprite.position.y + 0.6, duration: 1.2, ease: 'power1.out' });
    gsap.to(material, { opacity: 0, duration: 1.2, ease: 'power1.out' });
  }

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

      {/* Counter with coffee machine + snack jar */}
      <RoundedBox args={[4, 0.2, 1.8]} radius={0.05} smoothness={4} position={[-1.4, 3.1, -4.5]} castShadow receiveShadow>
        <meshToonMaterial color="#c9975f" gradientMap={gradientMap} map={counterWoodGrain} />
      </RoundedBox>

      {/* Round table for incidental small talk */}
      <mesh position={[0, 1.5, -1.5]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 1.0, 0.1, 20]} />
        <meshToonMaterial color="#c9975f" gradientMap={gradientMap} map={counterWoodGrain} />
      </mesh>
      <mesh position={[0, 0.75, -1.5]}>
        <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
        <meshToonMaterial color="#5a3a24" gradientMap={gradientMap} />
      </mesh>

      {/* NPC silhouette: simple flat toon-shaded humanoid, presence only */}
      <mesh position={[1.3, 1.1, -1.5]} castShadow data-kind="npc-silhouette">
        <capsuleGeometry args={[0.28, 1.2, 4, 8]} />
        <meshToonMaterial color="#4a4a52" gradientMap={gradientMap} />
      </mesh>
      <mesh position={[1.3, 2.0, -1.5]} castShadow data-kind="npc-head">
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshToonMaterial color="#e0b088" gradientMap={gradientMap} />
      </mesh>

      {/* Coffee machine busywork prop: click -> brew animation + steam burst */}
      <InteractiveProp position={COFFEE_MACHINE_POSITION} baseScale={[1, 1, 1]} onActivate={handleBrew}>
        <mesh castShadow data-kind="coffee-machine-body">
          <boxGeometry args={[0.3, 0.4, 0.25]} />
          <meshToonMaterial color="#2b2b2b" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.15, 0.15]} data-kind="coffee-machine-pot">
          <cylinderGeometry args={[0.08, 0.08, 0.12, 10]} />
          <meshToonMaterial color="#1a1a1a" gradientMap={gradientMap} />
        </mesh>
      </InteractiveProp>
      <sprite ref={steamRef} position={COFFEE_MACHINE_POSITION} scale={[0.3, 0.4, 1]}>
        <spriteMaterial map={steamTexture} transparent depthWrite={false} opacity={0} />
      </sprite>

      {/* Snack jar busywork prop: click -> lid-pop (handled by InteractiveProp bounce) */}
      <InteractiveProp position={SNACK_JAR_POSITION} baseScale={[1, 1, 1]}>
        <mesh castShadow data-kind="snack-jar-body">
          <cylinderGeometry args={[0.12, 0.12, 0.3, 12]} />
          <meshToonMaterial color="#dce8e0" gradientMap={gradientMap} transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 0.18, 0]} data-kind="snack-jar-lid">
          <cylinderGeometry args={[0.13, 0.13, 0.05, 12]} />
          <meshToonMaterial color="#7a5230" gradientMap={gradientMap} />
        </mesh>
      </InteractiveProp>

      <Sparkles count={12} scale={[6, 3, 6]} position={[-1, 4, -3]} size={1.5} speed={0.15} opacity={0.15} />
    </>
  );
}