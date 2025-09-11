<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Group;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class GroupPageController extends Controller
{

    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $user = $request->user();

        // Common base query with counts
        $base = \App\Models\Group::query()
            ->withCount(['members as members_count' => function ($q) {
                $q->whereIn('memberships.role', ['owner','organizer','member']);
            }])
            ->when($q, function ($w) use ($q) {
                $w->where(function ($x) use ($q) {
                    $x->where('name', 'like', "%{$q}%")
                      ->orWhere('description', 'like', "%{$q}%");
                });
            });

        // If not logged in, just show "other" as all groups (paginated)
        if (!$user) {
            $other = (clone $base)->orderByDesc('id')->paginate(12)->withQueryString();

            return Inertia::render('Groups/Index', [
                'params' => ['q' => $q],
                'owned_or_organized' => [],
                'member' => [],
                'other' => $other,
            ]);
        }

        // Get group ids where the user has memberships
        $ownedOrOrganizedIds = \DB::table('memberships')
            ->select('group_id')
            ->where('user_id', $user->id)
            ->whereIn('role', ['owner','organizer'])
            ->pluck('group_id');

        $memberIds = \DB::table('memberships')
            ->select('group_id')
            ->where('user_id', $user->id)
            ->where('role', 'member')
            ->pluck('group_id');

        // Buckets
        $ownedOrOrganized = (clone $base)
            ->whereIn('id', $ownedOrOrganizedIds)
            ->orderBy('name')
            ->get(['id','name','description']);

        $member = (clone $base)
            ->whereIn('id', $memberIds)
            ->whereNotIn('id', $ownedOrOrganizedIds) // ensure no overlap
        ->orderBy('name')
        ->get(['id','name','description']);

        $other = (clone $base)
            ->whereNotIn('id', $ownedOrOrganizedIds->merge($memberIds))
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Groups/Index', [
            'params' => ['q' => $q],
            'owned_or_organized' => $ownedOrOrganized->values()->all(),
            'member' => $member->values()->all(),
            'other' => $other,
        ]);
    }

    public function show(Group $group)
    {
        $group->load([
            'owner:id,name',
            'members:id,name',
            'events' => function ($q) {
                $q->select('id','group_id','title','start_at','price_yen','capacity')
                  ->latest('start_at');
            },
        ]);

        return Inertia::render('Groups/Show', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'description' => $group->description,
                'owner' => $group->owner?->only(['id','name']),
                'members' => $group->members->map(fn($u) => $u->only(['id','name'])),
                'events' => $group->events->map(function ($e) {
                    return [
                        'id' => $e->id,
                        'title' => $e->title,
                        'start_at' => $e->start_at,
                        'price_yen' => $e->price_yen,
                        'capacity' => $e->capacity,
                    ];
                }),
            ],
        ]);
    }

    public function create()
    {
        // auth middleware already protects this route
        return Inertia::render('Groups/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:120'],
            'description' => ['nullable','string','max:2000'],
        ]);

        $group = DB::transaction(function () use ($data) {
            $group = Group::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'owner_id'    => Auth::id(),
            ]);

            // Make current user the owner
            DB::table('memberships')->insert([
                'user_id'   => Auth::id(),
                'group_id'  => $group->id,
                'role'      => 'owner',
                'created_at'=> now(),
                'updated_at'=> now(),
            ]);

            return $group;
        });

        return redirect()->route('groups.show', $group);
    }
}
