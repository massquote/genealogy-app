<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /** People this user has added to the system. */
    public function createdPeople(): HasMany
    {
        return $this->hasMany(Person::class, 'created_by_user_id');
    }

    /** The single Person record this user has claimed (themself). */
    public function person(): HasOne
    {
        return $this->hasOne(Person::class, 'claimed_by_user_id');
    }

    /** Invitations this user has sent out. */
    public function sentInvitations(): HasMany
    {
        return $this->hasMany(Invitation::class, 'invited_by_user_id');
    }

    /** Third-party integrations this user has configured. */
    public function integrations(): HasMany
    {
        return $this->hasMany(Integration::class);
    }

    /** Convenience: this user's email integration (if any). */
    public function emailIntegration(): HasOne
    {
        return $this->hasOne(Integration::class)->where('type', Integration::TYPE_EMAIL);
    }

    /** Web Push subscriptions across the user's browsers/devices. */
    public function pushSubscriptions(): HasMany
    {
        return $this->hasMany(PushSubscription::class);
    }
}
