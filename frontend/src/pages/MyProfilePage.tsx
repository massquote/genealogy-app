import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { useAuth, useMe } from '@/hooks/useAuth';

function formatGender(g: string | null | undefined): string {
  if (!g || g === 'unknown') return '—';
  return g[0].toUpperCase() + g.slice(1);
}

export function MyProfilePage() {
  const { user } = useAuth();
  const { isLoading } = useMe();

  if (isLoading && !user) {
    return <p className="text-slate-500">Loading your profile…</p>;
  }

  const person = user?.person;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-2 text-slate-600">This is your node on the family tree.</p>
      </header>

      <Card padding="lg">
        <CardTitle>{person?.full_name ?? user?.name}</CardTitle>
        <CardDescription>Account: {user?.email}</CardDescription>

        <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <Field label="First name" value={person?.first_name} />
          <Field label="Middle name" value={person?.middle_name} />
          <Field label="Last name" value={person?.last_name} />
          <Field label="Date of birth" value={person?.date_of_birth} />
          <Field label="Gender" value={formatGender(person?.gender)} />
          <Field label="Birthplace" value={person?.birthplace} />
        </dl>

        <p className="mt-8 text-sm text-slate-500">
          Editing your profile and adding relatives lands in Session 4.
        </p>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value || '—'}</dd>
    </div>
  );
}
