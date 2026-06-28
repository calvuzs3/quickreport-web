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
# Set KTOR_API_URL and SESSION_SECRET, then:
npm install && npm run dev
```

### Production deploy

```bash
./deploy.sh update   # pull + rebuild Docker image
./deploy.sh install  # first-time: also installs Docker
./deploy.sh start    # rebuild without git pull
```

The container listens on port 3001 and sits behind Nginx Proxy Manager.

---

## Architecture

This is a **Next.js 15 App Router** frontend that acts purely as a thin proxy and server-rendered UI over the `qreport-server` Ktor backend. There is no local database.

### Two distinct data access patterns

**Server components** call `src/lib/api.ts` directly. `apiFetch()` reads the session cookie server-side and forwards requests to `KTOR_API_URL`. Pages use `async/await` at the component level and call `notFound()` on errors.

**Client components** (forms, action buttons) call the Next.js API routes under `src/app/api/`. These route handlers use `proxyRequest()` from `src/lib/proxy.ts`, which forwards the HTTP request verbatim (including body and query string) to Ktor with the session token attached. The browser never sees the Ktor token.

### Auth flow

Two cookies are set on login:
- `qreport_token` — raw Ktor JWT; forwarded as `Authorization: Bearer` on every Ktor call
- `qreport_session` — HMAC-signed JWT (`HS256`, `SESSION_SECRET`) containing `{ role }`; the role value comes from Ktor's login response and is cryptographically bound — never read from the JWT payload, never stored as a plain string

**Middleware** (`src/middleware.ts`, Edge runtime) verifies the `qreport_session` HMAC signature on every non-public request. Admin-only paths (`/island-types`, `/module-types`, `/criticality-levels`, `/checkup-statuses`, `/check-item-templates`) redirect to `/dashboard` for non-ADMIN users.

**Server-side guards** in `src/lib/auth.ts`:
- `requireAuth()` — verifies session, redirects to `/login` if invalid
- `requireAdmin()` — additionally checks `role === "ADMIN"`, redirects to `/dashboard` otherwise

If Ktor returns 401 (token expired/revoked), `apiFetch` in `src/lib/api.ts` clears the session and redirects to `/login`.

**`/api/auth/me`** — verifies the local session AND pings Ktor to confirm the bearer token is still accepted. Returns `{ role, ktorReachable }`.

**Sidebar** is a client component that receives `role` as a prop from the server layout. ADMIN users see an additional "Configurazione" section with master data routes. Non-admins cannot see or navigate to those routes.

### Route structure

- `src/app/(dashboard)/` — protected route group; all pages here require auth
- `src/app/api/` — proxy route handlers; each file is a thin wrapper around `proxyRequest()`
- `src/app/login/` — public login page

### Entity model

All entities extend `SyncFields` (`created_at`, `updated_at`, `synced_at`, `is_deleted`) — matching the PostgreSQL schema in `qreport-server`. Dates are **epoch milliseconds** (use `formatDate()` from `src/lib/utils.ts` to display them).

Hierarchy: `Client → Facility → FacilityIsland → MechanicalUnit / MaintenanceLog`

Deletions are **soft-delete only** (`is_deleted = true`). UI code must filter `!entity.is_deleted` when displaying lists. Entities with `is_active` have a `ToggleActiveButton` component.

### Styling

No Tailwind. Styling uses:
- CSS variables defined in `src/app/globals.css` (colours, spacing)
- Utility classes defined there: `btn`, `btn-primary`, `btn-secondary`, `btn-sm`, `badge`, `badge-green`, `badge-red`, `badge-orange`, `badge-blue`, `card`, `page-title`, `page-subtitle`, `page-header`, `table`
- CSS Modules for layout components (`layout.module.css`, `Sidebar.module.css`)
- Inline `style` props for one-off adjustments

### Adding a new entity

1. Add types to `src/types/index.ts`
2. Add CRUD functions to `src/lib/api.ts` (following existing patterns)
3. Add API route handlers under `src/app/api/<entity>/` and `src/app/api/<entity>/[id]/` using `proxyRequest()`
4. Add dashboard pages under `src/app/(dashboard)/<entity>/`

### UI language

All UI text is in **Italian**.
