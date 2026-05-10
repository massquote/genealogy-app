import { forwardRef, type InputHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/cn';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  containerClassName?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, helpText, id, containerClassName, className, type = 'text', ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? `tf-${reactId}`;
  const hasError = Boolean(error);

  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
        }
        className={cn(
          'h-10 rounded-md border bg-white px-3 text-sm text-slate-900 shadow-sm',
          'placeholder:text-slate-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          hasError
            ? 'border-red-400 focus-visible:ring-red-400'
            : 'border-slate-300 focus-visible:ring-brand-500 focus-visible:border-brand-500',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
          className,
        )}
        {...rest}
      />
      {hasError ? (
        <p id={`${inputId}-error`} className="text-xs text-red-600">
          {error}
        </p>
      ) : helpText ? (
        <p id={`${inputId}-help`} className="text-xs text-slate-500">
          {helpText}
        </p>
      ) : null}
    </div>
  );
});
