import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InviteRelativeForm } from '../InviteRelativeForm';
import { api } from '@/lib/api';
import type { Person } from '@/types';

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

const fakePerson: Person = {
  id: 7,
  first_name: 'Eliza',
  middle_name: null,
  last_name: 'Tester',
  full_name: 'Eliza Tester',
  date_of_birth: '1992-12-02',
  date_of_death: null,
  gender: 'female',
  birthplace: null,
  bio: null,
  is_claimed: false,
  claimed_by_user_id: null,
  created_by_user_id: 1,
  created_at: '',
  updated_at: '',
};

function renderForm(props: Partial<React.ComponentProps<typeof InviteRelativeForm>> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <InviteRelativeForm person={fakePerson} {...props} />
    </QueryClientProvider>,
  );
}

describe('InviteRelativeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refuses to submit without a valid email', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: /send invitation/i }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('POSTs to /invitations with the entered email and shows success', async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { id: 99, email: 'eliza@demo.test' } },
    });

    renderForm();
    await userEvent.type(screen.getByLabelText(/their email/i), 'eliza@demo.test');
    await userEvent.click(screen.getByRole('button', { name: /send invitation/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/invitations', {
        person_id: 7,
        email: 'eliza@demo.test',
      });
    });
    expect(await screen.findByText(/invitation sent to eliza@demo\.test/i)).toBeInTheDocument();
  });

  it('renders the focus person name in the prompt', () => {
    renderForm();
    expect(screen.getByText(/eliza tester/i)).toBeInTheDocument();
  });
});
