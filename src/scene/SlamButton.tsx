import gsap from 'gsap';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { generatePoem } from '../engine/generatePoem';
import { computeSlamLayout, LINE_HEIGHT } from '../engine/slamLayout';
import { type MagnetBoardBounds } from '../engine/magnetSelection';
import { type WordTheme } from '../engine/wordBank';

export interface TriggerPoetrySlamOptions {
  /** Scene theme used to weight which words the generated poem favors. Defaults to 'kitchen'. */
  theme?: WordTheme;
  /**
   * Words placed in the poem band by the *previous* slam (empty on the
   * first slam). Any of these not chosen again this time are animated back
   * down to their original grid slot (via `getHomePosition`) instead of
   * being left stranded in the poem band, where a new poem word could
   * otherwise be placed right on top of them.
   */
  previousPoemWords: string[];
  /** Looks up a word's original, never-reassigned grid slot (see
   * `homeLayoutBySceneId` in sceneStore.ts) — guaranteed to still be empty
   * since no other magnet is ever packed into another's home slot. */
  getHomePosition: (word: string) => [number, number, number] | undefined;
  /** Called with the new poem's word list once this slam's poem is chosen,
   * so callers can remember it as `previousPoemWords` for the next slam. */
  onPoemWordsChange?: (words: string[]) => void;
  /** Called once per word when its post-slam animation (either into the
   * poem band or back home) finishes, with its final settled position, so
   * callers can persist it (avoiding a stale-position snap-back on the next
   * unrelated re-render). */
  onSettled?: (word: string, position: [number, number, number]) => void;
}

export interface SlamButtonProps {
  /** Maps a word to its live magnet mesh, so the animation can target the right object. */
  getMagnetMesh: (word: string) => THREE.Object3D | undefined;
  position: [number, number, number];
  /**
   * Words currently placed as magnets on this scene's board. The poem must
   * be generated from this list (not the full word bank) or most chosen
   * words won't have a matching magnet mesh and will silently be skipped,
   * producing a poem line with only 1-2 words instead of a full sentence.
   */
  availableWords: string[];
  /**
   * The scene's magnet board bounds. The poem line is targeted at the
   * `POEM_BAND_HEIGHT`-tall band reserved at the top of these bounds
   * (see `createMagnetLayout`), which the initial magnet grid never fills,
   * so slammed words land in guaranteed-clear space instead of on top of
   * the already-placed grid.
   */
  bounds: MagnetBoardBounds;
  slamOptions: TriggerPoetrySlamOptions;
}

/**
 * Y coordinate for the first (topmost) line of a slammed poem: near the top
 * edge of `bounds`, inside the `POEM_BAND_HEIGHT`-tall band reserved there
 * (see `createMagnetLayout`), leaving room below for a wrapped second line
 * before it would reach into the initial magnet grid.
 */
export function computeSlamStartY(bounds: MagnetBoardBounds): number {
  return bounds.y[1] - LINE_HEIGHT / 2;
}

export function triggerPoetrySlam(
  getMagnetMesh: SlamButtonProps['getMagnetMesh'],
  availableWords: string[],
  bounds: MagnetBoardBounds,
  options: TriggerPoetrySlamOptions,
): void {
  const { theme = 'kitchen', previousPoemWords, getHomePosition, onPoemWordsChange, onSettled } = options;
  const poemWords = generatePoem(availableWords, { theme });

  // Send home any word the previous slam placed in the poem band that isn't
  // part of this new poem — otherwise it would sit there indefinitely and a
  // newly-slammed word could land right on top of it.
  const wordsToReturn = previousPoemWords.filter((word) => !poemWords.includes(word));
  wordsToReturn.forEach((word, index) => {
    const mesh = getMagnetMesh(word);
    const home = getHomePosition(word);
    if (!mesh || !home) return;
    const [hx, hy, hz] = home;
    const tl = gsap.timeline({ delay: index * 0.15 });
    tl.to(mesh.position, { z: mesh.position.z + 0.5, duration: 0.3, ease: 'power2.out' }, 0)
      .to(mesh.position, { x: hx, y: hy, duration: 0.7, ease: 'power2.inOut' }, 0.3)
      .to(mesh.position, { z: hz, duration: 0.2, ease: 'bounce.out' }, 1.0)
      .call(() => onSettled?.(word, [hx, hy, hz]));
  });

  if (poemWords.length === 0) {
    onPoemWordsChange?.([]);
    return;
  }

  const layout = computeSlamLayout(poemWords, { startY: computeSlamStartY(bounds) + (Math.random() - 0.5) * 0.1 });

  layout.forEach(({ word, x, y }, index) => {
    const mesh = getMagnetMesh(word);
    if (!mesh) return;
    const z = mesh.position.z;
    const tl = gsap.timeline({ delay: index * 0.2 });
    tl.to(mesh.position, { z: z + 0.5, duration: 0.3, ease: 'power2.out' }, 0)
      .to(mesh.rotation, { z: (Math.random() - 0.5) * Math.PI, duration: 0.3 }, 0)
      .to(mesh.position, { x, y, duration: 0.8, ease: 'back.out(1.5)' }, 0.3)
      .to(mesh.rotation, { z: (Math.random() - 0.5) * 0.1, duration: 0.5 }, 0.3)
      .to(mesh.position, { z, duration: 0.2, ease: 'bounce.out' }, 1.1)
      .call(() => onSettled?.(word, [x, y, z]));
  });

  onPoemWordsChange?.(poemWords);
}

export function SlamButton({ getMagnetMesh, position, availableWords, bounds, slamOptions }: SlamButtonProps) {
  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    triggerPoetrySlam(getMagnetMesh, availableWords, bounds, slamOptions);
  }

  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]} castShadow onClick={handleClick} userData={{ isSlamButton: true }}>
      <cylinderGeometry args={[0.25, 0.25, 0.08, 32]} />
      <meshStandardMaterial color="#ff4757" roughness={0.4} />
    </mesh>
  );
}
