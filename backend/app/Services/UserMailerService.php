<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Contracts\Mail\Mailer as MailerContract;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

/**
 * Picks the right mailer to use when sending on behalf of a user.
 *
 * - If the user has an enabled `email` integration with an API key:
 *     -> Configure the Resend driver with their key and return that mailer.
 * - Otherwise:
 *     -> Return the application's default mailer (Mailpit in dev).
 *
 * The dynamic config change only affects the current request — Laravel
 * boots fresh on the next one.
 */
class UserMailerService
{
    public function mailerFor(User $user): MailerContract
    {
        $integration = $user->emailIntegration()->first();

        if ($integration && $integration->isUsable()) {
            // Inject this user's Resend key into the runtime config and
            // make sure any cached resend mailer is rebuilt with it.
            Config::set('services.resend.key', $integration->getApiKey());
            Mail::purge('resend');

            $integration->forceFill(['last_used_at' => now()])->save();

            return Mail::mailer('resend');
        }

        return Mail::mailer();
    }

    /**
     * Convenience: returns the from-address override (if any) for the user.
     */
    public function fromAddressFor(User $user): ?string
    {
        return $user->emailIntegration()->first()?->getFromAddress();
    }
}
