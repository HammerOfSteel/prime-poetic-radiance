import { usePostFxStore } from '../state/postFxStore';

/** Small always-visible fixed button, bottom-right corner, that opens the
 * post-fx settings panel. Uses a toy/gear emoji to match the playful tone
 * the user asked for ("something fun as an asset"). */
export function PostFxSettingsButton() {
  const isPanelOpen = usePostFxStore((state) => state.isPanelOpen);
  const togglePanel = usePostFxStore((state) => state.togglePanel);

  return (
    <button
      type="button"
      className="glass-panel interactive-ui postfx-settings-button"
      aria-pressed={isPanelOpen}
      onClick={togglePanel}
    >
      <span aria-hidden="true">🧸</span>
      <span className="visually-hidden">Toy Settings</span>
    </button>
  );
}
