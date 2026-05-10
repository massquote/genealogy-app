<?php

namespace App\Http\Resources;

use App\Models\Integration;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IntegrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'provider' => $this->provider,
            'is_enabled' => $this->is_enabled,
            'has_api_key' => !empty($this->getApiKey()),
            'api_key_masked' => Integration::maskKey($this->getApiKey()),
            'from_address' => $this->getFromAddress(),
            'last_used_at' => $this->last_used_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
