# FamilyKnot

A collaborative family-tree application. Build out from yourself, invite relatives by email, and watch separate trees merge when they claim their profiles.

Built for the **Full Stack Developer Exam** — Laravel 11 + React 18 + Docker.

---

## Quick Start

**Prerequisites:** Docker + Docker Compose. Nothing else required on the host.

```bash
git clone git@github.com:massquote/genealogy-app.git familyknot
cd familyknot
make up         # first boot pulls images + installs deps inside containers (~3–5 min)
make seed       # load the demo family
```

That's it. Open:

| URL | What |
|---|---|
| <http://localhost:19173> | React app (Vite dev server) |
| <http://localhost:19000/api/v1/health> | Backend health check |
| <http://localhost:19025> | Mailpit — see emails the app sends |

**Demo accounts** (after `make seed`):

| Email | Password | Tree |
|---|---|---|
| `felix@demo.test` | `password` | 10 people across 3 generations + spouse + child |
| `alice@demo.test` | `password` | Small starter tree (isolated from Felix's) |

To stop everything: `make down`. Type `make` or `make help` for the full command list.

---

## What it does

Two workflows (login excluded):

### Workflow 1 — Build my family
Sign in → fill your own profile → add relatives one at a time (parent / sibling / spouse / child) → optionally send each one an invitation email so they can claim their own profile.

### Workflow 2 — Explore & connect
View your family tree as an interactive SVG visualization → click any person to open their detail → check pending invitations → accept an invitation, which links the existing profile to your account and merges that branch into your tree.

The data model is a graph (parent and spouse edges between people), not a strict tree, so marriages and shared parents are handled correctly. The UI auto-derives siblings from people who share a parent.

---

## Tech Stack

**Backend**
PHP 8.3 · Laravel 11 · MySQL 8 · Sanctum (token auth) · Pest (tests) · Mailpit (dev SMTP)

**Frontend**
React 18 · TypeScript · Vite · React Router v6 · TanStack Query · Zustand · React Hook Form + Zod · Tailwind CSS · `react-d3-tree` · Vitest + Testing Library

**Infra**
Docker Compose · Nginx → PHP-FPM

---

## Port Map

All services run in the `19xxx` range so they don't collide with other Docker projects on the host.

| Service | Host port | URL |
|---|---|---|
| Laravel API (nginx) | `19000` | <http://localhost:19000> |
| React (Vite) | `19173` | <http://localhost:19173> |
| MySQL | `19306` | `localhost:19306` |
| Mailpit web UI | `19025` | <http://localhost:19025> |
| Mailpit SMTP | `19125` | `localhost:19125` |

Inside the Docker network, services use their service name (e.g. `mysql:3306`, `mailpit:1025`) — only the host-side mapping is in the `19xxx` namespace.

---

## Project Structure

```
.
├── backend/                       Laravel 11 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/   AuthController, PersonController,
│   │   │   │                      RelationshipController, InvitationController,
│   │   │   │                      TreeController
│   │   │   ├── Requests/          Form-request validators per endpoint
│   │   │   └── Resources/         API JSON resources (User, Person, Invitation)
│   │   ├── Models/                User, Person, Relationship, Invitation
│   │   ├── Policies/              PersonPolicy, RelationshipPolicy
│   │   ├── Services/              FamilyGraphService (BFS traversal, cycle check)
│   │   └── Mail/                  InvitationMail (markdown mailable)
│   ├── database/
│   │   ├── migrations/            users, people, relationships, invitations + Sanctum
│   │   ├── factories/             Person/Relationship/Invitation factories
│   │   └── seeders/               DemoFamilySeeder (felix + alice)
│   ├── routes/api.php             /api/v1/* route table
│   └── tests/Feature/             Pest test suites (auth, people, relationships,
│                                  invitations, tree, env-isolation guard)
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ui/                Button, Card, TextField, Select, Textarea, Modal
│       │   ├── layout/            NavBar, AppLayout, AuthLayout, ProtectedRoute
│       │   └── feature/           PersonCard, PersonForm, RelativesList,
│       │                          InviteRelativeForm, FamilyTreeNode
│       ├── hooks/                 useAuth, usePeople, useRelationships,
│       │                          useInvitations, useTree
│       ├── lib/                   api (axios), apiErrors, cn, relations,
│       │                          treeData, queryClient
│       ├── pages/                 Home, Login, Register, MyProfile, EditProfile,
│       │                          AddRelative, PersonDetail, EditPerson,
│       │                          Invitations, ClaimInvitation, FamilyTree, NotFound
│       ├── routes/                React Router config (public / auth-only / protected)
│       ├── store/                 zustand auth store (persisted to localStorage)
│       └── test/                  Vitest setup
├── docker/
│   ├── nginx/                     nginx → PHP-FPM config
│   └── php/                       PHP-FPM Dockerfile + entrypoint
├── docker-compose.yml             Five services: app, nginx, mysql, mailpit, frontend
├── Makefile                       developer ergonomics (up/down/test/seed/...)
└── README.md
```

---

## Architecture

### High-level

```
   Browser (localhost:19173)
        │  (Vite dev server, HMR)
        ▼
   React + TypeScript SPA
        │  axios with Bearer token interceptor
        ▼
   Nginx (localhost:19000) ──► PHP-FPM (Laravel 11)
                                    │
                            ┌───────┼───────┐
                            ▼       ▼       ▼
                          MySQL  Mailpit  (queue, sync in dev)
```

### Data model

```
users (1) ──── (1) people  (claimed_by_user_id, nullable+unique)
        │              │
        │              │ (created_by_user_id)
        │              │
        │           ┌──┴──── relationships (person_a_id, person_b_id, type)
        │           │           type IN ('parent', 'spouse')
        │           │           For 'parent': a is parent of b
        │           │           For 'spouse': a.id < b.id (normalised)
        │           │
        │           └──── invitations (person_id, email, token, accepted_at)
        │
        └──── personal_access_tokens  (Sanctum)
```

- **People** can be claimed (linked to a user) or unclaimed (managed by the user who added them). The same person row stays put when claimed; only `claimed_by_user_id` flips.
- **Relationships** are a directed-or-symmetric edge table. Cycle prevention runs in `FamilyGraphService` before insert.
- **Tree scoping**: `GET /api/v1/tree` runs a BFS from the user's claimed Person across both edge types, returning only people in the connected component.
- **Sibling** is a derived concept: two people sharing at least one parent. Computed client-side in `lib/relations.ts`.

### Auth

- Sanctum personal access tokens (Bearer in `Authorization` header).
- Frontend stores `{user, token}` in a zustand store persisted to `localStorage`.
- Axios request interceptor attaches the token; response interceptor on 401 clears the store and redirects to `/login`.
- React Router has three layout layers: `AppLayout` (default), `AuthLayout` (centred login/register card), `ProtectedRoute` / `PublicOnlyRoute` wrappers.

### Workflow 1 — Build my family

1. `POST /auth/register` creates the user + a Person record auto-claimed by them, in one transaction.
2. From `/profile`, "Add relative" → `AddRelativePage` lets you pick a friendly relation (Father / Sister / Spouse / etc).
3. The frontend maps friendly labels → API payload via `lib/relations.ts::friendlyToApi()` and POSTs to `/api/v1/people` with an embedded `relationship: {anchor_id, relation}` block.
4. `PersonController::store` creates both the person AND the relationship in a single DB transaction (via `FamilyGraphService::createRelationship`), normalising spouse ordering and rejecting cycles.
5. Optionally an invitation email is dispatched via Mailpit by chaining a call to `POST /api/v1/invitations`.

### Workflow 2 — Explore & connect

1. `/tree` calls `GET /api/v1/tree` which returns `{people, relationships}` scoped to the user's graph.
2. `lib/treeData.ts::buildDescendantTree` converts that flat shape into the hierarchical structure `react-d3-tree` consumes (cycle-safe via a visited set).
3. Each node is a custom SVG (`FamilyTreeNode`) — gendered colour, year of birth, italic spouse line, claimed badge.
4. "Re-root upward" pills let you re-anchor on any of the current root's parents (`?rootId=` query param).
5. The claim flow lives at the public `/claim/:token` route. Unauthenticated users are pushed through register/login with the email pre-filled and a `redirectTo` query param. Once authenticated, `POST /invitations/{token}/accept` flips `claimed_by_user_id` on the linked Person inside a transaction.

---

## API Reference

All endpoints under `/api/v1`. JSON in, JSON out. Sanctum bearer required except where noted.

### Auth

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | — | first/middle/last/email/password (+ optional date_of_birth/gender). Creates user + claimed Person. Returns `{user, token, token_type}`. |
| POST | `/auth/login` | — | email + password. Returns same shape as register. |
| GET | `/auth/me` | ✓ | Current user with their Person eager-loaded. |
| POST | `/auth/logout` | ✓ | Revokes the current token. 204. |

### People

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/people` | ✓ | All people in the requester's connected family graph (BFS from their claimed Person). |
| POST | `/people` | ✓ | Create a person. Optional `relationship: {anchor_id, relation: parent\|child\|spouse}` creates the link in the same transaction. |
| GET | `/people/{id}` | ✓ | Single person (gated by `PersonPolicy::view`). |
| PATCH | `/people/{id}` | ✓ | Update — gated by `PersonPolicy::update` (creator OR claimer). |
| DELETE | `/people/{id}` | ✓ | Delete — gated by `PersonPolicy::delete` (creator, never if claimed by someone else). |

### Tree

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/tree` | ✓ | `{people, relationships}` for the requester's connected component. Optional `?root_id=` shifts the centre. |

### Relationships

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/relationships` | ✓ | `{person_a_id, person_b_id, type}`. Idempotent (firstOrCreate). Spouse rows normalised so `person_a_id < person_b_id`. Rejects cycles. |
| DELETE | `/relationships/{id}` | ✓ | Creator-only. |

### Invitations

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/invitations` | ✓ | `{sent, pending}` for the current user. |
| POST | `/invitations` | ✓ | `{person_id, email}`. Person must be unclaimed and created by the requester. Sends `InvitationMail` via Mailpit. |
| POST | `/invitations/{token}/accept` | ✓ | Claims the linked Person. Rejects mismatched email, already-accepted, already-claims-a-profile. |
| GET | `/invitations/{token}` | — | Public lookup for the claim landing page (returns email + person summary, no auth). |

### Health

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | — | `{status: "ok", service, version, timestamp}`. |

---

## Reusable component library

Built up deliberately rather than as an afterthought. Everything composable, all in `frontend/src/components/`.

**ui/** (primitive, no domain knowledge)
- `Button` — 4 variants (primary / secondary / ghost / danger), 3 sizes, loading state, leftIcon/rightIcon, fullWidth
- `Card` + `CardHeader` + `CardTitle` + `CardDescription` — padding variants, border control
- `TextField` — RHF-compatible, label / error / help text / aria-invalid
- `Select` — same conventions, options array, optional placeholder
- `Textarea` — matching API
- `Modal` — native `<dialog>`, ESC + backdrop close, size variants

**layout/**
- `NavBar` — auth-aware (signed-in vs out), active-route highlight
- `AppLayout` — header + main + footer with `<Outlet>`
- `AuthLayout` — centred card layout for login/register
- `ProtectedRoute` / `PublicOnlyRoute` — auth-guard wrappers

**feature/** (domain-aware composites)
- `PersonCard` — name + DOB + gender icon + claimed badge + optional action slot + optional link
- `PersonForm` — RHF + Zod, used for both create AND edit
- `RelativesList` — grouped by Parents / Spouses / Siblings / Children with empty state
- `InviteRelativeForm` — quick email-only invite
- `FamilyTreeNode` — custom SVG node renderer for the tree visualization

---

## Testing

```bash
make test           # both backend + frontend
make test-back      # Pest only
make test-front     # Vitest only
```

**Coverage at a glance**:
- **Backend** (40 Pest tests / 119 assertions):
  - `AuthTest` — registration, login, logout, /me, validation, dupes
  - `PersonApiTest` — graph scoping, transactional create-with-relationship, policies
  - `RelationshipApiTest` — spouse normalisation, cycle prevention, dedup, policies
  - `InvitationApiTest` — sending, listing, accepting, all error states (Mail::fake)
  - `TreeApiTest` — graph isolation, ?root_id= re-rooting
  - `EnvCheckTest` — regression guard against accidentally testing on the dev DB
- **Frontend** (35 Vitest tests):
  - Primitives: `Button`, `Card`, `TextField`, `PersonCard`, `PersonForm`
  - Auth flows: `LoginPage` validation + 422 mapping, `ProtectedRoute` redirect/render
  - Domain helpers: `relations` (friendlyToApi + bucketRelatives), `treeData` (buildDescendantTree + findParents)

The test suite uses a separate `familyknot_testing` database — your dev data is safe.

---

## Configuration & Environment Variables

Two `.env` files in `backend/`:
- `.env` — runtime (autocreated on first boot from `.env.example` if missing).
- `.env.testing` — used by `php artisan test`. Points at `familyknot_testing`. **Do not change DB_DATABASE here unless you really know what you're doing.**

Frontend has `.env` with:
- `VITE_API_URL` — defaults to `http://localhost:19000/api/v1`. Change if you remap the API port.

---

## Troubleshooting

**`make up` fails during PHP image build**
The first build downloads PHP extension dependencies via Alpine `apk`. If it fails on a flaky network, just retry — `docker compose up -d --build` is idempotent.

**`/api/v1/health` returns 500 with a permission error in the response**
The PHP container runs as `root` and writes to mounted host directories. The entrypoint `chmod 777`s `storage/` and `bootstrap/cache/` on every boot, but if you ran `php artisan` on the host with a different user, ownership may have drifted. Fix:
```bash
make fix-perms
```

**Frontend page is blank / unstyled**
Tailwind is generating CSS from `tailwind.config.js`'s `content` paths. If the file gets reset to the empty default (`content: []`), no utility classes are emitted and the app renders unstyled. Run:
```bash
docker compose logs frontend | grep -i tailwind
```
Look for `warn - The 'content' option in your Tailwind CSS configuration is missing or empty`. The committed config is correct — if it's been edited, restore it from git.

**Login fails with "credentials are incorrect" but you typed the right password**
Your dev DB might have been wiped. Re-seed:
```bash
make seed
```
The included `EnvCheckTest` is a regression guard against the historical bug where the test suite pointed at the dev DB and `RefreshDatabase` wiped it on every test run. If `EnvCheckTest` ever fails, fix `phpunit.xml` *before* running other tests.

**Port already in use**
The 19xxx range was chosen to avoid common defaults. If something on your host is using these ports, change the host-side mapping in `docker-compose.yml` (the container-side ports stay the same).

**Email "sent" but I can't see it**
Open Mailpit at <http://localhost:19025>. Outgoing email is captured locally — the app never sends real email in dev.

**Browser shows the old dist of the page**
Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R`). Vite's HMR is on, but service workers / browser caches occasionally hold stale assets.

---

## What's intentionally not built (v1 scope)

- Step-parents, adoption, divorces (only `parent` + `spouse` edges)
- Profile photo galleries (single avatar at most)
- Profile merge / dedup beyond the invitation-claim flow
- Mobile-responsive polish (works but not optimised below ~640px)
- Audit log
- Real email delivery (Mailpit captures everything in dev)
- Full GraphQL — only REST is exposed (a single `ancestors()` GraphQL query is the planned bonus item)

---

## Repo

<https://github.com/massquote/genealogy-app>
