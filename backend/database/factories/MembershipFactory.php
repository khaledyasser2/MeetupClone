<?php

namespace Database\Factories;

use App\Models\Membership;
use App\Models\User;
use App\Models\Group;
use Illuminate\Database\Eloquent\Factories\Factory;

class MembershipFactory extends Factory
{
    protected $model = Membership::class;

    public function definition(): array
    {
        return [
            'user_id'  => User::factory(),
            'group_id' => Group::factory(),
            'role'     => $this->faker->randomElement(['member','member','organizer']),
        ];
    }
}
