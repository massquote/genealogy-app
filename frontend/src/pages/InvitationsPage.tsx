import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { useAcceptInvitation, useInvitations } from '@/hooks/useInvitations';
import type { Invitation } from '@/types';

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString();
}

export function InvitationsPage() {
  const invitations = useInvitations();
  const accept = useAcceptInvitation();

  if (invitations.isLoading) return <p className="text-slate-500">Loading invitations…</p>;
  if (invitations.isError) return <p className="text-red-600">Could not load invitations.</p>;

  const { sent = [], pending = [] } = invitations.data ?? {};

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Invitations</h1>
        <p className="mt-1 text-slate-600">
          Manage profile claims — both ones you&rsquo;ve sent and ones waiting for you.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-slate-900">
          Pending for you ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <Card padding="lg">
            <CardDescription>
              No invitations are waiting for you right now. When someone adds you to their
              tree and invites you, the claim will appear here.
            </CardDescription>
          </Card>
        ) : (
          <div className="space-y-3">
            {pending.map((inv) => (
              <PendingInviteRow
                key={inv.id}
                invitation={inv}
                onAccept={() => accept.mutateAsync(inv.token)}
                isAccepting={accept.isPending}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-slate-900">
          Sent by you ({sent.length})
        </h2>
        {sent.length === 0 ? (
          <Card padding="lg">
            <CardDescription>
              You haven&rsquo;t sent any invitations yet. Invite a relative from your profile.
            </CardDescription>
            <div className="mt-4">
              <Link to="/profile">
                <Button variant="secondary" size="sm">Back to profile</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {sent.map((inv) => (
              <SentInviteRow key={inv.id} invitation={inv} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PendingInviteRow({
  invitation,
  onAccept,
  isAccepting,
}: {
  invitation: Invitation;
  onAccept: () => Promise<unknown>;
  isAccepting: boolean;
}) {
  return (
    <Card padding="md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {invitation.person?.full_name ?? `Person #${invitation.person_id}`}
          </p>
          <p className="text-xs text-slate-500">
            Sent to {invitation.email} · {formatDate(invitation.created_at)}
          </p>
        </div>
        <Button onClick={() => onAccept()} isLoading={isAccepting} size="sm">
          Claim this profile
        </Button>
      </div>
    </Card>
  );
}

function SentInviteRow({ invitation }: { invitation: Invitation }) {
  return (
    <Card padding="md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {invitation.person?.full_name ?? `Person #${invitation.person_id}`}
          </p>
          <p className="text-xs text-slate-500">
            To {invitation.email} · sent {formatDate(invitation.created_at)}
          </p>
        </div>
        <span
          className={
            invitation.is_accepted
              ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700'
              : 'rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700'
          }
        >
          {invitation.is_accepted ? 'Accepted' : 'Awaiting'}
        </span>
      </div>
    </Card>
  );
}
