# FamilyKnot

A collaborative family-tree application.
Built for the **Full Stack Developer Exam** with Laravel 11 + React 18 + Docker.

> **Status:** Session 1 scaffolding complete (foundation, Docker, routing shell). Auth, workflows, and tree viz land in subsequent sessions.

---

## Quick Start

**Prerequisites:** Docker + Docker Compose. Nothing else required on the host.

```bash
git clone <repo-url> familyknot
cd familyknot
make up
```

That's it. First boot will pull images and install PHP + Node dependencies inside the containers (~3–5 min). Subsequent boots take seconds.

Open:

| URL | What |
|---|---|
| <http://localhost:19173> | React app (Vite dev server) |
| <http://localhost:19000/api/v1/health> | Backend health check |
| <http://localhost:19025> | Mailpit — see emails the app sends |

To stop:

```bash
make down
```

Type `make` (or `make help`) to see all available commands.

---

## Tech Stack

**Backend** — PHP 8.3 · Laravel 11 · MySQL 8 · Sanctum (auth) · Pest (tests) · Mailpit (dev email)
**Frontend** — React 18 · TypeScript · Vite · React Router v6 · TanStack Query · Zustand · React Hook Form + Zod · Tailwind CSS · Vitest · Testing Library
**Infra** — Docker Compose · Nginx → PHP-FPM

---

## Port Map

All services run in the `19xxx` range to avoid conflicts with other Docker projects on the host.

| Service | Host port | URL |
|---|---|---|
| Laravel API (nginx) | `19000` | <http://localhost:19000> |
| React (Vite) | `19173` | <http://localhost:19173> |
| MySQL | `19306` | `localhost:19306` |
| Mailpit web UI | `19025` | <http://localhost:19025> |
| Mailpit SMTP | `19125` | `localhost:19125` |

---

## Project Structure

```
.
├── backend/            Laravel 11 application
├── frontend/           React + Vite + TypeScript application
├── docker/
│   ├── nginx/          nginx config
│   └── php/            PHP-FPM Dockerfile + entrypoint
├── docker-compose.yml
├── Makefile            developer ergonomics
└── README.md
```

---

## Development

```bash
make up               # start everything
make logs             # tail all service logs
make shell-app        # shell into the PHP container
make shell-front      # shell into the Node container
make migrate          # run pending DB migrations
make fresh            # drop & re-create the schema
make seed             # load demo data
make test             # run backend + frontend tests
make down             # tear everything down (keeps DB volume)
```

Code on the host is mounted into the containers, so edits in `backend/` or `frontend/` reflect immediately (HMR for React, autoload for Laravel).

---

## Tests

```bash
make test            # both
make test-back       # Pest / PHPUnit
make test-front      # Vitest
```

---

## Architecture & Workflows

*Filled in during Session 6.*

## API Reference

*Filled in during Session 6.*

## Troubleshooting

*Filled in during Session 6.*
