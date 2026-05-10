import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/layout/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { MyProfilePage } from '@/pages/MyProfilePage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export const router = createBrowserRouter([
  // Public + general layout
  {
    path: '/',
    element: <AppLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },

  // Auth-only routes (redirect away if already signed in)
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },

  // Authenticated app routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/profile', element: <MyProfilePage /> },
          {
            path: '/tree',
            element: (
              <PlaceholderPage title="Family Tree" comingIn="Tree visualization arrives in Session 5." />
            ),
          },
          {
            path: '/invitations',
            element: (
              <PlaceholderPage title="Invitations" comingIn="Invitation workflow arrives in Session 5." />
            ),
          },
        ],
      },
    ],
  },

  // Catch-all 404
  {
    path: '*',
    element: <AppLayout />,
    children: [{ path: '*', element: <NotFoundPage /> }],
  },
]);
