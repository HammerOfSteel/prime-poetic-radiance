// src/ui/PostFxSettingsPanel.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostFxSettingsPanel } from './PostFxSettingsPanel';
import { usePostFxStore } from '../state/postFxStore';

describe('PostFxSettingsPanel', () => {
  beforeEach(() => {
    usePostFxStore.setState(usePostFxStore.getInitialState());
  });

  it('renders nothing when the panel is closed', () => {
    render(<PostFxSettingsPanel />);
    expect(screen.queryByRole('checkbox', { name: /bloom/i })).not.toBeInTheDocument();
  });

  it('renders a checked checkbox per effect when open, since all default on', () => {
    usePostFxStore.getState().togglePanel();
    render(<PostFxSettingsPanel />);
    for (const label of [/bloom/i, /depth of field/i, /vignette/i, /ambient occlusion/i, /color grade/i, /grain/i]) {
      expect(screen.getByRole('checkbox', { name: label })).toBeChecked();
    }
  });

  it('unchecking a checkbox disables the corresponding store flag', async () => {
    usePostFxStore.getState().togglePanel();
    render(<PostFxSettingsPanel />);
    await userEvent.click(screen.getByRole('checkbox', { name: /bloom/i }));
    expect(usePostFxStore.getState().bloomEnabled).toBe(false);
  });

  it('resets every flag to enabled when "Reset to defaults" is clicked', async () => {
    usePostFxStore.getState().setDofEnabled(false);
    usePostFxStore.getState().setGrainEnabled(false);
    usePostFxStore.getState().togglePanel();
    render(<PostFxSettingsPanel />);

    await userEvent.click(screen.getByRole('button', { name: /reset to defaults/i }));

    const state = usePostFxStore.getState();
    expect(state.dofEnabled).toBe(true);
    expect(state.grainEnabled).toBe(true);
  });
});
