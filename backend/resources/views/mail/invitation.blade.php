@component('mail::message')
# You're invited to FamilyKnot

**{{ $inviterName }}** has added a profile for **{{ $personName }}** in their family tree on FamilyKnot, and thinks that's you.

Claim your profile to start contributing your own branches:

@component('mail::button', ['url' => $claimUrl])
Claim my profile
@endcomponent

If you don't recognise this person, you can simply ignore this email — no account will be created.

Warmly,<br>
The FamilyKnot team
@endcomponent
