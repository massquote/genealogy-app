<?php

use App\Models\Integration;
use App\Models\Person;
use App\Models\User;
use App\Services\UserMailerService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;

it('uses the default mailer when the user has no integration', function () {
    $user = User::factory()->create();
    $service = app(UserMailerService::class);

    $mailer = $service->mailerFor($user);

    expect($mailer)->toBe(Mail::mailer());
});

it('uses the default mailer when the integration is disabled', function () {
    $user = User::factory()->create();
    Integration::factory()->disabled()->create(['user_id' => $user->id]);
    $service = app(UserMailerService::class);

    $mailer = $service->mailerFor($user);

    expect($mailer)->toBe(Mail::mailer());
});

it('configures the resend driver with the user key when integration is enabled', function () {
    $user = User::factory()->create();
    Integration::factory()->create([
        'user_id' => $user->id,
        'config' => [
            'api_key' => 're_TestKey0987654321Special',
            'from_address' => 'mybox@familyknot.app',
        ],
        'is_enabled' => true,
    ]);
    $service = app(UserMailerService::class);

    $service->mailerFor($user);

    expect(Config::get('services.resend.key'))->toBe('re_TestKey0987654321Special');
});

it('marks last_used_at when the integration mailer is selected', function () {
    $user = User::factory()->create();
    $integration = Integration::factory()->create(['user_id' => $user->id]);
    expect($integration->last_used_at)->toBeNull();

    app(UserMailerService::class)->mailerFor($user);

    expect($integration->fresh()->last_used_at)->not->toBeNull();
});

it('falls back to the default mailer when sending an invitation if user has no integration', function () {
    Mail::fake();
    $user = User::factory()->create(['email' => 'sender@example.test']);
    $person = Person::factory()->claimedBy($user)->create();
    $relative = Person::factory()->create(['created_by_user_id' => $user->id]);

    Sanctum::actingAs($user);

    $this->postJson('/api/v1/invitations', [
        'person_id' => $relative->id,
        'email' => 'them@example.test',
    ])->assertCreated();

    Mail::assertSent(\App\Mail\InvitationMail::class);
});
