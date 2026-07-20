import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepBackButton } from './StepBackButton';
import { useSceneStore } from '../state/sceneStore';

describe('StepBackButton', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
  });

  it('does not render when not zoomed in', () => {
    render(<StepBackButton />);
    expect(screen.queryByRole('button', { name: /step back/i })).not.toBeInTheDocument();
  });

  it('renders and resets the camera when clicked, once zoomed in', async () => {
    useSceneStore.getState().zoomToFridge();
    render(<StepBackButton />);
    const button = screen.getByRole('button', { name: /step back/i });
    await userEvent.click(button);
    expect(useSceneStore.getState().isZoomedIn).toBe(false);
  });
});
