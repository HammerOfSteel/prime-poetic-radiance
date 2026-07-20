import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlueprintDebugPanel } from './BlueprintDebugPanel';

describe('BlueprintDebugPanel', () => {
  it('shows only the generate button when no blueprint is active', () => {
    render(<BlueprintDebugPanel activeSeed={null} onGenerate={() => {}} onExit={() => {}} />);
    expect(screen.getByRole('button', { name: /generate random room/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /back to scenes/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/seed:/i)).not.toBeInTheDocument();
  });

  it('shows the exit button and seed label when a blueprint is active', () => {
    render(<BlueprintDebugPanel activeSeed={12345} onGenerate={() => {}} onExit={() => {}} />);
    expect(screen.getByRole('button', { name: /back to scenes/i })).toBeInTheDocument();
    expect(screen.getByText('Seed: 12345')).toBeInTheDocument();
  });

  it('calls onGenerate when the generate button is clicked', async () => {
    const onGenerate = vi.fn();
    render(<BlueprintDebugPanel activeSeed={null} onGenerate={onGenerate} onExit={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /generate random room/i }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it('calls onExit when the back button is clicked', async () => {
    const onExit = vi.fn();
    render(<BlueprintDebugPanel activeSeed={999} onGenerate={() => {}} onExit={onExit} />);
    await userEvent.click(screen.getByRole('button', { name: /back to scenes/i }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
