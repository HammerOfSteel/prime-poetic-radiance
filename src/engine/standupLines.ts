/**
 * Canned stand-up speech-bubble lines cycled by the Developer Cubicle's
 * "calendar/clock" busywork prop vignette (see `todo/phase-8b-developer-
 * cubicle-and-kitchen/todo.md`). Pure data, no dialogue-tree/branching —
 * a simple deterministic rotation through a fixed script, matching this
 * project's "cozy toy, no real simulation" ethos.
 */
export const STANDUP_LINES: string[] = [
  'Yesterday I fixed the flaky test.',
  'Today: PR review + the auth bug.',
  'Blocked on staging access.',
  'No blockers, just vibes.',
];

/** Returns the stand-up line for a given cycle index, wrapping around the
 * fixed script. Extracted as a pure function so the rotation logic is
 * unit-testable without mounting any component. */
export function getStandupLine(index: number): string {
  const wrapped = ((index % STANDUP_LINES.length) + STANDUP_LINES.length) % STANDUP_LINES.length;
  return STANDUP_LINES[wrapped];
}