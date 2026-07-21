import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsapDefault from 'gsap';
import { useThree } from '@react-three/fiber';
import { useSceneStore } from '../state/sceneStore';
import { LIGHTING_PRESETS, type LightingPreset, type LightingPresetName } from '../engine/lightingPresets';
import { applyEnvironmentModifiers, type Season } from '../engine/environment';
import { SCENES, type SceneId } from '../engine/scenes';

interface LightRefs {
  ambient: THREE.AmbientLight;
  directional: THREE.DirectionalLight;
  fill: THREE.PointLight;
  fog: THREE.FogExp2;
}

/**
 * Looks up the named base preset and layers in season/weather tinting via
 * `applyEnvironmentModifiers`. Pure and unit-testable, mirroring
 * `applyLightingPreset` below.
 */
export function computeTintedLightingPreset(
  name: LightingPresetName,
  season: Season,
  weatherCode: number | null,
): LightingPreset {
  return applyEnvironmentModifiers(LIGHTING_PRESETS[name], season, weatherCode);
}

/**
 * Resolves the lighting preset that should actually be applied for the
 * active scene: the scene's fixed preset if it opts out of the environment
 * system, otherwise the tinted preset from the Auto/Manual lighting state.
 * Pure and unit-testable, mirroring computeTintedLightingPreset above.
 */
export function computeActiveLightingPreset(
  activeSceneId: SceneId,
  lightingPreset: LightingPresetName,
  season: Season,
  weatherCode: number | null,
): LightingPreset {
  const scene = SCENES[activeSceneId];
  if (!scene.usesEnvironmentLighting && scene.fixedLightingPreset) {
    return scene.fixedLightingPreset;
  }
  return computeTintedLightingPreset(lightingPreset, season, weatherCode);
}

/** Pure(ish) tween trigger, extracted so it's unit-testable with a mocked gsap. */
export function applyLightingPreset(
  refs: LightRefs,
  preset: LightingPreset,
  gsapInstance: typeof gsapDefault = gsapDefault,
): void {
  const duration = 1.5;
  gsapInstance.killTweensOf([
    refs.ambient.color,
    refs.directional.color,
    refs.directional,
    refs.fill.color,
    refs.fill,
    refs.fog.color,
  ]);

  const ambientColor = new THREE.Color(preset.ambientColor);
  const directionalColor = new THREE.Color(preset.directionalColor);
  const fillColor = new THREE.Color(preset.fillColor);
  const fogColor = new THREE.Color(preset.fogColor);

  gsapInstance.to(refs.directional.position, { ...preset.directionalPosition, duration });
  gsapInstance.to(refs.ambient.color, { r: ambientColor.r, g: ambientColor.g, b: ambientColor.b, duration });
  gsapInstance.to(refs.directional.color, { r: directionalColor.r, g: directionalColor.g, b: directionalColor.b, duration });
  gsapInstance.to(refs.fill.color, { r: fillColor.r, g: fillColor.g, b: fillColor.b, duration });
  gsapInstance.to(refs.fog.color, { r: fogColor.r, g: fogColor.g, b: fogColor.b, duration });
  gsapInstance.to(refs.directional, { intensity: preset.directionalIntensity, duration });
  gsapInstance.to(refs.fill, { intensity: preset.fillIntensity, duration });
}

export function Lighting() {
  const { scene } = useThree();
  const activeSceneId = useSceneStore((state) => state.activeSceneId);
  const lightingPreset = useSceneStore((state) => state.lightingPreset);
  const season = useSceneStore((state) => state.season);
  const weatherCode = useSceneStore((state) => state.weatherCode);

  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    scene.fog = new THREE.FogExp2(0x1a1a1a, 0.02);
  }, [scene]);

  useEffect(() => {
    if (!ambientRef.current || !directionalRef.current || !fillRef.current || !scene.fog) return;
    applyLightingPreset(
      {
        ambient: ambientRef.current,
        directional: directionalRef.current,
        fill: fillRef.current,
        fog: scene.fog as THREE.FogExp2,
      },
      computeActiveLightingPreset(activeSceneId, lightingPreset, season, weatherCode),
    );
  }, [activeSceneId, lightingPreset, season, weatherCode, scene]);

  return (
    <>
      <ambientLight ref={ambientRef} intensity={1.4} />
      {/* No castShadow here: with the light's tunable position moved close
       * to large rooms (e.g. tavern's `directionalPosition: {x:3,y:4,z:4}`)
       * the fixed ±10 orthographic shadow-camera frustum couldn't cover
       * receiveShadow meshes near its edges (the tavern bench, back wall),
       * which rendered as solid black instead of merely unshadowed.
       * Ambient occlusion from the global post-processing pass already
       * provides contact shadowing, so directional shadows were dropped
       * rather than re-tuned per scene. */}
      <directionalLight
        ref={directionalRef}
        position={[5, 10, 5]}
      />
      <pointLight ref={fillRef} position={[0, 5, 2]} intensity={0.5} distance={20} />
      <pointLight color="#fff3d6" intensity={3} distance={12} position={[-5, 6, -5.3]} />
    </>
  );
}
