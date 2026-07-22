import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CubicleOverlays } from './CubicleOverlays';
import { useSceneStore } from '../state/sceneStore';

describe('CubicleOverlays', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
  });

  it('renders nothing when the active scene is not the cubicle', () => {
    const { container } = render(<CubicleOverlays />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the meeting tally once it is above zero, on the cubicle scene', () => {
    useSceneStore.getState().setActiveScene('developerCubicle');
    useSceneStore.getState().incrementCubicleMeetingTally();
    render(<CubicleOverlays />);
    expect(screen.getByTestId('cubicle-meeting-tally')).toHaveTextContent('Meetings today: 1');
  });

  it('renders the standup vignette with the current canned line and closes it', () => {
    useSceneStore.getState().setActiveScene('developerCubicle');
    useSceneStore.getState().advanceCubicleStandupLine();
    render(<CubicleOverlays />);
    expect(screen.getByTestId('standup-vignette')).toBeInTheDocument();
  });

  it('renders the PR-review overlay with Approve/Request changes buttons', () => {
    useSceneStore.getState().setActiveScene('developerCubicle');
    useSceneStore.getState().setCubiclePrReviewOpen(true);
    render(<CubicleOverlays />);
    expect(screen.getByTestId('pr-review-overlay')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request changes/i })).toBeInTheDocument();
  });
});