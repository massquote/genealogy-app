import { Link, Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-full flex-col bg-slate-100">
      <header className="px-6 py-5">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-brand-700">
          <span aria-hidden className="text-2xl">🪢</span>
          <span>FamilyKnot</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
