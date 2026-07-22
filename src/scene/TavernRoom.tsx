import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { createToonGradientMap } from './toonGradient';
import { createGrainTexture, createWoodGrainTexture, createSoftCircleTexture } from './proceduralTextures';
import { TavernAtmosphere } from './TavernAtmosphere';
import { InteractiveProp } from './InteractiveProp';

const HEARTH_POSITION: [number, number, number] = [-6, 2.5, -4.6];
const HEARTH_FLAME_COUNT = 3;
const HEARTH_FLICKER_BASE_INTENSITY = 1.1;

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
const SCONCE_POSITIONS: [number, number, number][] = [
  [-1, 4.5, -5.4],
  [9, 4.5, -5.4],
];
const TANKARD_POSITIONS: [number, number, number][] = [
  [-6.5, 1.0, -2.3],
  [-5.5, 1.0, -1.7],
  [-2, 1.0, -2],
];

/** Static tavern interior: wood floor/walls, a warm hearth glow, and
 * (from this plan onward) furniture/decor props and procedural textures.
 * Mirrors Kitchen.tsx's structure. */
export function TavernRoom() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const floorWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [8, 8], seed: 501 }), []);
  const wallGrain = useMemo(() => createGrainTexture({ repeat: [6, 3], seed: 502 }), []);
  const benchWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [4, 1], seed: 503 }), []);
  const flameTexture = useMemo(() => createSoftCircleTexture(), []);
  const flameRefs = useRef<(THREE.Sprite | null)[]>([]);
  const flickerLightRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    const [hx, hy, hz] = HEARTH_POSITION;
    const flameTimelines = flameRefs.current.map((sprite, index) => {
      if (!sprite) return null;
      const material = sprite.material as THREE.SpriteMaterial;
      const drift = index % 2 === 0 ? 0.15 : -0.15;
      const duration = 0.5 + index * 0.15;

      sprite.position.set(hx + drift * 0.5, hy, hz);
      const tl = gsap.timeline({ repeat: -1, yoyo: true, delay: index * 0.1 });
      tl.to(sprite.position, { x: hx + drift, y: hy + 0.3, duration, ease: 'sine.inOut' }, 0)
        .to(sprite.scale, { x: 0.9, y: 1.1, duration, ease: 'sine.inOut' }, 0)
        .to(material, { opacity: 0.55, duration, ease: 'sine.inOut' }, 0);
      return tl;
    });

    const light = flickerLightRef.current;
    const lightTimeline = light
      ? gsap.timeline({ repeat: -1 }).to(light, {
          intensity: HEARTH_FLICKER_BASE_INTENSITY * 1.4,
          duration: 0.18,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      : null;

    return () => {
      flameTimelines.forEach((tl) => tl?.kill());
      lightTimeline?.kill();
    };
  }, []);

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

      {/* Animated flickering hearth fire: layered flame sprites + a flickering point light */}
      {Array.from({ length: HEARTH_FLAME_COUNT }, (_, index) => (
        <sprite
          key={index}
          position={HEARTH_POSITION}
          scale={[0.7, 0.9, 1]}
          data-kind="hearth-flame"
          ref={(el) => {
            flameRefs.current[index] = el;
          }}
        >
          <spriteMaterial
            map={flameTexture}
            color={index === 0 ? '#ffcf6b' : '#ff8c3c'}
            transparent
            depthWrite={false}
            opacity={0.4}
          />
        </sprite>
      ))}
      <pointLight
        ref={flickerLightRef}
        position={HEARTH_POSITION}
        color="#ff9c4c"
        intensity={HEARTH_FLICKER_BASE_INTENSITY}
        distance={8}
        decay={2}
      />

      {/* meshStandardMaterial here, not meshToonMaterial like the rest of the
       * room: this specific mesh rendered solid black only in the native
       * Tauri app's WebKit/Metal WebGL renderer (fine in Chromium), even
       * with identical geometry/texture/gradientMap to the working shelf
       * plank and barrels below. Shadows, RoundedBox vs boxGeometry, AO,
       * DOF, and tone-mapping exposure were all ruled out as the cause via
       * native-app testing; swapping just this mesh off meshToonMaterial
       * is the confirmed, working fix for whatever WebKit-specific toon
       * shader issue this large flat mesh was triggering. */}
      <mesh position={[-4, 0.5, -2]} receiveShadow data-kind="bench">
        <boxGeometry args={[10, 1, 3]} />
        <meshStandardMaterial color="#8a5a34" map={benchWoodGrain} />
      </mesh>

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
      <mesh position={[7, 3.5, -5.3]} receiveShadow data-kind="shelf-plank">
        <boxGeometry args={[2, 0.12, 0.5]} />
        <meshToonMaterial color="#6a4527" gradientMap={gradientMap} map={benchWoodGrain} />
      </mesh>
      {SHELF_BOTTLES.map(({ x, height, color }, index) => (
        <mesh key={index} position={[7 + x, 3.56 + height / 2, -5.3]} castShadow data-kind="shelf-bottle">
          <cylinderGeometry args={[0.09, 0.11, height, 10]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      ))}

      {/* Wall sconces flanking the back wall, adding warm fill light points */}
      {SCONCE_POSITIONS.map((position, index) => (
        <group key={index} position={position}>
          <mesh castShadow data-kind="sconce-bracket">
            <boxGeometry args={[0.25, 0.4, 0.25]} />
            <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0, 0.35, 0.1]} data-kind="sconce-flame">
            <coneGeometry args={[0.12, 0.35, 8]} />
            <meshToonMaterial
              color="#3d2b1f"
              gradientMap={gradientMap}
              emissive="#ffb454"
              emissiveIntensity={1.4}
            />
          </mesh>
          <pointLight color="#ffb454" intensity={0.5} distance={5} decay={2} position={[0, 0.35, 0.2]} />
        </group>
      ))}

      {/* Tankards resting on the bench top */}
      {TANKARD_POSITIONS.map((position, index) => (
        <group key={index} position={position}>
          <mesh position={[0, 0.13, 0]} castShadow data-kind="tankard-body">
            <cylinderGeometry args={[0.13, 0.11, 0.26, 12]} />
            <meshToonMaterial color="#9a9488" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0.15, 0.13, 0]} rotation={[0, 0, Math.PI / 2]} data-kind="tankard-handle">
            <torusGeometry args={[0.08, 0.02, 8, 12]} />
            <meshToonMaterial color="#7a7468" gradientMap={gradientMap} />
          </mesh>
        </group>
      ))}

      {/* Adventurer busywork props: map table, whetstone + dagger, coin pouch */}
      <InteractiveProp position={[1, 0.55, -2]} baseScale={[1, 1, 1]}>
        <mesh castShadow receiveShadow data-kind="map-table-top">
          <cylinderGeometry args={[0.7, 0.7, 0.08, 8]} />
          <meshToonMaterial color="#6a4527" gradientMap={gradientMap} map={benchWoodGrain} />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} data-kind="map-scroll">
          <planeGeometry args={[0.5, 0.35]} />
          <meshToonMaterial color="#d9c496" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
          <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
        </mesh>
      </InteractiveProp>

      <InteractiveProp position={[-3.2, 1.05, -1.6]} baseScale={[1, 1, 1]}>
        <mesh castShadow data-kind="whetstone">
          <boxGeometry args={[0.3, 0.08, 0.12]} />
          <meshToonMaterial color="#8a8a86" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0.05, 0.08, 0]} rotation={[0, 0, Math.PI / 6]} data-kind="dagger-blade">
          <boxGeometry args={[0.5, 0.03, 0.05]} />
          <meshToonMaterial color="#c9c9c9" gradientMap={gradientMap} />
        </mesh>
      </InteractiveProp>

      <InteractiveProp position={[0, 1.05, -1.8]} baseScale={[1, 1, 1]}>
        <mesh castShadow data-kind="coin-pouch">
          <sphereGeometry args={[0.14, 10, 10]} />
          <meshToonMaterial color="#7a5230" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0.1, 0.02, 0.08]} data-kind="coin">
          <cylinderGeometry args={[0.04, 0.04, 0.01, 10]} />
          <meshToonMaterial color="#d4af37" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[-0.08, 0.02, 0.05]} data-kind="coin">
          <cylinderGeometry args={[0.04, 0.04, 0.01, 10]} />
          <meshToonMaterial color="#d4af37" gradientMap={gradientMap} />
        </mesh>
      </InteractiveProp>

      <TavernAtmosphere hearthPosition={HEARTH_POSITION} />
    </>
  );
}
