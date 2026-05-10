<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PersonResource;
use App\Models\Person;
use App\Models\Relationship;
use App\Services\FamilyGraphService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TreeController extends Controller
{
    public function __construct(private readonly FamilyGraphService $graph) {}

    /**
     * Return people + relationships in the requesting user's family graph.
     * Optional ?root_id query param shifts the centre.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $rootId = $request->integer('root_id') ?: $user->person?->id;

        if ($rootId === null) {
            return response()->json([
                'data' => [
                    'people' => [],
                    'relationships' => [],
                ],
                'meta' => ['total_people' => 0, 'total_relationships' => 0, 'rooted_at' => null],
            ]);
        }

        $ids = $this->graph->reachablePeopleIds($rootId);

        $people = Person::whereIn('id', $ids)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        $relationships = Relationship::query()
            ->whereIn('person_a_id', $ids)
            ->whereIn('person_b_id', $ids)
            ->get(['id', 'person_a_id', 'person_b_id', 'type', 'created_by_user_id']);

        return response()->json([
            'data' => [
                'people' => PersonResource::collection($people),
                'relationships' => $relationships,
            ],
            'meta' => [
                'total_people' => $people->count(),
                'total_relationships' => $relationships->count(),
                'rooted_at' => $rootId,
            ],
        ]);
    }
}
