<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Group;
use App\Models\Event;
use App\Models\Membership;
use App\Models\EventSignup;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Counts (override via .env)
        $usersCount          = (int) env('SEED_USERS', 30);
        $groupsCount         = (int) env('SEED_GROUPS', 6);
        $eventsPerGroup      = (int) env('SEED_EVENTS_PER_GROUP', 8);
        $extraSignups        = (int) env('SEED_EXTRA_SIGNUPS', 200); // across all events

        // Users
        $users = User::factory()->count($usersCount)->create();

        // Make one known user for easy login
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User', 'password' => bcrypt('password')]
        );

        // Groups with real owners
        $groups = Group::factory()->count($groupsCount)->make()->each(function ($g) use ($users) {
            $owner = $users->random();
            $g->owner_id = $owner->id;
            $g->save();

            // Owner membership + a few random members/organizers
            Membership::firstOrCreate(['user_id' => $owner->id, 'group_id' => $g->id], ['role' => 'owner']);

            $membersToAdd = rand(5, 15);
            $memberIds = $users->where('id', '!=', $owner->id)->random(min($membersToAdd, max(1, $users->count()-1)))->pluck('id');

            foreach ($memberIds as $uid) {
                Membership::firstOrCreate(
                    ['user_id' => $uid, 'group_id' => $g->id],
                    ['role' => (rand(0, 9) === 0 ? 'organizer' : 'member')] // ~10% organizers
                );
            }
        });

        // Events per group with creator = owner or organizer
        $events = collect();
        foreach ($groups as $group) {
            $organizers = Membership::where('group_id', $group->id)
                ->whereIn('role', ['owner','organizer'])
                ->pluck('user_id');

            for ($i = 0; $i < $eventsPerGroup; $i++) {
                $creatorId = $organizers->random();
                $event = Event::factory()->for($group, 'group')
                    ->state(['created_by' => $creatorId])
                    ->create();
                $events->push($event);

                // Auto-RSVP some random members up to capacity
                $cap = $event->capacity ?? rand(15, 80); // if unlimited, pretend a soft cap
                $goingCount = rand((int)($cap*0.2), min($cap, max(1, (int)($cap*0.8))));
                $memberIds = Membership::where('group_id', $group->id)->inRandomOrder()->limit($goingCount)->pluck('user_id');

                foreach ($memberIds as $uid) {
                    EventSignup::firstOrCreate(
                        ['user_id' => $uid, 'event_id' => $event->id],
                        ['status' => 'going']
                    );
                }
            }
        }

        // Extra random signups across all events (respect unique constraint)
        if ($events->isNotEmpty()) {
            for ($i = 0; $i < $extraSignups; $i++) {
                $user  = $users->random();
                $event = $events->random();
                EventSignup::firstOrCreate(
                    ['user_id' => $user->id, 'event_id' => $event->id],
                    ['status' => ['going','waitlist','cancelled'][array_rand(['going','waitlist','cancelled'])]]
                );
            }
        }
    }
}
