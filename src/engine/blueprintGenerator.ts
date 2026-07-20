export type PropType = 'crate' | 'barrel' | 'pillar' | 'rug' | 'pottedPlant' | 'chest';

const PROP_TYPES: PropType[] = ['crate', 'barrel', 'pillar', 'rug', 'pottedPlant', 'chest'];

export interface PlacedProp {
  type: PropType;
  position: [number, number, number];
  rotationY: number;
  scale: number;
}

export interface RoomPalette {
  floorColor: string;
  wallColor: string;
  accentColor: string;
}

export interface RoomBlueprint {
  seed: number;
  width: number;
  depth: number;
  height: number;
  palette: RoomPalette;
  props: PlacedProp[];
}

/** 5 curated palette presets, chosen so generated rooms stay in the cozy
 * toy aesthetic rather than producing clashing random RGB combinations. */
export const ROOM_PALETTES: RoomPalette[] = [
  { floorColor: '#8a5a3b', wallColor: '#f2e3c9', accentColor: '#c96a3e' }, // Warm Stone
  { floorColor: '#4a4a52', wallColor: '#3a3a42', accentColor: '#6a6a72' }, // Cool Cellar
  { floorColor: '#7a5230', wallColor: '#a97a4a', accentColor: '#c98a3e' }, // Autumn Wood
  { floorColor: '#5a6e4a', wallColor: '#7a8e6a', accentColor: '#4a5e3a' }, // Moss Green
  { floorColor: '#8a6a6a', wallColor: '#c9a3a3', accentColor: '#a35a5a' }, // Dusty Rose
];

const WALL_MARGIN = 1.5;

/** Deterministic pseudo-random generator (mulberry32 algorithm). The same
 * seed always produces the same sequence of values in [0, 1). */
export function createSeededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randRange(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}

function randInt(random: () => number, min: number, max: number): number {
  return Math.floor(randRange(random, min, max + 1));
}

/** Generates a fully deterministic RoomBlueprint from a numeric seed: room
 * dimensions, a curated color palette, and 4-8 randomly placed props from
 * the 6-shape prop library (see src/scene/proceduralProps.tsx). */
export function generateRoomBlueprint(seed: number): RoomBlueprint {
  const random = createSeededRandom(seed);

  const width = randRange(random, 8, 16);
  const depth = randRange(random, 8, 16);
  const height = randRange(random, 6, 10);
  const palette = ROOM_PALETTES[randInt(random, 0, ROOM_PALETTES.length - 1)];

  const propCount = randInt(random, 4, 8);
  const props: PlacedProp[] = [];
  for (let i = 0; i < propCount; i += 1) {
    const type = PROP_TYPES[randInt(random, 0, PROP_TYPES.length - 1)];
    const x = randRange(random, -width / 2 + WALL_MARGIN, width / 2 - WALL_MARGIN);
    const z = randRange(random, -depth / 2 + WALL_MARGIN, depth / 2 - WALL_MARGIN);
    const rotationY = randRange(random, 0, Math.PI * 2);
    const scale = randRange(random, 0.8, 1.3);
    props.push({ type, position: [x, 0, z], rotationY, scale });
  }

  return { seed, width, depth, height, palette, props };
}
