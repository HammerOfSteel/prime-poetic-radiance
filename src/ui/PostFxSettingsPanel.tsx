import { usePostFxStore } from '../state/postFxStore';

/** Toggleable settings panel for the post-processing effect stack. Opened
 * via PostFxSettingsButton. Every checkbox maps 1:1 to a postFxStore flag;
 * "Color Grade" and "Grain" each control two underlying effects at once
 * (HueSaturation+BrightnessContrast, and ChromaticAberration+Noise,
 * respectively — see PostProcessing.tsx), matching the approved design's
 * one-checkbox-per-row layout. */
export function PostFxSettingsPanel() {
  const isPanelOpen = usePostFxStore((state) => state.isPanelOpen);
  const bloomEnabled = usePostFxStore((state) => state.bloomEnabled);
  const setBloomEnabled = usePostFxStore((state) => state.setBloomEnabled);
  const dofEnabled = usePostFxStore((state) => state.dofEnabled);
  const setDofEnabled = usePostFxStore((state) => state.setDofEnabled);
  const vignetteEnabled = usePostFxStore((state) => state.vignetteEnabled);
  const setVignetteEnabled = usePostFxStore((state) => state.setVignetteEnabled);
  const aoEnabled = usePostFxStore((state) => state.aoEnabled);
  const setAoEnabled = usePostFxStore((state) => state.setAoEnabled);
  const colorGradeEnabled = usePostFxStore((state) => state.colorGradeEnabled);
  const setColorGradeEnabled = usePostFxStore((state) => state.setColorGradeEnabled);
  const grainEnabled = usePostFxStore((state) => state.grainEnabled);
  const setGrainEnabled = usePostFxStore((state) => state.setGrainEnabled);
  const resetToDefaults = usePostFxStore((state) => state.resetToDefaults);

  if (!isPanelOpen) return null;

  return (
    <div className="glass-panel interactive-ui postfx-settings-panel">
      <label>
        <input type="checkbox" checked={bloomEnabled} onChange={(e) => setBloomEnabled(e.target.checked)} />
        Bloom
      </label>
      <label>
        <input type="checkbox" checked={dofEnabled} onChange={(e) => setDofEnabled(e.target.checked)} />
        Depth of Field
      </label>
      <label>
        <input type="checkbox" checked={vignetteEnabled} onChange={(e) => setVignetteEnabled(e.target.checked)} />
        Vignette
      </label>
      <label>
        <input type="checkbox" checked={aoEnabled} onChange={(e) => setAoEnabled(e.target.checked)} />
        Ambient Occlusion
      </label>
      <label>
        <input
          type="checkbox"
          checked={colorGradeEnabled}
          onChange={(e) => setColorGradeEnabled(e.target.checked)}
        />
        Color Grade
      </label>
      <label>
        <input type="checkbox" checked={grainEnabled} onChange={(e) => setGrainEnabled(e.target.checked)} />
        Grain
      </label>
      <button type="button" onClick={resetToDefaults}>
        Reset to defaults
      </button>
    </div>
  );
}
