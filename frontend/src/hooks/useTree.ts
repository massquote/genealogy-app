import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Person, Relationship } from '@/types';

interface TreeResponse {
  data: {
    people: Person[];
    relationships: Relationship[];
  };
  meta: {
    total_people: number;
    total_relationships: number;
    rooted_at: number | null;
  };
}

export function useTree(rootId?: number) {
  return useQuery({
    queryKey: ['tree', rootId ?? 'self'],
    queryFn: async () => {
      const params = rootId ? { root_id: rootId } : undefined;
      const { data } = await api.get<TreeResponse>('/tree', { params });
      return data;
    },
  });
}
