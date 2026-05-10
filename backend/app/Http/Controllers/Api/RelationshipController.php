<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRelationshipRequest;
use App\Models\Relationship;
use App\Services\FamilyGraphService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RelationshipController extends Controller
{
    public function __construct(private readonly FamilyGraphService $graph) {}

    public function store(StoreRelationshipRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        $relationship = $this->graph->createRelationship(
            (int) $data['person_a_id'],
            (int) $data['person_b_id'],
            $data['type'],
            $user->id,
        );

        return response()->json([
            'data' => [
                'id' => $relationship->id,
                'person_a_id' => $relationship->person_a_id,
                'person_b_id' => $relationship->person_b_id,
                'type' => $relationship->type,
                'created_by_user_id' => $relationship->created_by_user_id,
            ],
        ], Response::HTTP_CREATED);
    }

    public function destroy(Request $request, Relationship $relationship): Response
    {
        $this->authorize('delete', $relationship);
        $relationship->delete();

        return response()->noContent();
    }
}
