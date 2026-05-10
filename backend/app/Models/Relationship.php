<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Relationship extends Model
{
    /** @use HasFactory<\Database\Factories\RelationshipFactory> */
    use HasFactory;

    public const TYPE_PARENT = 'parent';
    public const TYPE_SPOUSE = 'spouse';

    protected $fillable = [
        'person_a_id',
        'person_b_id',
        'type',
        'created_by_user_id',
    ];

    public function personA(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'person_a_id');
    }

    public function personB(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'person_b_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
