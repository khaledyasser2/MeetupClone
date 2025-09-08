<?php

namespace Database\Factories;

use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class GroupFactory extends Factory
{
    protected $model = Group::class;

    public function definition(): array
    {
        // Tokyo center with small random jitter
        [$lat, $lng] = [35.681236 + $this->faker->randomFloat(6, -0.05, 0.05), 139.767125 + $this->faker->randomFloat(6, -0.05, 0.05)];

        return [
            'name'           => $this->faker->unique()->words(3, true) . ' Group',
            'description'    => $this->faker->paragraph(),
            'location_city'  => $this->faker->randomElement(['Tokyo','Shibuya','Shinjuku','Akihabara','Ikebukuro','Kichijoji']),
            'location_lat'   => $lat,
            'location_lng'   => $lng,
            'owner_id'       => User::factory(),
            'cover_image'    => null,
        ];
    }
}
