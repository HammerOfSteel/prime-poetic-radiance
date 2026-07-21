import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';
import { createGrainTexture, createWoodGrainTexture, createSkyGradientTexture, createSeededRng } from './proceduralTextures';
import { useSceneStore } from '../state/sceneStore';
import { LIGHTING_PRESETS } from '../engine/lightingPresets';

const NIGHT_STAR_COUNT = 15;
const NIGHT_STAR_X_RANGE: [number, number] = [-7.6, -2.4];
const NIGHT_STAR_Y_RANGE: [number, number] = [4.2, 7.6];

const STRING_LIGHT_COUNT = 9;
const STRING_LIGHT_X_RANGE: [number, number] = [-8, 6];
const STRING_LIGHT_TOP_Y = 12.6;
const STRING_LIGHT_SAG = 1.1;
const STRING_LIGHT_Z = -5.35;

export function Kitchen() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const wallGrain = useMemo(() => createGrainTexture({ repeat: [6, 3] }), []);
  const floorWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [8, 8] }), []);
  const counterWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [4, 1] }), []);
  const shelfWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [2, 1] }), []);

  const lightingPreset = useSceneStore((state) => state.lightingPreset);
  const skyTexture = useMemo(() => {
    const preset = LIGHTING_PRESETS[lightingPreset];
    return createSkyGradientTexture(preset.fogColor, preset.ambientColor);
  }, [lightingPreset]);

  const nightStarPositions = useMemo<[number, number, number][]>(() => {
    const rng = createSeededRng(99);
    const [minX, maxX] = NIGHT_STAR_X_RANGE;
    const [minY, maxY] = NIGHT_STAR_Y_RANGE;
    return Array.from({ length: NIGHT_STAR_COUNT }, () => {
      const x = minX + rng() * (maxX - minX);
      const y = minY + rng() * (maxY - minY);
      return [x, y, -5.35] as [number, number, number];
    });
  }, []);

  const stringLightPositions = useMemo<[number, number, number][]>(() => {
    const [minX, maxX] = STRING_LIGHT_X_RANGE;
    return Array.from({ length: STRING_LIGHT_COUNT }, (_, i) => {
      const t = i / (STRING_LIGHT_COUNT - 1);
      const x = minX + t * (maxX - minX);
      const sag = STRING_LIGHT_SAG * (1 - (2 * t - 1) ** 2);
      const y = STRING_LIGHT_TOP_Y - sag;
      return [x, y, STRING_LIGHT_Z] as [number, number, number];
    });
  }, []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshToonMaterial color="#8a5a3b" gradientMap={gradientMap} map={floorWoodGrain} />
      </mesh>

      <mesh position={[0, 7.5, -6]} receiveShadow>
        <boxGeometry args={[30, 15, 1]} />
        <meshToonMaterial color="#f2e3c9" gradientMap={gradientMap} map={wallGrain} />
      </mesh>

      <mesh position={[-10, 7.5, 0]} receiveShadow>
        <boxGeometry args={[1, 15, 30]} />
        <meshToonMaterial color="#f2e3c9" gradientMap={gradientMap} map={wallGrain} />
      </mesh>

      <mesh position={[-5, 6, -5.4]}>
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial map={skyTexture} />
      </mesh>

      {lightingPreset === 'night' &&
        nightStarPositions.map((position, index) => (
          <mesh key={index} position={position} data-kind="night-star">
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}

      {/* Curtains flanking the window */}
      <RoundedBox
        args={[0.6, 4.4, 0.15]}
        radius={0.2}
        smoothness={4}
        position={[-8.4, 6, -5.3]}
        castShadow
        data-kind="curtain"
      >
        <meshToonMaterial color="#a8523a" gradientMap={gradientMap} />
      </RoundedBox>
      <RoundedBox
        args={[0.6, 4.4, 0.15]}
        radius={0.2}
        smoothness={4}
        position={[-1.6, 6, -5.3]}
        castShadow
        data-kind="curtain"
      >
        <meshToonMaterial color="#a8523a" gradientMap={gradientMap} />
      </RoundedBox>

      {/* Wall shelf with jars and books, mounted above the fridge */}
      <RoundedBox
        args={[2.4, 0.15, 0.7]}
        radius={0.05}
        smoothness={4}
        position={[4, 8.6, -5.3]}
        castShadow
        receiveShadow
      >
        <meshToonMaterial color="#c9975f" gradientMap={gradientMap} map={shelfWoodGrain} />
      </RoundedBox>
      <mesh position={[3.5, 8.9, -5.2]} castShadow data-kind="shelf-jar">
        <cylinderGeometry args={[0.18, 0.18, 0.5, 12]} />
        <meshToonMaterial color="#dce8e0" gradientMap={gradientMap} />
      </mesh>
      <mesh position={[4.5, 8.9, -5.2]} castShadow data-kind="shelf-jar">
        <cylinderGeometry args={[0.18, 0.18, 0.5, 12]} />
        <meshToonMaterial color="#dce8e0" gradientMap={gradientMap} />
      </mesh>
      <RoundedBox
        args={[0.5, 0.12, 0.35]}
        radius={0.02}
        smoothness={2}
        position={[4.1, 8.74, -5.35]}
        castShadow
        data-kind="shelf-book"
      >
        <meshToonMaterial color="#7a3b3b" gradientMap={gradientMap} />
      </RoundedBox>
      <RoundedBox
        args={[0.5, 0.12, 0.35]}
        radius={0.02}
        smoothness={2}
        position={[4.1, 8.86, -5.35]}
        castShadow
        data-kind="shelf-book"
      >
        <meshToonMaterial color="#3b5a7a" gradientMap={gradientMap} />
      </RoundedBox>
      <RoundedBox
        args={[0.5, 0.12, 0.35]}
        radius={0.02}
        smoothness={2}
        position={[4.1, 8.98, -5.35]}
        castShadow
        data-kind="shelf-book"
      >
        <meshToonMaterial color="#5a7a3b" gradientMap={gradientMap} />
      </RoundedBox>

      {/* Pendant lamp above the counter */}
      <mesh position={[-4, 7.15, -3]}>
        <cylinderGeometry args={[0.03, 0.03, 3.7, 8]} />
        <meshToonMaterial color="#3d2b1f" gradientMap={gradientMap} />
      </mesh>
      <mesh position={[-4, 5.3, -3]} data-kind="pendant-bulb">
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshToonMaterial color="#3d2b1f" gradientMap={gradientMap} emissive="#ffdca0" emissiveIntensity={1.5} />
      </mesh>
      <pointLight position={[-4, 5.3, -3]} color="#ffdca0" intensity={0.6} distance={6} decay={2} />

      {/* String lights along the back wall */}
      {stringLightPositions.map((position, index) => (
        <mesh key={index} position={position} data-kind="string-light">
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshToonMaterial color="#3d2b1f" gradientMap={gradientMap} emissive="#ffd97a" emissiveIntensity={1.2} />
        </mesh>
      ))}

      {/* Braided rug in the open floor area in front of the counter/fridge */}
      <RoundedBox
        args={[5, 0.06, 3.4]}
        radius={0.15}
        smoothness={4}
        position={[0, 0.03, 1]}
        receiveShadow
        data-kind="rug-layer"
      >
        <meshToonMaterial color="#b5502e" gradientMap={gradientMap} />
      </RoundedBox>
      <RoundedBox
        args={[4.2, 0.08, 2.6]}
        radius={0.15}
        smoothness={4}
        position={[0, 0.05, 1]}
        receiveShadow
        data-kind="rug-layer"
      >
        <meshToonMaterial color="#e8c9a0" gradientMap={gradientMap} />
      </RoundedBox>
      <RoundedBox
        args={[3.2, 0.1, 1.8]}
        radius={0.15}
        smoothness={4}
        position={[0, 0.07, 1]}
        receiveShadow
        data-kind="rug-layer"
      >
        <meshToonMaterial color="#7a9e5a" gradientMap={gradientMap} />
      </RoundedBox>

      <RoundedBox args={[12, 3, 3]} radius={0.1} smoothness={4} position={[-4, 1.5, -4]} castShadow receiveShadow>
        <meshToonMaterial color="#c96a3e" gradientMap={gradientMap} map={counterWoodGrain} />
      </RoundedBox>

      <RoundedBox args={[12.2, 0.2, 3.2]} radius={0.06} smoothness={4} position={[-4, 3.1, -4]} castShadow receiveShadow>
        <meshToonMaterial color="#2b1d14" gradientMap={gradientMap} />
      </RoundedBox>

      <mesh position={[-2, 3.4, -3.5]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.4, 16]} />
        <meshToonMaterial color="#e8543f" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-7, 3.5, -4]} castShadow>
        <cylinderGeometry args={[0.4, 0.3, 0.6, 16]} />
        <meshToonMaterial color="#cd6133" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-7, 4.2, -4]} castShadow>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshToonMaterial color="#7a9e5a" gradientMap={gradientMap} />
      </mesh>
    </>
  );
}
