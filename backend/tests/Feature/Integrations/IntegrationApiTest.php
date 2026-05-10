<?php

use App\Models\Integration;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

it('returns an empty list when the user has no integrations', function () {
    $response = $this->getJson('/api/v1/integrations');

    $response->assertOk()->assertJsonPath('data', []);
});

it('creates an email integration via PUT', function () {
    $response = $this->putJson('/api/v1/integrations/email', [
        'api_key' => 're_TestKey1234567890ABCDEFGHIJ',
        'from_address' => 'no-reply@familyknot.app',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.type', 'email')
        ->assertJsonPath('data.provider', 'resend')
        ->assertJsonPath('data.is_enabled', true)
        ->assertJsonPath('data.has_api_key', true)
        ->assertJsonPath('data.from_address', 'no-reply@familyknot.app');

    expect(Integration::count())->toBe(1);
    $stored = Integration::first();
    expect($stored->getApiKey())->toBe('re_TestKey1234567890ABCDEFGHIJ');
});

it('masks the API key in API responses', function () {
    Integration::factory()->create([
        'user_id' => $this->user->id,
        'config' => [
            'api_key' => 're_RealLongResendKey1234567890aF7p',
            'from_address' => 'no-reply@familyknot.app',
        ],
    ]);

    $response = $this->getJson('/api/v1/integrations');

    $masked = $response->json('data.0.api_key_masked');
    expect($masked)->toStartWith('re_');
    expect($masked)->toEndWith('aF7p');
    expect($masked)->toContain('•');
    // Make sure the FULL key is not anywhere in the response.
    expect($response->getContent())->not->toContain('re_RealLongResendKey1234567890aF7p');
});

it('replaces an existing email integration on subsequent PUTs', function () {
    $this->putJson('/api/v1/integrations/email', [
        'api_key' => 're_FirstKey1234567890XYZ',
        'from_address' => 'old@familyknot.app',
    ])->assertOk();

    $this->putJson('/api/v1/integrations/email', [
        'api_key' => 're_SecondKey1234567890XYZ',
        'from_address' => 'new@familyknot.app',
    ])->assertOk();

    expect(Integration::count())->toBe(1);
    expect(Integration::first()->getApiKey())->toBe('re_SecondKey1234567890XYZ');
    expect(Integration::first()->getFromAddress())->toBe('new@familyknot.app');
});

it('rejects an obviously invalid Resend key shape', function () {
    $response = $this->putJson('/api/v1/integrations/email', [
        'api_key' => 'not-a-real-key',
        'from_address' => 'no-reply@familyknot.app',
    ]);

    $response->assertStatus(422)->assertJsonValidationErrors(['api_key']);
});

it('rejects an invalid from address', function () {
    $response = $this->putJson('/api/v1/integrations/email', [
        'api_key' => 're_TestKey1234567890ABCDEF',
        'from_address' => 'not-an-email',
    ]);

    $response->assertStatus(422)->assertJsonValidationErrors(['from_address']);
});

it('toggles the integration on and off without losing the key', function () {
    Integration::factory()->create([
        'user_id' => $this->user->id,
        'is_enabled' => true,
    ]);

    $r1 = $this->patchJson('/api/v1/integrations/email/toggle');
    $r1->assertOk()->assertJsonPath('data.is_enabled', false);

    $r2 = $this->patchJson('/api/v1/integrations/email/toggle');
    $r2->assertOk()->assertJsonPath('data.is_enabled', true);

    // Key must still be present
    expect(Integration::first()->getApiKey())->not->toBeEmpty();
});

it('deletes the email integration', function () {
    Integration::factory()->create(['user_id' => $this->user->id]);

    $this->deleteJson('/api/v1/integrations/email')->assertNoContent();
    expect(Integration::count())->toBe(0);
});

it('isolates integrations between users', function () {
    $other = User::factory()->create();
    Integration::factory()->create(['user_id' => $other->id]);

    $response = $this->getJson('/api/v1/integrations');
    $response->assertOk()->assertJsonPath('data', []);
});

it('rejects test send when no integration is configured', function () {
    $response = $this->postJson('/api/v1/integrations/email/test');
    $response->assertStatus(422);
});

it('rejects test send when integration is disabled', function () {
    Integration::factory()->disabled()->create(['user_id' => $this->user->id]);

    $response = $this->postJson('/api/v1/integrations/email/test');
    $response->assertStatus(422);
});
