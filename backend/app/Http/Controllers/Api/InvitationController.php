<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInvitationRequest;
use App\Http\Resources\InvitationResource;
use App\Mail\InvitationMail;
use App\Models\Invitation;
use App\Models\Person;
use App\Services\UserMailerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InvitationController extends Controller
{
    public function __construct(private readonly UserMailerService $userMailer) {}

    /**
     * List invitations the current user sent + invitations addressed to their email.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $sent = Invitation::with('person')
            ->where('invited_by_user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        $pending = Invitation::with('person')
            ->where('email', $user->email)
            ->whereNull('accepted_at')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'sent' => InvitationResource::collection($sent),
            'pending' => InvitationResource::collection($pending),
        ]);
    }

    public function store(StoreInvitationRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $person = Person::findOrFail($data['person_id']);

        // Authorization: only the creator can invite for an unclaimed person.
        if ($person->claimed_by_user_id !== null) {
            throw ValidationException::withMessages([
                'person_id' => ['That profile has already been claimed.'],
            ]);
        }
        if ($person->created_by_user_id !== $user->id) {
            abort(403, 'You can only invite people you added.');
        }

        $invitation = Invitation::create([
            'person_id' => $person->id,
            'invited_by_user_id' => $user->id,
            'email' => strtolower($data['email']),
            'token' => Invitation::generateToken(),
        ]);

        // Use the inviter's configured email integration (Resend) if enabled,
        // else fall back to the application default mailer (Mailpit in dev).
        $this->userMailer
            ->mailerFor($user)
            ->to($invitation->email)
            ->send(new InvitationMail($invitation, $user));

        return response()->json([
            'data' => new InvitationResource($invitation->load('person')),
        ], Response::HTTP_CREATED);
    }

    /**
     * Accept an invitation: claim the linked Person for the authenticated user.
     */
    public function accept(Request $request, string $token): JsonResponse
    {
        $invitation = Invitation::where('token', $token)->firstOrFail();
        $user = $request->user();

        if ($invitation->is_accepted) {
            throw ValidationException::withMessages([
                'token' => ['This invitation has already been accepted.'],
            ]);
        }

        if (strcasecmp($invitation->email, $user->email) !== 0) {
            abort(403, 'This invitation was sent to a different email address.');
        }

        if ($user->person !== null) {
            throw ValidationException::withMessages([
                'token' => ['You already claim a profile. Profile merging is not yet supported.'],
            ]);
        }

        DB::transaction(function () use ($invitation, $user) {
            $invitation->person->update(['claimed_by_user_id' => $user->id]);
            $invitation->update([
                'accepted_at' => now(),
                'accepted_by_user_id' => $user->id,
            ]);
        });

        return response()->json([
            'data' => new InvitationResource($invitation->fresh()->load('person')),
        ]);
    }

    /**
     * Look up an invitation by token without authenticating (for the claim landing page).
     */
    public function lookup(string $token): JsonResponse
    {
        $invitation = Invitation::with('person:id,first_name,middle_name,last_name')
            ->where('token', $token)
            ->firstOrFail();

        return response()->json([
            'data' => [
                'email' => $invitation->email,
                'is_accepted' => $invitation->is_accepted,
                'person' => [
                    'id' => $invitation->person->id,
                    'full_name' => $invitation->person->full_name,
                ],
            ],
        ]);
    }
}
