import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Person } from '@/types';

const genderEmoji: Record<Person['gender'], string> = {
  male: '👨',
  female: '👩',
  other: '🧑',
  unknown: '🧑',
};

function formatYearRange(p: Person): string {
  const birth = p.date_of_birth?.slice(0, 4);
  const death = p.date_of_death?.slice(0, 4);
  if (birth && death) return `${birth} – ${death}`;
  if (birth) return `b. ${birth}`;
  if (death) return `d. ${death}`;
  return '';
}

export interface PersonCardProps {
  person: Person;
  /** When provided, the whole card becomes a link to /people/:id (or this URL). */
  linkTo?: string;
  action?: ReactNode;
  /** Show creator vs claimer badge. */
  showStatus?: boolean;
  className?: string;
}

export function PersonCard({
  person,
  linkTo,
  action,
  showStatus = true,
  className,
}: PersonCardProps) {
  const yearRange = formatYearRange(person);
  const inner = (
    <>
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-2xl">
          {genderEmoji[person.gender] ?? '🧑'}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">{person.full_name}</p>
          {yearRange && <p className="text-xs text-slate-500">{yearRange}</p>}
          {person.birthplace && (
            <p className="text-xs text-slate-400">{person.birthplace}</p>
          )}
        </div>
        {showStatus && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
              person.is_claimed
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-500',
            )}
          >
            {person.is_claimed ? 'Claimed' : 'Unclaimed'}
          </span>
        )}
      </div>
      {action && <div className="mt-3 border-t border-slate-100 pt-3">{action}</div>}
    </>
  );

  const baseClasses = cn(
    'block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition',
    linkTo && 'hover:border-brand-300 hover:shadow',
    className,
  );

  return linkTo ? (
    <Link to={linkTo} className={baseClasses}>
      {inner}
    </Link>
  ) : (
    <div className={baseClasses}>{inner}</div>
  );
}
