<?php

use App\Models\Person;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->myself = Person::factory()->claimedBy($this->user)->create();
    Sanctum::actingAs($this->user);
});

it('rejects a relationship payload pointing at a non-existent anchor', function () {
    $response = $this->postJson('/api/v1/people', [
        'first_name' => 'Ghost',
        'last_name' => 'Person',
        'relationship' => [
            'anchor_id' => 999999,
            'relation' => 'parent',
        ],
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['relationship.anchor_id']);
});

it('rejects a relationship payload with an invalid relation type', function () {
    $response = $this->postJson('/api/v1/people', [
        'first_name' => 'Weird',
        'last_name' => 'Cousin',
        'relationship' => [
            'anchor_id' => $this->myself->id,
            'relation' => 'nephew', // not a supported relation in v1
        ],
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['relationship.relation']);
});

it('creates a person without any relationship payload', function () {
    $response = $this->postJson('/api/v1/people', [
        'first_name' => 'Solo',
        'last_name' => 'Add',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.first_name', 'Solo')
        ->assertJsonPath('relationship_id', null);
});

it('returns only people the user created when they have no claimed person', function () {
    $blank = User::factory()->create();
    Sanctum::actingAs($blank);

    $own = Person::factory()->create(['created_by_user_id' => $blank->id]);
    Person::factory()->create(); // unrelated, different user

    $response = $this->getJson('/api/v1/people');

    $response->assertOk()
        ->assertJsonPath('meta.rooted_at', null);

    $ids = collect($response->json('data'))->pluck('id')->all();
    expect($ids)->toBe([$own->id]);
});
