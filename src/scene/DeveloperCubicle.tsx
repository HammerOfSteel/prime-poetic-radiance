import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { createToonGradientMap } from './toonGradient';
import { InteractiveProp } from './InteractiveProp';
import { useSceneStore } from '../state/sceneStore';

const TALLY_POSITION: [number, number, number] = [-2.5, 3.6, -4.8];
const VIDEO_CALL_POSITION: [number, number, number] = [-1.4, 3.6, -4.8];
const CALENDAR_POSITION: [number, number, number] = [-0.3, 3.6, -4.8];
const MONITOR_POSITION: [number, number, number] = [-2, 3.6, -4.9];

/** Sterile open-plan cubicle: beige partitions, motivational poster,
 * standing-desk converter, and this room's signature "office life"
 * busywork props (meetings tally, muted video-call, stand-up vignette
 * trigger, PR-review trigger). Mirrors DeveloperHomeOffice.tsx's
 * structure. */
export function DeveloperCubicle() {
  const gradientMap = useMemo(() => createToonGradientMap(), []);
  const cubicleMeetingTally = useSceneStore((state) => state.cubicleMeetingTally);
  const incrementCubicleMeetingTally = useSceneStore((state) => state.incrementCubicleMeetingTally);
  const advanceCubicleStandupLine = useSceneStore((state) => state.advanceCubicleStandupLine);
  const setCubiclePrReviewOpen = useSceneStore((state) => state.setCubiclePrReviewOpen);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshToonMaterial color="#c9c2b0" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[0, 7.5, -6]} receiveShadow>
        <boxGeometry args={[30, 15, 1]} />
        <meshToonMaterial color="#e8e2d4" gradientMap={gradientMap} />
      </mesh>

      <mesh position={[-10, 7.5, 0]} receiveShadow>
        <boxGeometry args={[1, 15, 30]} />
        <meshToonMaterial color="#e8e2d4" gradientMap={gradientMap} />
      </mesh>

      {/* Beige fabric partition walls flanking the desk */}
      <RoundedBox args={[0.15, 3.2, 3]} radius={0.02} smoothness={2} position={[-4.5, 1.6, -3.5]} castShadow receiveShadow>
        <meshToonMaterial color="#d8cfc0" gradientMap={gradientMap} />
      </RoundedBox>
      <RoundedBox args={[0.15, 3.2, 3]} radius={0.02} smoothness={2} position={[0.5, 1.6, -3.5]} castShadow receiveShadow>
        <meshToonMaterial color="#d8cfc0" gradientMap={gradientMap} />
      </RoundedBox>

      {/* Motivational poster */}
      <mesh position={[-2, 5.5, -5.4]}>
        <planeGeometry args={[1.2, 1.6]} />
        <meshToonMaterial color="#7a9ec9" gradientMap={gradientMap} />
      </mesh>

      {/* Desk + standing-desk converter */}
      <RoundedBox args={[5.5, 0.2, 2.2]} radius={0.05} smoothness={4} position={[-2, 3.1, -4]} castShadow receiveShadow>
        <meshToonMaterial color="#b8b0a0" gradientMap={gradientMap} />
      </RoundedBox>
      <RoundedBox args={[0.15, 3, 0.15]} radius={0.02} smoothness={2} position={[-4.3, 1.55, -4.8]} castShadow>
        <meshToonMaterial color="#8a8478" gradientMap={gradientMap} />
      </RoundedBox>
      <RoundedBox args={[0.15, 3, 0.15]} radius={0.02} smoothness={2} position={[0.3, 1.55, -4.8]} castShadow>
        <meshToonMaterial color="#8a8478" gradientMap={gradientMap} />
      </RoundedBox>
      <RoundedBox args={[1.8, 0.5, 1.6]} radius={0.03} smoothness={2} position={[-2, 3.45, -4]} castShadow receiveShadow data-kind="standing-desk-riser">
        <meshToonMaterial color="#9a9488" gradientMap={gradientMap} />
      </RoundedBox>

      {/* Monitor */}
      <RoundedBox args={[1.6, 1.0, 0.08]} radius={0.03} smoothness={4} position={MONITOR_POSITION} castShadow>
        <meshToonMaterial color="#1a1a1a" gradientMap={gradientMap} emissive="#3a6ea8" emissiveIntensity={0.6} />
      </RoundedBox>

      {/* Meetings-today tally: sticky notes, click → increments (pure visual gag) */}
      <InteractiveProp position={TALLY_POSITION} baseScale={[1, 1, 1]} onActivate={incrementCubicleMeetingTally}>
        <mesh castShadow data-kind="tally-sticky-note">
          <boxGeometry args={[0.3, 0.3, 0.02]} />
          <meshToonMaterial color="#fff27a" gradientMap={gradientMap} />
        </mesh>
        {Array.from({ length: Math.min(cubicleMeetingTally, 8) }, (_, index) => (
          <mesh key={index} position={[-0.1 + index * 0.03, 0.1, 0.02]} data-kind="tally-mark">
            <boxGeometry args={[0.015, 0.15, 0.005]} />
            <meshToonMaterial color="#2b2b2b" gradientMap={gradientMap} />
          </mesh>
        ))}
      </InteractiveProp>

      {/* Muted video-call window: click → shake animation (handled by InteractiveProp's bounce) */}
      <InteractiveProp position={VIDEO_CALL_POSITION} baseScale={[1, 1, 1]}>
        <mesh castShadow data-kind="video-call-panel">
          <boxGeometry args={[0.5, 0.35, 0.02]} />
          <meshToonMaterial color="#2b2b2b" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.05, 0.015]} data-kind="video-call-avatar">
          <circleGeometry args={[0.1, 16]} />
          <meshToonMaterial color="#c9975f" gradientMap={gradientMap} />
        </mesh>
      </InteractiveProp>

      {/* Calendar/clock prop -> triggers the stand-up vignette */}
      <InteractiveProp position={CALENDAR_POSITION} baseScale={[1, 1, 1]} onActivate={advanceCubicleStandupLine}>
        <mesh castShadow data-kind="calendar-prop">
          <boxGeometry args={[0.35, 0.35, 0.02]} />
          <meshToonMaterial color="#f5f5f0" gradientMap={gradientMap} />
        </mesh>
      </InteractiveProp>

      {/* Monitor click -> opens the PR-review overlay */}
      <InteractiveProp
        position={[MONITOR_POSITION[0], MONITOR_POSITION[1], MONITOR_POSITION[2] + 0.05]}
        baseScale={[1, 1, 1]}
        onActivate={() => setCubiclePrReviewOpen(true)}
      >
        <mesh data-kind="monitor-click-target">
          <planeGeometry args={[1.6, 1.0]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </InteractiveProp>
    </>
  );
}