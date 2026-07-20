import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import { Kitchen } from './scene/Kitchen';
import { Fridge } from './scene/Fridge';
import { Lighting } from './scene/Lighting';
import { CanvasErrorBoundary } from './scene/CanvasErrorBoundary';
import { TransitionOverlay } from './scene/TransitionOverlay';
import { HUD } from './ui/HUD';
import { StepBackButton } from './ui/StepBackButton';
import { useSceneStore } from './state/sceneStore';

const CAMERA_ZOOMED_IN: [number, number, number] = [4, 5, 3.5];
const CAMERA_ZOOMED_OUT: [number, number, number] = [0, 4, 15];

function CameraRig({
  isZoomedIn,
  onTweenChange,
  onOverlayProgress,
}: {
  isZoomedIn: boolean;
  onTweenChange: (tweening: boolean) => void;
  onOverlayProgress: (progress: number) => void;
}) {
  const { camera } = useThree();
  const overlayTimelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const [x, y, z] = isZoomedIn ? CAMERA_ZOOMED_IN : CAMERA_ZOOMED_OUT;
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
    const overlay = { progress: 0 };
    overlayTimelineRef.current = gsap
      .timeline({ onUpdate: () => onOverlayProgress(overlay.progress) })
      .to(overlay, { progress: 1, duration: 0.25, ease: 'power1.in' })
      .to(overlay, { progress: 1, duration: 0.1 })
      .to(overlay, { progress: 0, duration: 0.25, ease: 'power1.out' });
  }, [camera, isZoomedIn, onTweenChange, onOverlayProgress]);

  return null;
}

function App() {
  const isZoomedIn = useSceneStore((state) => state.isZoomedIn);
  const zoomToFridge = useSceneStore((state) => state.zoomToFridge);
  const [isTweening, setIsTweening] = useState(false);
  const [overlayProgress, setOverlayProgress] = useState(0);

  const cameraTarget: [number, number, number] = isZoomedIn ? [4, 5, -1.85] : [0, 3, 0];

  return (
    <div data-testid="app-root" style={{ width: '100vw', height: '100vh' }}>
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: CAMERA_ZOOMED_OUT, fov: 45, near: 0.1, far: 1000 }}
          shadows
          onPointerMissed={() => {
            if (!isZoomedIn) zoomToFridge();
          }}
        >
          <CameraRig isZoomedIn={isZoomedIn} onTweenChange={setIsTweening} onOverlayProgress={setOverlayProgress} />
          <Lighting />
          <Kitchen />
          <Fridge />
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
      <HUD />
      <StepBackButton />
    </div>
  );
}

export default App;

