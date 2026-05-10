import axios from 'axios';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import type { ApiError } from '@/types';

/** Apply Laravel-style 422 validation errors to a react-hook-form instance. */
export function applyServerErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
): string | null {
  if (!axios.isAxiosError(err)) return 'Unexpected error';
  const data = err.response?.data as ApiError | undefined;
  if (err.response?.status === 422 && data?.errors) {
    Object.entries(data.errors).forEach(([field, messages]) => {
      setError(field as Path<T>, { type: 'server', message: messages[0] });
    });
    return null;
  }
  return data?.message ?? err.message ?? 'Request failed';
}
