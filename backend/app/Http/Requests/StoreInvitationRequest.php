<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvitationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'person_id' => ['required', 'integer', 'exists:people,id'],
            'email' => ['required', 'email', 'max:255'],
        ];
    }
}
