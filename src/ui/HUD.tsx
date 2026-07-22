import { LIGHTING_PRESET_NAMES, LightingPresetName } from '../engine/lightingPresets';
import { SCENE_IDS, SCENES } from '../engine/scenes';
import { useSceneStore } from '../state/sceneStore';

const PRESET_LABELS: Record<LightingPresetName, string> = {
  morning: '🌅 Morning',
  day: '☀️ Day',
  evening: '🌇 Eve',
  night: '🌙 Night',
};

export function HUD() {
  const activeSceneId = useSceneStore((state) => state.activeSceneId);
  const setActiveScene = useSceneStore((state) => state.setActiveScene);
  const setLightingPreset = useSceneStore((state) => state.setLightingPreset);
  const environmentMode = useSceneStore((state) => state.environmentMode);
  const setEnvironmentMode = useSceneStore((state) => state.setEnvironmentMode);
  const isAuto = environmentMode === 'auto';
  const activeScene = SCENES[activeSceneId];
  const usesEnvironmentLighting = activeScene.usesEnvironmentLighting;

  return (
    <div className="glass-panel interactive-ui hud">
      <h1>{activeScene.label}</h1>
      <p>Click a scene to zoom in. Drag words to write poetry.</p>
      {activeScene.roleTagline && (
        <p data-testid="role-tagline" className="role-tagline">
          {activeScene.roleTagline}
        </p>
      )}
      <div>
        {SCENE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={activeSceneId === id}
            onClick={() => setActiveScene(id)}
          >
            {SCENES[id].label}
          </button>
        ))}
      </div>
      {usesEnvironmentLighting && (
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
      )}
    </div>
  );
}
