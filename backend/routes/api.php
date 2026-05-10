<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', fn () => response()->json([
        'status' => 'ok',
        'service' => 'familyknot-api',
        'version' => '0.1.0',
        'timestamp' => now()->toIso8601String(),
    ]));

    Route::middleware('auth:sanctum')->get('/user', fn (Request $request) => $request->user());
});
