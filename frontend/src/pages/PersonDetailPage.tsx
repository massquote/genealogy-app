import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { usePerson, useDeletePerson } from '@/hooks/usePeople';

function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString();
}

export function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const personId = id ? Number(id) : undefined;
  const { user } = useAuth();
  const navigate = useNavigate();
  const personQuery = usePerson(personId);
  const deletePerson = useDeletePerson();

  if (personQuery.isLoading) return <p className="text-slate-500">Loading…</p>;
  if (personQuery.isError || !personQuery.data) {
    return (
      <Card padding="lg">
        <CardTitle>Person not found</CardTitle>
        <CardDescription>This person may have been removed or is outside your family graph.</CardDescription>
        <div className="mt-4">
          <Link to="/profile" className="text-brand-700 hover:underline">Back to profile</Link>
        </div>
      </Card>
    );
  }

  const person = personQuery.data;
  const canEdit =
    person.created_by_user_id === user?.id || person.claimed_by_user_id === user?.id;
  const canDelete = canEdit && person.claimed_by_user_id !== (user?.id ? null : 0); // placeholder

  const handleDelete = async () => {
    if (!confirm(`Remove ${person.full_name} from your tree? Their relationships will also be removed.`)) {
      return;
    }
    await deletePerson.mutateAsync(person.id);
    navigate('/profile');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">{person.full_name}</h1>
          {person.is_claimed && (
            <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Claimed profile
            </span>
          )}
        </header>
        {canEdit && (
          <div className="flex gap-2">
            <Link to={`/people/${person.id}/edit`}>
              <Button variant="secondary" size="sm">Edit</Button>
            </Link>
            <Link to={`/relatives/new?anchorId=${person.id}`}>
              <Button size="sm">Add relative here</Button>
            </Link>
          </div>
        )}
      </div>

      <Card padding="lg">
        <CardTitle>Details</CardTitle>
        <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          <Field label="First name" value={person.first_name} />
          <Field label="Middle name" value={person.middle_name} />
          <Field label="Last name" value={person.last_name} />
          <Field label="Date of birth" value={formatDate(person.date_of_birth)} />
          <Field label="Date of death" value={formatDate(person.date_of_death)} />
          <Field label="Gender" value={person.gender === 'unknown' ? '—' : person.gender} />
          <Field label="Birthplace" value={person.birthplace} />
        </dl>
        {person.bio && (
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{person.bio}</p>
          </div>
        )}
      </Card>

      {canDelete && (
        <Card padding="lg" className="border-red-200">
          <CardTitle className="text-red-700">Danger zone</CardTitle>
          <CardDescription>
            Removing {person.first_name} also removes every relationship that touches them.
          </CardDescription>
          <div className="mt-4">
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={deletePerson.isPending}
            >
              Remove from tree
            </Button>
          </div>
        </Card>
      )}
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
