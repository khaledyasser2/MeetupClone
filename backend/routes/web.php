<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Web\EventPageController;
use App\Http\Controllers\Web\GroupPageController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// TODO: just remove instead of redirecting
Route::get('/dashboard', fn () => redirect()->route('events.index'))
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/groups/create', [GroupPageController::class, 'create'])->name('groups.create');
    Route::post('/groups', [GroupPageController::class, 'store'])->name('groups.store');
    Route::get('/groups', [GroupPageController::class, 'index'])->name('groups.index');
    Route::get('/groups/{group}', [GroupPageController::class, 'show'])->name('groups.show');
});

Route::get('/', [EventPageController::class, 'index'])->name('home');
Route::get('/events', [EventPageController::class, 'index'])->name('events.index');
Route::get('/events/{event}', [EventPageController::class, 'show'])->name('events.show');

require __DIR__.'/auth.php';
