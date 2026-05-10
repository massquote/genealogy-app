<?php

namespace Database\Seeders;

use App\Models\Invitation;
use App\Models\Person;
use App\Models\Relationship;
use App\Models\User;
use App\Services\FamilyGraphService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoFamilySeeder extends Seeder
{
    public function run(): void
    {
        $graph = app(FamilyGraphService::class);

        $felix = User::updateOrCreate(
            ['email' => 'felix@demo.test'],
            ['name' => 'Felix Q Tester', 'password' => Hash::make('password')],
        );

        $alice = User::updateOrCreate(
            ['email' => 'alice@demo.test'],
            ['name' => 'Alice Smith', 'password' => Hash::make('password')],
        );

        // --- Felix's tree (3 generations) ---

        $felixPerson = Person::firstOrCreate(
            ['claimed_by_user_id' => $felix->id],
            [
                'first_name' => 'Felix',
                'middle_name' => 'Q',
                'last_name' => 'Tester',
                'gender' => 'male',
                'date_of_birth' => '1990-05-10',
                'birthplace' => 'Sydney, Australia',
                'created_by_user_id' => $felix->id,
            ],
        );

        // Parents
        $father = Person::create([
            'first_name' => 'Robert', 'last_name' => 'Tester', 'gender' => 'male',
            'date_of_birth' => '1962-03-14',
            'created_by_user_id' => $felix->id,
        ]);
        $mother = Person::create([
            'first_name' => 'Margaret', 'last_name' => 'Tester', 'gender' => 'female',
            'date_of_birth' => '1964-07-22',
            'created_by_user_id' => $felix->id,
        ]);
        $graph->createRelationship($father->id, $felixPerson->id, 'parent', $felix->id);
        $graph->createRelationship($mother->id, $felixPerson->id, 'parent', $felix->id);
        $graph->createRelationship($father->id, $mother->id, 'spouse', $felix->id);

        // Paternal grandparents
        $patGrandpa = Person::create([
            'first_name' => 'Edward', 'last_name' => 'Tester', 'gender' => 'male',
            'date_of_birth' => '1935-01-04', 'date_of_death' => '2010-09-01',
            'created_by_user_id' => $felix->id,
        ]);
        $patGrandma = Person::create([
            'first_name' => 'Helen', 'last_name' => 'Tester', 'gender' => 'female',
            'date_of_birth' => '1938-11-18',
            'created_by_user_id' => $felix->id,
        ]);
        $graph->createRelationship($patGrandpa->id, $father->id, 'parent', $felix->id);
        $graph->createRelationship($patGrandma->id, $father->id, 'parent', $felix->id);
        $graph->createRelationship($patGrandpa->id, $patGrandma->id, 'spouse', $felix->id);

        // Maternal grandparents
        $matGrandpa = Person::create([
            'first_name' => 'James', 'last_name' => 'Brennan', 'gender' => 'male',
            'date_of_birth' => '1940-06-30',
            'created_by_user_id' => $felix->id,
        ]);
        $matGrandma = Person::create([
            'first_name' => 'Patricia', 'last_name' => 'Brennan', 'gender' => 'female',
            'date_of_birth' => '1942-09-05',
            'created_by_user_id' => $felix->id,
        ]);
        $graph->createRelationship($matGrandpa->id, $mother->id, 'parent', $felix->id);
        $graph->createRelationship($matGrandma->id, $mother->id, 'parent', $felix->id);
        $graph->createRelationship($matGrandpa->id, $matGrandma->id, 'spouse', $felix->id);

        // Sibling
        $sister = Person::create([
            'first_name' => 'Eliza', 'last_name' => 'Tester', 'gender' => 'female',
            'date_of_birth' => '1992-12-02',
            'created_by_user_id' => $felix->id,
        ]);
        $graph->createRelationship($father->id, $sister->id, 'parent', $felix->id);
        $graph->createRelationship($mother->id, $sister->id, 'parent', $felix->id);

        // Spouse + child for Felix
        $spouse = Person::create([
            'first_name' => 'Sara', 'last_name' => 'Cole', 'gender' => 'female',
            'date_of_birth' => '1991-08-19',
            'created_by_user_id' => $felix->id,
        ]);
        $child = Person::create([
            'first_name' => 'Theo', 'last_name' => 'Tester-Cole', 'gender' => 'male',
            'date_of_birth' => '2022-04-11',
            'created_by_user_id' => $felix->id,
        ]);
        $graph->createRelationship($felixPerson->id, $spouse->id, 'spouse', $felix->id);
        $graph->createRelationship($felixPerson->id, $child->id, 'parent', $felix->id);
        $graph->createRelationship($spouse->id, $child->id, 'parent', $felix->id);

        // --- Alice's tree (smaller, separate graph) ---

        $alicePerson = Person::firstOrCreate(
            ['claimed_by_user_id' => $alice->id],
            [
                'first_name' => 'Alice', 'last_name' => 'Smith', 'gender' => 'female',
                'date_of_birth' => '1988-02-14',
                'created_by_user_id' => $alice->id,
            ],
        );
        $aliceMom = Person::create([
            'first_name' => 'Karen', 'last_name' => 'Smith', 'gender' => 'female',
            'date_of_birth' => '1960-04-23',
            'created_by_user_id' => $alice->id,
        ]);
        $graph->createRelationship($aliceMom->id, $alicePerson->id, 'parent', $alice->id);

        // --- A pending invitation Felix sent for his sister ---
        Invitation::firstOrCreate(
            ['person_id' => $sister->id, 'email' => 'eliza@demo.test'],
            [
                'invited_by_user_id' => $felix->id,
                'token' => 'demo-invite-eliza-' . substr(bin2hex(random_bytes(8)), 0, 16),
            ],
        );

        $this->command?->info('Demo family seeded:');
        $this->command?->info('  felix@demo.test / password (3-generation tree)');
        $this->command?->info('  alice@demo.test / password (small starter tree)');
    }
}
