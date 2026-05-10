import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { Textarea } from '@/components/ui/Textarea';

const baseSchema = z.object({
  first_name: z.string().min(1, 'Required').max(80),
  middle_name: z.string().max(80).optional().or(z.literal('')),
  last_name: z.string().min(1, 'Required').max(80),
  date_of_birth: z.string().optional().or(z.literal('')),
  date_of_death: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  birthplace: z.string().max(120).optional().or(z.literal('')),
  bio: z.string().max(2000).optional().or(z.literal('')),
});

export type PersonFormValues = z.infer<typeof baseSchema>;

const genderOptions = [
  { value: 'unknown', label: 'Prefer not to say' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
];

export interface PersonFormProps {
  defaultValues?: Partial<PersonFormValues>;
  submitLabel?: string;
  onSubmit: (values: PersonFormValues) => Promise<void> | void;
  onCancel?: () => void;
  formError?: string | null;
  /** Pre-injected useForm setError binding for server-side errors. */
  registerSetError?: (setError: ReturnType<typeof useForm<PersonFormValues>>['setError']) => void;
}

export function PersonForm({
  defaultValues,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
  formError,
  registerSetError,
}: PersonFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PersonFormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      date_of_birth: '',
      gender: 'unknown',
      birthplace: '',
      bio: '',
      ...defaultValues,
    },
  });

  if (registerSetError) registerSetError(setError);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="First name"
          {...register('first_name')}
          error={errors.first_name?.message}
        />
        <TextField
          label="Last name"
          {...register('last_name')}
          error={errors.last_name?.message}
        />
      </div>

      <TextField
        label="Middle name (optional)"
        {...register('middle_name')}
        error={errors.middle_name?.message}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Date of birth"
          type="date"
          {...register('date_of_birth')}
          error={errors.date_of_birth?.message}
        />
        <Select
          label="Gender"
          options={genderOptions}
          {...register('gender')}
          error={errors.gender?.message}
        />
      </div>

      <TextField
        label="Birthplace (optional)"
        {...register('birthplace')}
        error={errors.birthplace?.message}
      />

      <Textarea
        label="Notes (optional)"
        rows={3}
        {...register('bio')}
        error={errors.bio?.message}
        helpText="Anything to remember about this person."
      />

      {formError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
