import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders the children content', () => {
    render(<StatusBadge>Active</StatusBadge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies the green tone classes when tone=green', () => {
    const { container } = render(<StatusBadge tone="green">OK</StatusBadge>);
    expect(container.firstChild).toHaveClass('text-emerald-700');
  });

  it('applies the amber tone classes when tone=amber', () => {
    const { container } = render(<StatusBadge tone="amber">Soon</StatusBadge>);
    expect(container.firstChild).toHaveClass('text-amber-700');
  });

  it('renders without a dot when dot=false', () => {
    const { container } = render(
      <StatusBadge dot={false}>x</StatusBadge>,
    );
    // Only the text node — no leading colored dot span
    expect(container.firstChild?.childNodes).toHaveLength(1);
  });
});
