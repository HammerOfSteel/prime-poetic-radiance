import { ReactElement } from 'react';
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  N8AO,
  HueSaturation,
  BrightnessContrast,
  ChromaticAberration,
  Noise,
} from '@react-three/postprocessing';
import { useSceneStore } from '../state/sceneStore';
import { usePostFxStore } from '../state/postFxStore';
import { resolveActiveEffects } from './postFxSelectors';

/** World-space distance from the zoomed-out camera (`CAMERA_ZOOMED_OUT` in
 * App.tsx, [0, 4, 15]) to its look-at target (`DEFAULT_ZOOMED_OUT_TARGET`,
 * [0, 3, 0]) — approximately 15 units. Depth of Field's in-focus band is
 * centered here so the room/fridge stay sharp while the near and far
 * edges soften, producing the tilt-shift "toy diorama" look. */
const DOF_WORLD_FOCUS_DISTANCE = 15;
/** Width (in world units) of the in-focus band around the focus distance
 * above. Tuned during visual QA (Task 9) — wide enough that the whole
 * fridge/board reads sharp, narrow enough that the blur is still visible
 * at the floor/ceiling edges of the zoomed-out view. */
const DOF_WORLD_FOCUS_RANGE = 8;

/** Renders the app-wide post-processing stack: bloom, depth of field
 * (zoomed-out only), vignette, ambient occlusion, color grading, and
 * chromatic aberration + grain. Mounted once inside <Canvas>, after all
 * scene content, so it composites the fully-rendered frame. Every effect
 * is individually toggleable via `postFxStore` (see the settings panel in
 * PostFxSettingsPanel.tsx); intensities are constant across all lighting
 * presets by design. */
export function PostProcessing() {
  const isZoomedIn = useSceneStore((state) => state.isZoomedIn);
  const bloomEnabled = usePostFxStore((state) => state.bloomEnabled);
  const dofEnabled = usePostFxStore((state) => state.dofEnabled);
  const vignetteEnabled = usePostFxStore((state) => state.vignetteEnabled);
  const aoEnabled = usePostFxStore((state) => state.aoEnabled);
  const colorGradeEnabled = usePostFxStore((state) => state.colorGradeEnabled);
  const grainEnabled = usePostFxStore((state) => state.grainEnabled);

  const active = resolveActiveEffects(
    { bloomEnabled, dofEnabled, vignetteEnabled, aoEnabled, colorGradeEnabled, grainEnabled },
    isZoomedIn,
  );

  const effects: ReactElement[] = [];

  if (active.ao) {
    effects.push(
      <N8AO key="ao" aoRadius={2} distanceFalloff={1} intensity={1} quality="medium" />,
    );
  }

  if (active.bloom) {
    effects.push(
      <Bloom key="bloom" luminanceThreshold={0.6} luminanceSmoothing={0.3} intensity={0.8} mipmapBlur />,
    );
  }

  if (active.dof) {
    effects.push(
      <DepthOfField
        key="dof"
        worldFocusDistance={DOF_WORLD_FOCUS_DISTANCE}
        worldFocusRange={DOF_WORLD_FOCUS_RANGE}
        bokehScale={3}
      />,
    );
  }

  if (active.colorGrade) {
    effects.push(
      <HueSaturation key="hue-saturation" saturation={0.15} />,
      <BrightnessContrast key="brightness-contrast" brightness={0} contrast={0.08} />,
    );
  }

  if (active.grain) {
    effects.push(
      <ChromaticAberration key="chromatic-aberration" offset={[0.0006, 0.0006]} />,
      <Noise key="noise" opacity={0.035} premultiply />,
    );
  }

  if (active.vignette) {
    effects.push(
      <Vignette key="vignette" darkness={0.5} offset={0.3} />,
    );
  }

  return (
    <EffectComposer enableNormalPass={false}>
      {effects}
    </EffectComposer>
  );
}
