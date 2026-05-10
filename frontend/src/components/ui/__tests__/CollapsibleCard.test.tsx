import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollapsibleCard } from '../CollapsibleCard';
import { StatusBadge } from '../StatusBadge';

describe('CollapsibleCard', () => {
  it('renders collapsed by default and shows the subtitle', () => {
    render(
      <CollapsibleCard title="Email" subtitle="Not configured">
        <div>Inner panel</div>
      </CollapsibleCard>,
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Not configured')).toBeInTheDocument();
    expect(screen.queryByText('Inner panel')).not.toBeInTheDocument();
  });

  it('aria-expanded on the trigger flips when toggled', async () => {
    render(
      <CollapsibleCard title="Email">
        <div>Inner panel</div>
      </CollapsibleCard>,
    );
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Inner panel')).toBeInTheDocument();
  });

  it('respects defaultOpen=true', () => {
    render(
      <CollapsibleCard title="Email" defaultOpen>
        <div>Inner panel</div>
      </CollapsibleCard>,
    );
    expect(screen.getByText('Inner panel')).toBeInTheDocument();
  });

  it('renders the status slot in the header', () => {
    render(
      <CollapsibleCard
        title="Email"
        status={<StatusBadge tone="green">Active</StatusBadge>}
      >
        <div>Inner</div>
      </CollapsibleCard>,
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('supports controlled mode via open + onOpenChange', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CollapsibleCard title="Email" open={false} onOpenChange={onChange}>
        <div>Inner</div>
      </CollapsibleCard>,
    );
    expect(screen.queryByText('Inner')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(true);

    // Parent flips the prop
    rerender(
      <CollapsibleCard title="Email" open={true} onOpenChange={onChange}>
        <div>Inner</div>
      </CollapsibleCard>,
    );
    expect(screen.getByText('Inner')).toBeInTheDocument();
  });

  it('does not propagate clicks from the status slot when stopped', async () => {
    render(
      <CollapsibleCard
        title="Email"
        status={
          <span onClick={(e) => e.stopPropagation()}>
            <button type="button">Inner action</button>
          </span>
        }
      >
        <div>Panel</div>
      </CollapsibleCard>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Inner action' }));
    // The card stayed collapsed because we stopped propagation
    expect(screen.queryByText('Panel')).not.toBeInTheDocument();
  });
});
