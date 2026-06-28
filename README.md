# QReport Web

Version:    1.4.2
Date:       28 June 2026


Web administration interface for QReport — the industrial equipment checkup management system.

Built with Next.js 15, it connects to the existing Ktor backend (`qreport-server`) via the internal LAN and provides full CRUD access to all client management entities, master data configuration, and user administration.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Auth | JWT cookie session (jose / HMAC-HS256) |
| Backend | Ktor REST API (`qreport-server`) |
| Deploy | Docker + Nginx Proxy Manager |

---

## Features

- Login with existing `qreport-server` credentials (same JWT as the Android app)
- Role-based access: **ADMIN** and **TECHNICIAN** — enforced in middleware and server-side guards
- Dashboard with entity counts and quick actions
- Full CRUD for: Clients, Facilities, Robotic Islands, Contacts, Contracts
- Maintenance logs per island
- Soft delete — deletions propagate to Android devices on next sync
- Server-side data fetching — no CORS issues, token never exposed to the browser

### ADMIN-only features

- **User management** — create, edit (role / active / password reset), disable users
- **Master data** — Island types, Checkup module types, Criticality levels, Checkup statuses, Check item templates

---

## Project structure

```
src/
├── app/
│   ├── login/                      # Public login page
│   ├── api/                        # Route handlers (proxy to Ktor)
│   │   ├── auth/login              # Login → set session cookies
│   │   ├── auth/logout             # Clear session cookies
│   │   ├── auth/me                 # Verify session + ping Ktor
│   │   ├── admin/users/[id]        # User CRUD (ADMIN only)
│   │   ├── clients/[id]
│   │   ├── facilities/[id]
│   │   ├── islands/[id]
│   │   ├── contacts/[id]
│   │   ├── contracts/[id]
│   │   ├── maintenance-logs/[id]
│   │   ├── mechanical-units/[id]
│   │   ├── module-types/[id]
│   │   ├── criticality-levels/[id]
│   │   ├── checkup-statuses/[id]
│   │   ├── check-item-templates/[id]
│   │   └── island-types/[id]
│   └── (dashboard)/                # Protected route group (requires auth)
│       ├── dashboard/              # Overview page
│       ├── users/                  # User management (ADMIN only)
│       ├── clients/
│       ├── facilities/
│       ├── islands/
│       ├── contacts/
│       ├── contracts/
│       ├── maintenance/
│       ├── island-types/           # ADMIN only
│       ├── module-types/           # ADMIN only
│       ├── criticality-levels/     # ADMIN only
│       ├── checkup-statuses/       # ADMIN only
│       └── check-item-templates/   # ADMIN only
├── middleware.ts                   # Edge auth guard + role-based route protection
├── lib/
│   ├── api.ts                      # Server-side Ktor client
│   ├── auth.ts                     # Session cookie helpers (sign/verify with jose)
│   ├── config.ts                   # KTOR_URL (throws if KTOR_API_URL not set)
│   ├── proxy.ts                    # Generic API proxy middleware
│   └── utils.ts                    # Date formatting, UUID, classnames
├── types/
│   └── index.ts                    # TypeScript types matching PostgreSQL schema
└── components/
    └── layout/
        ├── Sidebar.tsx             # Role-aware sidebar (ADMIN/TECHNICIAN sections)
        └── Sidebar.module.css
```

---

## Prerequisites

- Node.js 20+
- A running `qreport-server` instance reachable on the LAN (v1.2.0+)

---

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.local.example .env.local
# Edit .env.local — two variables required (see below)

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Login with the same credentials used in the Android app.

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `KTOR_API_URL` | Internal URL of the Ktor backend, e.g. `http://x.x.x.x:8080` |
| `SESSION_SECRET` | Random 32+ char string used to sign the session cookie (HMAC-HS256). Generate once with `openssl rand -base64 32` and keep it stable — changing it invalidates all active sessions. |

