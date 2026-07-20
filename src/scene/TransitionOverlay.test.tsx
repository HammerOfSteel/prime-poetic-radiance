import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { TransitionOverlay } from './TransitionOverlay';

describe('TransitionOverlay', () => {
  it('renders fully transparent at progress 0', () => {
    const { container } = render(<TransitionOverlay progress={0} />);
    const overlay = container.querySelector('.transition-overlay');
    expect(overlay).toHaveStyle({ opacity: '0' });
  });

  it('renders fully opaque at progress 1', () => {
    const { container } = render(<TransitionOverlay progress={1} />);
    const overlay = container.querySelector('.transition-overlay');
    expect(overlay).toHaveStyle({ opacity: '1' });
  });

  it('renders partial opacity mid-transition', () => {
    const { container } = render(<TransitionOverlay progress={0.5} />);
    const overlay = container.querySelector('.transition-overlay');
    expect(overlay).toHaveStyle({ opacity: '0.5' });
  });
});
