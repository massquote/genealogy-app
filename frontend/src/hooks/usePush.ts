import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { arrayBufferToBase64Url, isPushSupported, urlBase64ToUint8Array } from '@/lib/push';

interface PushDevice {
  id: number;
  endpoint_tail: string;
  user_agent: string | null;
  last_used_at: string | null;
  created_at: string;
}

interface VapidKeyResponse {
  public_key: string;
  subject: string;
}

const devicesKey = ['push', 'devices'] as const;

export function usePushDevices() {
  return useQuery({
    queryKey: devicesKey,
    queryFn: async () => {
      const { data } = await api.get<{ data: PushDevice[] }>('/push/subscriptions');
      return data.data;
    },
  });
}

export function useDeletePushDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/push/subscriptions/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: devicesKey }),
  });
}

export function useTestPush() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ message: string }>('/push/test');
      return data;
    },
  });
}

/**
 * State + actions for the current browser's push subscription.
 * Wraps the platform Push API and the backend subscription endpoints.
 */
export function usePush() {
  const supported = isPushSupported();
  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? Notification.permission : 'denied',
  );
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const qc = useQueryClient();

  // Check whether THIS browser is already subscribed.
  useEffect(() => {
    if (!supported) {
      setSubscribed(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!cancelled) setSubscribed(Boolean(sub));
      } catch {
        if (!cancelled) setSubscribed(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported) throw new Error('Push notifications are not supported on this browser.');

    // 1. Ask permission
    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== 'granted') {
      throw new Error('Notification permission denied.');
    }

    // 2. Get VAPID public key from backend
    const { data: vapid } = await api.get<VapidKeyResponse>('/push/vapid-public-key');
    if (!vapid.public_key) {
      throw new Error('Server VAPID key is not configured.');
    }

    // 3. Subscribe via PushManager
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid.public_key),
    });

    // 4. Hand subscription to backend
    const json = sub.toJSON();
    await api.post('/push/subscriptions', {
      endpoint: json.endpoint,
      keys: {
        p256dh: json.keys?.p256dh ?? arrayBufferToBase64Url(sub.getKey('p256dh')),
        auth: json.keys?.auth ?? arrayBufferToBase64Url(sub.getKey('auth')),
      },
    });

    setSubscribed(true);
    qc.invalidateQueries({ queryKey: devicesKey });
  }, [supported, qc]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      // Backend cleanup happens via the dead-endpoint pruning on next send,
      // but we can also nudge the device list to refresh:
      qc.invalidateQueries({ queryKey: devicesKey });
    }
    setSubscribed(false);
  }, [supported, qc]);

  return {
    isSupported: supported,
    permission,
    isSubscribed: subscribed,
    subscribe,
    unsubscribe,
  };
}
