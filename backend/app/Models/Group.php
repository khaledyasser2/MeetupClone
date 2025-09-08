<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Group extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function memberships()
    {
        return $this->hasMany(Membership::class);
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'memberships')->withPivot('role')->withTimestamps();
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }
}
