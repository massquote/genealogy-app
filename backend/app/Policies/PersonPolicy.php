<?php

namespace App\Policies;

use App\Models\Person;
use App\Models\User;

class PersonPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Person $person): bool
    {
        // A user can view any person in their connected family graph.
        // Practical short-circuit: creator or claimer can always view; for
        // graph-membership checks the controller scopes the index query.
        return $person->created_by_user_id === $user->id
            || $person->claimed_by_user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Person $person): bool
    {
        // Editable by the creator (until claimed) OR the claimant.
        if ($person->claimed_by_user_id !== null) {
            return $person->claimed_by_user_id === $user->id;
        }
        return $person->created_by_user_id === $user->id;
    }

    public function delete(User $user, Person $person): bool
    {
        // Only the creator can delete, and never if the person is claimed by someone else.
        if ($person->claimed_by_user_id !== null && $person->claimed_by_user_id !== $user->id) {
            return false;
        }
        return $person->created_by_user_id === $user->id;
    }
}
