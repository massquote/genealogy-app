import { NavLink, Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import {
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
  DropdownLabel,
} from '@/components/ui/DropdownMenu';
import { useAuth, useLogout } from '@/hooks/useAuth';

interface NavItem {
  to: string;
  label: string;
}

const authedNavItems: NavItem[] = [
  { to: '/profile', label: 'My Profile' },
  { to: '/tree', label: 'Family Tree' },
  { to: '/invitations', label: 'Invitations' },
];

export function NavBar() {
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate('/login', { replace: true });
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-brand-700">
          <span aria-hidden className="text-2xl">🪢</span>
          <span>FamilyKnot</span>
        </Link>

        <nav className="flex items-center gap-1">
          {isAuthenticated &&
            authedNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}

          {isAuthenticated ? (
            <DropdownMenu
              className="ml-2"
              trigger={
                <button
                  type="button"
                  aria-label="Open account menu"
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <Avatar name={user?.name} size="md" />
                </button>
              }
            >
              <DropdownLabel>Signed in as</DropdownLabel>
              <div className="px-4 pb-2 text-sm text-slate-700">
                <p className="truncate font-medium">{user?.name}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              <DropdownDivider />
              <DropdownItem to="/profile" icon={<span>👤</span>}>
                My profile
              </DropdownItem>
              <DropdownItem to="/profile/edit" icon={<span>⚙️</span>}>
                Account settings
              </DropdownItem>
              <DropdownItem to="/integrations" icon={<span>🔌</span>}>
                Integrations
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={handleLogout} tone="danger" icon={<span>↩</span>}>
                Sign out
              </DropdownItem>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
