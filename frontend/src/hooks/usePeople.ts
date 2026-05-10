import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Person } from '@/types';

interface PeopleListResponse {
  data: Person[];
  meta: { total: number; rooted_at: number | null };
}

export interface CreatePersonPayload {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  date_of_birth?: string | null;
  date_of_death?: string | null;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthplace?: string | null;
  bio?: string | null;
  relationship?: {
    anchor_id: number;
    relation: 'parent' | 'child' | 'spouse';
  };
}

export type UpdatePersonPayload = Partial<Omit<CreatePersonPayload, 'relationship'>>;

const peopleListKey = ['people', 'list'] as const;

export function usePeople() {
  return useQuery({
    queryKey: peopleListKey,
    queryFn: async () => {
      const { data } = await api.get<PeopleListResponse>('/people');
      return data;
    },
  });
}

export function usePerson(id: number | undefined) {
  return useQuery({
    queryKey: ['people', 'show', id],
    enabled: id !== undefined,
    queryFn: async () => {
      const { data } = await api.get<{ data: Person }>(`/people/${id}`);
      return data.data;
    },
  });
}

function invalidatePeople(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['people'] });
  qc.invalidateQueries({ queryKey: ['auth', 'me'] });
}

export function useCreatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePersonPayload) => {
      const { data } = await api.post<{ data: Person; relationship_id: number | null }>(
        '/people',
        payload,
      );
      return data;
    },
    onSuccess: () => invalidatePeople(qc),
  });
}

export function useUpdatePerson(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdatePersonPayload) => {
      const { data } = await api.patch<{ data: Person }>(`/people/${id}`, payload);
      return data.data;
    },
    onSuccess: () => invalidatePeople(qc),
  });
}

export function useDeletePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/people/${id}`);
    },
    onSuccess: () => invalidatePeople(qc),
  });
}
