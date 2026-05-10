<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Person extends Model
{
    /** @use HasFactory<\Database\Factories\PersonFactory> */
    use HasFactory;

    protected $table = 'people';

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'date_of_birth',
        'date_of_death',
        'gender',
        'birthplace',
        'bio',
        'claimed_by_user_id',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'date_of_death' => 'date',
        ];
    }

    protected $appends = ['full_name', 'is_claimed'];

    protected function fullName(): Attribute
    {
        return Attribute::get(fn () => trim(implode(' ', array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name,
        ]))));
    }

    protected function isClaimed(): Attribute
    {
        return Attribute::get(fn () => $this->claimed_by_user_id !== null);
    }

    public function claimedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimed_by_user_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /** Relationships where this person sits in slot A. */
    public function relationshipsAsA(): HasMany
    {
        return $this->hasMany(Relationship::class, 'person_a_id');
    }

    /** Relationships where this person sits in slot B. */
    public function relationshipsAsB(): HasMany
    {
        return $this->hasMany(Relationship::class, 'person_b_id');
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }

    /** Convenience: parents of this person. */
    public function parents()
    {
        return Person::whereIn(
            'id',
            Relationship::query()
                ->where('type', 'parent')
                ->where('person_b_id', $this->id)
                ->select('person_a_id'),
        );
    }

    /** Convenience: children of this person. */
    public function children()
    {
        return Person::whereIn(
            'id',
            Relationship::query()
                ->where('type', 'parent')
                ->where('person_a_id', $this->id)
                ->select('person_b_id'),
        );
    }

    /** Convenience: spouses of this person (symmetric type). */
    public function spouses()
    {
        return Person::whereIn(
            'id',
            Relationship::query()
                ->where('type', 'spouse')
                ->where(function ($q) {
                    $q->where('person_a_id', $this->id)
                        ->orWhere('person_b_id', $this->id);
                })
                ->get()
                ->map(fn ($r) => $r->person_a_id === $this->id ? $r->person_b_id : $r->person_a_id),
        );
    }
}
