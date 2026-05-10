<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpsertEmailIntegrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            // Resend keys start with "re_" — basic shape check.
            'api_key' => ['required', 'string', 'min:10', 'max:255', 'regex:/^re_[A-Za-z0-9_]+$/'],
            'from_address' => ['required', 'email', 'max:255'],
            'is_enabled' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'api_key.regex' => 'API key looks wrong — Resend keys start with "re_".',
        ];
    }
}
