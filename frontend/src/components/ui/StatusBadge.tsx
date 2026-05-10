import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type StatusBadgeTone = 'green' | 'amber' | 'red' | 'slate';

export interface StatusBadgeProps {
  tone?: StatusBadgeTone;
  children: ReactNode;
  className?: string;
  /** Show a leading colored dot. */
  dot?: boolean;
}

const toneClasses: Record<StatusBadgeTone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  slate: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20',
};

const dotClasses: Record<StatusBadgeTone, string> = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  slate: 'bg-slate-400',
};

export function StatusBadge({ tone = 'slate', children, className, dot = true }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {dot && <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', dotClasses[tone])} />}
      {children}
    </span>
  );
}
