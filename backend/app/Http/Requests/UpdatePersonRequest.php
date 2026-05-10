<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePersonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('person')) ?? false;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['sometimes', 'required', 'string', 'max:80'],
            'middle_name' => ['nullable', 'string', 'max:80'],
            'last_name' => ['sometimes', 'required', 'string', 'max:80'],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'date_of_death' => ['nullable', 'date', 'after_or_equal:date_of_birth'],
            'gender' => ['nullable', 'in:male,female,other,unknown'],
            'birthplace' => ['nullable', 'string', 'max:120'],
            'bio' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
