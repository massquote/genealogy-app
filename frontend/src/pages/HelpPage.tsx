import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { CollapsibleCard } from '@/components/ui/CollapsibleCard';
import type { ReactNode } from 'react';

export function HelpPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Help &amp; Guide</h1>
        <p className="mt-1 text-slate-600">
          Everything you need to know about FamilyKnot. Click any section to expand.
        </p>
      </header>

      <Card padding="lg" className="border-brand-200 bg-brand-50">
        <p className="text-sm text-brand-900">
          <strong>New here?</strong> Start with{' '}
          <a className="font-semibold underline" href="#what-is">What is FamilyKnot</a>,
          then{' '}
          <a className="font-semibold underline" href="#start">Getting started</a>. The
          two most distinctive features are{' '}
          <a className="font-semibold underline" href="#claim">the claim flow</a> and the{' '}
          <a className="font-semibold underline" href="#tree">tree visualisation</a>.
        </p>
      </Card>

      <CollapsibleCard
        defaultOpen
        title={<span id="what-is">🪢 What is FamilyKnot?</span>}
      >
        <Body>
          <P>
            FamilyKnot is a <strong>collaborative family-tree app</strong>. You start
            from yourself, add relatives one by one, and optionally invite them to claim
            their own profile. When they accept, the two trees merge into one shared graph.
          </P>
          <P>
            The data model is a <em>graph</em>, not a strict tree — marriages and shared
            parents are first-class. Siblings are derived automatically from people who
            share a parent.
          </P>
          <P>
            Every person in the system is one of two states:
          </P>
          <Ul>
            <Li>
              <strong>Claimed</strong> — linked to a real user account. Only that user
              can edit them.
            </Li>
            <Li>
              <strong>Unclaimed</strong> — a profile someone added on their behalf. The
              creator can edit them until the real person claims them.
            </Li>
          </Ul>
        </Body>
      </CollapsibleCard>

      <CollapsibleCard title={<span id="start">🚀 Getting started</span>}>
        <Body>
          <P>
            After you register, you automatically have a Person record claimed by your
            account — that&rsquo;s you. You&rsquo;re the centre of your family tree.
          </P>
          <Ol>
            <Li>
              Open <Link className="text-brand-700 underline" to="/profile">My Profile</Link>{' '}
              to see your details and any relatives in your tree.
            </Li>
            <Li>
              Click <strong>Edit profile</strong> (or your avatar →{' '}
              <strong>Account settings</strong>) to fill in things like date of birth,
              birthplace, and notes.
            </Li>
            <Li>
              Click <strong>Add relative</strong> to start building your family.
            </Li>
          </Ol>
        </Body>
      </CollapsibleCard>

      <CollapsibleCard title={<span id="building">👨‍👩‍👧‍👦 Building your family (Workflow 1)</span>}>
        <Body>
          <H3>Adding a relative</H3>
          <Ol>
            <Li>
              From <Link className="text-brand-700 underline" to="/profile">My Profile</Link>{' '}
              click <strong>Add relative</strong>.
            </Li>
            <Li>
              Pick the relation: <strong>Father</strong>, <strong>Mother</strong>,{' '}
              <strong>Brother / Sister</strong>, <strong>Spouse</strong>,{' '}
              <strong>Son</strong>, or <strong>Daughter</strong>.
            </Li>
            <Li>
              For Brother/Sister, pick which existing parent you share. Add a parent first
              if you don&rsquo;t have one.
            </Li>
            <Li>
              Fill in the relative&rsquo;s details (only first and last name are required).
            </Li>
            <Li>
              <em>Optionally</em> tick the <strong>Send invitation email</strong> box to
              invite them to claim the profile.
            </Li>
          </Ol>

          <H3>Editing a relative</H3>
          <P>
            Click any relative card on your profile, or open them via the tree. From their
            detail page click <strong>Edit</strong>. You can edit anyone you created (until
            they claim their own profile).
          </P>

          <H3>Adding a relative anchored to someone else</H3>
          <P>
            On any person detail page, click <strong>Add relative here</strong>. The new
            relative is connected to that person rather than to you — useful for filling in
            an in-law&rsquo;s family or your grandparents&rsquo; siblings.
          </P>

          <H3>Removing a relative</H3>
          <P>
            On the person detail page, scroll to <strong>Danger zone</strong> and click
            <strong> Remove from tree</strong>. This deletes the person AND all their
            relationships. You cannot delete profiles claimed by other users.
          </P>
        </Body>
      </CollapsibleCard>

      <CollapsibleCard title={<span id="tree">🌳 Family tree visualization (Workflow 2)</span>}>
        <Body>
          <P>
            Open <Link className="text-brand-700 underline" to="/tree">Family Tree</Link>{' '}
            in the nav. The visualisation centres on you and shows descendants going down.
            Spouses appear as a small italic line inside the focused node.
          </P>
          <H3>Controls</H3>
          <Ul>
            <Li><strong>Click</strong> any node to open that person&rsquo;s detail page.</Li>
            <Li><strong>Drag</strong> the canvas to pan around.</Li>
            <Li><strong>Scroll wheel</strong> (or pinch) to zoom in/out.</Li>
            <Li>
              <strong>Re-root upward</strong> pills above the canvas — click a parent to
              re-centre the tree on them. This is how you see ancestors.
            </Li>
            <Li><strong>Centre on me</strong> resets to your own subtree.</Li>
          </Ul>
          <H3>Reading the cards</H3>
          <Ul>
            <Li>Background colour = gender (blue=male, pink=female, violet=other, grey=unknown).</Li>
            <Li>Green check badge = the profile is claimed by a real user.</Li>
            <Li>The italic line under the name shows their spouse(s).</Li>
          </Ul>
        </Body>
      </CollapsibleCard>

      <CollapsibleCard title={<span id="claim">📨 Inviting relatives & the claim flow</span>}>
        <Body>
          <P>
            This is the most distinctive feature. It&rsquo;s how two separate users end up
            sharing one merged family tree.
          </P>
          <H3>To invite someone</H3>
          <Ol>
            <Li>
              Open <Link className="text-brand-700 underline" to="/profile">My Profile</Link>.
              On any unclaimed relative&rsquo;s card, click{' '}
              <strong>Invite to claim</strong>.
            </Li>
            <Li>Enter their email address and submit.</Li>
            <Li>
              They receive an email with a unique <code className="rounded bg-slate-100 px-1">/claim/&lt;token&gt;</code>{' '}
              link. (In dev, the email is caught locally — see{' '}
              <a className="text-brand-700 underline" href="http://localhost:19025" target="_blank" rel="noreferrer">Mailpit</a>.)
            </Li>
          </Ol>
          <H3>What happens when they accept</H3>
          <Ol>
            <Li>They click the email link and land on a public claim page.</Li>
            <Li>
              They sign in or register with the email address the invitation was sent to.
              The email is pre-filled and locked so they can&rsquo;t change it.
            </Li>
            <Li>They see your relative&rsquo;s details and click <strong>Yes, claim this profile</strong>.</Li>
            <Li>
              <strong>The profile flips ownership.</strong> Their account is now linked to
              that Person. From now on, they edit it (you can&rsquo;t).
            </Li>
            <Li>
              <strong>Your trees are now merged.</strong> All people connected to that
              Person — your shared family — appear in their tree, and any new branches
              they add appear in yours.
            </Li>
          </Ol>
          <H3>Status of invitations</H3>
          <P>
            Open <Link className="text-brand-700 underline" to="/invitations">Invitations</Link>{' '}
            in the nav to see two lists:
          </P>
          <Ul>
            <Li>
              <strong>Pending for you</strong> — invitations someone sent to your email
              that you haven&rsquo;t accepted yet.
            </Li>
            <Li>
              <strong>Sent by you</strong> — invitations you&rsquo;ve sent, with{' '}
              <em>Awaiting</em> or <em>Accepted</em> status.
            </Li>
          </Ul>
        </Body>
      </CollapsibleCard>

      <CollapsibleCard title={<span id="integrations">🔌 Integrations</span>}>
        <Body>
          <P>
            Open your avatar menu →{' '}
            <Link className="text-brand-700 underline" to="/integrations">Integrations</Link>.
            Each integration is private to your account and can be toggled on or off
            without losing its config.
          </P>
          <H3>📧 Email — Resend</H3>
          <P>
            By default, invitation emails go to local Mailpit (they don&rsquo;t reach real
            inboxes). Connect a{' '}
            <a className="text-brand-700 underline" href="https://resend.com" target="_blank" rel="noreferrer">Resend</a>{' '}
            API key to send real emails to your invitees.
          </P>
          <Ul>
            <Li><strong>Active</strong> — emails go through Resend to the real recipient.</Li>
            <Li>
              <strong>Disabled</strong> — falls back to Mailpit. Your API key is preserved;
              re-enable any time.
            </Li>
            <Li>
              <strong>Not configured</strong> — same as disabled (Mailpit fallback). Add a
              key to send for real.
            </Li>
          </Ul>
          <H3>🔔 Push notifications</H3>
          <P>
            Get a system notification when something happens in your tree, even when
            FamilyKnot isn&rsquo;t open. Per-device — you can enable on multiple browsers.
          </P>
          <Ul>
            <Li>Toggle on this device → grant the browser permission → done.</Li>
            <Li>The Devices list shows every browser/device you&rsquo;ve enabled it on.</Li>
            <Li>
              <strong>iOS Safari note:</strong> push only works after you install
              FamilyKnot as a PWA from the Share menu.
            </Li>
            <Li>
              Send a test notification from the card to confirm it works on this device.
            </Li>
          </Ul>
        </Body>
      </CollapsibleCard>

      <CollapsibleCard title={<span id="faq">❓ Common questions</span>}>
        <Body>
          <Q>Why don&rsquo;t I see my grandparents on my Profile page?</Q>
          <P>
            The Profile page shows <em>direct</em> relations only — parents, spouses,
            siblings, and children. Grandparents are two hops away, so they appear in the{' '}
            <Link className="text-brand-700 underline" to="/tree">Family Tree</Link>{' '}
            view, not on the Profile.
          </P>

          <Q>How do I add a sibling?</Q>
          <P>
            Add a parent first. Then on the Add Relative form pick{' '}
            <strong>Brother / Sister</strong> and select which parent the sibling shares
            with you.
          </P>

          <Q>Can I edit a relative after they claim their profile?</Q>
          <P>
            No. Once a Person is claimed, only the claiming user can edit it. Your tree
            still shows them, you just can&rsquo;t change their details anymore.
          </P>

          <Q>What happens if I delete an integration?</Q>
          <P>
            For email: the API key is removed and emails fall back to the default
            (Mailpit in dev). For push: existing subscriptions stay registered until they
            naturally expire — you can also remove specific devices from the device list.
          </P>

          <Q>Is my data shared with other users?</Q>
          <P>
            Only with people in your <em>connected family graph</em>. Two separate trees
            (e.g. you and a stranger) are completely isolated until someone accepts an
            invitation that bridges them.
          </P>

          <Q>What email does Mailpit catch in dev?</Q>
          <P>
            All of them. Open{' '}
            <a className="text-brand-700 underline" href="http://localhost:19025" target="_blank" rel="noreferrer">
              http://localhost:19025
            </a>{' '}
            to see every invitation email FamilyKnot has sent.
          </P>
        </Body>
      </CollapsibleCard>

      <CollapsibleCard title={<span id="security">🔒 Privacy &amp; security</span>}>
        <Body>
          <Ul>
            <Li>
              <strong>Tree scoping:</strong> when you open the tree or the people list,
              the API only returns people connected to your claimed Person via parent
              or spouse edges. Strangers&rsquo; trees are invisible.
            </Li>
            <Li>
              <strong>Authorisation:</strong> editing/deleting a person requires being
              the creator (for unclaimed) or the claimer. Backend policies enforce this
              at every endpoint.
            </Li>
            <Li>
              <strong>API keys at rest:</strong> Resend keys are encrypted at the
              database level via Laravel&rsquo;s <code className="rounded bg-slate-100 px-1">encrypted</code>{' '}
              cast. The full key is never returned in any API response — you only ever see
              the masked form (<code className="rounded bg-slate-100 px-1">re_••••••aF7p</code>).
            </Li>
            <Li>
              <strong>Push subscriptions:</strong> stored per device. You can remove any
              device individually from the Integrations page; dead subscriptions are also
              auto-pruned by the backend on next send.
            </Li>
            <Li>
              <strong>Invitation tokens:</strong> 48 random chars, single-use, validated
              against the recipient&rsquo;s email at acceptance time.
            </Li>
          </Ul>
        </Body>
      </CollapsibleCard>

      <CollapsibleCard title={<span id="trouble">🐞 Troubleshooting</span>}>
        <Body>
          <Q>Push test says &ldquo;Sent to 1 device&rdquo; but I don&rsquo;t see anything.</Q>
          <P>
            Check Windows / macOS notification settings for your browser; Focus Assist
            and Do Not Disturb modes silently suppress notifications. Also try opening
            the browser&rsquo;s site settings and confirming notifications are allowed.
          </P>

          <Q>Resend test send fails with &ldquo;You can only send to your own email&rdquo;.</Q>
          <P>
            Resend is in test mode until you verify a domain at{' '}
            <a className="text-brand-700 underline" href="https://resend.com/domains" target="_blank" rel="noreferrer">
              resend.com/domains
            </a>. While in test mode, you can only send to the email that owns the
            Resend account.
          </P>

          <Q>I changed something but the page doesn&rsquo;t update.</Q>
          <P>
            Hard-refresh: <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">Ctrl+Shift+R</kbd>{' '}
            (or <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">Cmd+Shift+R</kbd> on Mac).
            Service Workers can serve stale content otherwise.
          </P>

          <Q>I lost track of my demo accounts.</Q>
          <P>
            Run <code className="rounded bg-slate-100 px-1">make demo</code> to wipe and
            re-seed. The demo accounts are{' '}
            <code className="rounded bg-slate-100 px-1">felix@demo.test</code> and{' '}
            <code className="rounded bg-slate-100 px-1">alice@demo.test</code>, both with
            password <code className="rounded bg-slate-100 px-1">password</code>.
          </P>
        </Body>
      </CollapsibleCard>

      <Card padding="md" className="bg-slate-50 text-sm text-slate-600">
        Still stuck? Read the full README at{' '}
        <a
          className="text-brand-700 underline"
          href="https://github.com/massquote/genealogy-app"
          target="_blank"
          rel="noreferrer"
        >
          github.com/massquote/genealogy-app
        </a>
        .
      </Card>
    </div>
  );
}

// ---------- Tiny prose primitives so the page reads cleanly ----------

function Body({ children }: { children: ReactNode }) {
  return <div className="space-y-3 text-sm leading-relaxed text-slate-700">{children}</div>;
}
function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}
function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-4 text-sm font-semibold text-slate-900">{children}</h3>;
}
function Ul({ children }: { children: ReactNode }) {
  return <ul className="ml-5 list-disc space-y-1">{children}</ul>;
}
function Ol({ children }: { children: ReactNode }) {
  return <ol className="ml-5 list-decimal space-y-1">{children}</ol>;
}
function Li({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}
function Q({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-sm font-semibold text-slate-900">{children}</p>;
}
