import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { CollapsibleCard } from '@/components/ui/CollapsibleCard';
import { StatusBadge, type StatusBadgeTone } from '@/components/ui/StatusBadge';
import { TextField } from '@/components/ui/TextField';
import { Toggle } from '@/components/ui/Toggle';
import {
  useDeleteEmailIntegration,
  useEmailIntegration,
  useTestEmailIntegration,
  useToggleEmailIntegration,
  useUpsertEmailIntegration,
} from '@/hooks/useIntegrations';
import { applyServerErrors } from '@/lib/apiErrors';
import { PushIntegrationCard } from '@/components/feature/PushIntegrationCard';

const schema = z.object({
  api_key: z
    .string()
    .min(10, 'Looks too short')
    .max(255)
    .regex(/^re_[A-Za-z0-9_]+$/, 'Resend keys start with "re_".'),
  from_address: z.string().email('Enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

function emailStatus(integration: { has_api_key: boolean; is_enabled: boolean } | null): {
  tone: StatusBadgeTone;
  label: string;
  subtitle: string;
} {
  if (!integration?.has_api_key) {
    return {
      tone: 'slate',
      label: 'Not configured',
      subtitle: 'Add a Resend API key to send real invitation emails.',
    };
  }
  if (!integration.is_enabled) {
    return {
      tone: 'amber',
      label: 'Disabled',
      subtitle: 'Falls back to Mailpit until re-enabled.',
    };
  }
  return {
    tone: 'green',
    label: 'Active',
    subtitle: 'Invitations are being sent through Resend.',
  };
}

export function IntegrationsPage() {
  const { integration, isLoading } = useEmailIntegration();
  const upsert = useUpsertEmailIntegration();
  const toggle = useToggleEmailIntegration();
  const remove = useDeleteEmailIntegration();
  const test = useTestEmailIntegration();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { api_key: '', from_address: '' },
  });

  useEffect(() => {
    if (integration) {
      reset({ api_key: '', from_address: integration.from_address ?? '' });
    }
  }, [integration, reset]);

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    setSuccessMsg(null);
    setTestResult(null);
    try {
      await upsert.mutateAsync({
        api_key: values.api_key,
        from_address: values.from_address,
        is_enabled: integration?.is_enabled ?? true,
      });
      setSuccessMsg('Saved.');
    } catch (err) {
      const msg = applyServerErrors<FormValues>(err, setError);
      if (msg) setFormError(msg);
    }
  };

  const handleToggle = async (e?: React.MouseEvent) => {
    // Prevent the click from collapsing/expanding the card
    e?.stopPropagation();
    setSuccessMsg(null);
    setTestResult(null);
    await toggle.mutateAsync();
  };

  const handleDelete = async () => {
    if (!confirm('Disconnect Resend? Your API key will be removed.')) return;
    await remove.mutateAsync();
    reset({ api_key: '', from_address: '' });
    setSuccessMsg('Integration disconnected.');
  };

  const handleTest = async () => {
    setTestResult(null);
    try {
      const res = await test.mutateAsync();
      setTestResult({ ok: true, msg: res.message });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setTestResult({ ok: false, msg: e.response?.data?.message ?? e.message ?? 'Test failed' });
    }
  };

  const status = emailStatus(integration);
  const startOpen = !integration?.has_api_key;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Integrations</h1>
        <p className="mt-1 text-slate-600">
          Connect FamilyKnot to third-party services. Click any card to expand.
        </p>
      </header>

      <CollapsibleCard
        defaultOpen={startOpen}
        title={<span>📧 Email — Resend</span>}
        subtitle={status.subtitle}
        status={
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
            {integration?.has_api_key && (
              <Toggle
                checked={integration.is_enabled}
                onChange={() => handleToggle()}
                ariaLabel="Toggle email integration"
              />
            )}
          </div>
        }
      >
        <CardDescription>
          Send real invitation emails through{' '}
          <a
            href="https://resend.com"
            target="_blank"
            rel="noreferrer"
            className="text-brand-700 hover:underline"
          >
            Resend
          </a>
          . Get an API key at{' '}
          <code className="rounded bg-slate-100 px-1 text-xs">resend.com/api-keys</code>.
        </CardDescription>

        {isLoading ? (
          <p className="mt-6 text-slate-500">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <TextField
              label="API key"
              type="password"
              placeholder={integration?.has_api_key ? `Saved: ${integration.api_key_masked}` : 're_…'}
              autoComplete="off"
              {...register('api_key')}
              error={errors.api_key?.message}
              helpText={
                integration?.has_api_key
                  ? 'Leave blank to keep the saved key. Enter a new one to replace it.'
                  : 'Starts with re_ — find this in your Resend dashboard.'
              }
            />

            <TextField
              label="From address"
              type="email"
              placeholder="no-reply@yourdomain.com"
              {...register('from_address')}
              error={errors.from_address?.message}
              helpText="Must be on a domain you've verified in Resend (or use onboarding@resend.dev for testing)."
            />

            {formError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
            {successMsg && (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMsg}</p>
            )}
            {testResult && (
              <p
                className={
                  testResult.ok
                    ? 'rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700'
                    : 'rounded-md bg-red-50 px-3 py-2 text-sm text-red-700'
                }
              >
                {testResult.msg}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              {integration?.has_api_key && (
                <>
                  <Button type="button" variant="ghost" onClick={handleDelete} isLoading={remove.isPending}>
                    Disconnect
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleTest}
                    isLoading={test.isPending}
                    disabled={!integration.is_enabled}
                  >
                    Send test email
                  </Button>
                </>
              )}
              <Button type="submit" isLoading={isSubmitting}>
                {integration?.has_api_key ? (isDirty ? 'Save changes' : 'Save') : 'Save & connect'}
              </Button>
            </div>
          </form>
        )}

        <BehaviourPanel
          isEnabled={integration?.is_enabled ?? false}
          hasKey={integration?.has_api_key ?? false}
        />
      </CollapsibleCard>

      <PushIntegrationCard />

      <Card padding="lg" className="border-dashed bg-slate-50">
        <CardTitle className="text-slate-700">More integrations coming…</CardTitle>
        <CardDescription>
          The architecture supports adding calendar sync, image storage, Slack, and more.
          Email and push notifications are the first of many.
        </CardDescription>
      </Card>
    </div>
  );
}

