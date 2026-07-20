# Phase 3 — Environment System Design

**Date:** 2026-07-20
**Status:** Approved (assumptions made autonomously; no live user available to answer
clarifying questions — see "Assumptions" below)

## What This Is

Phase 3 makes the kitchen scene's lighting reflect the real world: the actual local
time of day (and, where available, real sunrise/sunset), the current season, and
current weather conditions — with a graceful offline/no-network fallback that still
cycles believably from the system clock alone. This replaces the current
always-manual lighting preset picker with an "Auto" mode (default) plus a manual
override, reusing the existing `LightingPreset` system from Phase 2a rather than
replacing it.

## Assumptions (made without live user input)

Per roadmap guidance and existing code conventions, since no user was available to
answer clarifying questions in this session, the following decisions were made and
should be revisited if they don't match user intent:

1. **Auto is default, manual is override.** An "Auto" toggle is added to the HUD.
   When on (default), the 4 manual preset buttons are disabled/greyed but still
   visible for a quick jump back to manual. Toggling any manual preset button
   switches mode to "manual" automatically.
2. **Geolocation source:** free IP-based geolocation (no API key, no permission
   prompts) rather than browser `navigator.geolocation` (which requires an OS
   permission dialog inside a Tauri webview — worse first-run UX for a toy app).
3. **Weather/sunrise data source:** Open-Meteo (per roadmap), queried with the
   IP-derived lat/long for current weather code and today's sunrise/sunset.
4. **Season affects palette only**, not geometry/props — consistent with the
   "no external asset pipeline" non-goal. It's a subtle tint layered on top of the
   time-of-day preset.
5. **Weather affects lighting only** (intensity/color/fog), not new particle
   effects (no rain/snow VFX) — keeps this phase scoped and fully unit-testable
   without a new rendering subsystem.
6. **Update cadence:** re-sync every 15 minutes and once on app launch. No
   real-time push/websocket.
7. **Offline fallback:** if IP-geolocation or Open-Meteo requests fail or time out
   (5s), fall back to pure system-clock time-of-day banding (existing 4 presets,
   fixed local-hour thresholds) with neutral season/weather (no tint applied).

## Architecture

Following the existing `engine/` (pure, rendering-agnostic, unit-tested) vs.
`scene/` (R3F components) vs. `state/` (Zustand) split:

- **`src/engine/environment.ts`** (new, pure, fully unit-tested):
  - `timeOfDayFromClock(date: Date): LightingPresetName` — existing implicit
    behavior made explicit: hour bands (5–10 morning, 10–17 day, 17–20 evening,
    20–5 night).
  - `timeOfDayFromSunTimes(date: Date, sunrise: Date, sunset: Date): LightingPresetName`
    — refines the above using real sunrise/sunset (morning = sunrise±1.5h, etc.).
  - `seasonFromDate(date: Date, latitude: number): Season` (`'spring'|'summer'|'autumn'|'winter'`)
    — meteorological seasons, flipped for southern hemisphere (`latitude < 0`).
  - `applyEnvironmentModifiers(base: LightingPreset, season: Season, weatherCode: number | null): LightingPreset`
    — pure function returning a new preset: season nudges color temperature/fog
    slightly; a small table maps Open-Meteo WMO weather codes to overcast/clear/
    precipitation buckets, each with its own intensity/desaturation/fog multiplier.
- **`src/services/environmentSync.ts`** (new, the only module doing network I/O):
  - `fetchEnvironmentSnapshot(fetchImpl = fetch): Promise<EnvironmentSnapshot>`
    where `EnvironmentSnapshot = { preset: LightingPresetName; season: Season;
    weatherCode: number | null; source: 'live' | 'fallback' }`.
  - Internally: IP geolocation call → Open-Meteo call (sunrise/sunset + current
    weather) → compose via `engine/environment.ts` functions. Wrapped in a 5s
    timeout and try/catch; on any failure, returns the clock-only fallback
    snapshot (`source: 'fallback'`) instead of throwing, so callers never need
    error-handling branches.
  - Fully testable by injecting a mock `fetch`.
