import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { RelativesList } from '@/components/feature/RelativesList';
import { InviteRelativeForm } from '@/components/feature/InviteRelativeForm';
import { useAuth, useMe } from '@/hooks/useAuth';
import { useTree } from '@/hooks/useTree';
import { bucketRelatives } from '@/lib/relations';
import type { Person } from '@/types';

function formatGender(g: string | null | undefined): string {
  if (!g || g === 'unknown') return '—';
  return g[0].toUpperCase() + g.slice(1);
}

export function MyProfilePage() {
  const { user } = useAuth();
  useMe();
  const tree = useTree();
  const [invitePerson, setInvitePerson] = useState<Person | null>(null);

  const myPerson = user?.person;

  const buckets = useMemo(() => {
    if (!myPerson || !tree.data) {
      return { parents: [], spouses: [], children: [], siblings: [] };
    }
    return bucketRelatives(myPerson.id, tree.data.data.people, tree.data.data.relationships);
  }, [myPerson, tree.data]);

  if (!myPerson) {
    return (
      <Card padding="lg">
        <CardTitle>No profile yet</CardTitle>
        <CardDescription>Sign out and back in to refresh your account.</CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="mt-1 text-slate-600">
            You&rsquo;re the centre of your tree — add the people around you.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/profile/edit">
            <Button variant="secondary">Edit profile</Button>
          </Link>
          <Link to="/relatives/new">
            <Button>Add relative</Button>
          </Link>
        </div>
      </header>

      <Card padding="lg">
        <CardTitle>{myPerson.full_name}</CardTitle>
        <CardDescription>Account: {user?.email}</CardDescription>

        <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
          <Field label="Date of birth" value={myPerson.date_of_birth} />
          <Field label="Gender" value={formatGender(myPerson.gender)} />
          <Field label="Birthplace" value={myPerson.birthplace} />
        </dl>
        {myPerson.bio && (
          <p className="mt-6 whitespace-pre-wrap text-sm text-slate-700">{myPerson.bio}</p>
        )}
      </Card>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Your relatives</h2>
          <span className="text-sm text-slate-500">
            {tree.data ? `${tree.data.meta.total_people} people in your tree` : 'Loading…'}
          </span>
        </div>

        {tree.isLoading ? (
          <p className="text-slate-500">Building your tree…</p>
        ) : tree.isError ? (
          <p className="text-red-600">Could not load your tree.</p>
        ) : (
          <RelativesList
            buckets={buckets}
            renderAction={(person) => (
              <div className="flex items-center justify-between gap-2">
                <Link
                  to={`/people/${person.id}`}
                  className="text-xs font-medium text-brand-700 hover:underline"
                >
                  View details →
                </Link>
                {!person.is_claimed && (
                  <button
                    type="button"
                    onClick={() => setInvitePerson(person)}
                    className="text-xs font-medium text-slate-600 hover:text-brand-700"
                  >
                    Invite to claim
                  </button>
                )}
              </div>
            )}
          />
        )}
      </section>

      <Modal
        open={invitePerson !== null}
        onClose={() => setInvitePerson(null)}
        title="Send invitation"
        size="sm"
      >
        {invitePerson && (
          <InviteRelativeForm
            person={invitePerson}
            onSent={() => setInvitePerson(null)}
            onCancel={() => setInvitePerson(null)}
          />
        )}
      </Modal>
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
