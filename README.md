# Files to add

64 file pronti. Ora ti do la mappa esatta di dove mettere ognuno. La struttura da ricreare:
qreport-web/
├── package.json
├── tsconfig.json
├── next.config.ts
├── .env.local          ← rinomina env.local.example
├── Dockerfile
├── docker-compose.yml
│
└── src/
    ├── types/
    │   └── index.ts                    ← types_index.ts
    ├── lib/
    │   ├── api.ts                      ← lib_api.ts
    │   ├── auth.ts                     ← lib_auth.ts
    │   ├── proxy.ts                    ← lib_proxy.ts
    │   └── utils.ts                    ← lib_utils.ts
    ├── components/layout/
    │   ├── Sidebar.tsx
    │   └── Sidebar.module.css
    └── app/
        ├── globals.css
        ├── layout.tsx                  ← app_layout.tsx
        ├── page.tsx                    ← app_page.tsx
        ├── login/
        │   ├── page.tsx                ← login_page.tsx
        │   └── LoginForm.tsx           ← login_LoginForm.tsx
        ├── api/
        │   ├── auth/login/route.ts     ← api_auth_login_route.ts
        │   ├── auth/logout/route.ts    ← api_auth_logout_route.ts
        │   ├── clients/route.ts        ← api_clients_route.ts
        │   ├── clients/[id]/route.ts   ← api_clients_id_route.ts
        │   ├── facilities/...          ← stesso pattern
        │   ├── islands/...
        │   ├── contacts/...
        │   ├── contracts/...
        │   └── mechanical-units/...
        └── (dashboard)/
            ├── layout.tsx              ← dashboard_layout.tsx
            ├── layout.module.css       ← dashboard_layout.module.css
            ├── dashboard/page.tsx      ← dashboard_page.tsx
            ├── clients/
            │   ├── page.tsx            ← clients_page.tsx
            │   ├── new/page.tsx        ← clients_new_page.tsx
            │   └── [id]/
            │       ├── page.tsx        ← clients_id_page.tsx
            │       ├── DeleteButton.tsx
            │       └── edit/
            │           ├── page.tsx
            │           └── ClientEditForm.tsx
            └── (stesso pattern per facilities, islands, contacts, contracts)