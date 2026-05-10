<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Person>
 */
class PersonFactory extends Factory
{
    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName(),
            'middle_name' => $this->faker->boolean(40) ? $this->faker->firstName() : null,
            'last_name' => $this->faker->lastName(),
            'date_of_birth' => $this->faker->dateTimeBetween('-90 years', '-1 years')->format('Y-m-d'),
            'gender' => $this->faker->randomElement(['male', 'female', 'other', 'unknown']),
            'birthplace' => $this->faker->city(),
            'bio' => null,
            'claimed_by_user_id' => null,
            'created_by_user_id' => User::factory(),
        ];
    }

    public function claimedBy(User $user): static
    {
        return $this->state(fn () => [
            'claimed_by_user_id' => $user->id,
            'created_by_user_id' => $user->id,
        ]);
    }
}
