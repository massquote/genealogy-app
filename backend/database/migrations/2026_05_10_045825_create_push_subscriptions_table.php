<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            // Push service endpoint URL (FCM, autopush, etc.) — unique because
            // the same browser+user combo always returns the same endpoint.
            $table->text('endpoint');
            $table->string('p256dh', 255);   // public key
            $table->string('auth', 255);     // auth secret
            $table->string('user_agent', 255)->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            // We can't UNIQUE on a TEXT column in MySQL without a length, so
            // use a hash column trick OR simply enforce uniqueness in code.
            // Index a prefix instead:
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
