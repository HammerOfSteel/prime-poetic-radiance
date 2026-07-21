import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostFxSettingsButton } from './PostFxSettingsButton';
import { usePostFxStore } from '../state/postFxStore';

describe('PostFxSettingsButton', () => {
  beforeEach(() => {
    usePostFxStore.setState(usePostFxStore.getInitialState());
  });

  it('renders with aria-pressed false when the panel is closed', () => {
    render(<PostFxSettingsButton />);
    const button = screen.getByRole('button', { name: /toy settings/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles the panel open when clicked', async () => {
    render(<PostFxSettingsButton />);
    const button = screen.getByRole('button', { name: /toy settings/i });
    await userEvent.click(button);
    expect(usePostFxStore.getState().isPanelOpen).toBe(true);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles the panel closed again on a second click', async () => {
    render(<PostFxSettingsButton />);
    const button = screen.getByRole('button', { name: /toy settings/i });
    await userEvent.click(button);
    await userEvent.click(button);
    expect(usePostFxStore.getState().isPanelOpen).toBe(false);
  });
});
