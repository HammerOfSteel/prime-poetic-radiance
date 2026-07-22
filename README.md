# Prime Poetic Radiance

A cozy, low-poly 3D magnetic-poetry desktop toy. Drag word magnets around a
fridge, or hit the Poetry Slam / Tesseract Shuffle buttons for auto-generated
verse. Built with Tauri, React, TypeScript, and React Three Fiber.

## Roadmap & Design Docs

See `docs/superpowers/specs/` for the project roadmap and per-phase design
docs, and `docs/superpowers/plans/` for implementation plans.

See `todo/overview_todo.md` for the "Day in the Life of X" concept
(point-and-click "day in the life" sim rooms — Developer, Adventurer, and
stretch reframes) and `todo/phase-*/todo.md` for its per-phase task lists.

## Development

```bash
npm install
npm run dev       # Vite dev server (browser)
npm run tauri dev # full desktop app via Tauri
```

## Testing

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Project History

The original interaction design was validated in two HTML/Three.js
proofs-of-concept, preserved under `docs/poc-archive/`.
