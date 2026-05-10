import { forwardRef, type TextareaHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, helpText, id, containerClassName, className, rows = 4, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? `ta-${reactId}`;
  const hasError = Boolean(error);

  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={hasError}
        className={cn(
          'rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm',
          'placeholder:text-slate-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          hasError
            ? 'border-red-400 focus-visible:ring-red-400'
            : 'border-slate-300 focus-visible:ring-brand-500 focus-visible:border-brand-500',
          className,
        )}
        {...rest}
      />
      {hasError ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : helpText ? (
        <p className="text-xs text-slate-500">{helpText}</p>
      ) : null}
    </div>
  );
});
