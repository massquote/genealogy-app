<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpsertEmailIntegrationRequest;
use App\Http\Resources\IntegrationResource;
use App\Models\Integration;
use App\Services\UserMailerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Mail\Message;

class IntegrationController extends Controller
{
    public function __construct(private readonly UserMailerService $userMailer) {}

    /**
     * List all integrations for the current user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $integrations = $user->integrations()->orderBy('type')->get();

        return response()->json([
            'data' => IntegrationResource::collection($integrations),
        ]);
    }

    /**
     * Create or update the email integration.
     */
    public function upsertEmail(UpsertEmailIntegrationRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        $integration = $user->integrations()->updateOrCreate(
            ['type' => Integration::TYPE_EMAIL],
            [
                'provider' => Integration::PROVIDER_RESEND,
                'config' => [
                    'api_key' => $data['api_key'],
                    'from_address' => $data['from_address'],
                ],
                'is_enabled' => $data['is_enabled'] ?? true,
            ],
        );

        return response()->json([
            'data' => new IntegrationResource($integration->fresh()),
        ]);
    }

    /**
     * Toggle the email integration on/off without changing the key.
     */
    public function toggleEmail(Request $request): JsonResponse
    {
        $user = $request->user();
        $integration = $user->emailIntegration()->firstOrFail();
        $integration->update(['is_enabled' => !$integration->is_enabled]);

        return response()->json([
            'data' => new IntegrationResource($integration->fresh()),
        ]);
    }

    /**
     * Delete the email integration entirely.
     */
    public function destroyEmail(Request $request): Response
    {
        $user = $request->user();
        $integration = $user->emailIntegration()->firstOrFail();
        $integration->delete();

        return response()->noContent();
    }

    /**
     * Send a test email using the user's configured email integration.
     * Returns success/failure JSON without exposing the underlying error
     * message in detail (just provider class name + brief).
     */
    public function testEmail(Request $request): JsonResponse
    {
        $user = $request->user();
        $integration = $user->emailIntegration()->first();

        if (!$integration) {
            return response()->json([
                'message' => 'No email integration configured.',
            ], 422);
        }

        if (!$integration->is_enabled) {
            return response()->json([
                'message' => 'Integration is currently disabled — enable it to send a test.',
            ], 422);
        }

        try {
            $mailer = $this->userMailer->mailerFor($user);
            $mailer->raw(
                "This is a test email from FamilyKnot to verify your Resend integration is working.\n\n" .
                "If you received this, you're all set — invitation emails you send will reach real recipients.",
                function (Message $msg) use ($user, $integration) {
                    $msg->to($user->email)
                        ->subject('FamilyKnot — test email')
                        ->from($integration->getFromAddress(), 'FamilyKnot');
                },
            );

            $integration->update(['last_used_at' => now()]);

            return response()->json([
                'message' => "Test email sent to {$user->email}. Check your inbox.",
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Provider rejected the test send: ' . $e->getMessage(),
            ], 502);
        }
    }
}
