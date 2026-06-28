# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Next.js dev server (http://localhost:3000)
npm run build     # production build
npm run lint      # ESLint via next lint
```

No test suite is configured (`npm test` exits with error).

### Local setup

```bash
cp .env.local.example .env.local
# Edit .env.local: set KTOR_API_URL and generate SESSION_SECRET with:
#   openssl rand -base64 32
npm install && npm run dev
```

`SESSION_SECRET` must be a static value (not a shell substitution) — it is used to sign session cookies and must not change between restarts, or all active sessions are invalidated.

### Production deploy

```bash
./deploy.sh update   # pull + rebuild Docker image
./deploy.sh install  # first-time: also installs Docker
./deploy.sh start    # rebuild without git pull
```

The container listens on port 3001 and sits behind Nginx Proxy Manager.

---

## Architecture

**Next.js 15 App Router** frontend — a thin proxy and server-rendered UI over the `qreport-server` Ktor backend. No local database.

### Two distinct data access patterns

**Server components** call `src/lib/api.ts` directly. `apiFetch()` reads `qreport_token` from the session, forwards the request to `KTOR_URL`, and handles errors:
- Network error → throws with a message that includes the actual `KTOR_URL` value
- 401 from Ktor → clears session cookies and redirects to `/login`

**Client components** (forms, action buttons) call the Next.js API routes under `src/app/api/`. These use `proxyRequest()` from `src/lib/proxy.ts`, which forwards the request verbatim to Ktor. The Ktor token never leaves the server.

### Configuration

`src/lib/config.ts` exports `KTOR_URL`. It throws at startup if `KTOR_API_URL` is not set — there is no hardcoded fallback. All files that need the backend URL import from here.

### Auth flow

Two cookies are set on successful login:
- `qreport_token` — raw Ktor JWT, forwarded as `Authorization: Bearer` on every backend call
- `qreport_session` — HMAC-signed JWT (`HS256`, `SESSION_SECRET`) containing `{ role }`; the role value is taken from Ktor's login response and cryptographically bound — the JWT payload is never decoded client-side

**Middleware** (`src/middleware.ts`, Edge runtime) runs on every non-public request:
1. Verifies the `qreport_session` HMAC signature; clears cookies and redirects to `/login` if invalid/expired
2. Blocks access to admin-only paths for non-ADMIN users (redirects to `/dashboard`)

Admin-only path prefixes (defined in `src/middleware.ts`):
```
/users, /island-types, /module-types, /criticality-levels,
/checkup-statuses, /check-item-templates
```

**Server-side guards** in `src/lib/auth.ts`:
- `requireAuth()` → verifies session, redirects to `/login` if missing
- `requireAdmin()` → calls `requireAuth()` then checks `role === "ADMIN"`, redirects to `/dashboard` otherwise
- `getVerifiedSession()` → returns `{ token, role }` or `null` (no redirect)

**`GET /api/auth/me`** — verifies the local session and pings Ktor with the bearer token to confirm it is still accepted. Returns `{ role, ktorReachable }` or 401/502.

**Sidebar** is a `"use client"` component that receives `role: string` as a prop from the server layout (`src/app/(dashboard)/layout.tsx`). ADMIN users see a "Configurazione" section; TECHNICIAN users do not.

### Route structure

- `src/app/(dashboard)/` — protected route group; layout calls `requireAuth()` and passes `role` to Sidebar
- `src/app/api/` — proxy route handlers; thin wrappers around `proxyRequest()`
- `src/app/api/admin/` — admin-only proxy routes (Ktor enforces `role = ADMIN` server-side via 403)
- `src/app/login/` — public

### Entity model

Sync entities extend `SyncFields` (`created_at`, `updated_at`, `synced_at`, `is_deleted`) — matching the PostgreSQL schema in `qreport-server`. Dates are **epoch milliseconds**; use `formatDate()` / `formatDateTime()` from `src/lib/utils.ts`.

Hierarchy: `Client → Facility → FacilityIsland → MechanicalUnit / MaintenanceLog`

Deletions are **soft-delete only** (`is_deleted = true`). Always filter `!entity.is_deleted` when rendering lists. Entities with `is_active` have a `ToggleActiveButton` component pattern.

`User` does not extend `SyncFields` — it has only `id`, `username`, `role`, `is_active`, `created_at`, `updated_at`. Deletion via `DELETE /admin/users/{id}` sets `is_active = false`.

### Styling

No Tailwind. Everything is in `src/app/globals.css` (CSS variables + utility classes) and CSS Modules for layout components.

Key utility classes:
- **Layout**: `card`, `page-header`, `page-title`, `page-subtitle`, `table-wrapper`
- **Buttons**: `btn`, `btn-primary`, `btn-secondary`, `btn-danger`, `btn-sm`
- **Badges**: `badge`, `badge-green`, `badge-red`, `badge-orange`, `badge-blue`
- **Forms**: `form-group`, `form-label`, `form-input`, `form-select`, `form-textarea`, `form-card`, `form-row`, `form-actions`
- **Alerts**: `alert`, `alert-error`, `alert-success`

`form-card` is the standard wrapper for standalone forms (max-width 560px). `form-actions` is the button row at the bottom.

### App version

The version is the `"version"` field in `package.json`. `next.config.ts` reads it at build time and exposes it as `NEXT_PUBLIC_APP_VERSION`. The Sidebar displays it in the footer. **Update `package.json` on every release.**

### Adding a new entity (standard pattern)

1. Add interface to `src/types/index.ts`
2. Add CRUD functions to `src/lib/api.ts` using `apiFetch()`
3. Add proxy routes under `src/app/api/<entity>/` and `src/app/api/<entity>/[id]/`
4. Add dashboard pages under `src/app/(dashboard)/<entity>/`
5. If admin-only: add the path prefix to `ADMIN_PREFIXES` in `src/middleware.ts` and add it to `ADMIN_ITEMS` in `Sidebar.tsx`

### UI language

All UI text is in **Italian**.
