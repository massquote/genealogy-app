<?php

namespace App\Services;

use App\Models\Person;
use App\Models\Relationship;

class FamilyGraphService
{
    /**
     * BFS traversal returning every person reachable from $startId
     * by following parent or spouse edges, up to $maxDepth hops.
     *
     * @return array<int, int> List of unique person ids (including $startId)
     */
    public function reachablePeopleIds(int $startId, int $maxDepth = 8): array
    {
        $visited = [$startId => true];
        $frontier = [$startId];

        for ($depth = 0; $depth < $maxDepth && ! empty($frontier); $depth++) {
            $relationships = Relationship::query()
                ->where(function ($q) use ($frontier) {
                    $q->whereIn('person_a_id', $frontier)
                        ->orWhereIn('person_b_id', $frontier);
                })
                ->get(['person_a_id', 'person_b_id']);

            $next = [];
            foreach ($relationships as $rel) {
                foreach ([$rel->person_a_id, $rel->person_b_id] as $id) {
                    if (! isset($visited[$id])) {
                        $visited[$id] = true;
                        $next[] = $id;
                    }
                }
            }
            $frontier = $next;
        }

        return array_keys($visited);
    }

    /**
     * Persist a relationship between two people, normalising the storage
     * order for symmetric types (spouse) and avoiding duplicates.
     */
    public function createRelationship(int $personAId, int $personBId, string $type, int $createdByUserId): Relationship
    {
        if ($personAId === $personBId) {
            abort(422, 'A person cannot be related to themselves.');
        }

        if ($type === Relationship::TYPE_SPOUSE && $personAId > $personBId) {
            [$personAId, $personBId] = [$personBId, $personAId];
        }

        if ($type === Relationship::TYPE_PARENT && $this->wouldCreateAncestryCycle($personAId, $personBId)) {
            abort(422, 'Adding this parent would create a cycle in the family graph.');
        }

        return Relationship::firstOrCreate(
            ['person_a_id' => $personAId, 'person_b_id' => $personBId, 'type' => $type],
            ['created_by_user_id' => $createdByUserId],
        );
    }

    /**
     * Naive cycle check: would marking $parentId as parent of $childId mean
     * $parentId is also a descendant of $childId? If so it's a cycle.
     */
    public function wouldCreateAncestryCycle(int $parentId, int $childId): bool
    {
        // Walk descendants of childId; if we reach parentId, it's a cycle.
        $visited = [$childId => true];
        $frontier = [$childId];

        while (! empty($frontier)) {
            $children = Relationship::query()
                ->where('type', Relationship::TYPE_PARENT)
                ->whereIn('person_a_id', $frontier)
                ->pluck('person_b_id')
                ->all();

            if (in_array($parentId, $children, true)) {
                return true;
            }

            $next = [];
            foreach ($children as $cid) {
                if (! isset($visited[$cid])) {
                    $visited[$cid] = true;
                    $next[] = $cid;
                }
            }
            $frontier = $next;
        }

        return false;
    }

    public function findOrFailPerson(int $id): Person
    {
        return Person::findOrFail($id);
    }
}
