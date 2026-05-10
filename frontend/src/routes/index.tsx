import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/layout/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { MyProfilePage } from '@/pages/MyProfilePage';
import { EditProfilePage } from '@/pages/EditProfilePage';
import { AddRelativePage } from '@/pages/AddRelativePage';
import { PersonDetailPage } from '@/pages/PersonDetailPage';
import { EditPersonPage } from '@/pages/EditPersonPage';
import { InvitationsPage } from '@/pages/InvitationsPage';
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
          { path: '/profile/edit', element: <EditProfilePage /> },
          { path: '/relatives/new', element: <AddRelativePage /> },
          { path: '/people/:id', element: <PersonDetailPage /> },
          { path: '/people/:id/edit', element: <EditPersonPage /> },
          { path: '/invitations', element: <InvitationsPage /> },
          {
            path: '/tree',
            element: (
              <PlaceholderPage
                title="Family Tree visualization"
                comingIn="Interactive tree view arrives in Session 5."
              />
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
