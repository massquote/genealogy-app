import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Invitation } from '@/types';

interface InvitationsResponse {
  sent: Invitation[];
  pending: Invitation[];
}

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const { data } = await api.get<InvitationsResponse>('/invitations');
      return data;
    },
  });
}

export function useCreateInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { person_id: number; email: string }) => {
      const { data } = await api.post<{ data: Invitation }>('/invitations', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invitations'] }),
  });
}

export function useAcceptInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      const { data } = await api.post<{ data: Invitation }>(`/invitations/${token}/accept`);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] });
      qc.invalidateQueries({ queryKey: ['people'] });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

interface InvitationLookup {
  email: string;
  is_accepted: boolean;
  person: { id: number; full_name: string };
}

export function useInvitationLookup(token: string | undefined) {
  return useQuery({
    queryKey: ['invitations', 'lookup', token],
    enabled: Boolean(token),
    queryFn: async () => {
      const { data } = await api.get<{ data: InvitationLookup }>(`/invitations/${token}`);
      return data.data;
    },
  });
}
