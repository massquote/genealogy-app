import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Relationship, RelationshipType } from '@/types';

interface CreateRelationshipPayload {
  person_a_id: number;
  person_b_id: number;
  type: RelationshipType;
}

export function useCreateRelationship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRelationshipPayload) => {
      const { data } = await api.post<{ data: Relationship }>('/relationships', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['people'] }),
  });
}

export function useDeleteRelationship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/relationships/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['people'] }),
  });
}
