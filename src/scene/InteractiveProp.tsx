import { useRef, useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';

/**
 * Builds the gsap timeline for an `InteractiveProp`'s one-shot click
 * "response" animation: a quick squash/bounce scale wiggle. Extracted as a
 * pure function (of the target object + its base scale) so the animation
 * curve itself is unit-testable without mounting any R3F/Three.js
 * scene graph (per Phase 7's "busywork prop" abstraction spec).
 */
export function buildPropBounceTimeline(
  scaleTarget: { x: number; y: number; z: number },
  baseScale: [number, number, number],
): gsap.core.Timeline {
  const [bx, by, bz] = baseScale;
  const tl = gsap.timeline();
  tl.to(scaleTarget, { x: bx * 1.18, y: by * 0.82, z: bz * 1.18, duration: 0.12, ease: 'power2.out' })
    .to(scaleTarget, { x: bx * 0.94, y: by * 1.08, z: bz * 0.94, duration: 0.14, ease: 'power2.inOut' })
    .to(scaleTarget, { x: bx, y: by, z: bz, duration: 0.18, ease: 'elastic.out(1, 0.5)' });
  return tl;
}

export interface InteractivePropProps {
  /** World/local position of the prop's group. */
  position: [number, number, number];
  /** Base (rest) scale of the prop's group, restored after the bounce. */
  baseScale?: [number, number, number];
  /** Called when the prop is clicked, after the bounce animation starts —
   * callers use this to trigger their own flavor animation (steam puff,
   * confetti, etc.) alongside the shared bounce. */
  onActivate?: () => void;
  /** The prop's own geometry/material children. */
  children: React.ReactNode;
}

/**
 * Shared wrapper for "busywork" props (rubber duck, coffee mug, whetstone,
 * etc.): gives every such prop the same hover cursor + emissive highlight
 * affordance (per point-and-click research findings #1/#2 in
 * `todo/overview_todo.md` — always show a clear hover cue, no pixel-hunting)
 * and the same one-shot click "bounce" response (finding #6 — pure juice,
 * no game-state consequence).
 */
export function InteractiveProp({ position, baseScale = [1, 1, 1], onActivate, children }: InteractivePropProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    const group = groupRef.current;
    if (group) buildPropBounceTimeline(group.scale, baseScale);
    onActivate?.();
  }

  return (
    <group
      ref={groupRef}
      position={position}
      scale={baseScale}
      onClick={handleClick}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      userData={{ isInteractiveProp: true, hovered }}
    >
      {children}
    </group>
  );
}