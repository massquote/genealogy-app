<?php

namespace App\Mail;

use App\Models\Invitation;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Invitation $invitation,
        public User $inviter,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "{$this->inviter->name} invited you to claim your profile on FamilyKnot",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.invitation',
            with: [
                'inviterName' => $this->inviter->name,
                'personName' => $this->invitation->person->full_name,
                'claimUrl' => rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:19173')), '/').'/claim/'.$this->invitation->token,
            ],
        );
    }
}
