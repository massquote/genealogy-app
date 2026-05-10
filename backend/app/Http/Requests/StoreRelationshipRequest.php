<?php

namespace App\Http\Requests;

use App\Models\Relationship;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRelationshipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'person_a_id' => ['required', 'integer', 'exists:people,id'],
            'person_b_id' => ['required', 'integer', 'exists:people,id', 'different:person_a_id'],
            'type' => ['required', Rule::in([Relationship::TYPE_PARENT, Relationship::TYPE_SPOUSE])],
        ];
    }
}
