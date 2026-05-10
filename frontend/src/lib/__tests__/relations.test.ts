import { describe, it, expect } from 'vitest';
import { bucketRelatives, friendlyToApi } from '../relations';
import type { Person, Relationship } from '@/types';

function person(id: number, first = 'P'): Person {
  return {
    id,
    first_name: `${first}${id}`,
    middle_name: null,
    last_name: 'Test',
    full_name: `${first}${id} Test`,
    date_of_birth: null,
    date_of_death: null,
    gender: 'unknown',
    birthplace: null,
    bio: null,
    is_claimed: false,
    claimed_by_user_id: null,
    created_by_user_id: 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };
}

describe('friendlyToApi', () => {
  it('maps father/mother to parent with gender hint', () => {
    expect(friendlyToApi('father')).toEqual({ relation: 'parent', genderHint: 'male' });
    expect(friendlyToApi('mother')).toEqual({ relation: 'parent', genderHint: 'female' });
  });

  it('maps son/daughter to child with gender hint', () => {
    expect(friendlyToApi('son')).toEqual({ relation: 'child', genderHint: 'male' });
    expect(friendlyToApi('daughter')).toEqual({ relation: 'child', genderHint: 'female' });
  });

  it('maps spouse to spouse with no hint', () => {
    expect(friendlyToApi('spouse')).toEqual({ relation: 'spouse' });
  });
});

describe('bucketRelatives', () => {
  it('classifies parents, spouses, children, and siblings around an anchor', () => {
    const me = person(10, 'Me');
    const dad = person(11, 'Dad');
    const mom = person(12, 'Mom');
    const sister = person(13, 'Sis');
    const spouse = person(14, 'Spouse');
    const kid = person(15, 'Kid');
    const stranger = person(99, 'Stranger');

    const people = [me, dad, mom, sister, spouse, kid, stranger];

    const rels: Relationship[] = [
      { id: 1, person_a_id: dad.id, person_b_id: me.id, type: 'parent', created_by_user_id: 1 },
      { id: 2, person_a_id: mom.id, person_b_id: me.id, type: 'parent', created_by_user_id: 1 },
      { id: 3, person_a_id: dad.id, person_b_id: sister.id, type: 'parent', created_by_user_id: 1 },
      { id: 4, person_a_id: mom.id, person_b_id: sister.id, type: 'parent', created_by_user_id: 1 },
      { id: 5, person_a_id: me.id, person_b_id: spouse.id, type: 'spouse', created_by_user_id: 1 },
      { id: 6, person_a_id: me.id, person_b_id: kid.id, type: 'parent', created_by_user_id: 1 },
    ];

    const buckets = bucketRelatives(me.id, people, rels);

    expect(buckets.parents.map((p) => p.id).sort()).toEqual([dad.id, mom.id]);
    expect(buckets.spouses.map((p) => p.id)).toEqual([spouse.id]);
    expect(buckets.children.map((p) => p.id)).toEqual([kid.id]);
    expect(buckets.siblings.map((p) => p.id)).toEqual([sister.id]);
  });

  it('returns empty buckets when the anchor has no relationships', () => {
    const me = person(1);
    const buckets = bucketRelatives(me.id, [me], []);
    expect(buckets.parents).toEqual([]);
    expect(buckets.spouses).toEqual([]);
    expect(buckets.children).toEqual([]);
    expect(buckets.siblings).toEqual([]);
  });

  it('handles spouse where the anchor is in slot a or slot b', () => {
    const me = person(5);
    const partner = person(2);
    const rels: Relationship[] = [
      { id: 1, person_a_id: partner.id, person_b_id: me.id, type: 'spouse', created_by_user_id: 1 },
    ];
    const buckets = bucketRelatives(me.id, [me, partner], rels);
    expect(buckets.spouses.map((p) => p.id)).toEqual([partner.id]);
  });
});
