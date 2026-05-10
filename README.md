# FamilyKnot

A collaborative family-tree application. Build out from yourself, invite relatives by email, and watch separate trees merge when they claim their profiles.

Built for the **Full Stack Developer Exam** — Laravel 11 + React 18 + Docker.

> **Want a guided 5-minute tour?** See **[DEMO.md](./DEMO.md)** after you boot the app.
> **Just want to read the in-app docs?** Sign in and click your avatar → **❓ Help & guide**.

---

## Table of Contents

1. [What you need to install](#what-you-need-to-install)
2. [Getting it running](#getting-it-running)
3. [Demo accounts (auto-seeded)](#demo-accounts-auto-seeded)
4. [Reset / re-seed](#reset--re-seed)
5. [Common commands](#common-commands)
6. [What it does](#what-it-does)
7. [Tech stack](#tech-stack)
8. [Port map](#port-map)
9. [Project structure](#project-structure)
10. [Architecture](#architecture)
11. [API reference](#api-reference)
12. [Reusable component library](#reusable-component-library)
13. [Testing](#testing)
14. [Configuration & environment variables](#configuration--environment-variables)
15. [Troubleshooting (per-OS)](#troubleshooting-per-os)
16. [What's intentionally not built](#whats-intentionally-not-built-v1-scope)

---

## What you need to install

**Just two things on the host machine:**

| | Required version | Why |
|---|---|---|
| **Docker** | 24.0+ (Compose v2) | Runs every other piece (PHP, MySQL, Node, Mailpit, Nginx) — you don't install any of those yourself |
| **Git** | any recent | To clone the repo |

**Optional (nice to have):**

| | Why |
|---|---|
| **Make** | Lets you use the `make up`, `make demo` shortcuts. If missing, the README shows the equivalent raw `docker compose` commands for every shortcut |

You do **not** need PHP, Composer, Node, npm, MySQL, or Nginx on the host — they all run in containers.

### Install steps per OS

#### macOS

```bash
# 1. Docker Desktop for Mac (Apple Silicon or Intel)
#    https://www.docker.com/products/docker-desktop/
#    Open the .dmg, drag to Applications, launch it once to grant permissions.

# 2. Verify
docker --version
docker compose version

# 3. Git is pre-installed via Xcode CLT; if not:
xcode-select --install

# 4. Make is pre-installed via Xcode CLT.
```

#### Windows 10/11

The recommended path is **Docker Desktop with the WSL2 backend**. Pure Windows (no WSL) works too but is slower.

```powershell
# 1. Enable WSL2 (one-time, requires reboot — skip if you already have WSL2)
#    In an Admin PowerShell:
wsl --install
# Reboot when prompted, then in the Ubuntu terminal that opens, set a username + password.

# 2. Install Docker Desktop for Windows
#    https://www.docker.com/products/docker-desktop/
#    During install, leave "Use WSL2 instead of Hyper-V" CHECKED.
#    After install, open Docker Desktop -> Settings -> Resources -> WSL Integration ->
#    enable for your default WSL distro (Ubuntu).

# 3. Install Git for Windows (includes Git Bash + a copy of make)
#    https://git-scm.com/download/win

# 4. Verify (in PowerShell, Git Bash, or your WSL Ubuntu terminal)
docker --version
docker compose version
git --version

# 5. (Best practice) Clone INSIDE the WSL filesystem, not C:\, for ~10x speed:
#    From your WSL Ubuntu terminal:
cd ~ && git clone git@github.com:massquote/genealogy-app.git familyknot
```

> **Windows tip:** if you don't have Make and don't want to install it, every `make X` command in this README has the raw `docker compose ...` equivalent listed. Or just use Git Bash, which ships with `make` on most Windows installs.

#### Linux (Ubuntu / Debian / Fedora / Arch)

```bash
# 1. Docker Engine + Compose plugin
#    Ubuntu/Debian:
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin git make
#    Fedora:
sudo dnf install -y docker docker-compose git make
#    Arch:
sudo pacman -S docker docker-compose git make

# 2. Start and enable the Docker daemon
sudo systemctl enable --now docker

# 3. Add yourself to the docker group so you don't need sudo every time
sudo usermod -aG docker $USER
# Log out and back in (or run `newgrp docker`) for the group change to take effect.

# 4. Verify
docker --version
docker compose version
```

#### Verify Docker is working (any OS)

```bash
docker run --rm hello-world
```

You should see *"Hello from Docker!"*. If you don't, fix the Docker install before continuing.

### Resource minimums

Docker Desktop **needs at least 4 GB of RAM allocated** to comfortably run the full stack. On Mac/Windows: Docker Desktop → Settings → Resources → Memory. On Linux this is automatic.

---

## Getting it running

```bash
# 1. Clone (HTTPS works without SSH keys)
git clone https://github.com/massquote/genealogy-app.git familyknot
cd familyknot

# 2. Boot everything
make up
#    or, without make:
#    docker compose up -d --build

# 3. Wait for first boot (~3-5 min the first time, ~10 sec after)
#    The PHP container will install Composer deps, generate APP_KEY,
#    generate VAPID keys for Web Push, run migrations, AND auto-seed
#    the demo family — all in the entrypoint, no extra commands needed.
```

That's it. Open these in your browser:

| URL | What you'll see |
|---|---|
| <http://localhost:19173> | The React app — the home page calls the backend health endpoint live |
| <http://localhost:19000/api/v1/health> | `{"status":"ok","service":"familyknot-api","version":"0.1.0",...}` |
| <http://localhost:19025> | Mailpit web UI — shows every email FamilyKnot has sent (invitations, etc.) |

**To stop everything:**
```bash
make down
# or: docker compose down
```

**Stop AND wipe all data (start completely fresh next time):**
```bash
docker compose down -v        # the -v removes named volumes (mysql data + node_modules cache)
```

---

## Demo accounts (auto-seeded)

`make up` automatically populates the database the first time it boots — no separate seed step needed. The two demo accounts:

| Email | Password | Tree |
|---|---|---|
| `felix@demo.test` | `password` | Felix Q Tester — 10 people across 3 generations + spouse + child |
| `alice@demo.test` | `password` | Alice Smith — small starter tree, isolated from Felix's |

Sign in as Felix to explore a populated tree. Sign in as Alice to see what isolation looks like — completely separate graph until someone bridges them via an invitation.

> Open the app's built-in Help (avatar → ❓ **Help & guide**) for an interactive walkthrough of every feature.
> For a step-by-step grader walkthrough, see **[DEMO.md](./DEMO.md)**.

---

## Reset / re-seed

If you mess up the demo data and want to start clean:

```bash
make demo                       # drop all tables + re-run migrations + re-seed (one shot)
# or: docker compose exec app php artisan migrate:fresh --seed --force
```

If you just want to re-seed without wiping (idempotent — uses `firstOrCreate`):

```bash
make seed
# or: docker compose exec app php artisan db:seed
```

If you want to wipe but NOT re-seed (e.g. for testing the registration flow from scratch):

```bash
make fresh
# or: docker compose exec app php artisan migrate:fresh --force
```

---

## Common commands

Type `make help` (or just `make`) at any time to see the full list. The most useful:

| Command | What it does | Without make |
|---|---|---|
| `make up` | Build images and start the full stack | `docker compose up -d --build` |
| `make down` | Stop and remove containers (keeps DB volume) | `docker compose down` |
| `make logs` | Tail logs from all services | `docker compose logs -f --tail=200` |
| `make ps` | Show running services | `docker compose ps` |
| `make health` | Pretty-print the API health endpoint | `curl http://localhost:19000/api/v1/health` |
| `make demo` | Fresh DB + seed (clean reset) | `docker compose exec app php artisan migrate:fresh --seed --force` |
| `make seed` | Re-seed (idempotent) | `docker compose exec app php artisan db:seed` |
| `make fresh` | Drop and re-migrate (no seed) | `docker compose exec app php artisan migrate:fresh` |
| `make migrate` | Run pending migrations | `docker compose exec app php artisan migrate` |
| `make test` | Run BOTH backend and frontend tests | `docker compose exec app php artisan test && docker compose exec frontend npm test` |
| `make test-back` | Backend tests (Pest) | `docker compose exec app php artisan test` |
| `make test-front` | Frontend tests (Vitest) | `docker compose exec frontend npm test` |
| `make shell-app` | Bash inside the PHP container | `docker compose exec app sh` |
| `make shell-front` | Shell inside the frontend container | `docker compose exec frontend sh` |
| `make shell-db` | MySQL CLI inside the db container | `docker compose exec mysql mysql -u familyknot -psecret familyknot` |
| `make tinker` | Laravel Tinker REPL | `docker compose exec app php artisan tinker` |
| `make fix-perms` | Reset file ownership (rare, after `artisan make:`) | `docker compose exec app chown -R 1000:1000 /var/www/html` |

---

## What it does

Two workflows (login excluded):

### Workflow 1 — Build my family
Sign in → fill your own profile → add relatives one at a time (parent / sibling / spouse / child) → optionally send each one an invitation email so they can claim their own profile.

### Workflow 2 — Explore & connect
View your family tree as an interactive SVG visualization → click any person to open their detail → check pending invitations → accept an invitation, which links the existing profile to your account and merges that branch into your tree.

The data model is a graph (parent and spouse edges between people), not a strict tree, so marriages and shared parents are handled correctly. The UI auto-derives siblings from people who share a parent.

---

## Tech stack

**Backend**
PHP 8.3 · Laravel 11 · MySQL 8 · Sanctum (token auth) · Pest (tests) · Mailpit (dev SMTP) · `minishlink/web-push` (VAPID push) · `resend/resend-laravel` (optional)

**Frontend**
React 18 · TypeScript · Vite · React Router v6 · TanStack Query · Zustand · React Hook Form + Zod · Tailwind CSS · `react-d3-tree` · Service Worker (Web Push) · Vitest + Testing Library

**Infra**
Docker Compose · Nginx → PHP-FPM

---

## Port map

All services run in the `19xxx` range so they don't collide with other Docker projects on the host.

| Service | Host port | URL |
|---|---|---|
| Laravel API (nginx) | `19000` | <http://localhost:19000> |
| React (Vite) | `19173` | <http://localhost:19173> |
| MySQL | `19306` | `localhost:19306` |
| Mailpit web UI | `19025` | <http://localhost:19025> |
| Mailpit SMTP | `19125` | `localhost:19125` |

Inside the Docker network, services use their service name (e.g. `mysql:3306`, `mailpit:1025`) — only the host-side mapping is in the `19xxx` namespace.

If any of these ports are taken on your machine, edit the host-side mapping in `docker-compose.yml` (the container-side ports don't need to change).

---

## Project structure

```
.
├── backend/                       Laravel 11 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/   AuthController, PersonController,
│   │   │   │                      RelationshipController, InvitationController,
│   │   │   │                      TreeController, IntegrationController,
│   │   │   │                      PushSubscriptionController
│   │   │   ├── Requests/          Form-request validators per endpoint
│   │   │   └── Resources/         JSON resources (User, Person, Invitation, Integration)
│   │   ├── Models/                User, Person, Relationship, Invitation,
│   │   │                          Integration, PushSubscription
│   │   ├── Policies/              PersonPolicy, RelationshipPolicy
│   │   ├── Services/              FamilyGraphService, UserMailerService,
│   │   │                          PushNotificationService
│   │   └── Mail/                  InvitationMail (markdown mailable)
│   ├── database/
│   │   ├── migrations/            users, people, relationships, invitations,
│   │   │                          integrations, push_subscriptions, sanctum
│   │   ├── factories/             Person/Relationship/Invitation/Integration/
│   │   │                          PushSubscription factories
│   │   └── seeders/               DemoFamilySeeder (felix + alice)
│   ├── routes/api.php             /api/v1/* route table
│   └── tests/Feature/             Pest test suites
├── frontend/
│   ├── public/
│   │   ├── sw.js                  Service worker (Web Push)
│   │   └── favicon.svg
│   └── src/
│       ├── components/
│       │   ├── ui/                Primitive: Button, Card, TextField, Select,
│       │   │                      Textarea, Modal, Avatar, Toggle,
│       │   │                      CollapsibleCard, StatusBadge, DropdownMenu
│       │   ├── layout/            NavBar, AppLayout, AuthLayout, ProtectedRoute
│       │   └── feature/           PersonCard, PersonForm, RelativesList,
│       │                          InviteRelativeForm, FamilyTreeNode,
│       │                          PushIntegrationCard
│       ├── hooks/                 useAuth, usePeople, useRelationships,
│       │                          useInvitations, useTree, useIntegrations, usePush
│       ├── lib/                   api (axios), apiErrors, cn, relations,
│       │                          treeData, queryClient, push, initials
│       ├── pages/                 Home, Login, Register, MyProfile, EditProfile,
│       │                          AddRelative, PersonDetail, EditPerson,
│       │                          Invitations, ClaimInvitation, FamilyTree,
│       │                          Integrations, Help, NotFound
│       ├── routes/                React Router config (public / auth-only / protected)
│       ├── store/                 zustand auth store (persisted to localStorage)
│       └── test/                  Vitest setup
├── docker/
│   ├── nginx/                     nginx → PHP-FPM config
│   └── php/                       PHP-FPM Dockerfile + entrypoint
├── docker-compose.yml             Five services: app, nginx, mysql, mailpit, frontend
├── Makefile                       developer ergonomics (up/down/test/seed/...)
├── DEMO.md                        5-minute grader walkthrough
└── README.md                      you are here
```

---

## Architecture

### High-level

```
   Browser (localhost:19173)
        │  (Vite dev server, HMR + Service Worker for push)
        ▼
   React + TypeScript SPA
        │  axios with Bearer token interceptor
        ▼
   Nginx (localhost:19000) ──► PHP-FPM (Laravel 11)
                                    │
                            ┌───────┼───────────────────────┐
                            ▼       ▼            ▼          ▼
                          MySQL  Mailpit   Resend (opt)  Browser Push
                                                        Service (FCM/APNS)
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
        ├──── integrations (type=email, provider=resend, encrypted config)
        ├──── push_subscriptions (endpoint, p256dh, auth, user_agent)
        └──── personal_access_tokens  (Sanctum)
```

- **People** can be claimed (linked to a user) or unclaimed (managed by the user who added them). The same person row stays put when claimed; only `claimed_by_user_id` flips.
- **Relationships** are a directed-or-symmetric edge table. Cycle prevention runs in `FamilyGraphService` before insert.
- **Tree scoping**: `GET /api/v1/tree` runs a BFS from the user's claimed Person across both edge types, returning only people in the connected component.
- **Sibling** is a derived concept: two people sharing at least one parent. Computed client-side in `lib/relations.ts`.
- **Integrations** store API keys encrypted at rest and never return them in plaintext via the API.

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
5. Optionally an invitation email is dispatched via `UserMailerService` (Resend if the inviter has the integration enabled, else Mailpit) by chaining a call to `POST /api/v1/invitations`.

### Workflow 2 — Explore & connect

1. `/tree` calls `GET /api/v1/tree` which returns `{people, relationships}` scoped to the user's graph.
2. `lib/treeData.ts::buildDescendantTree` converts that flat shape into the hierarchical structure `react-d3-tree` consumes (cycle-safe via a visited set).
3. Each node renders as HTML inside a `<foreignObject>` (`FamilyTreeNode`) — gendered colour, year of birth, italic spouse line, claimed badge.
4. "Re-root upward" pills let you re-anchor on any of the current root's parents (`?rootId=` query param).
5. The claim flow lives at the public `/claim/:token` route. Unauthenticated users are pushed through register/login with the email pre-filled and a `redirectTo` query param. Once authenticated, `POST /invitations/{token}/accept` flips `claimed_by_user_id` on the linked Person inside a transaction.

---

## API reference

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
| POST | `/invitations` | ✓ | `{person_id, email}`. Person must be unclaimed and created by the requester. Sends `InvitationMail` via the inviter's configured mailer. |
| POST | `/invitations/{token}/accept` | ✓ | Claims the linked Person. Rejects mismatched email, already-accepted, already-claims-a-profile. |
| GET | `/invitations/{token}` | — | Public lookup for the claim landing page. |

### Integrations (email)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/integrations` | ✓ | List current user's integrations. API key is masked (`re_••••aF7p`). |
| PUT | `/integrations/email` | ✓ | Upsert Resend integration with `{api_key, from_address}`. |
| PATCH | `/integrations/email/toggle` | ✓ | Enable/disable without deleting the key. |
| DELETE | `/integrations/email` | ✓ | Remove the integration entirely. |
| POST | `/integrations/email/test` | ✓ | Send a test email to the user's own address using their Resend key. |

### Push notifications

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/push/vapid-public-key` | — | Public — frontend needs this to call PushManager.subscribe. |
| GET | `/push/subscriptions` | ✓ | List the user's registered devices. |
| POST | `/push/subscriptions` | ✓ | Register a subscription. Idempotent on (user, endpoint). |
| DELETE | `/push/subscriptions/{id}` | ✓ | Owner-only. |
| POST | `/push/test` | ✓ | Send a test notification to all of the user's devices. |

### Health

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | — | `{status: "ok", service, version, timestamp}`. |

---

## Reusable component library

Built up deliberately rather than as an afterthought. Everything composable, all in `frontend/src/components/`.

**ui/** (primitives, no domain knowledge)
- `Button` — 4 variants, 3 sizes, loading state, icons, fullWidth
- `Card` — padding variants
- `TextField` / `Select` / `Textarea` — RHF-compatible, label / error / help / aria-invalid
- `Modal` — native `<dialog>`, ESC + backdrop close
- `Avatar` — initials with deterministic colour palette per name
- `Toggle` — accessible switch with role + aria-checked
- `CollapsibleCard` — disclosure card with header + status slot + chevron
- `StatusBadge` — tone-coded pills (green/amber/red/slate)
- `DropdownMenu` + `DropdownItem` + `DropdownDivider` + `DropdownLabel`

**layout/**
- `NavBar` — auth-aware (signed-in vs out), avatar dropdown
- `AppLayout` — header + main + footer with `<Outlet>`
- `AuthLayout` — centred card layout for login/register
- `ProtectedRoute` / `PublicOnlyRoute` — auth-guard wrappers

**feature/** (domain-aware composites)
- `PersonCard` — name + DOB + gender icon + claimed badge + optional action slot
- `PersonForm` — RHF + Zod, used for both create AND edit
- `RelativesList` — grouped by Parents / Spouses / Siblings / Children
- `InviteRelativeForm` — quick email-only invite
- `FamilyTreeNode` — HTML-inside-foreignObject node renderer for the tree
- `PushIntegrationCard` — push notifications integration card

---

## Testing

```bash
make test           # both backend + frontend
make test-back      # Pest only
make test-front     # Vitest only
```

**Coverage at a glance** (148 passing tests):
- **Backend** (73 Pest):
  - `AuthTest` — registration, login, logout, /me, validation, dupes
  - `PersonApiTest` + `PersonStoreEdgeCasesTest` — graph scoping, transactional create-with-relationship, edge cases, policies
  - `RelationshipApiTest` — spouse normalisation, cycle prevention, dedup, policies
  - `InvitationApiTest` — sending, listing, accepting, all error states (Mail::fake)
  - `TreeApiTest` — graph isolation, ?root_id= re-rooting
  - `IntegrationApiTest` + `UserMailerSelectionTest` — encrypted config, mask, toggle, isolation, mailer selection logic
  - `PushSubscriptionApiTest` + `PushNotificationServiceTest` — device CRUD, idempotency, dead-endpoint pruning
  - `EnvCheckTest` — regression guard against accidentally testing on the dev DB
- **Frontend** (75 Vitest):
  - Primitives: Button, Card, TextField, Avatar, Toggle, CollapsibleCard, StatusBadge, DropdownMenu, PersonCard, PersonForm, InviteRelativeForm
  - Auth flows: LoginPage validation + 422 mapping, ProtectedRoute redirect/render
  - Domain helpers: relations, treeData, initials, push (VAPID base64 round-trip)
  - HelpPage section reveal

The test suite uses a separate `familyknot_testing` database — your dev data is safe.

---

## Configuration & environment variables

You shouldn't need to touch any env files for the demo to work — the entrypoint generates everything on first boot.

**`backend/.env`** (autocreated from `.env.example`):
- `APP_KEY` — auto-generated on first boot if missing
- `DB_*` — points at the `mysql` Docker service
- `MAIL_*` — defaults to Mailpit (`smtp://mailpit:1025`)
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — auto-generated on first boot if missing (for Web Push)
- `FRONTEND_URL` — used in invitation emails to build the claim link

**`backend/.env.testing`** (committed):
- Used by `php artisan test`. Points at `familyknot_testing` (separate DB so tests never touch dev data). **Do not change `DB_DATABASE` here.**

**`frontend/.env`** (autocreated from `.env.example`):
- `VITE_API_URL` — defaults to `http://localhost:19000/api/v1`. Change if you remap the API port.

---

## Troubleshooting (per-OS)

### Cross-platform

**`make` not found**
You don't actually need it — every `make X` command in this README has the raw `docker compose ...` equivalent. Or install make:
- macOS: `xcode-select --install`
- Linux: `sudo apt-get install make` (or your distro's equivalent)
- Windows: install Git for Windows (Git Bash includes it), or use raw `docker compose` commands

**`make up` is taking forever**
First boot only: ~3-5 minutes to pull images, install Composer + npm dependencies, run migrations, generate keys, and seed the database. Watch progress with `docker compose logs -f`. Subsequent boots take seconds.

**Port already in use**
Some other process on your machine is using one of the `19xxx` ports. Find it:
- macOS/Linux: `lsof -i :19000`
- Windows: `netstat -ano | findstr :19000`

Either stop that process or remap the host-side port in `docker-compose.yml`.

**`/api/v1/health` returns 500 with permission errors**
On Linux/WSL, mounted volumes can have ownership drift. Fix:
```bash
make fix-perms
# or: docker compose exec app chown -R 1000:1000 /var/www/html
```

**Login fails with "credentials are incorrect" — but the password is right**
Your dev DB may have been wiped. Re-seed:
```bash
make seed
```
The included `EnvCheckTest` is a regression guard against the historical bug where the test suite pointed at the dev DB and `RefreshDatabase` wiped it on every test run.

**Browser shows old / unstyled content**
Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac). Service Workers and Vite HMR can occasionally serve stale assets. Nuclear option: DevTools → Application → Storage → Clear site data → refresh.

**Email sent but I can't see it in my inbox**
By default, email goes to **Mailpit** (a fake SMTP catcher) at <http://localhost:19025>. The app never sends real emails in dev unless you configure a Resend integration via the Integrations page.

**Push test says "Sent to 1 device" but no notification appears**
Check OS notification settings:
- **Windows**: Settings → System → Notifications → ensure "Google Chrome" (or your browser) is allowed; disable Focus Assist
- **macOS**: System Settings → Notifications → ensure your browser is allowed; disable Do Not Disturb
- **Linux**: depends on your DE, but check the notification daemon

### macOS-specific

**Docker Desktop won't start / "Cannot connect to the Docker daemon"**
Quit Docker Desktop fully (menu bar → Quit Docker Desktop), then re-launch. If still broken, restart your Mac. On Apple Silicon, make sure you downloaded the **Apple Silicon** build of Docker Desktop, not the Intel one.

**`make up` fails with "no space left on device"**
Docker Desktop's disk image is full. Open Docker Desktop → Troubleshoot → Clean / Purge data, or increase the disk image size in Settings → Resources.

### Windows-specific

**Slow file watching / hot reload not triggering**
You probably cloned into `C:\Users\you\` — Docker file events from the Windows filesystem to WSL2 are slow. Move the repo into your WSL home directory (`~/familyknot` inside Ubuntu) for ~10x speedup.

**`make` not found in PowerShell**
PowerShell doesn't have `make` built in. Either:
- Open Git Bash (installed with Git for Windows) and run from there
- Use the raw `docker compose ...` commands shown in the table above
- Install make via Chocolatey: `choco install make`

**Docker Desktop says "WSL 2 installation is incomplete"**
Open an Admin PowerShell and run `wsl --update`. Reboot if prompted.

**Push notifications don't work in Chrome / Edge on Windows**
First check Windows notification settings (above). If those are correct, also check that Focus Assist isn't on. The notification might be silently going to Action Center — open it (`Win+N` or click the bottom-right corner).

### Linux-specific

**`docker: permission denied`**
You haven't added yourself to the `docker` group:
```bash
sudo usermod -aG docker $USER
newgrp docker      # or log out and back in
```

**MySQL container exits immediately**
This sometimes happens on Linux when SELinux is enforcing. Check:
```bash
docker compose logs mysql
```
If you see permission errors writing to the volume, add `:Z` to the volume mount in `docker-compose.yml` (Fedora / RHEL) or temporarily disable SELinux for that volume.

**Network unreachable from inside containers**
If you're behind a corporate firewall or VPN that intercepts Docker's bridge network, Composer/npm install may fail to reach packagist / npm registry. Try `docker network prune`, restart Docker, or temporarily disable VPN during the first build.

---

## What's intentionally not built (v1 scope)

- Step-parents, adoption, divorces (only `parent` + `spouse` edges)
- Profile photo galleries (single avatar at most)
- Profile merge / dedup beyond the invitation-claim flow
- Mobile-responsive polish (works but not optimised below ~640px)
- Audit log
- Page analytics
- Full GraphQL — only REST is exposed (a single `ancestors()` GraphQL query was the planned bonus item)

---

## Repo

<https://github.com/massquote/genealogy-app>