function BehaviourPanel({ isEnabled, hasKey }: { isEnabled: boolean; hasKey: boolean }) {
  let copy: { title: string; body: string; tone: 'green' | 'amber' | 'slate' };

  if (!hasKey) {
    copy = {
      title: 'No integration configured',
      body: 'Invitation emails are sent through the system default (Mailpit in development). They never leave your machine — view them at http://localhost:19025. Real recipients will not receive anything until you connect Resend.',
      tone: 'slate',
    };
  } else if (!isEnabled) {
    copy = {
      title: 'Currently disabled — what happens',
      body: 'Invitation emails fall back to the system default (Mailpit in development). Recipients in production will not actually receive your invitations; you would need to share the /claim/<token> URL manually instead. Your API key is preserved — re-enable any time to resume real delivery.',
      tone: 'amber',
    };
  } else {
    copy = {
      title: 'Enabled — sending live',
      body: 'Invitation emails are sent through Resend using your API key, from the address above. Recipients receive them in their real inbox.',
      tone: 'green',
    };
  }

  const toneClasses = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  } as const;

  return (
    <div className={`mt-6 rounded-md border p-4 text-sm ${toneClasses[copy.tone]}`}>
      <p className="font-semibold">ⓘ {copy.title}</p>
      <p className="mt-1 whitespace-pre-line">{copy.body}</p>
    </div>
  );
}
