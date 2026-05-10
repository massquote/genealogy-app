import { forwardRef, type SelectHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options: SelectOption[];
  containerClassName?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, helpText, options, id, containerClassName, className, placeholder, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? `sel-${reactId}`;
  const hasError = Boolean(error);

  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        aria-invalid={hasError}
        className={cn(
          'h-10 rounded-md border bg-white px-3 text-sm text-slate-900 shadow-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          hasError
            ? 'border-red-400 focus-visible:ring-red-400'
            : 'border-slate-300 focus-visible:ring-brand-500 focus-visible:border-brand-500',
          className,
        )}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hasError ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : helpText ? (
        <p className="text-xs text-slate-500">{helpText}</p>
      ) : null}
    </div>
  );
});
