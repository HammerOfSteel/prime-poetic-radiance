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

  return (
    <div className="glass-panel interactive-ui">
      <h1>Magic Fridge</h1>
      <p>Click the fridge to zoom in. Drag words to write poetry.</p>
      <div>
        {LIGHTING_PRESET_NAMES.map((name) => (
          <button key={name} type="button" onClick={() => setLightingPreset(name)}>
            {PRESET_LABELS[name]}
          </button>
        ))}
      </div>
    </div>
  );
}
