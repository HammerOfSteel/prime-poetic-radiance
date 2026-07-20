import { LIGHTING_PRESET_NAMES, LightingPresetName } from '../engine/lightingPresets';
import { useSceneStore } from '../state/sceneStore';

const PRESET_LABELS: Record<LightingPresetName, string> = {
  morning: '🌅 Morning',
  day: '☀️ Day',
  evening: '🌇 Eve',
  night: '🌙 Night',
};

export function HUD() {
  const setLightingPreset = useSceneStore((state) => state.setLightingPreset);
  const environmentMode = useSceneStore((state) => state.environmentMode);
  const setEnvironmentMode = useSceneStore((state) => state.setEnvironmentMode);
  const isAuto = environmentMode === 'auto';

  return (
    <div className="glass-panel interactive-ui hud">
      <h1>Magic Fridge</h1>
      <p>Click the fridge to zoom in. Drag words to write poetry.</p>
      <div>
        <button
          type="button"
          aria-pressed={isAuto}
          onClick={() => setEnvironmentMode(isAuto ? 'manual' : 'auto')}
        >
          {isAuto ? '🌐 Auto' : '✋ Manual'}
        </button>
        {LIGHTING_PRESET_NAMES.map((name) => (
          <button key={name} type="button" disabled={isAuto} onClick={() => setLightingPreset(name)}>
            {PRESET_LABELS[name]}
          </button>
        ))}
      </div>
    </div>
  );
}
