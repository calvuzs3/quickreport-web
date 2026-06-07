# QReport Web

Version:    1.2.0
Date:       07 June 2026


Web administration interface for QReport — the industrial equipment checkup management system.

Built with Next.js 15, it connects to the existing Ktor backend (`qreport-server`) via the internal LAN and provides full CRUD access to all client management entities.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Auth | JWT cookie session (jose) |
| Backend | Ktor REST API (`qreport-server`) |
| Deploy | Docker + Nginx Proxy Manager |

---

## Features

- Login with existing `qreport-server` credentials (same JWT as the Android app)
- Dashboard with entity counts and quick actions
- Full CRUD for: Clients, Facilities, Robotic Islands, Contacts, Contracts
- Soft delete — deletions propagate to Android devices on next sync
- Server-side data fetching — no CORS issues, token never exposed to the browser

---

## Project structure

```
src/
├── app/
│   ├── login/                  # Login page
│   ├── api/                    # Route handlers (proxy to Ktor)
│   │   ├── auth/login
│   │   ├── auth/logout
│   │   ├── clients/[id]
│   │   ├── facilities/[id]
│   │   ├── islands/[id]
│   │   ├── contacts/[id]
│   │   ├── contracts/[id]
│   │   ├── maintenance-logs/[id]
│   │   └── mechanical-units/[id]
│   └── (dashboard)/            # Protected route group
│       ├── dashboard/          # Overview page
│       ├── clients/
│       ├── facilities/
│       ├── islands/
│       ├── maintenance-logs/
│       ├── contacts/
│       └── contracts/
├── lib/
│   ├── api.ts                  # Server-side Ktor client
│   ├── auth.ts                 # Session cookie helpers
│   ├── proxy.ts                # Generic API proxy middleware
│   └── utils.ts                # Date formatting, UUID, classnames
├── types/
│   └── index.ts                # TypeScript types matching PostgreSQL schema
└── components/
    └── layout/
        ├── Sidebar.tsx
        └── Sidebar.module.css
```

---

## Prerequisites

- Node.js 20+
- A running `qreport-server` instance reachable on the LAN
- The Ktor server must expose the CRUD routes added in v1.1.0

---

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.local.example .env.local
# Edit .env.local:
#   KTOR_API_URL=http://<ktor-server-ip>:8080
#   SESSION_SECRET=$(openssl rand -base64 32)

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Login with the same credentials used in the Android app.

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `KTOR_API_URL` | Internal URL of the Ktor backend, e.g. `http://x.x.x.x:x` |
| `SESSION_SECRET` | Random 32+ char string used to sign the session cookie. Generate with `openssl rand -base64 32` |

These variables must **never** be committed. `.env.local` is already in `.gitignore`.

---

## Production deploy (Docker)

```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f
```

The container exposes port `3000`. Add a Proxy Host in Nginx Proxy Manager pointing to `<vm-ip>:3000` with SSL via Let's Encrypt.

### docker-compose.yml environment

Set `SESSION_SECRET` as an environment variable on the host before running:

```bash
export SESSION_SECRET=$(openssl rand -base64 32)
docker compose up -d --build
```

Or use an `.env` file in the same directory as `docker-compose.yml` (not committed to git):

```
SESSION_SECRET=your_generated_secret
KTOR_API_URL=http://192.168.0.191:8080
```

---

## Relationship with qreport-server

This app requires `qreport-server` v1.2.0 or later, which adds the following REST endpoints:

```
GET/POST   /api/clients
GET/PUT/DELETE  /api/clients/{id}

# Same pattern for:
/api/contacts    (?clientId= filter)
/api/contracts   (?clientId= filter)
/api/facilities  (?clientId= filter)
/api/islands     (?facilityId= filter)
/api/mechanical-units  (?islandId= filter)
/api/maintenance-logs  (?islandId= filter)
```

All endpoints require `Authorization: Bearer <token>` using the same JWT issued by `/auth/login`.

Deletions use soft delete (`is_deleted=true`) to keep the Android sync mechanism intact.

---

## Git repository

- Android app: `qreport`
- Ktor server: `qreportserver`
- This web app: `qreportweb`