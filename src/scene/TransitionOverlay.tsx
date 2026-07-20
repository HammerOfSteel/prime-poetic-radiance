export interface TransitionOverlayProps {
  progress: number;
}

export function TransitionOverlay({ progress }: TransitionOverlayProps) {
  return <div className="transition-overlay" style={{ opacity: progress }} />;
}
