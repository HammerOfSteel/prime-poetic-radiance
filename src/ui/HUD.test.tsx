import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HUD } from './HUD';
import { useSceneStore } from '../state/sceneStore';

describe('HUD', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState());
  });

  it('renders the title and one button per lighting preset', () => {
    render(<HUD />);
    expect(screen.getByText('Magic Fridge')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /morning/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /day/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /eve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /night/i })).toBeInTheDocument();
  });

  it('updates the store when a lighting button is clicked', async () => {
    render(<HUD />);
    await userEvent.click(screen.getByRole('button', { name: /night/i }));
    expect(useSceneStore.getState().lightingPreset).toBe('night');
  });
});
