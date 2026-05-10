<?php

use App\Models\Person;
use App\Models\Relationship;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->myself = Person::factory()->claimedBy($this->user)->create();
    Sanctum::actingAs($this->user);
});

it('returns people and relationships scoped to my graph', function () {
    $father = Person::factory()->create(['created_by_user_id' => $this->user->id]);
    Relationship::factory()->parent()->create([
        'person_a_id' => $father->id,
        'person_b_id' => $this->myself->id,
        'created_by_user_id' => $this->user->id,
    ]);
    // Stranger outside my graph
    Person::factory()->create();

    $response = $this->getJson('/api/v1/tree');

    $response->assertOk()
        ->assertJsonPath('meta.total_people', 2)
        ->assertJsonPath('meta.total_relationships', 1)
        ->assertJsonPath('meta.rooted_at', $this->myself->id);
});

it('returns an empty payload when the user has no claimed person', function () {
    $blank = User::factory()->create();
    Sanctum::actingAs($blank);

    $response = $this->getJson('/api/v1/tree');

    $response->assertOk()
        ->assertJsonPath('meta.total_people', 0)
        ->assertJsonPath('meta.rooted_at', null);
});

it('lets the caller re-root via root_id query param', function () {
    $father = Person::factory()->create(['created_by_user_id' => $this->user->id]);
    Relationship::factory()->parent()->create([
        'person_a_id' => $father->id,
        'person_b_id' => $this->myself->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $response = $this->getJson("/api/v1/tree?root_id={$father->id}");

    $response->assertOk()->assertJsonPath('meta.rooted_at', $father->id);
});
