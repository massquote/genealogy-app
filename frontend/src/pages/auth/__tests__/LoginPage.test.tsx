import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => {
  return {
    api: {
      post: vi.fn(),
      get: vi.fn(),
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    },
  };
});

function renderLogin() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '/profile', element: <div>Profile</div> },
    ],
    { initialEntries: ['/login'] },
  );
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
    vi.clearAllMocks();
  });

  it('shows a validation error when email is missing', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it('calls the API and redirects on success', async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        user: { id: 1, name: 'Felix', email: 'felix@example.test', created_at: '' },
        token: 'tok-xyz',
        token_type: 'Bearer',
      },
    });

    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'felix@example.test');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBe('tok-xyz');
    });
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('shows server-side validation errors from a 422', async () => {
    (api.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 422,
        data: { message: 'Invalid', errors: { email: ['These credentials do not match.'] } },
      },
    });

    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.test');
    await userEvent.type(screen.getByLabelText(/password/i), 'badpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/credentials do not match/i)).toBeInTheDocument();
  });
});
