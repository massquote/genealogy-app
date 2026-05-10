<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvitationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'person_id' => $this->person_id,
            'email' => $this->email,
            'token' => $this->token,
            'is_accepted' => $this->is_accepted,
            'accepted_at' => $this->accepted_at?->toIso8601String(),
            'invited_by_user_id' => $this->invited_by_user_id,
            'created_at' => $this->created_at->toIso8601String(),
            'person' => new PersonResource($this->whenLoaded('person')),
        ];
    }
}
