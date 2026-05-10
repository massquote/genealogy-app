import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { AuthResponse, User } from '@/types';

export interface RegisterPayload {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'unknown';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function useAuth() {
  const { user, token, setSession, setUser, clear, isAuthenticated } = useAuthStore();
  return { user, token, setSession, setUser, clear, isAuthenticated: isAuthenticated() };
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await api.post<AuthResponse>('/auth/register', payload);
      return data;
    },
    onSuccess: (data) => setSession(data.user, data.token),
  });
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post<AuthResponse>('/auth/login', payload);
      return data;
    },
    onSuccess: (data) => setSession(data.user, data.token),
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSettled: () => {
      clear();
      queryClient.clear();
    },
  });
}

export function useMe() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ['auth', 'me'],
    enabled: Boolean(token),
    queryFn: async () => {
      const { data } = await api.get<{ user: User }>('/auth/me');
      setUser(data.user);
      return data.user;
    },
  });
}