- **`src/state/sceneStore.ts`** (extend): add `environmentMode: 'auto' | 'manual'`,
  `season: Season`, `weatherCode: number | null`, `setEnvironmentMode(mode)`, and
  `applyEnvironmentSnapshot(snapshot)` (sets `lightingPreset`, `season`,
  `weatherCode` together, only when `environmentMode === 'auto'`).
  `setLightingPreset` (existing, called by manual buttons) now also sets
  `environmentMode: 'manual'`.
- **`src/state/useEnvironmentSync.ts`** (new hook): on mount, calls
  `fetchEnvironmentSnapshot`, dispatches `applyEnvironmentSnapshot`, and sets a
  15-minute `setInterval` to repeat. Mounted once near the app root (e.g. in
  `App.tsx`), not inside `Lighting.tsx`, keeping the R3F scene tree free of I/O.
- **`src/scene/Lighting.tsx`** (small change): before calling
  `applyLightingPreset`, run the base `LIGHTING_PRESETS[lightingPreset]` through
  `applyEnvironmentModifiers(base, season, weatherCode)` from the store, so season/
  weather tint applies smoothly through the existing GSAP tween — no changes to
  the tween mechanics themselves.
- **`src/ui/HUD.tsx`** (small change): add an "Auto" toggle button reflecting/
  setting `environmentMode`; disable (not hide) the 4 preset buttons when in auto
  mode.

## Data Flow

1. App mounts → `useEnvironmentSync` fires → `fetchEnvironmentSnapshot()`.
2. Service tries IP geolocation → Open-Meteo (sunrise/sunset + weather code) →
   computes `{ preset, season, weatherCode }` via pure `engine/environment.ts`
   functions. Any failure at any step → clock-only fallback snapshot.
3. Store's `applyEnvironmentSnapshot` updates state only if `environmentMode ===
   'auto'`.
4. `Lighting.tsx` reads `lightingPreset` + `season` + `weatherCode` from the
   store, derives the final tinted preset, and tweens to it exactly as today.
5. User can click a manual preset button anytime → `environmentMode` flips to
   `'manual'`, sync results are ignored (but the interval keeps running quietly
   so toggling back to Auto is instant with fresh data) until the user clicks
   "Auto" again.

## Error Handling

- All network calls wrapped with `AbortController` 5s timeout.
- Service never throws to its caller — always resolves with a snapshot, tagging
  `source: 'fallback'` on any failure (geolocation failure, weather failure,
  timeout, malformed response). This keeps `useEnvironmentSync` free of try/catch.
- No user-facing error UI for this phase (silent fallback is acceptable for a
  cozy toy app); `source` is exposed in the store/console for future debugging
  but not surfaced in the HUD.

## Testing

- `engine/environment.test.ts`: table-driven tests for hour-band boundaries,
  sunrise/sunset-based boundaries, season-by-hemisphere, and the weather-code →
  modifier table (pure, no network, no timers beyond fake dates).
- `services/environmentSync.test.ts`: mock `fetch` for success, geolocation
  failure, weather failure, and timeout paths — assert correct snapshot and
  `source` in each case.
- `state/sceneStore.test.ts` (extend): `applyEnvironmentSnapshot` is a no-op in
  manual mode; `setLightingPreset` flips mode to manual.
- `scene/Lighting.test.tsx` (extend): verify modifiers are applied before the
  tween call (mock `applyEnvironmentModifiers`).
- `ui/HUD.test.tsx` (extend): Auto toggle switches mode; preset buttons disabled
  while auto.

## Non-Goals (this phase)

- No skybox/weather particle VFX (rain, snow, clouds) — palette/lighting only.
- No user-facing settings for geolocation opt-out/manual city entry (future
  phase if needed).
- No caching/persistence of last-known-good snapshot across app restarts —
  each launch re-syncs (or falls back) fresh.
