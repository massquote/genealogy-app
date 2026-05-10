import type { FriendlyRelation, Person, Relationship } from '@/types';

/** Map a UI relation label to the API store-person relationship payload. */
export interface RelationApiPayload {
  relation: 'parent' | 'child' | 'spouse';
  genderHint?: 'male' | 'female';
}

export function friendlyToApi(label: FriendlyRelation): RelationApiPayload {
  switch (label) {
    case 'father':
      return { relation: 'parent', genderHint: 'male' };
    case 'mother':
      return { relation: 'parent', genderHint: 'female' };
    case 'parent':
      return { relation: 'parent' };
    case 'son':
      return { relation: 'child', genderHint: 'male' };
    case 'daughter':
      return { relation: 'child', genderHint: 'female' };
    case 'child':
      return { relation: 'child' };
    case 'spouse':
      return { relation: 'spouse' };
  }
}

export interface BucketedRelatives {
  parents: Person[];
  spouses: Person[];
  children: Person[];
  siblings: Person[];
}

/**
 * Group every person in a graph relative to a given anchor person.
 * Siblings = people sharing at least one parent with the anchor (excluding the anchor itself).
 */
export function bucketRelatives(
  anchorId: number,
  people: Person[],
  relationships: Relationship[],
): BucketedRelatives {
  const byId = new Map(people.map((p) => [p.id, p]));
  const parents: Person[] = [];
  const children: Person[] = [];
  const spouses: Person[] = [];
  const parentIdsOfAnchor = new Set<number>();

  for (const r of relationships) {
    if (r.type === 'parent') {
      if (r.person_b_id === anchorId) {
        parentIdsOfAnchor.add(r.person_a_id);
        const p = byId.get(r.person_a_id);
        if (p) parents.push(p);
      } else if (r.person_a_id === anchorId) {
        const c = byId.get(r.person_b_id);
        if (c) children.push(c);
      }
    } else if (r.type === 'spouse') {
      if (r.person_a_id === anchorId) {
        const s = byId.get(r.person_b_id);
        if (s) spouses.push(s);
      } else if (r.person_b_id === anchorId) {
        const s = byId.get(r.person_a_id);
        if (s) spouses.push(s);
      }
    }
  }

  // Siblings: people who share at least one parent with the anchor (excluding the anchor).
  const siblingIds = new Set<number>();
  for (const r of relationships) {
    if (r.type !== 'parent') continue;
    if (parentIdsOfAnchor.has(r.person_a_id) && r.person_b_id !== anchorId) {
      siblingIds.add(r.person_b_id);
    }
  }
  const siblings: Person[] = [];
  for (const id of siblingIds) {
    const p = byId.get(id);
    if (p) siblings.push(p);
  }

  return { parents, spouses, children, siblings };
}
