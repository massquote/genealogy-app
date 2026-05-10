import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { PersonForm, type PersonFormValues } from '@/components/feature/PersonForm';
import { useAuth } from '@/hooks/useAuth';
import { useUpdatePerson } from '@/hooks/usePeople';
import { applyServerErrors } from '@/lib/apiErrors';

export function EditProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const person = user?.person;
  const updatePerson = useUpdatePerson(person?.id ?? 0);
  const [formError, setFormError] = useState<string | null>(null);
  let setErrorRef: ((field: any, error: any) => void) | null = null;

  if (!person) {
    return (
      <Card padding="lg">
        <CardTitle>Profile not found</CardTitle>
        <CardDescription>Re-login to refresh your account.</CardDescription>
      </Card>
    );
  }

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
      navigate('/profile');
    } catch (err) {
      const msg = applyServerErrors<PersonFormValues>(err, setErrorRef as never);
      if (msg) setFormError(msg);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Edit profile</h1>
        <p className="mt-1 text-slate-600">Update your details on the family tree.</p>
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
          onCancel={() => navigate('/profile')}
          formError={formError}
          registerSetError={(s) => {
            setErrorRef = s as never;
          }}
        />
      </Card>
    </div>
  );
}
