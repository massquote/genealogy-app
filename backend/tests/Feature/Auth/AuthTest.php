<?php

use App\Models\Person;
use App\Models\User;

it('registers a user and creates a claimed person record', function () {
    $payload = [
        'first_name' => 'Felix',
        'middle_name' => 'Q',
        'last_name' => 'Tester',
        'email' => 'felix@example.test',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'date_of_birth' => '1990-05-10',
        'gender' => 'male',
    ];

    $response = $this->postJson('/api/v1/auth/register', $payload);

    $response->assertCreated()
        ->assertJsonStructure([
            'user' => ['id', 'name', 'email', 'person' => ['id', 'first_name', 'last_name', 'full_name', 'is_claimed']],
            'token',
            'token_type',
        ])
        ->assertJsonPath('user.email', 'felix@example.test')
        ->assertJsonPath('user.person.full_name', 'Felix Q Tester')
        ->assertJsonPath('user.person.is_claimed', true)
        ->assertJsonPath('token_type', 'Bearer');

    $user = User::firstWhere('email', 'felix@example.test');
    expect($user)->not->toBeNull();
    expect($user->person)->not->toBeNull();
    expect($user->person->claimed_by_user_id)->toBe($user->id);
    expect($user->person->created_by_user_id)->toBe($user->id);
});

it('rejects registration with missing required fields', function () {
    $response = $this->postJson('/api/v1/auth/register', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'password']);
});

it('rejects registration with a duplicate email', function () {
    User::factory()->create(['email' => 'taken@example.test']);

    $response = $this->postJson('/api/v1/auth/register', [
        'first_name' => 'X',
        'last_name' => 'Y',
        'email' => 'taken@example.test',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

it('rejects registration with mismatched password confirmation', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'first_name' => 'X',
        'last_name' => 'Y',
        'email' => 'mismatch@example.test',
        'password' => 'password123',
        'password_confirmation' => 'different',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['password']);
});

it('logs a user in with valid credentials', function () {
    $user = User::factory()->create([
        'email' => 'login@example.test',
        'password' => 'password123',
    ]);
    Person::factory()->claimedBy($user)->create();

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'login@example.test',
        'password' => 'password123',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['user', 'token', 'token_type'])
        ->assertJsonPath('user.email', 'login@example.test')
        ->assertJsonPath('user.person.is_claimed', true);
});

it('rejects login with wrong password', function () {
    User::factory()->create([
        'email' => 'wrong@example.test',
        'password' => 'password123',
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'wrong@example.test',
        'password' => 'badpassword',
    ]);

    $response->assertStatus(422)->assertJsonValidationErrors(['email']);
});

it('returns the authenticated user from /me', function () {
    $user = User::factory()->create();
    Person::factory()->claimedBy($user)->create();

    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/auth/me');

    $response->assertOk()
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonPath('user.email', $user->email);
});

it('rejects /me without a token', function () {
    $this->getJson('/api/v1/auth/me')->assertUnauthorized();
});

it('logs a user out and revokes their token', function () {
    $user = User::factory()->create();
    $plainText = $user->createToken('test')->plainTextToken;

    expect($user->tokens()->count())->toBe(1);

    $this->withHeader('Authorization', "Bearer {$plainText}")
        ->postJson('/api/v1/auth/logout')
        ->assertNoContent();

    expect($user->fresh()->tokens()->count())->toBe(0);
});
