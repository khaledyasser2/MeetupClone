<?php

namespace Database\Factories;

use App\Models\EventSignup;
use App\Models\User;
use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventSignupFactory extends Factory
{
    protected $model = EventSignup::class;

    public function definition(): array
    {
        return [
            'user_id'  => User::factory(),
            'event_id' => Event::factory(),
            'status'   => $this->faker->randomElement(['going','going','waitlist','cancelled']),
        ];
    }
}
