import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { Sparkles } from '@react-three/drei';
import { createSoftCircleTexture } from './proceduralTextures';
import type { LightingPresetName } from '../engine/lightingPresets';

export interface KitchenAtmosphereProps {
  lightingPreset: LightingPresetName;
  kettlePosition: [number, number, number];
}

const STEAM_PARTICLE_COUNT = 5;
const STEAM_LOOP_DURATION = 2.6;
const STEAM_RISE_HEIGHT = 1.4;

/**
 * Ambient dust motes, kettle steam, and (evening/night-only) fireflies for
 * the kitchen scene. Kept in its own file/component so Kitchen.tsx's
 * room-prop JSX doesn't also have to carry all the particle/animation
 * logic — mounted as a plain sibling inside Kitchen.tsx's fragment.
 *
 * Steam is animated via gsap timelines directly on each sprite's
 * position/scale/material.opacity, matching this project's existing
 * animation pattern (see SlamButton.tsx) rather than introducing a new
 * useFrame-based particle system.
 */
export function KitchenAtmosphere({ lightingPreset, kettlePosition }: KitchenAtmosphereProps) {
  const steamTexture = useMemo(() => createSoftCircleTexture(), []);
  const steamRefs = useRef<(THREE.Sprite | null)[]>([]);

  useEffect(() => {
    const [kx, ky, kz] = kettlePosition;
    const timelines = steamRefs.current.map((sprite, index) => {
      if (!sprite) return null;
      const material = sprite.material as THREE.SpriteMaterial;
      const drift = index % 2 === 0 ? 0.3 : -0.3;
      const delay = (index / STEAM_PARTICLE_COUNT) * STEAM_LOOP_DURATION;

      const tl = gsap.timeline({ repeat: -1, delay });
      tl.set(sprite.position, { x: kx, y: ky, z: kz })
        .set(sprite.scale, { x: 0.2, y: 0.2, z: 1 })
        .set(material, { opacity: 0 })
        .to(material, { opacity: 0.35, duration: STEAM_LOOP_DURATION * 0.2, ease: 'sine.out' }, 0)
        .to(
          sprite.position,
          { x: kx + drift, y: ky + STEAM_RISE_HEIGHT, duration: STEAM_LOOP_DURATION, ease: 'sine.inOut' },
          0,
        )
        .to(sprite.scale, { x: 0.6, y: 0.6, duration: STEAM_LOOP_DURATION, ease: 'sine.out' }, 0)
        .to(material, { opacity: 0, duration: STEAM_LOOP_DURATION * 0.3, ease: 'sine.in' }, STEAM_LOOP_DURATION * 0.7);
      return tl;
    });

    return () => {
      timelines.forEach((tl) => tl?.kill());
    };
  }, [kettlePosition]);

  const showFireflies = lightingPreset === 'evening' || lightingPreset === 'night';

  return (
    <>
      <Sparkles
        count={25}
        scale={[3, 3, 2]}
        size={2}
        speed={0.15}
        color="#fff3d6"
        opacity={0.35}
        position={[-5, 5, -3]}
      />
      {showFireflies && (
        <Sparkles
          count={12}
          scale={[4, 2, 3]}
          size={3}
          speed={0.3}
          color="#ffd97a"
          opacity={0.6}
          position={[-7, 4.5, -3]}
        />
      )}
      {Array.from({ length: STEAM_PARTICLE_COUNT }, (_, index) => (
        <sprite
          key={index}
          ref={(el) => {
            steamRefs.current[index] = el;
          }}
        >
          <spriteMaterial map={steamTexture} transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </>
  );
}
