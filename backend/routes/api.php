<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', fn () => response()->json([
        'status' => 'ok',
        'service' => 'familyknot-api',
        'version' => '0.1.0',
        'timestamp' => now()->toIso8601String(),
    ]));

    // --- Public auth endpoints ---
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
        Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
    });

    // --- Public invitation lookup (no auth) ---
    Route::get('/invitations/{token}', [\App\Http\Controllers\Api\InvitationController::class, 'lookup'])
        ->name('invitations.lookup');

    // --- Authenticated routes ---
    Route::middleware('auth:sanctum')->group(function () {
        Route::prefix('auth')->group(function () {
            Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
            Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
        });

        Route::get('/tree', [\App\Http\Controllers\Api\TreeController::class, 'index'])
            ->name('tree.index');
        Route::apiResource('people', \App\Http\Controllers\Api\PersonController::class);

        Route::post('/relationships', [\App\Http\Controllers\Api\RelationshipController::class, 'store'])
            ->name('relationships.store');
        Route::delete('/relationships/{relationship}', [\App\Http\Controllers\Api\RelationshipController::class, 'destroy'])
            ->name('relationships.destroy');

        Route::get('/invitations', [\App\Http\Controllers\Api\InvitationController::class, 'index'])
            ->name('invitations.index');
        Route::post('/invitations', [\App\Http\Controllers\Api\InvitationController::class, 'store'])
            ->name('invitations.store');
        Route::post('/invitations/{token}/accept', [\App\Http\Controllers\Api\InvitationController::class, 'accept'])
            ->name('invitations.accept');

        // --- Per-user 3rd party integrations ---
        Route::get('/integrations', [\App\Http\Controllers\Api\IntegrationController::class, 'index'])
            ->name('integrations.index');
        Route::put('/integrations/email', [\App\Http\Controllers\Api\IntegrationController::class, 'upsertEmail'])
            ->name('integrations.email.upsert');
        Route::patch('/integrations/email/toggle', [\App\Http\Controllers\Api\IntegrationController::class, 'toggleEmail'])
            ->name('integrations.email.toggle');
        Route::delete('/integrations/email', [\App\Http\Controllers\Api\IntegrationController::class, 'destroyEmail'])
            ->name('integrations.email.destroy');
        Route::post('/integrations/email/test', [\App\Http\Controllers\Api\IntegrationController::class, 'testEmail'])
            ->name('integrations.email.test');
    });
});
