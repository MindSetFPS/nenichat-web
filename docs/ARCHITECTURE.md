# Nenichat Architecture

## High-Level Overview

Nenichat is a multi-tenant WhatsApp commerce platform. Each business gets its own GoWapp (WhatsApp gateway) container. The Next.js frontend talks to GoWapp through a Traefik reverse proxy that routes by business ID path prefix.

```
                       Internet
                          |
                     [Traefik] (port 80)
                     /          \
            [GoWapp containers]  [Next.js Frontend (port 3001)]
            (per business)                |
            port 3000 internal       [PostgreSQL (local)]
                                          |
                                    [Supabase (auth, storage)]
```

## Project Layout

```
nenichat-web/
├── app/                    # Next.js App Router
│   ├── (app)/              # Authenticated pages + API routes
│   │   ├── api/            # All REST API endpoints
│   │   ├── chats/          # Chat UI
│   │   ├── contacts/       # Contact management
│   │   ├── products/       # Product catalog
│   │   ├── orders/         # Order management
│   │   └── ...             # Other pages
│   ├── (marketing)/        # Public pages
│   ├── login/              # Supabase auth
│   ├── webhook/            # WhatsApp webhook handler
│   └── middleware.ts       # Auth guard + redirects
├── Nenichat/               # Domain-Driven Design modules
│   ├── Chats/              # Chat domain
│   ├── Messages/           # Message domain
│   ├── Contacts/           # Contact domain
│   ├── Products/           # Product domain
│   ├── Orders/             # Order domain
│   ├── Containers/         # Container orchestration
│   ├── Expenses/           # Expense tracking
│   ├── Campaigns/          # Campaign management
│   ├── Audiences/           # Audience segmentation
│   ├── Suggestions/         # AI chat suggestions (Ollama use cases)
│   ├── Templates/           # Message templates
│   ├── Wapp/                # GoWapp gateway transport client (auth, device slots, QR)
│   └── Shared/              # Shared infra (DB, LLM)
├── components/             # Shared React components
│   ├── ui/                 # Radix-based primitives
│   ├── chat/               # Chat UI components
│   ├── layout/             # App shell, sidebar
│   └── ...
├── stores/                 # Zustand state stores
├── lib/                    # Utilities, auth, Supabase clients, browser Wapp API (lib/wapp/)
├── docker-compose.yml      # Frontend container
├── Dockerfile              # Multi-stage Next.js build
└── docs/                   # Documentation
```

## Domain-Driven Design Pattern

Each bounded context follows a consistent three-layer structure:

```
Nenichat/{Context}/
├── domain/       Entities, interfaces, repository contracts
├── app/          Application services (use cases)
└── infra/        Implementations
    ├── api/        GoWapp HTTP clients
    └── persistance/  PostgreSQL or Supabase repositories
```

## Databases

### Supabase (Cloud)
- **Auth**: Email/password, SSR cookie sessions
- **Tables**: `business`, `whatsapp-containers`
- **Storage**: `qr` bucket (QR images), `business` bucket (logos)

### PostgreSQL (Local, via `pg` Pool)
- All operational data: `contacts`, `phone_numbers`, `chats`, `messages`, `products`, `orders`, `expenses`, etc.
- Configured via env vars `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`

## Authentication Flow

1. **middleware.ts** runs on every request, refreshes Supabase session
2. Unauthenticated users redirected to `/login` for `(app)` routes
3. Server components use `createServerSupabaseClient()` + `getBusinessFromUser()`
4. Client components use `createBrowserSupabaseClient()`
5. `BusinessProvider` context makes business data available to all children

## Infrastructure

### Traefik Reverse Proxy
- Routes `PathPrefix(/api/user/{business_id})` to the correct GoWapp container
- Strips the prefix via `stripprefix` middleware before forwarding
- Each business container gets its own route: `whatsapp-{business_id}`

### Dokploy Container Orchestration
- Manages Docker Compose projects per business
- API: `POST /api/compose.create`, `POST /api/compose.deploy`, `POST /api/compose.update`
- Templates generate compose files with Traefik labels

### GoWapp Containers
- Image: `aldinokemal2104/go-whatsapp-web-multidevice:v9.0.0`
- Each container holds exactly one WhatsApp session, in a device slot named after the business ID
- Internal port: 3000 (not exposed, only accessible via Traefik)
- Basic Auth: `admin:admin`
- Container lifecycle states: `none → empty → created → deployed → connected` plus terminal `error/stopped/unreachable` — see [CONTAINER_STATES.md](./CONTAINER_STATES.md) for exact meanings, writers, and known transition bugs
- All gateway traffic goes through the `Wapp` client (`Nenichat/Wapp`): Basic auth,
  `X-Device-Id` header, timeouts, error normalization (`WappApiError`), plus
  device slots, login-QR polling, and app info/devices/reconnect calls.
  Domain adapters (`GoWappChatRepository`, `GoWappMessageRepository`) hold a
  `Wapp` instance and map responses to their own models.

Device slots and the `X-Device-Id` header are covered in [WHATSAPP_INFRA.md](./WHATSAPP_INFRA.md).

