import { describe, expect, it } from 'vitest';
import { resolveActiveEffects, type PostFxFlags } from './postFxSelectors';

const ALL_ENABLED: PostFxFlags = {
  bloomEnabled: true,
  dofEnabled: true,
  vignetteEnabled: true,
  aoEnabled: true,
  colorGradeEnabled: true,
  grainEnabled: true,
};

describe('resolveActiveEffects', () => {
  it('activates every effect when all flags are enabled and zoomed out', () => {
    expect(resolveActiveEffects(ALL_ENABLED, false)).toEqual({
      bloom: true,
      dof: true,
      vignette: true,
      ao: true,
      colorGrade: true,
      grain: true,
    });
  });

  it('deactivates depth of field when zoomed in, even though dofEnabled is true', () => {
    const result = resolveActiveEffects(ALL_ENABLED, true);
    expect(result.dof).toBe(false);
  });

  it('leaves every other effect untouched by zoom state', () => {
    const result = resolveActiveEffects(ALL_ENABLED, true);
    expect(result.bloom).toBe(true);
    expect(result.vignette).toBe(true);
    expect(result.ao).toBe(true);
    expect(result.colorGrade).toBe(true);
    expect(result.grain).toBe(true);
  });

  it('keeps depth of field off when zoomed out but dofEnabled is false', () => {
    const flags: PostFxFlags = { ...ALL_ENABLED, dofEnabled: false };
    expect(resolveActiveEffects(flags, false).dof).toBe(false);
  });

  it('passes through each disabled flag as an inactive effect', () => {
    const flags: PostFxFlags = {
      bloomEnabled: false,
      dofEnabled: false,
      vignetteEnabled: false,
      aoEnabled: false,
      colorGradeEnabled: false,
      grainEnabled: false,
    };
    expect(resolveActiveEffects(flags, false)).toEqual({
      bloom: false,
      dof: false,
      vignette: false,
      ao: false,
      colorGrade: false,
      grain: false,
    });
  });
});
