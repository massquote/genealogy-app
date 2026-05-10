import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelpPage } from '../HelpPage';

function renderHelp() {
  return render(
    <MemoryRouter>
      <HelpPage />
    </MemoryRouter>,
  );
}

describe('HelpPage', () => {
  it('renders the page heading', () => {
    renderHelp();
    expect(screen.getByRole('heading', { level: 1, name: /help & guide/i })).toBeInTheDocument();
  });

  it('opens the "What is FamilyKnot" section by default', () => {
    renderHelp();
    expect(
      screen.getByText(/collaborative family-tree app/i),
    ).toBeInTheDocument();
  });

  it('reveals the claim flow section content when clicked', async () => {
    renderHelp();
    const trigger = screen.getByRole('button', {
      name: /inviting relatives & the claim flow/i,
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByText(/most distinctive feature/i).length).toBeGreaterThan(0);
  });

  it('shows the troubleshooting section after expand', async () => {
    renderHelp();
    await userEvent.click(
      screen.getByRole('button', { name: /troubleshooting/i }),
    );
    expect(
      screen.getByText(/Sent to 1 device/i),
    ).toBeInTheDocument();
  });
});
