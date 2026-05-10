<?php

namespace Database\Factories;

use App\Models\Invitation;
use App\Models\Person;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invitation>
 */
class InvitationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'person_id' => Person::factory(),
            'invited_by_user_id' => User::factory(),
            'email' => $this->faker->safeEmail(),
            'token' => Invitation::generateToken(),
            'accepted_at' => null,
            'accepted_by_user_id' => null,
        ];
    }

    public function accepted(?User $user = null): static
    {
        return $this->state(fn () => [
            'accepted_at' => now(),
            'accepted_by_user_id' => $user?->id ?? User::factory(),
        ]);
    }
}
