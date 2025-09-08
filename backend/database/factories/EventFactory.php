<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        // Start between -10 days and +30 days
        $start = Carbon::now()->addDays($this->faker->numberBetween(-10, 30))
                              ->setTime($this->faker->numberBetween(17, 20), [0,15,30,45][$this->faker->numberBetween(0,3)]);
        $end   = (clone $start)->addHours($this->faker->numberBetween(2, 4));

        // Tokyo-ish, jitter
        [$lat, $lng] = [35.681236 + $this->faker->randomFloat(6, -0.06, 0.06), 139.767125 + $this->faker->randomFloat(6, -0.06, 0.06)];

        $venues = ['Shibuya Café','Akiba Hub','Ikebukuro Commons','Kanda Studio','Shinjuku Loft','Nakano Lounge'];

        return [
            'group_id'      => Group::factory(),
            'created_by'    => User::factory(),
            'title'         => $this->faker->randomElement(['Anime Night','Cosplay Meetup','Manga Circle','Watch Party','Retro Games Jam','Study & Draw']) . ' ' . $this->faker->randomElement(['Vol. 1','Vol. 2','Weekend','Special','Night']),
            'description'   => $this->faker->paragraphs(2, true),
            'venue_name'    => $this->faker->randomElement($venues),
            'venue_address' => $this->faker->streetAddress() . ', Tokyo',
            'location_lat'  => $lat,
            'location_lng'  => $lng,
            'start_at'      => $start,
            'end_at'        => $end,
            'capacity'      => $this->faker->optional(0.7)->numberBetween(10, 60), // 30% unlimited
            'price_yen'   => $this->faker->randomElement([0, 0, 0, 500, 700, 1000]),
        ];
    }
}
