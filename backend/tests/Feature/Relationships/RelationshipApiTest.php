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

it('creates a parent relationship between two existing people', function () {
    $father = Person::factory()->create(['created_by_user_id' => $this->user->id]);

    $response = $this->postJson('/api/v1/relationships', [
        'person_a_id' => $father->id,
        'person_b_id' => $this->myself->id,
        'type' => Relationship::TYPE_PARENT,
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.type', 'parent')
        ->assertJsonPath('data.person_a_id', $father->id)
        ->assertJsonPath('data.person_b_id', $this->myself->id);
});

it('normalises a spouse relationship to put the smaller id first', function () {
    $a = Person::factory()->create(['created_by_user_id' => $this->user->id]);
    $b = Person::factory()->create(['created_by_user_id' => $this->user->id]);
    $low = min($a->id, $b->id);
    $high = max($a->id, $b->id);

    $response = $this->postJson('/api/v1/relationships', [
        'person_a_id' => $high,
        'person_b_id' => $low,
        'type' => Relationship::TYPE_SPOUSE,
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.person_a_id', $low)
        ->assertJsonPath('data.person_b_id', $high);
});

it('does not duplicate an existing relationship', function () {
    $father = Person::factory()->create(['created_by_user_id' => $this->user->id]);
    $payload = [
        'person_a_id' => $father->id,
        'person_b_id' => $this->myself->id,
        'type' => Relationship::TYPE_PARENT,
    ];

    $this->postJson('/api/v1/relationships', $payload)->assertCreated();
    $this->postJson('/api/v1/relationships', $payload)->assertCreated();

    expect(Relationship::count())->toBe(1);
});

it('rejects self-relationships at validation', function () {
    $this->postJson('/api/v1/relationships', [
        'person_a_id' => $this->myself->id,
        'person_b_id' => $this->myself->id,
        'type' => Relationship::TYPE_PARENT,
    ])->assertStatus(422);
});

it('rejects creating a parent relationship that would form a cycle', function () {
    $dad = Person::factory()->create(['created_by_user_id' => $this->user->id]);
    Relationship::factory()->parent()->create([
        'person_a_id' => $dad->id,
        'person_b_id' => $this->myself->id,
        'created_by_user_id' => $this->user->id,
    ]);

    // Try to make me a parent of dad (cycle)
    $this->postJson('/api/v1/relationships', [
        'person_a_id' => $this->myself->id,
        'person_b_id' => $dad->id,
        'type' => Relationship::TYPE_PARENT,
    ])->assertStatus(422);
});

it('lets the creator delete a relationship', function () {
    $rel = Relationship::factory()->create(['created_by_user_id' => $this->user->id]);

    $this->deleteJson("/api/v1/relationships/{$rel->id}")->assertNoContent();
    expect(Relationship::find($rel->id))->toBeNull();
});

it('forbids deleting a relationship made by someone else', function () {
    $other = User::factory()->create();
    $rel = Relationship::factory()->create(['created_by_user_id' => $other->id]);

    $this->deleteJson("/api/v1/relationships/{$rel->id}")->assertForbidden();
});
