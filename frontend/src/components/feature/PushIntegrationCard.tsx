import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CardDescription } from '@/components/ui/Card';
import { CollapsibleCard } from '@/components/ui/CollapsibleCard';
import { StatusBadge, type StatusBadgeTone } from '@/components/ui/StatusBadge';
import { Toggle } from '@/components/ui/Toggle';
import {
  useDeletePushDevice,
  usePush,
  usePushDevices,
  useTestPush,
} from '@/hooks/usePush';

function shortDevice(ua: string | null): string {
  if (!ua) return 'Unknown device';
  const m = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)[\/\s](\d+)/i);
  const browser = m ? `${m[1]} ${m[2]}` : 'Browser';
  const os = ua.includes('Mac')
    ? 'macOS'
    : ua.includes('Windows')
      ? 'Windows'
      : ua.includes('Linux')
        ? 'Linux'
        : ua.includes('iPhone') || ua.includes('iPad')
          ? 'iOS'
          : ua.includes('Android')
            ? 'Android'
            : '';
  return os ? `${browser} on ${os}` : browser;
}

function pushStatus(args: {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribedHere: boolean;
  deviceCount: number;
}): { tone: StatusBadgeTone; label: string; subtitle: string } {
  if (!args.isSupported) {
    return {
      tone: 'slate',
      label: 'Not supported',
      subtitle: 'Try this in Chrome, Firefox, or Edge.',
    };
  }
  if (args.permission === 'denied') {
    return {
      tone: 'red',
      label: 'Blocked',
      subtitle: 'You blocked notifications in your browser settings.',
    };
  }
  if (args.deviceCount === 0) {
    return {
      tone: 'slate',
      label: 'Off',
      subtitle: 'No devices enabled. Toggle on to receive notifications.',
    };
  }
  if (!args.isSubscribedHere) {
    return {
      tone: 'amber',
      label: `${args.deviceCount} other device(s)`,
      subtitle: 'This browser is not subscribed yet.',
    };
  }
  return {
    tone: 'green',
    label: `Active · ${args.deviceCount}`,
    subtitle: 'You will receive notifications on this device.',
  };
}

export function PushIntegrationCard() {
  const push = usePush();
  const devices = usePushDevices();
  const test = useTestPush();
  const removeDevice = useDeletePushDevice();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggle = async (next: boolean) => {
    setError(null);
    setSuccess(null);
    try {
      if (next) {
        await push.subscribe();
        setSuccess('Enabled on this device.');
      } else {
        await push.unsubscribe();
        setSuccess('Disabled on this device.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleTest = async () => {
    setError(null);
    setSuccess(null);
    try {
      const res = await test.mutateAsync();
      setSuccess(res.message);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message ?? e.message ?? 'Test failed');
    }
  };

  const deviceCount = devices.data?.length ?? 0;
  const status = pushStatus({
    isSupported: push.isSupported,
    permission: push.permission,
    isSubscribedHere: push.isSubscribed === true,
    deviceCount,
  });

  return (
    <CollapsibleCard
      title={<span>🔔 Push notifications</span>}
      subtitle={status.subtitle}
      status={
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
          {push.isSupported && (
            <Toggle
              checked={push.isSubscribed === true}
              onChange={handleToggle}
              disabled={push.isSubscribed === null || push.permission === 'denied'}
              ariaLabel="Toggle push notifications on this device"
            />
          )}
        </div>
      }
    >
      <CardDescription>
        Get a system notification when something happens in your tree — even when FamilyKnot
        isn&rsquo;t open.
      </CardDescription>

      {!push.isSupported && (
        <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold">ⓘ Not supported on this browser</p>
          <p className="mt-1">
            Web Push needs Service Worker + PushManager + Notification APIs. Try Chrome,
            Firefox, or Edge.
          </p>
        </div>
      )}

      {push.permission === 'denied' && push.isSupported && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Permission blocked</p>
          <p className="mt-1">
            You blocked notifications for this site. Re-enable in your browser&rsquo;s site
            settings, then come back and toggle this on.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {success && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      )}

      {push.isSupported && deviceCount > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Registered devices ({deviceCount})
          </h3>
          <ul className="mt-3 space-y-2">
            {devices.data!.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {shortDevice(d.user_agent)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Added {new Date(d.created_at).toLocaleDateString()}
                    {d.last_used_at &&
                      ` · last push ${new Date(d.last_used_at).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs font-medium text-red-600 hover:underline"
                  onClick={() => removeDevice.mutateAsync(d.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTest}
              isLoading={test.isPending}
            >
              Send test notification
            </Button>
          </div>
        </div>
      )}

      <BehaviourPanel
        isSupported={push.isSupported}
        isSubscribedHere={push.isSubscribed === true}
        deviceCount={deviceCount}
      />
    </CollapsibleCard>
  );
}

function BehaviourPanel({
  isSupported,
  isSubscribedHere,
  deviceCount,
}: {
  isSupported: boolean;
  isSubscribedHere: boolean;
  deviceCount: number;
}) {
  let title: string;
  let body: string;
  let tone: 'green' | 'amber' | 'slate';

  if (!isSupported) {
    title = 'Push is not active';
    body =
      'Without Web Push, you only see notifications when FamilyKnot is open in a browser tab. Important things still happen — invitations, claims, new relatives — you just have to refresh to see them.';
    tone = 'slate';
  } else if (deviceCount === 0) {
    title = 'No devices enabled — what happens';
    body =
      'You will not receive system notifications. To know about new invitations or claims, you have to keep FamilyKnot open in a tab and refresh. Toggle this on to get a notification on this device.';
    tone = 'slate';
  } else if (!isSubscribedHere) {
    title = 'This device is not subscribed';
    body = `You have ${deviceCount} other device(s) registered. They will receive notifications, but THIS browser won't until you toggle the switch on.`;
    tone = 'amber';
  } else {
    title = `Active on ${deviceCount} device(s)`;
    body =
      'You will get a system notification when someone sends you an invitation or claims a profile in your tree. Click the notification to jump back into FamilyKnot.';
    tone = 'green';
  }

  const toneClasses = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  } as const;

  return (
    <div className={`mt-6 rounded-md border p-4 text-sm ${toneClasses[tone]}`}>
      <p className="font-semibold">ⓘ {title}</p>
      <p className="mt-1">{body}</p>
      <p className="mt-2 text-xs opacity-75">
        Note: on iPhone, Safari only allows push when FamilyKnot is installed as a PWA from the
        Share menu.
      </p>
    </div>
  );
}
