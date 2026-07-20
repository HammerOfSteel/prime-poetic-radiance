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
});
