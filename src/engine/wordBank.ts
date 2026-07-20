export const WORDS: string[] = [
  'the', 'a', 'is', 'of', 'and', 'to', 'in', 'you', 'I', 'it',
  'that', 'was', 'for', 'on', 'are', 'with', 'as', 'my', 'his', 'they',
  'hot', 'cold', 'dog', 'cat', 'love', 'hate', 'magic', 'fridge', 'midnight', 'snack',
  'dream', 'sleep', 'dance', 'whisper', 'shadow', 'light', 'coffee', 'always', 'never', 'why',
  'stars', 'kitchen', 'ghost', 'breathe', 'slow', 'fast', 'beautiful', 'broken', 'time', 'machine',
];

export type WordCategory = 'noun' | 'verb' | 'adj';

export const CATEGORIES: Record<WordCategory, string[]> = {
  noun: ['dog', 'cat', 'magic', 'fridge', 'snack', 'dream', 'shadow', 'light', 'coffee', 'stars', 'kitchen', 'ghost', 'time', 'machine'],
  verb: ['love', 'hate', 'sleep', 'dance', 'whisper', 'breathe'],
  adj: ['hot', 'cold', 'midnight', 'slow', 'fast', 'beautiful', 'broken'],
};
