<?php

namespace App\Policies;

use App\Models\Relationship;
use App\Models\User;

class RelationshipPolicy
{
    public function delete(User $user, Relationship $relationship): bool
    {
        return $relationship->created_by_user_id === $user->id;
    }
}
