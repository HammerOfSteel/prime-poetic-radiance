import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Kitchen } from './scene/Kitchen';
import { Fridge } from './scene/Fridge';
import { Lighting } from './scene/Lighting';
import { CanvasErrorBoundary } from './scene/CanvasErrorBoundary';
import { HUD } from './ui/HUD';
import { StepBackButton } from './ui/StepBackButton';
import { useSceneStore } from './state/sceneStore';

function App() {
  const isZoomedIn = useSceneStore((state) => state.isZoomedIn);
  const zoomToFridge = useSceneStore((state) => state.zoomToFridge);

  const cameraPosition: [number, number, number] = isZoomedIn ? [4, 5, 3.5] : [0, 4, 15];
  const cameraTarget: [number, number, number] = isZoomedIn ? [4, 5, -1.85] : [0, 3, 0];

  return (
    <div data-testid="app-root" style={{ width: '100vw', height: '100vh' }}>
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: cameraPosition, fov: 45, near: 0.1, far: 1000 }}
          shadows
          onPointerMissed={() => {
            if (!isZoomedIn) zoomToFridge();
          }}
        >
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

