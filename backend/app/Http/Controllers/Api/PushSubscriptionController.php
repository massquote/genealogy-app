<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use App\Services\PushNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PushSubscriptionController extends Controller
{
    public function __construct(private readonly PushNotificationService $push) {}

    /**
     * Public — the frontend needs the VAPID public key before it can
     * call PushManager.subscribe().
     */
    public function vapidPublicKey(): JsonResponse
    {
        return response()->json([
            'public_key' => config('services.vapid.public_key'),
            'subject' => config('services.vapid.subject'),
        ]);
    }

    /**
     * List devices the authenticated user has registered.
     */
    public function index(Request $request): JsonResponse
    {
        $subs = $request->user()
            ->pushSubscriptions()
            ->orderByDesc('last_used_at')
            ->orderByDesc('created_at')
            ->get(['id', 'endpoint', 'user_agent', 'last_used_at', 'created_at']);

        $data = $subs->map(fn ($s) => [
            'id' => $s->id,
            // Show only the last bit of the endpoint URL so a user can tell
            // devices apart without exposing the full URL needlessly.
            'endpoint_tail' => substr($s->endpoint, -16),
            'user_agent' => $s->user_agent,
            'last_used_at' => $s->last_used_at?->toIso8601String(),
            'created_at' => $s->created_at->toIso8601String(),
        ]);

        return response()->json(['data' => $data]);
    }

    /**
     * Store (or update) a push subscription for the current user.
     * Idempotent on (user_id, endpoint) so re-subscribing doesn't dupe.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'endpoint' => ['required', 'string', 'url:https'],
            'keys.p256dh' => ['required', 'string'],
            'keys.auth' => ['required', 'string'],
        ]);

        $sub = $request->user()->pushSubscriptions()->updateOrCreate(
            ['endpoint' => $data['endpoint']],
            [
                'p256dh' => $data['keys']['p256dh'],
                'auth' => $data['keys']['auth'],
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
            ],
        );

        return response()->json([
            'data' => [
                'id' => $sub->id,
                'endpoint_tail' => substr($sub->endpoint, -16),
            ],
        ], Response::HTTP_CREATED);
    }

    /**
     * Remove one of the user's devices.
     */
    public function destroy(Request $request, PushSubscription $subscription): Response
    {
        if ($subscription->user_id !== $request->user()->id) {
            abort(403);
        }
        $subscription->delete();
        return response()->noContent();
    }

    /**
     * Send a test notification to every subscription the user has.
     */
    public function test(Request $request): JsonResponse
    {
        $user = $request->user();

        $result = $this->push->sendToUser($user, [
            'title' => 'FamilyKnot — test notification',
            'body' => 'If you can read this, push notifications work on this device. 🎉',
            'url' => '/profile',
        ]);

        if ($result['sent'] === 0 && $result['failed'] === 0 && $result['pruned'] === 0) {
            return response()->json([
                'message' => 'No registered devices to send to. Enable push first.',
            ], 422);
        }

        return response()->json([
            'message' => "Sent to {$result['sent']} device(s)" .
                ($result['pruned'] > 0 ? " — {$result['pruned']} dead subscription(s) cleaned up" : '') .
                ($result['failed'] > 0 ? " — {$result['failed']} failed" : ''),
            'result' => $result,
        ]);
    }
}
