export interface BlueprintDebugPanelProps {
  activeSeed: number | null;
  onGenerate: () => void;
  onExit: () => void;
}

/** Dev-only debug panel for Phase 5a's procedural blueprint POC. Fully
 * controlled: no internal state, so App.tsx owns the generated blueprint
 * and this component just reflects it. */
export function BlueprintDebugPanel({ activeSeed, onGenerate, onExit }: BlueprintDebugPanelProps) {
  return (
    <div className="glass-panel interactive-ui blueprint-debug-panel">
      <button type="button" onClick={onGenerate}>
        Generate Random Room
      </button>
      {activeSeed !== null && (
        <>
          <button type="button" onClick={onExit}>
            Back to Scenes
          </button>
          <p>Seed: {activeSeed}</p>
        </>
      )}
    </div>
  );
}
