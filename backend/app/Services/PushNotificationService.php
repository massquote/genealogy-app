<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

/**
 * Sends Web Push notifications to a user's subscribed devices.
 *
 * Subscriptions that the push service rejects with 404 / 410 (gone) are
 * automatically pruned so we don't keep retrying dead endpoints.
 */
class PushNotificationService
{
    /**
     * Send a notification payload to all of a user's push subscriptions.
     *
     * @return array{sent:int, pruned:int, failed:int}
     */
    public function sendToUser(User $user, array $payload): array
    {
        $subscriptions = $user->pushSubscriptions()->get();

        if ($subscriptions->isEmpty()) {
            return ['sent' => 0, 'pruned' => 0, 'failed' => 0];
        }

        $publicKey = config('services.vapid.public_key');
        $privateKey = config('services.vapid.private_key');
        $subject = config('services.vapid.subject', 'mailto:no-reply@familyknot.test');

        if (!$publicKey || !$privateKey) {
            Log::warning('VAPID keys missing — push notifications disabled.');
            return ['sent' => 0, 'pruned' => 0, 'failed' => $subscriptions->count()];
        }

        $webPush = $this->makeWebPush([
            'VAPID' => [
                'subject' => $subject,
                'publicKey' => $publicKey,
                'privateKey' => $privateKey,
            ],
        ]);

        $body = json_encode($payload, JSON_UNESCAPED_SLASHES);

        foreach ($subscriptions as $sub) {
            $webPush->queueNotification(
                Subscription::create($sub->toSubscriptionArray()),
                $body,
            );
        }

        $sent = 0;
        $pruned = 0;
        $failed = 0;

        foreach ($webPush->flush() as $report) {
            $endpoint = $report->getEndpoint();
            $sub = $subscriptions->firstWhere('endpoint', $endpoint);

            if ($report->isSuccess()) {
                $sent++;
                $sub?->forceFill(['last_used_at' => now()])->save();
                continue;
            }

            $statusCode = $report->getResponse()?->getStatusCode();
            if (in_array($statusCode, [404, 410], true)) {
                $sub?->delete();
                $pruned++;
            } else {
                $failed++;
                Log::warning('Push send failed', [
                    'endpoint' => $endpoint,
                    'status' => $statusCode,
                    'reason' => $report->getReason(),
                ]);
            }
        }

        return ['sent' => $sent, 'pruned' => $pruned, 'failed' => $failed];
    }

    /**
     * Indirection so tests can swap in a fake.
     */
    protected function makeWebPush(array $auth): WebPush
    {
        return new WebPush($auth);
    }
}