### Container Lifecycle
1. Admin clicks "Create Container" → Dokploy creates and deploys the compose stack → state `deployed`
2. App registers a device slot named `{business_id}` (`POST /devices`) — recreating a container wipes slots, so this always runs first
3. App polls `/devices/{business_id}/login` until WhatsApp returns a QR code
4. QR image uploaded to Supabase Storage, URL saved to `whatsapp-containers`

Steps 2–4 run inside the shared use case `fetchAndStoreQrCode()`
(`Nenichat/Containers/app/fetch-and-store-qr-code.ts`), used by both
`api/infra/containers` (create) and `api/infra/regenerate-qr` (regenerate).

5. User scans QR → the slot pairs its session → state `connected`
6. All GoWapp calls send `X-Device-Id: {business_id}` to resolve against that slot

## Key Data Flows

### Loading Chats
```
ChatListLoader (server component)
  → getBusinessFromUser() → checks container status in Supabase
  → new GoWappChatRepository("http://192.168.1.64/api/user/{businessId}", ...)
  → GET /chats?limit=26&offset=0  (via Traefik, prefix stripped)
  → GoWapp returns chat list
  → Mapped to IChat[] domain objects
```

### Sending a Message
```
Chat UI → POST /api/messages/send { phone, message }
  → SendMessage() in Nenichat/Messages/app/send-message.ts
  → new GoWappMessageRepository("http://192.168.1.64/api/user/{businessId}", ...)
  → POST /send/message  (via Traefik)
  → GoWapp forwards to WhatsApp
```

### Contact Syncing
- **Automatic**: ChatInitializer loads chats → ContactInitializer extracts JIDs → batch lookup via `POST /api/contacts/batch`
- **Manual** (legacy): `GET /api/contacts/sync` → fetches from GoWapp `/user/my/contacts`

### When a Container Goes Down
`GET /api/chats` probes the container when a request fails and marks it
`unreachable` in Supabase; the settings page then offers Recreate instead of
failing silently. Clients keep cached chats and flag `networkError` — they
never refetch-loop.

## Key Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `DOKPLOY_SERVER_URL` | Dokploy API host |
| `DOKPLOY_API_KEY` | Dokploy API key |
| `DOCKPLOY_PROJECT_ID` | Dokploy project ID |
| `DOCKPLOY_ENVIRONMENT_ID` | Dokploy environment ID |
| `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` | PostgreSQL connection |
| `NEXT_PUBLIC_WAPP_API_URL` | Default base URL for GoWapp gateway calls (`Wapp` client) |
| `WAPP_USER` / `WAPP_PASSWORD` | GoWapp Basic auth credentials (health check falls back to `admin:admin`) |
| `WAPP_DEBUG` | Set to `true` to log every Wapp request/response |
| `OLLAMA_HOST` | LLM host for AI suggestions |

Hardcoded addresses (used throughout): `192.168.1.64` (Traefik/Dokploy), ports `3000` (Dokploy API), `5102` (frontend dev), `5824` (webhooks), `11434` (Ollama).

## State Management

- **Zustand** (persisted to localStorage): `chat-store`, `contact-store`
- **Zustand** (ephemeral): `message-store`, `business-store`, `product-store`, `user-store`
- **React Context**: `BusinessProvider` for business data
- **URL params**: Page state, search queries, pagination

## API Routes

All under `app/(app)/api/`, require Supabase session.

| Route Group | Purpose |
|-------------|---------|
| `chats/` | Fetch chats (with 5-min server cache) |
| `messages/` | List/send messages |
| `contacts/` | CRUD, search, merge, sync contacts |
| `products/` | Product CRUD |
| `orders/` | Order CRUD with items |
| `infra/containers/` | Create/deploy WhatsApp containers |
| `infra/regenerate-qr/` | Regenerate QR code |
| `audiences/` | Audience CRUD + members |
| `campaigns/` | Campaign CRUD + execute |
| `expenses/` | Expense CRUD |
| `expense-categories/` | Category CRUD |
| `analytics/` | Profitability analytics |
| `whatsapp/devices/` | Get connected devices + update status |
| `whatsapp/info/` | GoWapp app/version info proxy |
| `whatsapp/reconnect/` | Reconnect WhatsApp session |
| `suggestions/` | AI chat suggestions |
| `business/` | Get/create business |
| `profile/` | User profile |

## Testing

- Jest with TypeScript (config: `jest.config.ts`)
- Run: `npm test`, `npm test -- --testPathPattern={name}`, `npm test -- --watch`
- Database tests use transactions + rollback per test

## Deployment

- **Frontend**: Docker container (`Dockerfile` → `docker-compose.yml`, port 3001)
- **Build**: `npm run build` (OpenNext Cloudflare), `npm run deploy` (Cloudflare Workers)
- **WhatsApp containers**: Dokploy-managed per business

## Common Debugging

- 404 from `/api/user/{id}/...` → container is stopped or doesn't exist in Dokploy
- Check container status: `docker ps -a | grep whatsapp`
- Check container logs: `docker logs {container_name} --tail 50`
- Test directly through Traefik: `curl -u admin:admin http://192.168.1.64/api/user/{id}/chats`
- Container crash loop → likely session expired + account validation failure
