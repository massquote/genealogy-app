import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { useRegister } from '@/hooks/useAuth';
import { applyServerErrors } from '@/lib/apiErrors';

const schema = z
  .object({
    first_name: z.string().min(1, 'First name is required').max(80),
    middle_name: z.string().max(80).optional().or(z.literal('')),
    last_name: z.string().min(1, 'Last name is required').max(80),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'At least 8 characters'),
    password_confirmation: z.string().min(1, 'Confirm your password'),
    date_of_birth: z.string().optional().or(z.literal('')),
    gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type FormValues = z.infer<typeof schema>;

const genderOptions = [
  { value: 'unknown', label: 'Prefer not to say' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { gender: 'unknown' },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      const payload = {
        ...values,
        middle_name: values.middle_name || undefined,
        date_of_birth: values.date_of_birth || undefined,
      };
      await registerMutation.mutateAsync(payload);
      navigate('/profile', { replace: true });
    } catch (err) {
      const message = applyServerErrors<FormValues>(err, setError);
      if (message) setFormError(message);
    }
  };

  return (
    <Card padding="lg">
      <CardTitle>Plant your first knot</CardTitle>
      <CardDescription>Create an account to start building your family tree.</CardDescription>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            autoComplete="given-name"
            {...register('first_name')}
            error={errors.first_name?.message}
          />
          <TextField
            label="Last name"
            autoComplete="family-name"
            {...register('last_name')}
            error={errors.last_name?.message}
          />
        </div>

        <TextField
          label="Middle name (optional)"
          autoComplete="additional-name"
          {...register('middle_name')}
          error={errors.middle_name?.message}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Date of birth (optional)"
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
          label="Email"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            error={errors.password?.message}
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            {...register('password_confirmation')}
            error={errors.password_confirmation?.message}
          />
        </div>

        {formError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
        )}

        <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
