import { useSceneStore } from '../state/sceneStore';

export function StepBackButton() {
  const isZoomedIn = useSceneStore((state) => state.isZoomedIn);
  const resetCamera = useSceneStore((state) => state.resetCamera);

  if (!isZoomedIn) return null;

  return (
    <button type="button" className="glass-panel interactive-ui" onClick={resetCamera}>
      Step Back
    </button>
  );
}
