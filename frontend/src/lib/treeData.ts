import type { Person, Relationship } from '@/types';

export interface TreeNodeAttributes extends Record<string, string | number | boolean> {
  id: number;
  full_name: string;
  dob: string;
  gender: string;
  is_claimed: boolean;
  spouseNames: string;
}

export interface RawNodeDatum {
  name: string;
  attributes: TreeNodeAttributes;
  children: RawNodeDatum[];
}

/**
 * Build a descendants-only hierarchy from $rootId, suitable for react-d3-tree.
 * Spouses are attached as a comma-separated string on the attributes
 * (rendered alongside the focused person in the custom node).
 * Cycles are guarded by a visited set so the recursion terminates.
 */
export function buildDescendantTree(
  rootId: number,
  people: Person[],
  relationships: Relationship[],
  visited: Set<number> = new Set(),
): RawNodeDatum | null {
  if (visited.has(rootId)) return null;
  visited.add(rootId);

  const peopleById = new Map(people.map((p) => [p.id, p]));
  const root = peopleById.get(rootId);
  if (!root) return null;

  // Direct children = relationships where root is in slot A and type=parent
  const childIds = relationships
    .filter((r) => r.type === 'parent' && r.person_a_id === rootId)
    .map((r) => r.person_b_id);

  // Spouses (any direction)
  const spouseNames = relationships
    .filter((r) => r.type === 'spouse' && (r.person_a_id === rootId || r.person_b_id === rootId))
    .map((r) => peopleById.get(r.person_a_id === rootId ? r.person_b_id : r.person_a_id))
    .filter((p): p is Person => Boolean(p))
    .map((p) => p.full_name)
    .join(', ');

  const children = childIds
    .map((id) => buildDescendantTree(id, people, relationships, visited))
    .filter((n): n is RawNodeDatum => n !== null);

  return {
    name: root.full_name,
    attributes: {
      id: root.id,
      full_name: root.full_name,
      dob: root.date_of_birth ?? '',
      gender: root.gender ?? 'unknown',
      is_claimed: root.is_claimed,
      spouseNames,
    },
    children,
  };
}

/**
 * Find the parents of a person — useful for the "Re-root on parent" UI control.
 */
export function findParents(personId: number, relationships: Relationship[]): number[] {
  return relationships
    .filter((r) => r.type === 'parent' && r.person_b_id === personId)
    .map((r) => r.person_a_id);
}
