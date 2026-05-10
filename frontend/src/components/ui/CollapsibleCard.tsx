import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Card } from './Card';

export interface CollapsibleCardProps {
  /** Main heading (left side of the header) */
  title: ReactNode;
  /** Optional subtitle/description shown under the title when collapsed */
  subtitle?: ReactNode;
  /** Right-side content shown in the header — typically a StatusBadge */
  status?: ReactNode;
  /** Whether the card starts open. Defaults to false. */
  defaultOpen?: boolean;
  /** When provided, makes the card a controlled component. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

export function CollapsibleCard({
  title,
  subtitle,
  status,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  children,
  className,
}: CollapsibleCardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp ?? internalOpen;
  const panelId = useId();

  const toggle = () => {
    const next = !open;
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <Card padding="none" className={cn('overflow-hidden', className)}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          'flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors',
          'hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset',
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 text-base font-semibold text-slate-900">
            {title}
          </div>
          {subtitle && !open && (
            <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {status}
          <Chevron open={open} />
        </div>
      </button>
      {open && (
        <div
          id={panelId}
          role="region"
          className="border-t border-slate-200 px-5 py-5"
        >
          {children}
        </div>
      )}
    </Card>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      width={16}
      height={16}
      viewBox="0 0 16 16"
      className={cn(
        'text-slate-400 transition-transform duration-200',
        open && 'rotate-180',
      )}
    >
      <path
        fill="currentColor"
        d="M3.22 5.97a.75.75 0 0 1 1.06 0L8 9.69l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 7.03a.75.75 0 0 1 0-1.06Z"
      />
    </svg>
  );
}
