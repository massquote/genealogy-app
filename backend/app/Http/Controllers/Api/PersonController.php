<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePersonRequest;
use App\Http\Requests\UpdatePersonRequest;
use App\Http\Resources\PersonResource;
use App\Models\Person;
use App\Models\Relationship;
use App\Services\FamilyGraphService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class PersonController extends Controller
{
    public function __construct(private readonly FamilyGraphService $graph) {}

    /**
     * List every person in the requesting user's connected family graph.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $rootId = $user->person?->id;

        if ($rootId === null) {
            // User has no claimed Person yet — return only people they created.
            $people = Person::where('created_by_user_id', $user->id)
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get();
        } else {
            $ids = $this->graph->reachablePeopleIds($rootId);
            $people = Person::whereIn('id', $ids)
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get();
        }

        return response()->json([
            'data' => PersonResource::collection($people),
            'meta' => [
                'total' => $people->count(),
                'rooted_at' => $rootId,
            ],
        ]);
    }

    public function store(StorePersonRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        $created = DB::transaction(function () use ($data, $user) {
            $person = Person::create([
                ...collect($data)->except('relationship')->all(),
                'created_by_user_id' => $user->id,
            ]);

            $createdRelationship = null;
            if (isset($data['relationship'])) {
                $anchorId = (int) $data['relationship']['anchor_id'];
                $relation = $data['relationship']['relation'];

                [$personAId, $personBId, $type] = match ($relation) {
                    'parent' => [$person->id, $anchorId, Relationship::TYPE_PARENT],
                    'child' => [$anchorId, $person->id, Relationship::TYPE_PARENT],
                    'spouse' => [$person->id, $anchorId, Relationship::TYPE_SPOUSE],
                };

                $createdRelationship = $this->graph->createRelationship(
                    $personAId,
                    $personBId,
                    $type,
                    $user->id,
                );
            }

            return [$person, $createdRelationship];
        });

        [$person, $relationship] = $created;

        return response()->json([
            'data' => new PersonResource($person->fresh()),
            'relationship_id' => $relationship?->id,
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, Person $person): JsonResponse
    {
        $this->authorize('view', $person);

        return response()->json(['data' => new PersonResource($person)]);
    }

    public function update(UpdatePersonRequest $request, Person $person): JsonResponse
    {
        // Authorization handled in UpdatePersonRequest::authorize()
        $person->update($request->validated());

        return response()->json(['data' => new PersonResource($person->fresh())]);
    }

    public function destroy(Request $request, Person $person): Response
    {
        $this->authorize('delete', $person);
        $person->delete();

        return response()->noContent();
    }
}
