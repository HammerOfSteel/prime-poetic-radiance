import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HUD } from './HUD';
import { useSceneStore } from '../state/sceneStore';

describe('HUD', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
  });

  it('renders the title, an auto toggle, and one button per lighting preset', () => {
    render(<HUD />);
    expect(screen.getByText('Magic Fridge')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /auto/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /morning/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /day/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /eve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /night/i })).toBeInTheDocument();
  });

  it('disables the preset buttons while in auto mode (the default)', () => {
    render(<HUD />);
    expect(screen.getByRole('button', { name: /night/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /day/i })).toBeDisabled();
  });

  it('clicking Auto switches to manual mode and enables the preset buttons', async () => {
    render(<HUD />);
    await userEvent.click(screen.getByRole('button', { name: /auto/i }));
    expect(useSceneStore.getState().environmentMode).toBe('manual');
    expect(screen.getByRole('button', { name: /night/i })).not.toBeDisabled();
  });

  it('updates the store when a lighting button is clicked in manual mode', async () => {
    render(<HUD />);
    await userEvent.click(screen.getByRole('button', { name: /auto/i }));
    await userEvent.click(screen.getByRole('button', { name: /night/i }));
    expect(useSceneStore.getState().lightingPreset).toBe('night');
    expect(useSceneStore.getState().environmentMode).toBe('manual');
  });
});
