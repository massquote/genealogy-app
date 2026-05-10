import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from '../Toggle';

describe('Toggle', () => {
  it('renders unchecked by default with proper aria-checked', () => {
    render(<Toggle checked={false} onChange={vi.fn()} ariaLabel="enable thing" />);
    const sw = screen.getByRole('switch', { name: 'enable thing' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
  });

  it('flips aria-checked when checked is true', () => {
    render(<Toggle checked={true} onChange={vi.fn()} ariaLabel="enable thing" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange with the inverted state when clicked', async () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} ariaLabel="enable thing" />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('renders the label and description when provided', () => {
    render(
      <Toggle
        checked={false}
        onChange={vi.fn()}
        label="Email integration"
        description="Use Resend to send invitations"
      />,
    );
    expect(screen.getByText('Email integration')).toBeInTheDocument();
    expect(screen.getByText('Use Resend to send invitations')).toBeInTheDocument();
  });

  it('does not call onChange when disabled', async () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} disabled ariaLabel="x" />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
