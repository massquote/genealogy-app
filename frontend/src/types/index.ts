export interface Person {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name: string;
  date_of_birth: string | null;
  date_of_death: string | null;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthplace: string | null;
  bio: string | null;
  is_claimed: boolean;
  claimed_by_user_id: number | null;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  person?: Person | null;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: 'Bearer';
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export type RelationshipType = 'parent' | 'spouse';

export interface Relationship {
  id: number;
  person_a_id: number;
  person_b_id: number;
  type: RelationshipType;
  created_by_user_id: number;
}

export interface Invitation {
  id: number;
  person_id: number;
  email: string;
  token: string;
  is_accepted: boolean;
  accepted_at: string | null;
  invited_by_user_id: number;
  created_at: string;
  person?: Person;
}

/** Friendly relation labels for the UI -> backend mapping. */
export type FriendlyRelation =
  | 'father'
  | 'mother'
  | 'parent'
  | 'son'
  | 'daughter'
  | 'child'
  | 'spouse';
