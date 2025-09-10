<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventPageController extends Controller
{
    public function index(Request $request)
    {
        $q  = $request->query('q');
        $yr = $request->integer('year');
        $mo = $request->integer('month');
        $dy = $request->integer('day');

        $events = Event::query()
            ->with(['group:id,name', 'creator:id,name'])
            ->when($q, function ($query) use ($q) {
                $query->where(function ($w) use ($q) {
                    $w->where('title', 'like', "%{$q}%")
                      ->orWhere('description', 'like', "%{$q}%");
                });
            })
            ->when($yr, fn($x) => $x->whereYear('start_at', $yr))
            ->when($mo, fn($x) => $x->whereMonth('start_at', $mo))
            ->when($dy, fn($x) => $x->whereDay('start_at', $dy))
            ->orderBy('start_at')
            ->paginate(12)
            ->withQueryString();

        // shape minimal props for the page, ensure it's a plain array
        $data = $events->through(function ($e) {
            return [
                'id'            => $e->id,
                'title'         => $e->title,
                'group'         => $e->group?->name,
                'creator'       => $e->creator?->name,
                'start_at'      => $e->start_at,
                'end_at'        => $e->end_at,
                'venue_name'    => $e->venue_name,
                'venue_address' => $e->venue_address,
                'price_yen'     => $e->price_yen,
                'capacity'      => $e->capacity,
                'lat'           => $e->location_lat,
                'lng'           => $e->location_lng,
            ];
        })->values()->all();

        return Inertia::render('Events/Index', [
            'filters' => [
                'q' => $q, 'year' => $yr, 'month' => $mo, 'day' => $dy,
            ],
            'events'  => [
                'data'  => $data,
                'links' => $events->linkCollection(),
                'meta'  => [
                    'current_page' => $events->currentPage(),
                    'last_page'    => $events->lastPage(),
                ],
            ],
        ]);
    }

    public function show(Event $event)
    {
        $event->load(['group:id,name', 'creator:id,name']);

        return Inertia::render('Events/Show', [
            'event' => [
                'id'            => $event->id,
                'title'         => $event->title,
                'description'   => $event->description,
                'group'         => $event->group?->name,
                'creator'       => $event->creator?->name,
                'start_at'      => $event->start_at,
                'end_at'        => $event->end_at,
                'venue_name'    => $event->venue_name,
                'venue_address' => $event->venue_address,
                'price_yen'     => $event->price_yen,
                'capacity'      => $event->capacity,
                'lat'           => $event->location_lat,
                'lng'           => $event->location_lng,
            ],
        ]);
    }
}
