<?php

use App\Models\PushSubscription;
use App\Models\User;
use App\Services\PushNotificationService;
use Minishlink\WebPush\MessageSentReport;
use Minishlink\WebPush\SubscriptionInterface;
use Minishlink\WebPush\WebPush;

class FakeWebPush extends WebPush
{
    public array $queued = [];
    public array $resultsToYield = [];

    public function __construct() {} // skip parent ctor

    public function queueNotification(
        SubscriptionInterface $subscription,
        ?string $payload = null,
        array $options = [],
        array $auth = [],
    ): void {
        $this->queued[] = ['endpoint' => $subscription->getEndpoint(), 'payload' => $payload];
    }

    public function flush(?int $batchSize = null): \Generator
    {
        foreach ($this->resultsToYield as $r) {
            yield $r;
        }
    }
}

class PushServiceWithFake extends PushNotificationService
{
    public FakeWebPush $fake;

    public function __construct()
    {
        $this->fake = new FakeWebPush();
    }

    protected function makeWebPush(array $auth): WebPush
    {
        return $this->fake;
    }
}

beforeEach(function () {
    config([
        'services.vapid.public_key' => 'PUB',
        'services.vapid.private_key' => 'PRIV',
        'services.vapid.subject' => 'mailto:t@x',
    ]);
});

it('returns zeros when the user has no subscriptions', function () {
    $user = User::factory()->create();
    $service = new PushServiceWithFake();

    $result = $service->sendToUser($user, ['title' => 'hi']);

    expect($result)->toBe(['sent' => 0, 'pruned' => 0, 'failed' => 0]);
});

it('counts sends, prunes 410-gone subscriptions, and reports failures', function () {
    $user = User::factory()->create();
    $okSub = PushSubscription::factory()->create([
        'user_id' => $user->id,
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/OK',
    ]);
    $deadSub = PushSubscription::factory()->create([
        'user_id' => $user->id,
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/DEAD',
    ]);
    $failSub = PushSubscription::factory()->create([
        'user_id' => $user->id,
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/FAIL',
    ]);

    $service = new PushServiceWithFake();

    $service->fake->resultsToYield = [
        makeReport($okSub->endpoint, success: true),
        makeReport($deadSub->endpoint, success: false, status: 410, reason: 'Gone'),
        makeReport($failSub->endpoint, success: false, status: 500, reason: 'Server error'),
    ];

    $result = $service->sendToUser($user, ['title' => 'hi']);

    expect($result['sent'])->toBe(1);
    expect($result['pruned'])->toBe(1);
    expect($result['failed'])->toBe(1);
    expect(PushSubscription::find($deadSub->id))->toBeNull();
    expect(PushSubscription::find($okSub->id))->not->toBeNull();
    expect(PushSubscription::find($failSub->id))->not->toBeNull();
});

it('updates last_used_at on successful sends', function () {
    $user = User::factory()->create();
    $sub = PushSubscription::factory()->create([
        'user_id' => $user->id,
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/OK',
        'last_used_at' => null,
    ]);

    $service = new PushServiceWithFake();
    $service->fake->resultsToYield = [
        makeReport($sub->endpoint, success: true),
    ];

    $service->sendToUser($user, ['title' => 'hi']);

    expect($sub->fresh()->last_used_at)->not->toBeNull();
});

it('returns failed=count when VAPID keys are missing', function () {
    config(['services.vapid.public_key' => null, 'services.vapid.private_key' => null]);

    $user = User::factory()->create();
    PushSubscription::factory()->count(2)->create(['user_id' => $user->id]);

    $service = new PushServiceWithFake();
    $result = $service->sendToUser($user, ['title' => 'hi']);

    expect($result['failed'])->toBe(2);
    expect($result['sent'])->toBe(0);
});

/** Helper to build a report stub since MessageSentReport is final-ish */
function makeReport(string $endpoint, bool $success, int $status = 200, string $reason = 'OK'): MessageSentReport
{
    $request = new \GuzzleHttp\Psr7\Request('POST', $endpoint);
    $response = new \GuzzleHttp\Psr7\Response($status, [], $reason);
    return new MessageSentReport($request, $response, $success, $reason);
}
