import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Integration } from '@/types';

interface IntegrationsResponse {
  data: Integration[];
}

const queryKey = ['integrations'] as const;

export function useIntegrations() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await api.get<IntegrationsResponse>('/integrations');
      return data.data;
    },
  });
}

export function useEmailIntegration() {
  const integrations = useIntegrations();
  return {
    ...integrations,
    integration: integrations.data?.find((i) => i.type === 'email') ?? null,
  };
}

export interface UpsertEmailPayload {
  api_key: string;
  from_address: string;
  is_enabled?: boolean;
}

export function useUpsertEmailIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertEmailPayload) => {
      const { data } = await api.put<{ data: Integration }>('/integrations/email', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

export function useToggleEmailIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch<{ data: Integration }>('/integrations/email/toggle');
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

export function useDeleteEmailIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete('/integrations/email');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

export function useTestEmailIntegration() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ message: string }>('/integrations/email/test');
      return data;
    },
  });
}
