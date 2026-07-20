import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders the canvas container and the HUD title', () => {
    render(<App />);
    expect(screen.getByTestId('app-root')).toBeInTheDocument();
    expect(screen.getByText('Magic Fridge')).toBeInTheDocument();
  });

  it('switches rendered scene labels are present after clicking the tavern button', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /tavern noticeboard/i }));
    // The HUD re-renders with the tavern button now marked active.
    expect(screen.getByRole('button', { name: /tavern noticeboard/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches to the dungeon scene and marks its button active', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /dungeon tablet/i }));
    expect(screen.getByRole('button', { name: /dungeon tablet/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('generates a procedural room, hides the normal HUD, and returns via Back to Scenes', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /generate random room/i }));
    expect(screen.getByText(/seed:/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /kitchen fridge/i })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /back to scenes/i }));
    expect(screen.getByRole('button', { name: /kitchen fridge/i })).toBeInTheDocument();
  });
});
