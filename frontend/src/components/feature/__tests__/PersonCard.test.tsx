import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PersonCard } from '../PersonCard';
import type { Person } from '@/types';

const basePerson: Person = {
  id: 1,
  first_name: 'Felix',
  middle_name: null,
  last_name: 'Tester',
  full_name: 'Felix Tester',
  date_of_birth: '1990-05-10',
  date_of_death: null,
  gender: 'male',
  birthplace: 'Sydney',
  bio: null,
  is_claimed: true,
  claimed_by_user_id: 1,
  created_by_user_id: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('PersonCard', () => {
  it('renders the full name and birth year', () => {
    renderWithRouter(<PersonCard person={basePerson} />);
    expect(screen.getByText('Felix Tester')).toBeInTheDocument();
    expect(screen.getByText('b. 1990')).toBeInTheDocument();
    expect(screen.getByText('Sydney')).toBeInTheDocument();
  });

  it('shows a Claimed badge for a claimed person', () => {
    renderWithRouter(<PersonCard person={basePerson} />);
    expect(screen.getByText('Claimed')).toBeInTheDocument();
  });

  it('shows an Unclaimed badge when not claimed', () => {
    renderWithRouter(
      <PersonCard person={{ ...basePerson, is_claimed: false, claimed_by_user_id: null }} />,
    );
    expect(screen.getByText('Unclaimed')).toBeInTheDocument();
  });

  it('renders as a link when linkTo is provided', () => {
    renderWithRouter(<PersonCard person={basePerson} linkTo="/people/1" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/people/1');
  });

  it('renders an action slot when given', () => {
    renderWithRouter(
      <PersonCard person={basePerson} action={<button>Invite</button>} />,
    );
    expect(screen.getByRole('button', { name: 'Invite' })).toBeInTheDocument();
  });
});
