import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import { Kitchen } from './scene/Kitchen';
import { Fridge } from './scene/Fridge';
import { Lighting } from './scene/Lighting';
import { CanvasErrorBoundary } from './scene/CanvasErrorBoundary';
import { HUD } from './ui/HUD';
import { StepBackButton } from './ui/StepBackButton';
import { useSceneStore } from './state/sceneStore';

const CAMERA_ZOOMED_IN: [number, number, number] = [4, 5, 3.5];
const CAMERA_ZOOMED_OUT: [number, number, number] = [0, 4, 15];

function CameraRig({ isZoomedIn }: { isZoomedIn: boolean }) {
  const { camera } = useThree();

  useEffect(() => {
    const [x, y, z] = isZoomedIn ? CAMERA_ZOOMED_IN : CAMERA_ZOOMED_OUT;
    gsap.killTweensOf(camera.position);
    gsap.to(camera.position, { x, y, z, duration: 0.8, ease: 'power2.inOut' });
  }, [camera, isZoomedIn]);

  return null;
}

function App() {
  const isZoomedIn = useSceneStore((state) => state.isZoomedIn);
  const zoomToFridge = useSceneStore((state) => state.zoomToFridge);

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
          <CameraRig isZoomedIn={isZoomedIn} />
          <Lighting />
          <Kitchen />
          <Fridge />
          <OrbitControls
            target={cameraTarget}
            enabled={isZoomedIn}
            minDistance={5}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
        </Canvas>
      </CanvasErrorBoundary>
      <HUD />
      <StepBackButton />
    </div>
  );
}

export default App;

