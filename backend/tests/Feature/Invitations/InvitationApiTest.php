<?php

use App\Mail\InvitationMail;
use App\Models\Invitation;
use App\Models\Person;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    Mail::fake();

    $this->user = User::factory()->create(['email' => 'felix@example.test']);
    $this->myself = Person::factory()->claimedBy($this->user)->create();
    Sanctum::actingAs($this->user);
});

it('creates an invitation and queues an email', function () {
    $father = Person::factory()->create([
        'created_by_user_id' => $this->user->id,
        'first_name' => 'Dad',
    ]);

    $response = $this->postJson('/api/v1/invitations', [
        'person_id' => $father->id,
        'email' => 'dad@example.test',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.email', 'dad@example.test')
        ->assertJsonPath('data.is_accepted', false);

    Mail::assertSent(InvitationMail::class, function (InvitationMail $mail) {
        return $mail->hasTo('dad@example.test');
    });
});

it('refuses to invite for a person you did not create', function () {
    $other = User::factory()->create();
    $person = Person::factory()->create(['created_by_user_id' => $other->id]);

    $this->postJson('/api/v1/invitations', [
        'person_id' => $person->id,
        'email' => 'someone@example.test',
    ])->assertForbidden();
});

it('refuses to invite for an already-claimed person', function () {
    $other = User::factory()->create();
    $claimed = Person::factory()->claimedBy($other)->create([
        'created_by_user_id' => $this->user->id,
    ]);

    $this->postJson('/api/v1/invitations', [
        'person_id' => $claimed->id,
        'email' => 'someone@example.test',
    ])->assertStatus(422);
});

it('lists sent and pending invitations for the current user', function () {
    $personA = Person::factory()->create(['created_by_user_id' => $this->user->id]);
    $personB = Person::factory()->create(['created_by_user_id' => $this->user->id]);

    Invitation::factory()->create([
        'person_id' => $personA->id,
        'invited_by_user_id' => $this->user->id,
        'email' => 'ann@example.test',
    ]);
    Invitation::factory()->create([
        'person_id' => $personB->id,
        'invited_by_user_id' => User::factory()->create()->id,
        'email' => $this->user->email,
    ]);

    $response = $this->getJson('/api/v1/invitations');

    $response->assertOk();
    expect($response->json('sent'))->toHaveCount(1);
    expect($response->json('pending'))->toHaveCount(1);
});

it('looks up an invitation publicly by token', function () {
    $person = Person::factory()->create(['first_name' => 'Mom']);
    $invite = Invitation::factory()->create([
        'person_id' => $person->id,
        'email' => 'mom@example.test',
    ]);

    // Logout - lookup is unauthenticated
    Sanctum::actingAs(User::factory()->create()); // any user; route is public anyway

    $response = $this->getJson("/api/v1/invitations/{$invite->token}");

    $response->assertOk()
        ->assertJsonPath('data.email', 'mom@example.test')
        ->assertJsonPath('data.person.id', $person->id)
        ->assertJsonPath('data.is_accepted', false);
});

it('accepts an invitation and claims the person', function () {
    $person = Person::factory()->create(['first_name' => 'Mom']);
    $invite = Invitation::factory()->create([
        'person_id' => $person->id,
        'email' => 'felix@example.test', // matches authed user
    ]);

    // Auth user has no person yet
    $blankUser = User::factory()->create(['email' => 'mom@example.test']);
    Sanctum::actingAs($blankUser);
    $invite->update(['email' => 'mom@example.test']);

    $response = $this->postJson("/api/v1/invitations/{$invite->token}/accept");

    $response->assertOk();
    expect($person->fresh()->claimed_by_user_id)->toBe($blankUser->id);
    expect($invite->fresh()->is_accepted)->toBeTrue();
});

it('rejects acceptance when the email does not match', function () {
    $person = Person::factory()->create();
    $invite = Invitation::factory()->create([
        'person_id' => $person->id,
        'email' => 'someone-else@example.test',
    ]);

    $this->postJson("/api/v1/invitations/{$invite->token}/accept")
        ->assertForbidden();
});

it('rejects acceptance when already accepted', function () {
    $person = Person::factory()->create();
    $invite = Invitation::factory()->accepted()->create([
        'person_id' => $person->id,
        'email' => $this->user->email,
    ]);

    $this->postJson("/api/v1/invitations/{$invite->token}/accept")
        ->assertStatus(422);
});

it('rejects acceptance when the user already claims a profile', function () {
    $person = Person::factory()->create();
    $invite = Invitation::factory()->create([
        'person_id' => $person->id,
        'email' => $this->user->email,
    ]);

    // $this->user already has $this->myself claimed
    $this->postJson("/api/v1/invitations/{$invite->token}/accept")
        ->assertStatus(422);
});
