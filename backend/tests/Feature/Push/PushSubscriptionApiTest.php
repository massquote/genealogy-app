<?php

use App\Models\PushSubscription;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('exposes the VAPID public key without authentication', function () {
    config([
        'services.vapid.public_key' => 'TEST_PUBLIC_KEY',
        'services.vapid.subject' => 'mailto:test@familyknot.test',
    ]);

    $response = $this->getJson('/api/v1/push/vapid-public-key');

    $response->assertOk()
        ->assertJsonPath('public_key', 'TEST_PUBLIC_KEY')
        ->assertJsonPath('subject', 'mailto:test@familyknot.test');
});

it('returns an empty list when the user has no subscriptions', function () {
    Sanctum::actingAs(User::factory()->create());
    $this->getJson('/api/v1/push/subscriptions')
        ->assertOk()
        ->assertJsonPath('data', []);
});

it('stores a new push subscription for the current user', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $payload = [
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/abc123def456',
        'keys' => [
            'p256dh' => str_repeat('a', 87),
            'auth' => str_repeat('b', 22),
        ],
    ];

    $response = $this->postJson('/api/v1/push/subscriptions', $payload);

    $response->assertCreated()
        ->assertJsonPath('data.endpoint_tail', substr($payload['endpoint'], -16));
    expect(PushSubscription::count())->toBe(1);
    expect(PushSubscription::first()->user_id)->toBe($user->id);
});

it('is idempotent on the endpoint — same endpoint twice does not duplicate', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $payload = [
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/sameendpoint',
        'keys' => ['p256dh' => str_repeat('a', 87), 'auth' => str_repeat('b', 22)],
    ];

    $this->postJson('/api/v1/push/subscriptions', $payload)->assertCreated();
    $this->postJson('/api/v1/push/subscriptions', $payload)->assertCreated();

    expect(PushSubscription::count())->toBe(1);
});

it('rejects malformed payloads', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/push/subscriptions', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['endpoint', 'keys.p256dh', 'keys.auth']);
});

it('lets the owner delete their own subscription', function () {
    $user = User::factory()->create();
    $sub = PushSubscription::factory()->create(['user_id' => $user->id]);
    Sanctum::actingAs($user);

    $this->deleteJson("/api/v1/push/subscriptions/{$sub->id}")->assertNoContent();
    expect(PushSubscription::find($sub->id))->toBeNull();
});

it('forbids deleting another user\'s subscription', function () {
    $other = User::factory()->create();
    $sub = PushSubscription::factory()->create(['user_id' => $other->id]);
    Sanctum::actingAs(User::factory()->create());

    $this->deleteJson("/api/v1/push/subscriptions/{$sub->id}")->assertForbidden();
    expect(PushSubscription::find($sub->id))->not->toBeNull();
});

it('isolates subscription listing between users', function () {
    $other = User::factory()->create();
    PushSubscription::factory()->count(3)->create(['user_id' => $other->id]);

    Sanctum::actingAs(User::factory()->create());
    $this->getJson('/api/v1/push/subscriptions')
        ->assertOk()
        ->assertJsonPath('data', []);
});

it('rejects test send when the user has no subscriptions', function () {
    Sanctum::actingAs(User::factory()->create());
    $this->postJson('/api/v1/push/test')->assertStatus(422);
});
