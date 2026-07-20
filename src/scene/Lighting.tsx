import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import gsapDefault from 'gsap';
import { useThree } from '@react-three/fiber';
import { useSceneStore } from '../state/sceneStore';
import { LIGHTING_PRESETS, type LightingPreset } from '../engine/lightingPresets';

// RectAreaLight requires this to be initialized once for correct rendering (three.js requirement).
RectAreaLightUniformsLib.init();

interface LightRefs {
  ambient: THREE.AmbientLight;
  directional: THREE.DirectionalLight;
  fill: THREE.PointLight;
  fog: THREE.FogExp2;
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
  const lightingPreset = useSceneStore((state) => state.lightingPreset);

  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);
  const windowLightRef = useRef<THREE.RectAreaLight>(null);

  useEffect(() => {
    scene.fog = new THREE.FogExp2(0x1a1a1a, 0.02);
  }, [scene]);

  useEffect(() => {
    windowLightRef.current?.lookAt(-5, 0, 0);
  }, []);

  useEffect(() => {
    if (!ambientRef.current || !directionalRef.current || !fillRef.current || !scene.fog) return;
    applyLightingPreset(
      {
        ambient: ambientRef.current,
        directional: directionalRef.current,
        fill: fillRef.current,
        fog: scene.fog as THREE.FogExp2,
      },
      LIGHTING_PRESETS[lightingPreset],
    );
  }, [lightingPreset, scene]);

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.2} />
      <directionalLight
        ref={directionalRef}
        position={[5, 10, 5]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.001}
      />
      <pointLight ref={fillRef} position={[0, 5, 2]} intensity={0.5} distance={20} />
      <rectAreaLight ref={windowLightRef} position={[-5, 6, -5.3]} color={0xffffff} intensity={2} width={6} height={4} />
    </>
  );
}
