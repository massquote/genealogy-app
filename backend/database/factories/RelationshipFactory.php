<?php

namespace Database\Factories;

use App\Models\Person;
use App\Models\Relationship;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Relationship>
 */
class RelationshipFactory extends Factory
{
    public function definition(): array
    {
        return [
            'person_a_id' => Person::factory(),
            'person_b_id' => Person::factory(),
            'type' => Relationship::TYPE_PARENT,
            'created_by_user_id' => User::factory(),
        ];
    }

    public function parent(): static
    {
        return $this->state(fn () => ['type' => Relationship::TYPE_PARENT]);
    }

    public function spouse(): static
    {
        return $this->state(fn () => ['type' => Relationship::TYPE_SPOUSE]);
    }
}
