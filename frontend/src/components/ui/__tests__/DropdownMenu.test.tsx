import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DropdownMenu, DropdownItem, DropdownDivider } from '../DropdownMenu';

function renderDropdown(props?: { onLogout?: () => void }) {
  const onLogout = props?.onLogout ?? vi.fn();
  return {
    onLogout,
    ...render(
      <MemoryRouter>
        <DropdownMenu trigger={<button type="button">Open menu</button>}>
          <DropdownItem to="/settings">Account settings</DropdownItem>
          <DropdownDivider />
          <DropdownItem onClick={onLogout} tone="danger">
            Sign out
          </DropdownItem>
        </DropdownMenu>
        <div data-testid="outside">outside element</div>
      </MemoryRouter>,
    ),
  };
}

describe('DropdownMenu', () => {
  it('is closed by default and opens on trigger click', async () => {
    renderDropdown();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Account settings' })).toBeInTheDocument();
  });

  it('reflects open state on the trigger via aria-expanded', async () => {
    renderDropdown();
    const trigger = screen.getByRole('button', { name: /open menu/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes when Escape is pressed', async () => {
    renderDropdown();
    await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes when clicking outside the menu', async () => {
    renderDropdown();
    await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('outside'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('fires the onClick of an action item and closes', async () => {
    const { onLogout } = renderDropdown();
    await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
