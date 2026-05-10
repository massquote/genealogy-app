import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  createMemoryRouter,
  RouterProvider,
  Outlet,
} from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from '../ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types';

function makeRouter(initial: string) {
  return createMemoryRouter(
    [
      {
        element: <ProtectedRoute />,
        children: [{ path: '/profile', element: <div>Profile content</div> }],
      },
      {
        element: <PublicOnlyRoute />,
        children: [{ path: '/login', element: <div>Login content</div> }],
      },
      { path: '/', element: <Outlet /> },
    ],
    { initialEntries: [initial] },
  );
}

const fakeUser: User = {
  id: 1,
  name: 'Felix',
  email: 'felix@example.test',
  created_at: '2026-01-01T00:00:00Z',
};

describe('Auth route guards', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
  });

  it('ProtectedRoute redirects to /login when unauthenticated', () => {
    render(<RouterProvider router={makeRouter('/profile')} />);
    expect(screen.getByText('Login content')).toBeInTheDocument();
  });

  it('ProtectedRoute renders the outlet when authenticated', () => {
    useAuthStore.setState({ user: fakeUser, token: 'tok-123' });
    render(<RouterProvider router={makeRouter('/profile')} />);
    expect(screen.getByText('Profile content')).toBeInTheDocument();
  });

  it('PublicOnlyRoute bounces authenticated users away from /login', () => {
    useAuthStore.setState({ user: fakeUser, token: 'tok-123' });
    render(<RouterProvider router={makeRouter('/login')} />);
    expect(screen.queryByText('Login content')).not.toBeInTheDocument();
  });
});
