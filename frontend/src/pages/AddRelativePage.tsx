import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { PersonForm, type PersonFormValues } from '@/components/feature/PersonForm';
import { useAuth } from '@/hooks/useAuth';
import { useCreatePerson } from '@/hooks/usePeople';
import { useCreateInvitation } from '@/hooks/useInvitations';
import { usePeople } from '@/hooks/usePeople';
import { bucketRelatives, friendlyToApi } from '@/lib/relations';
import { applyServerErrors } from '@/lib/apiErrors';
import type { FriendlyRelation } from '@/types';

const relationOptions: Array<{ value: FriendlyRelation | 'sibling'; label: string }> = [
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'sibling', label: 'Brother / Sister' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
];

export function AddRelativePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const myPersonId = user?.person?.id;
  const peopleQuery = usePeople();

  const anchorIdFromUrl = searchParams.get('anchorId');
  const anchorPersonId = anchorIdFromUrl ? Number(anchorIdFromUrl) : myPersonId;

  const [relation, setRelation] = useState<FriendlyRelation | 'sibling'>('father');
  const [parentForSibling, setParentForSibling] = useState<string>('');
  const [sendInvite, setSendInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const createPerson = useCreatePerson();
  const createInvitation = useCreateInvitation();

  // For sibling option: derive my parents
  const myParents = useMemo(() => {
    if (!anchorPersonId || !peopleQuery.data) return [];
    // We don't have the relationships array on the frontend (the people endpoint
    // doesn't return them yet). For sibling support we rely on the user manually
    // picking a parent from their visible people list. Filter: people whose
    // first_name starts with anything — we'll let the user pick from all people
    // and the backend will reject if it can't form a sensible link.
    return peopleQuery.data.data;
  }, [anchorPersonId, peopleQuery.data]);

  if (!anchorPersonId) {
    return (
      <Card padding="lg">
        <CardTitle>Profile required</CardTitle>
        <CardDescription>You need a profile before you can add relatives.</CardDescription>
      </Card>
    );
  }

  const onSubmit = async (values: PersonFormValues) => {
    setFormError(null);

    // Determine API anchor + relation
    let anchorId = anchorPersonId;
    let apiRelation: 'parent' | 'child' | 'spouse';
    let genderHint: 'male' | 'female' | undefined;

    if (relation === 'sibling') {
      if (!parentForSibling) {
        setFormError('Pick which parent this sibling shares with you.');
        return;
      }
      anchorId = Number(parentForSibling);
      apiRelation = 'child';
    } else {
      const mapped = friendlyToApi(relation);
      apiRelation = mapped.relation;
      genderHint = mapped.genderHint;
    }

    try {
      const created = await createPerson.mutateAsync({
        ...values,
        middle_name: values.middle_name || null,
        date_of_birth: values.date_of_birth || null,
        date_of_death: values.date_of_death || null,
        birthplace: values.birthplace || null,
        bio: values.bio || null,
        gender: values.gender ?? genderHint ?? 'unknown',
        relationship: { anchor_id: anchorId, relation: apiRelation },
      });

      if (sendInvite && inviteEmail) {
        await createInvitation.mutateAsync({
          person_id: created.data.id,
          email: inviteEmail,
        });
      }

      navigate('/profile');
    } catch (err) {
      const msg = applyServerErrors<PersonFormValues>(err, () => undefined as never);
      if (msg) setFormError(msg);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Add a relative</h1>
        <p className="mt-1 text-slate-600">A new branch on the tree.</p>
      </header>

      <Card padding="lg">
        <CardTitle>How are they related?</CardTitle>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Relation"
            options={relationOptions}
            value={relation}
            onChange={(e) => setRelation(e.target.value as FriendlyRelation | 'sibling')}
          />
          {relation === 'sibling' && (
            <Select
              label="Shared parent"
              placeholder={myParents.length === 0 ? 'No parents added yet' : 'Pick a parent…'}
              options={myParents.map((p) => ({ value: String(p.id), label: p.full_name }))}
              value={parentForSibling}
              onChange={(e) => setParentForSibling(e.target.value)}
              disabled={myParents.length === 0}
              helpText="Add a parent first to enable siblings."
            />
          )}
        </div>
      </Card>

      <Card padding="lg">
        <CardTitle>Their details</CardTitle>
        <div className="mt-4">
          <PersonForm
            submitLabel="Add to tree"
            onSubmit={onSubmit}
            onCancel={() => navigate('/profile')}
            formError={formError}
          />
        </div>
      </Card>

      <Card padding="lg">
        <CardTitle>Optionally send them an invitation</CardTitle>
        <CardDescription>
          They&rsquo;ll be able to claim their own profile and contribute their branch.
        </CardDescription>
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={sendInvite}
              onChange={(e) => setSendInvite(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Send an invitation email after adding
          </label>
          {sendInvite && (
            <TextField
              label="Their email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="them@example.com"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
