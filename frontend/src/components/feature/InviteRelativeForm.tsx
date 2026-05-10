import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useCreateInvitation } from '@/hooks/useInvitations';
import { applyServerErrors } from '@/lib/apiErrors';
import type { Person } from '@/types';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

interface InviteRelativeFormProps {
  person: Person;
  onSent?: () => void;
  onCancel?: () => void;
}

export function InviteRelativeForm({ person, onSent, onCancel }: InviteRelativeFormProps) {
  const createInvitation = useCreateInvitation();
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSuccess(null);
    setFormError(null);
    try {
      await createInvitation.mutateAsync({ person_id: person.id, email: values.email });
      setSuccess(`Invitation sent to ${values.email}`);
      reset();
      onSent?.();
    } catch (err) {
      const msg = applyServerErrors<FormValues>(err, setError);
      if (msg) setFormError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <p className="text-sm text-slate-600">
        Invite <strong>{person.full_name}</strong> to claim this profile.
      </p>
      <TextField
        label="Their email"
        type="email"
        autoComplete="email"
        {...register('email')}
        error={errors.email?.message}
      />
      {formError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      )}
      {success && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>
      )}
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Close
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>Send invitation</Button>
      </div>
    </form>
  );
}
