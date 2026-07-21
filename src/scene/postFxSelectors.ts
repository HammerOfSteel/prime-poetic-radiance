export interface PostFxFlags {
  bloomEnabled: boolean;
  dofEnabled: boolean;
  vignetteEnabled: boolean;
  aoEnabled: boolean;
  colorGradeEnabled: boolean;
  grainEnabled: boolean;
}

export interface ActiveEffects {
  bloom: boolean;
  dof: boolean;
  vignette: boolean;
  ao: boolean;
  colorGrade: boolean;
  grain: boolean;
}

/** Decides which post-processing effects should be mounted right now.
 * Every effect other than Depth of Field is a direct passthrough of its
 * store flag. Depth of Field is additionally gated by `!isZoomedIn`: it
 * must never render while zoomed into the fridge/board, so magnet word
 * tiles stay perfectly legible — this is a hard requirement, not just a
 * default, so it is enforced here regardless of `dofEnabled`. */
export function resolveActiveEffects(flags: PostFxFlags, isZoomedIn: boolean): ActiveEffects {
  return {
    bloom: flags.bloomEnabled,
    dof: flags.dofEnabled && !isZoomedIn,
    vignette: flags.vignetteEnabled,
    ao: flags.aoEnabled,
    colorGrade: flags.colorGradeEnabled,
    grain: flags.grainEnabled,
  };
}
