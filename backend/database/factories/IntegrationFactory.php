<?php

namespace Database\Factories;

use App\Models\Integration;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Integration>
 */
class IntegrationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => Integration::TYPE_EMAIL,
            'provider' => Integration::PROVIDER_RESEND,
            'config' => [
                'api_key' => 're_' . $this->faker->bothify('????????????????????'),
                'from_address' => 'no-reply@' . $this->faker->domainName(),
            ],
            'is_enabled' => true,
        ];
    }

    public function disabled(): static
    {
        return $this->state(fn () => ['is_enabled' => false]);
    }
}
