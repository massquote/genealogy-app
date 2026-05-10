# FamilyKnot — 5-Minute Demo Walkthrough

A grader-friendly tour that exercises every feature end-to-end. Designed to take ~5 minutes from cold start.

---

## 0. Boot (~3 min on first run)

```bash
git clone git@github.com:massquote/genealogy-app.git familyknot
cd familyknot
make up
```

That's it — no extra `make seed` needed. The entrypoint auto-seeds the demo family on first boot when the DB is empty.

Wait until you see `READY` in `make logs` (or `make health` returns `{"status":"ok"}`).

Open three browser tabs:

| Tab | URL |
|---|---|
| App | <http://localhost:19173> |
| Mailpit (sent emails) | <http://localhost:19025> |
| API health | <http://localhost:19000/api/v1/health> |

---

## 1. Login & profile (~30 sec)

1. App tab → click **Sign in** in the top-right
2. Email: `felix@demo.test` · Password: `password`
3. Land on **My Profile** — observe:
   - Felix's details (Sydney, born 1990-05-10)
   - 9 relatives bucketed into **Parents** (2), **Spouse** (1), **Sibling** (1), **Children** (1)
   - Note that grandparents *don't* show in the Profile bucket — they're 2 hops away. They'll appear in the tree visualisation.

---

## 2. Workflow 1: Build my family (~1 min)

1. Click **Add relative** (top-right)
2. **Relation**: pick `Father` — observe the form responds (no shared-parent picker for this option, only for Brother/Sister)
3. Fill: `Patrick / Tester`, DOB `1955-04-01`, Gender `Male`
4. Tick **Send an invitation email** → email `patrick@demo.test`
5. Submit
6. You're back on Profile — Patrick now appears in **Parents**
7. Switch to the Mailpit tab → see the new invitation email *"Felix Q Tester invited you to claim your profile"* with a Claim button. Don't click it yet.

---

## 3. Edit + Person Detail (~30 sec)

1. From Profile, click **View details** on the **Sara Cole** card (Felix's spouse)
2. Person Detail page opens — Edit / Add-relative-here / Danger zone visible (you created her)
3. Click **Edit** → change birthplace to `Melbourne, Australia` → Save
4. Person Detail re-renders with the new birthplace

---

## 4. Workflow 2: Tree visualization (~1 min)

1. Click **Family Tree** in the nav
2. Tree renders with Felix at the top, descendants going down (Theo Tester-Cole). Spouse "⚭ Sara Cole" italicised on Felix's node. Green check on claimed nodes.
3. **Drag** the canvas to pan. **Scroll** to zoom.
4. Above the tree, click an **Re-root upward → ↑ Robert Tester** (Felix's father)
5. Tree re-renders centred on Robert — now you can see Felix, Eliza (his sister), and any siblings sharing a parent. Robert's parents Edward + Helen are now reachable as ancestors via *Re-root upward → ↑ Edward Tester*.
6. Click any node to open that person's detail page.
7. Click **Centre on me** to return to Felix.

---

## 5. Workflow 2: Full claim flow (~1.5 min)

This is the showcase — two accounts merging via an emailed invitation.

### As Felix
1. Profile → click **Invite to claim** on the **Eliza Tester** card (his sister, currently unclaimed)
2. Modal opens. Email: `eliza@demo.test` · Send invitation
3. **Sign out** (top-right "Sign out" button)

### Switch to the recipient's perspective
4. Mailpit tab → refresh → click the most recent email
5. Click the **Claim my profile** button inside the email — it opens `/claim/<token>` in the app
6. Public landing page shows *"You've been invited to FamilyKnot — Felix Q Tester added a profile for Eliza Tester"*
7. Click **Create account** — register form opens with email pre-filled and locked (`eliza@demo.test`)
8. Fill in the rest: First `Eliza`, Last `Tester`, password `password123` (twice). Submit.
9. Browser redirects back to `/claim/<token>` — now signed in
10. Click **Yes, claim this profile**
11. Land on `/profile` — you are now Eliza, with Felix, Robert, Margaret, Edward, Helen, James, Patricia, Sara, Theo all visible in your relatives. **Two trees just merged.**
12. Open **Family Tree** — same graph, now centred on Eliza.

---

## 6. Invitations inbox (~20 sec)

Still as Eliza:
1. Click **Invitations** in the nav
2. **Pending for you** is now empty (you accepted Felix's invitation)
3. **Sent by you** is empty (Eliza hasn't sent any)

Sign back in as Felix to see his side:
1. **Sign out** → log in as `felix@demo.test`
2. **Invitations** → "Sent by you" shows the invitation to Eliza now marked **Accepted** (green badge), plus the Patrick one still **Awaiting**.

---

## 7. Tests + API tour (~30 sec)

Open a terminal and run:

```bash
make test         # 44 backend Pest + 38 frontend Vitest, all green
make health       # pretty-printed health endpoint JSON
```

Optionally hit a couple of endpoints directly with the bearer token from a login response:

```bash
TOKEN=$(curl -s -X POST http://localhost:19000/api/v1/auth/login \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"email":"felix@demo.test","password":"password"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

curl -sH "Authorization: Bearer $TOKEN" http://localhost:19000/api/v1/tree | python3 -m json.tool
```

---

## Reset

```bash
make demo         # migrate:fresh + re-seed in one shot
```

or stop everything:

```bash
make down
```

---

## What the demo proves vs. the rubric

| Requirement | Where it shows up |
|---|---|
| Login page | Step 1 |
| 2 workflows (login excluded) | Steps 2–3 (Workflow 1) and 4–5 (Workflow 2) |
| ≥ 4 screens | Profile · Add Relative · Person Detail · Edit · Family Tree · Invitations · Claim landing — 7 |
| Connect to an API | Whole UI is consuming `/api/v1/*` (Step 7 hits the API directly with a bearer token) |
| Proper routing | Public / auth-only / protected route trees, route params, 404 catch-all (try `/asdf`) |
| Code structure | `backend/app/{Models,Http,Policies,Services,Mail}` and `frontend/src/{components/ui,components/feature,hooks,lib,pages,routes,store}` |
| Reusable components | `components/ui/*` is consumed by every page; `PersonForm` is reused in Add + Edit + Edit Profile |
| Unit tests | Step 7 — `make test` |
| Dockerized app | Step 0 — `make up` is the only command |
| GraphQL | *Not implemented in v1 — REST is exposed instead* |
| Push notifications | *Not implemented in v1* |
| Page analytics | *Not implemented in v1* |
