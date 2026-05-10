import type { ReactNode } from 'react';
import type { Person } from '@/types';
import type { BucketedRelatives } from '@/lib/relations';
import { PersonCard } from './PersonCard';

interface RelativesListProps {
  buckets: BucketedRelatives;
  renderAction?: (person: Person) => ReactNode;
}

const sections: Array<{ key: keyof BucketedRelatives; label: string }> = [
  { key: 'parents', label: 'Parents' },
  { key: 'spouses', label: 'Spouses' },
  { key: 'siblings', label: 'Siblings' },
  { key: 'children', label: 'Children' },
];

export function RelativesList({ buckets, renderAction }: RelativesListProps) {
  const allEmpty = sections.every((s) => buckets[s.key].length === 0);
  if (allEmpty) {
    return (
      <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        No relatives added yet. Add your first one to start growing your tree.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map(({ key, label }) => {
        const people = buckets[key];
        if (people.length === 0) return null;
        return (
          <section key={key}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {label} ({people.length})
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {people.map((p) => (
                <PersonCard
                  key={p.id}
                  person={p}
                  linkTo={`/people/${p.id}`}
                  action={renderAction?.(p)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