**Important:** `SESSION_SECRET` must be a literal value in `.env.local`, not a shell substitution like `$(openssl rand ...)`. Shell substitution is not interpreted by Next.js's env parser; it would only work if the file were `source`d by bash, and even then it would generate a new secret on every invocation, breaking active sessions.

These variables must **never** be committed. `.env.local` is already in `.gitignore`.

---

## Auth & security

Session cookies:
- `qreport_token` — raw Ktor JWT, forwarded as `Authorization: Bearer` on every backend call; `httpOnly`, `secure` (in production), `sameSite=lax`
- `qreport_session` — HMAC-signed JWT containing `{ role }`; the role is taken from Ktor's login response and cryptographically bound with `SESSION_SECRET`; never decoded client-side

`src/middleware.ts` (Edge runtime) verifies both cookies on every request and enforces role-based access before any page renders. Admin-only routes redirect TECHNICIAN users to `/dashboard`.

If the Ktor token expires or is revoked (401 response), the session is cleared server-side and the user is redirected to `/login` automatically.

---

## Production deploy (Docker)

```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f
```

The container exposes port `3001`. Add a Proxy Host in Nginx Proxy Manager pointing to `<vm-ip>:3001` with SSL via Let's Encrypt.

Set `KTOR_API_URL` and `SESSION_SECRET` in `.env.local` on the server before deploying. `deploy.sh` sources this file automatically.

```bash
# First-time deploy on a fresh server
./deploy.sh install

# Update to latest version
./deploy.sh update
```

---

## Compatibility check

On every dashboard load the webapp calls `GET /api/version` on Ktor (no auth required) and compares the response against the minimum required version (`1.4.0`).

| Result | Banner |
|---|---|
| Version ≥ minimum | No banner; version shown top-right |
| Version < minimum | Red error banner — incompatibilità rilevata |
| Endpoint absent or Ktor unreachable | Yellow info banner — versione sconosciuta |

The check is non-blocking: the webapp continues to function but administrators are warned of a mismatch. **Bump `REQUIRED_SERVER_VERSION` in `src/lib/compat.ts`** whenever the webapp starts depending on a new Ktor endpoint.

---

## Relationship with qreport-server

Requires `qreport-server` v1.4.0 or later (the version that introduced `GET /api/version`). All authenticated endpoints require `Authorization: Bearer <token>`.

### Standard CRUD endpoints (all roles)

```
GET/POST              /api/clients
GET/PUT/DELETE        /api/clients/{id}

# Same pattern for:
/api/contacts              (?clientId= filter)
/api/contracts             (?clientId= filter)
/api/facilities            (?clientId= filter)
/api/islands               (?facilityId= filter)
/api/mechanical-units      (?islandId= filter)
/api/maintenance-logs      (?islandId= filter)
/api/island-types          (?all=true to include inactive)
/api/module-types          (?all=true to include inactive)
/api/criticality-levels    (?all=true to include inactive)
/api/checkup-statuses      (?all=true to include inactive)
/api/check-item-templates  (?moduleTypeId= filter)
/api/checkups              (?clientId= / ?islandId= filter, read-only)
```

### Version endpoint (no auth)

```
GET  /api/version   →  { "name": "qreport-server", "version": "x.y.z" }
```

### Admin-only endpoints (role = ADMIN, 403 otherwise)

```
GET                   /admin/users
GET                   /admin/users/{id}
POST                  /admin/users        body: { username, password, role }
PUT                   /admin/users/{id}   body: { role?, is_active?, password? }
DELETE                /admin/users/{id}   soft-disable (sets is_active = false)
```

Deletions on standard entities use soft delete (`is_deleted = true`) to keep the Android sync mechanism intact. `DELETE /admin/users/{id}` sets `is_active = false` (also reversible via PUT).

---

## Git repositories

- Android app: `qreport`
- Ktor server: `qreportserver`
- This web app: `qreportweb`
