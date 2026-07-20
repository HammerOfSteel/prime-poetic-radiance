import { useRef } from 'react';
import * as THREE from 'three';
import { Magnet } from './Magnet';
import { SlamButton } from './SlamButton';
import { TesseractButton } from './TesseractButton';
import { SCENES, type SceneId } from '../engine/scenes';
import { useSceneStore } from '../state/sceneStore';

export interface MagnetBoardProps {
  sceneId: SceneId;
  slamButtonPosition: [number, number, number];
  tesseractButtonPosition: [number, number, number];
}

/**
 * Scene-agnostic magnet surface: renders the current scene's magnet layout
 * (from the store, keyed by sceneId), plus its slam/tesseract buttons.
 * `sceneStore.setActiveScene` guarantees a layout exists for `sceneId`
 * before this ever mounts, so no lazy-init effect is needed here.
 */
export function MagnetBoard({ sceneId, slamButtonPosition, tesseractButtonPosition }: MagnetBoardProps) {
  const scene = SCENES[sceneId];
  const layout = useSceneStore((state) => state.magnetLayoutBySceneId[sceneId]) ?? [];
  const updateMagnetPosition = useSceneStore((state) => state.updateMagnetPosition);
  const regenerateMagnetLayout = useSceneStore((state) => state.regenerateMagnetLayout);

  const meshRefs = useRef(new Map<string, THREE.Object3D>());

  function registerMesh(word: string, mesh: THREE.Mesh | null) {
    if (mesh) meshRefs.current.set(word, mesh);
    else meshRefs.current.delete(word);
  }

  return (
    <>
      {layout.map(({ word, index, position }) => (
        <Magnet
          key={`${word}-${index}`}
          id={`magnet-${sceneId}-${index}`}
          word={word}
          initialPosition={position}
          surfaceZ={scene.magnetSurfaceZ}
          bounds={scene.magnetBoardBounds}
          onMeshReady={(mesh) => registerMesh(word, mesh)}
          onPositionChange={(next) => updateMagnetPosition(sceneId, index, next)}
        />
      ))}
      <SlamButton
        position={slamButtonPosition}
        theme={scene.wordTheme}
        getMagnetMesh={(word) => meshRefs.current.get(word)}
      />
      <TesseractButton
        position={tesseractButtonPosition}
        getMagnetMeshes={() => Array.from(meshRefs.current.values())}
        onShuffleComplete={() => regenerateMagnetLayout(sceneId)}
      />
    </>
  );
}
