import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { PersonForm, type PersonFormValues } from '@/components/feature/PersonForm';
import { usePerson, useUpdatePerson } from '@/hooks/usePeople';
import { applyServerErrors } from '@/lib/apiErrors';

export function EditPersonPage() {
  const { id } = useParams<{ id: string }>();
  const personId = id ? Number(id) : 0;
  const navigate = useNavigate();
  const personQuery = usePerson(personId);
  const updatePerson = useUpdatePerson(personId);
  const [formError, setFormError] = useState<string | null>(null);

  if (personQuery.isLoading) return <p className="text-slate-500">Loading…</p>;
  if (personQuery.isError || !personQuery.data) {
    return (
      <Card padding="lg">
        <CardTitle>Person not found</CardTitle>
        <CardDescription>You may not have access to edit this person.</CardDescription>
      </Card>
    );
  }

  const person = personQuery.data;

  const onSubmit = async (values: PersonFormValues) => {
    setFormError(null);
    try {
      await updatePerson.mutateAsync({
        ...values,
        middle_name: values.middle_name || null,
        date_of_birth: values.date_of_birth || null,
        date_of_death: values.date_of_death || null,
        birthplace: values.birthplace || null,
        bio: values.bio || null,
      });
      navigate(`/people/${person.id}`);
    } catch (err) {
      const msg = applyServerErrors<PersonFormValues>(err, () => undefined as never);
      if (msg) setFormError(msg);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Edit {person.full_name}</h1>
      </header>
      <Card padding="lg">
        <PersonForm
          defaultValues={{
            first_name: person.first_name,
            middle_name: person.middle_name ?? '',
            last_name: person.last_name,
            date_of_birth: person.date_of_birth ?? '',
            date_of_death: person.date_of_death ?? '',
            gender: person.gender,
            birthplace: person.birthplace ?? '',
            bio: person.bio ?? '',
          }}
          submitLabel="Save changes"
          onSubmit={onSubmit}
          onCancel={() => navigate(`/people/${person.id}`)}
          formError={formError}
        />
      </Card>
    </div>
  );
}
