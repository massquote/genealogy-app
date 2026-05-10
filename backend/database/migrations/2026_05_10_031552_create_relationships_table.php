<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('relationships', function (Blueprint $table) {
            $table->id();
            // For type=parent: person_a is the parent of person_b.
            // For type=spouse: order is irrelevant; we always store with person_a_id < person_b_id.
            $table->foreignId('person_a_id')->constrained('people')->cascadeOnDelete();
            $table->foreignId('person_b_id')->constrained('people')->cascadeOnDelete();
            $table->enum('type', ['parent', 'spouse']);
            $table->foreignId('created_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['person_a_id', 'person_b_id', 'type']);
            $table->index(['person_b_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('relationships');
    }
};
