import { useSceneStore } from '../state/sceneStore';
import { getStandupLine } from '../engine/standupLines';

/**
 * DOM overlay UI for the Developer Cubicle's two set-piece interactions:
 * the stand-up speech-bubble vignette (triggered by the calendar prop) and
 * the mock PR-review panel (triggered by clicking the monitor). Both are
 * pure flavor — no real logic, no persisted outcome — styled consistently
 * with the existing `glass-panel interactive-ui` HUD chrome.
 */
export function CubicleOverlays() {
  const activeSceneId = useSceneStore((state) => state.activeSceneId);
  const cubicleMeetingTally = useSceneStore((state) => state.cubicleMeetingTally);
  const cubicleStandupLineIndex = useSceneStore((state) => state.cubicleStandupLineIndex);
  const closeCubicleStandup = useSceneStore((state) => state.closeCubicleStandup);
  const cubiclePrReviewOpen = useSceneStore((state) => state.cubiclePrReviewOpen);
  const setCubiclePrReviewOpen = useSceneStore((state) => state.setCubiclePrReviewOpen);

  if (activeSceneId !== 'developerCubicle') return null;

  return (
    <>
      {cubicleMeetingTally > 0 && (
        <div className="glass-panel interactive-ui cubicle-meeting-tally" data-testid="cubicle-meeting-tally">
          Meetings today: {cubicleMeetingTally}
        </div>
      )}

      {cubicleStandupLineIndex !== null && (
        <div className="glass-panel interactive-ui standup-vignette" data-testid="standup-vignette">
          <p>{getStandupLine(cubicleStandupLineIndex)}</p>
          <button type="button" onClick={closeCubicleStandup}>
            Close
          </button>
        </div>
      )}

      {cubiclePrReviewOpen && (
        <div className="glass-panel interactive-ui pr-review-overlay" data-testid="pr-review-overlay">
          <p>Mock PR #42: fix flaky auth test</p>
          <button type="button" onClick={() => setCubiclePrReviewOpen(false)}>
            Approve
          </button>
          <button type="button" onClick={() => setCubiclePrReviewOpen(false)}>
            Request changes
          </button>
        </div>
      )}
    </>
  );
}