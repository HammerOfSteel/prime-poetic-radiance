import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import { Kitchen } from './scene/Kitchen';
import { Fridge } from './scene/Fridge';
import { TavernRoom } from './scene/TavernRoom';
import { TavernNoticeboard } from './scene/TavernNoticeboard';
import { DungeonRoom } from './scene/DungeonRoom';
import { DungeonTablet } from './scene/DungeonTablet';
import { ProceduralRoom } from './scene/ProceduralRoom';
import { Lighting } from './scene/Lighting';
import { CanvasErrorBoundary } from './scene/CanvasErrorBoundary';
import { TransitionOverlay } from './scene/TransitionOverlay';
import { HUD } from './ui/HUD';
import { StepBackButton } from './ui/StepBackButton';
import { BlueprintDebugPanel } from './ui/BlueprintDebugPanel';
import { useSceneStore } from './state/sceneStore';
import { useEnvironmentSync } from './state/useEnvironmentSync';
import { SCENES, type SceneId } from './engine/scenes';
import { generateRoomBlueprint, type RoomBlueprint } from './engine/blueprintGenerator';

const CAMERA_ZOOMED_OUT: [number, number, number] = [0, 4, 15];
const DEFAULT_ZOOMED_OUT_TARGET: [number, number, number] = [0, 3, 0];

/** Maps each scene id to its room (static environment) and board (magnet
 * surface) component pair. Adding a future scene only requires an entry
 * here, not a restructured conditional. */
const SCENE_COMPONENTS: Record<SceneId, { Room: () => React.JSX.Element; Board: () => React.JSX.Element }> = {
  kitchen: { Room: Kitchen, Board: Fridge },
  tavern: { Room: TavernRoom, Board: TavernNoticeboard },
  dungeon: { Room: DungeonRoom, Board: DungeonTablet },
};

function CameraRig({
  isZoomedIn,
  zoomedInPosition,
  onTweenChange,
  onOverlayProgress,
}: {
  isZoomedIn: boolean;
  zoomedInPosition: [number, number, number];
  onTweenChange: (tweening: boolean) => void;
  onOverlayProgress: (progress: number) => void;
}) {
  const { camera } = useThree();
  const overlayTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const [x, y, z] = isZoomedIn ? zoomedInPosition : CAMERA_ZOOMED_OUT;
    gsap.killTweensOf(camera.position);
    onTweenChange(true);
    gsap.to(camera.position, {
      x,
      y,
      z,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => onTweenChange(false),
    });

    overlayTimelineRef.current?.kill();

    if (!isInitialMount.current) {
      const overlay = { progress: 0 };
      overlayTimelineRef.current = gsap
        .timeline({ onUpdate: () => onOverlayProgress(overlay.progress) })
        .to(overlay, { progress: 1, duration: 0.25, ease: 'power1.in' })
        .to(overlay, { progress: 1, duration: 0.1 })
        .to(overlay, { progress: 0, duration: 0.25, ease: 'power1.out' });
    } else {
      isInitialMount.current = false;
    }
  }, [camera, isZoomedIn, zoomedInPosition, onTweenChange, onOverlayProgress]);

  return null;
}

function App() {
  useEnvironmentSync();
  const activeSceneId = useSceneStore((state) => state.activeSceneId);
  const isZoomedIn = useSceneStore((state) => state.isZoomedIn);
  const zoomIn = useSceneStore((state) => state.zoomIn);
  const [isTweening, setIsTweening] = useState(false);
  const [overlayProgress, setOverlayProgress] = useState(0);
  const [proceduralBlueprint, setProceduralBlueprint] = useState<RoomBlueprint | null>(null);

  const activeScene = SCENES[activeSceneId];
  const cameraTarget = isZoomedIn ? activeScene.cameraTarget : DEFAULT_ZOOMED_OUT_TARGET;
  const { Room: ActiveRoom, Board: ActiveBoard } = SCENE_COMPONENTS[activeSceneId];

  const handleGenerateProceduralRoom = () => {
    const seed = Math.floor(Math.random() * 1e9);
    console.log(`Generated procedural room with seed: ${seed}`);
    setProceduralBlueprint(generateRoomBlueprint(seed));
  };

  const handleExitProceduralRoom = () => {
    setProceduralBlueprint(null);
  };

  return (
    <div data-testid="app-root" style={{ width: '100vw', height: '100vh' }}>
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: CAMERA_ZOOMED_OUT, fov: 45, near: 0.1, far: 1000 }}
          shadows
          onPointerMissed={() => {
            if (!isZoomedIn) zoomIn();
          }}
        >
          <CameraRig
            isZoomedIn={isZoomedIn}
            zoomedInPosition={activeScene.cameraZoomedIn}
            onTweenChange={setIsTweening}
            onOverlayProgress={setOverlayProgress}
          />
          <Lighting />
          {proceduralBlueprint ? (
            <ProceduralRoom blueprint={proceduralBlueprint} />
          ) : (
            <>
              <ActiveRoom />
              <ActiveBoard />
            </>
          )}
          <OrbitControls
            target={cameraTarget}
            enabled={isZoomedIn && !isTweening}
            minDistance={5}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
        </Canvas>
      </CanvasErrorBoundary>
      <TransitionOverlay progress={overlayProgress} />
      {proceduralBlueprint === null && <HUD />}
      <BlueprintDebugPanel
        activeSeed={proceduralBlueprint?.seed ?? null}
        onGenerate={handleGenerateProceduralRoom}
        onExit={handleExitProceduralRoom}
      />
      <StepBackButton />
    </div>
  );
}

export default App;

