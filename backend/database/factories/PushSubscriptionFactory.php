<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PushSubscription>
 */
class PushSubscriptionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/' . $this->faker->bothify('????????????????????'),
            'p256dh' => 'B' . $this->faker->bothify(str_repeat('?', 86)),
            'auth' => $this->faker->bothify(str_repeat('?', 22)),
            'user_agent' => $this->faker->userAgent(),
        ];
    }
}
