import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';
import { createGrainTexture, createWoodGrainTexture, createSkyGradientTexture, createSeededRng } from './proceduralTextures';
import { useSceneStore } from '../state/sceneStore';
import { LIGHTING_PRESETS } from '../engine/lightingPresets';

const NIGHT_STAR_COUNT = 15;
const NIGHT_STAR_X_RANGE: [number, number] = [-7.6, -2.4];
const NIGHT_STAR_Y_RANGE: [number, number] = [4.2, 7.6];

export function Kitchen() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const wallGrain = useMemo(() => createGrainTexture({ repeat: [6, 3] }), []);
  const floorWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [8, 8] }), []);
  const counterWoodGrain = useMemo(() => createWoodGrainTexture({ repeat: [4, 1] }), []);

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
