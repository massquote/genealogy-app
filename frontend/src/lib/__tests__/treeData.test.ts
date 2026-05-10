import { describe, it, expect } from 'vitest';
import { buildDescendantTree, findParents } from '../treeData';
import type { Person, Relationship } from '@/types';

function person(id: number, name: string): Person {
  return {
    id,
    first_name: name,
    middle_name: null,
    last_name: 'Doe',
    full_name: `${name} Doe`,
    date_of_birth: '1980-01-01',
    date_of_death: null,
    gender: 'unknown',
    birthplace: null,
    bio: null,
    is_claimed: false,
    claimed_by_user_id: null,
    created_by_user_id: 1,
    created_at: '',
    updated_at: '',
  };
}

describe('buildDescendantTree', () => {
  it('returns null when the root id is not in the people list', () => {
    expect(buildDescendantTree(99, [], [])).toBeNull();
  });

  it('builds a one-deep hierarchy with a single child', () => {
    const dad = person(1, 'Dad');
    const kid = person(2, 'Kid');
    const rels: Relationship[] = [
      { id: 1, person_a_id: 1, person_b_id: 2, type: 'parent', created_by_user_id: 1 },
    ];
    const tree = buildDescendantTree(1, [dad, kid], rels);
    expect(tree?.attributes.id).toBe(1);
    expect(tree?.children).toHaveLength(1);
    expect(tree?.children[0].attributes.id).toBe(2);
  });

  it('renders multiple generations of descendants', () => {
    const a = person(1, 'A');
    const b = person(2, 'B');
    const c = person(3, 'C');
    const rels: Relationship[] = [
      { id: 1, person_a_id: 1, person_b_id: 2, type: 'parent', created_by_user_id: 1 },
      { id: 2, person_a_id: 2, person_b_id: 3, type: 'parent', created_by_user_id: 1 },
    ];
    const tree = buildDescendantTree(1, [a, b, c], rels);
    expect(tree?.children).toHaveLength(1);
    expect(tree?.children[0].children).toHaveLength(1);
    expect(tree?.children[0].children[0].attributes.id).toBe(3);
  });

  it('attaches spouse names as a comma-separated attribute', () => {
    const me = person(1, 'Me');
    const spouse1 = person(2, 'Spouse1');
    const spouse2 = person(3, 'Spouse2');
    const rels: Relationship[] = [
      { id: 1, person_a_id: 1, person_b_id: 2, type: 'spouse', created_by_user_id: 1 },
      { id: 2, person_a_id: 3, person_b_id: 1, type: 'spouse', created_by_user_id: 1 },
    ];
    const tree = buildDescendantTree(1, [me, spouse1, spouse2], rels);
    expect(tree?.attributes.spouseNames).toContain('Spouse1 Doe');
    expect(tree?.attributes.spouseNames).toContain('Spouse2 Doe');
  });

  it('terminates on cycles using the visited set', () => {
    const a = person(1, 'A');
    const b = person(2, 'B');
    // Pathological cycle: a -> b -> a
    const rels: Relationship[] = [
      { id: 1, person_a_id: 1, person_b_id: 2, type: 'parent', created_by_user_id: 1 },
      { id: 2, person_a_id: 2, person_b_id: 1, type: 'parent', created_by_user_id: 1 },
    ];
    const tree = buildDescendantTree(1, [a, b], rels);
    expect(tree?.children).toHaveLength(1);
    expect(tree?.children[0].children).toHaveLength(0);
  });
});

describe('findParents', () => {
  it('returns the parent ids of a given person', () => {
    const rels: Relationship[] = [
      { id: 1, person_a_id: 10, person_b_id: 5, type: 'parent', created_by_user_id: 1 },
      { id: 2, person_a_id: 11, person_b_id: 5, type: 'parent', created_by_user_id: 1 },
      { id: 3, person_a_id: 12, person_b_id: 6, type: 'parent', created_by_user_id: 1 },
      { id: 4, person_a_id: 5, person_b_id: 7, type: 'parent', created_by_user_id: 1 },
      { id: 5, person_a_id: 5, person_b_id: 11, type: 'spouse', created_by_user_id: 1 },
    ];
    expect(findParents(5, rels).sort()).toEqual([10, 11]);
    expect(findParents(7, rels)).toEqual([5]);
    expect(findParents(99, rels)).toEqual([]);
  });
});
