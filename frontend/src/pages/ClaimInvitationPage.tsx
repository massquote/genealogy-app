import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useAcceptInvitation, useInvitationLookup } from '@/hooks/useInvitations';
import { applyServerErrors } from '@/lib/apiErrors';

export function ClaimInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const lookup = useInvitationLookup(token);
  const accept = useAcceptInvitation();
  const [error, setError] = useState<string | null>(null);

  if (lookup.isLoading) {
    return <CenteredCard title="Looking up your invitation…" />;
  }

  if (lookup.isError) {
    return (
      <CenteredCard title="Invitation not found" tone="error">
        <CardDescription>
          This claim link is invalid or has been removed. Ask whoever invited you to send
          a new one.
        </CardDescription>
      </CenteredCard>
    );
  }

  const invite = lookup.data!;

  if (invite.is_accepted) {
    return (
      <CenteredCard title="Already accepted">
        <CardDescription>
          The profile for <strong>{invite.person.full_name}</strong> has already been claimed.
          {isAuthenticated ? (
            <>
              {' '}
              <Link to="/profile" className="text-brand-700 hover:underline">
                Go to your profile
              </Link>
              .
            </>
          ) : null}
        </CardDescription>
      </CenteredCard>
    );
  }

  // Not signed in → prompt
  if (!isAuthenticated) {
    const claimPath = `/claim/${token}`;
    return (
      <CenteredCard title="You've been invited to FamilyKnot">
        <CardDescription>
          Someone added a profile for <strong>{invite.person.full_name}</strong> in their
          family tree and thinks that's you. Sign in or create an account with{' '}
          <strong>{invite.email}</strong> to claim it.
        </CardDescription>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to={`/register?redirectTo=${encodeURIComponent(claimPath)}&email=${encodeURIComponent(invite.email)}`}>
            <Button>Create account</Button>
          </Link>
          <Link to={`/login?redirectTo=${encodeURIComponent(claimPath)}`}>
            <Button variant="secondary">Sign in</Button>
          </Link>
        </div>
      </CenteredCard>
    );
  }

  // Signed in but email mismatch
  if (user?.email && user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <CenteredCard title="Different email" tone="error">
        <CardDescription>
          This invitation was sent to <strong>{invite.email}</strong>, but you're signed in
          as <strong>{user.email}</strong>. Sign out and back in with the right email to claim.
        </CardDescription>
      </CenteredCard>
    );
  }

  // Signed in, email matches → show accept button
  const handleAccept = async () => {
    setError(null);
    try {
      await accept.mutateAsync(token!);
      navigate('/profile');
    } catch (err) {
      const msg = applyServerErrors(err, () => undefined as never);
      if (msg) setError(msg);
    }
  };

  return (
    <CenteredCard title="Claim your profile">
      <CardDescription>
        Accepting will link <strong>{invite.person.full_name}</strong> to your account and
        merge that branch into your family tree.
      </CardDescription>
      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="mt-6 flex gap-2">
        <Button onClick={handleAccept} isLoading={accept.isPending}>
          Yes, claim this profile
        </Button>
        <Link to="/profile">
          <Button variant="ghost">Not now</Button>
        </Link>
      </div>
    </CenteredCard>
  );
}

function CenteredCard({
  title,
  children,
  tone = 'default',
}: {
  title: string;
  children?: React.ReactNode;
  tone?: 'default' | 'error';
}) {
  return (
    <div className="mx-auto max-w-lg py-8">
      <Card padding="lg" className={tone === 'error' ? 'border-red-200' : undefined}>
        <CardTitle>{title}</CardTitle>
        {children}
      </Card>
    </div>
  );
}
