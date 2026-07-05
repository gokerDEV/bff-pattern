# V2 — Container Map

---

## Structurizr DSL

```structurizr
workspace "bff-pattern" "Generic Next.js BFF starter template — Container Map" {

    model {

        # ── People (from V1) ────────────────────────────────────────────────────
        endUser = person "End User" {
            description "A person using the frontend application in a browser."
            tags "External"
        }

        developer = person "Developer" {
            description "Frontend developer who scaffolds and builds on the template."
            tags "External"
        }

        # ── External Systems (from V1) ──────────────────────────────────────────
        backendApi = softwareSystem "OpenAPI Backend" {
            description "Any single, OpenAPI-compliant backend service."
            tags "External"
        }

        identityProvider = softwareSystem "Identity Provider" {
            description "OAuth 2.1 authorization server."
            tags "External"
        }

        # ── bff-pattern App (containers) ────────────────────────────────────────
        bffApp = softwareSystem "bff-pattern App" {
            description "Server-first Next.js application built from the bff-pattern template."
            tags "Internal"

            browser = container "Browser" {
                description "React Client Components and TanStack React Query hooks. Runs in the user's browser. Contains zero secrets. Communicates only with the Next.js server — never directly with the backend."
                technology "React 19, TanStack Query, TypeScript"
                tags "Client"
            }

            edgeMiddleware = container "Edge Middleware" {
                description "Next.js middleware.ts. Runs at the edge before any route handler. Enforces authentication guards: redirects unauthenticated requests to login, allows public routes through."
                technology "Next.js Middleware, Vercel Edge Runtime"
                tags "Edge"
            }

            nextServer = container "Next.js Server" {
                description "React Server Components and page rendering. Fetches data directly from the OpenAPI Backend using server-side OAuth 2.1 client credentials. No secrets ever leave this boundary toward the browser."
                technology "Next.js 16.2.10, React 19, Bun"
                tags "Server"
            }

            bffProxy = container "BFF Proxy" {
                description "Next.js catch-all API route: app/api/[...proxy]. The single exit point for all client-initiated API requests. Validates session, injects bearer token, sanitises headers, enforces CSRF protection, and forwards the request to the OpenAPI Backend."
                technology "Next.js Route Handler, TypeScript"
                tags "Server"
            }

            authHandler = container "Auth Handler" {
                description "NextAuth.js 5 session subsystem: app/api/auth/[...nextauth]. Manages OAuth 2.1 Authorization Code flow (user login), JWT session encoding, and automatic access-token refresh. Also maintains a cached client-credentials token for use by Server Components."
                technology "NextAuth.js 5.0.0-beta.31, OAuth 2.1, JWT"
                tags "Server"
            }
        }

        # ── Relationships ───────────────────────────────────────────────────────

        # End user entry points
        endUser -> browser "Uses the application via HTTPS"

        # All browser traffic hits Edge Middleware first
        browser -> edgeMiddleware "Every request (pages, API, auth) [HTTPS]"

        # Middleware routing decisions
        edgeMiddleware -> nextServer "Authenticated page requests and public routes"
        edgeMiddleware -> bffProxy "Requests to /api/[...proxy]/*"
        edgeMiddleware -> authHandler "Requests to /api/auth/*"

        # SSR path — server-to-server, no browser involvement
        nextServer -> backendApi "SSR: direct REST call with client credentials [HTTPS]"
        nextServer -> authHandler "Reads cached client-credentials token"

        # BFF path — browser-initiated, proxied by server
        bffProxy -> backendApi "BFF: proxied REST call with injected bearer token [HTTPS]"
        bffProxy -> authHandler "Reads user session token for injection"

        # Auth flows
        authHandler -> identityProvider "OAuth 2.1: Authorization Code + Client Credentials + token refresh [HTTPS]"

        # Developer (dev-time only — not a runtime relationship)
        developer -> backendApi "Dev-time: fetches OpenAPI spec for codegen (bun run codegen)"
    }

    views {

        container bffApp "V2_ContainerMap" {
            include *
            autoLayout lr
            title "V2 — bff-pattern: Container Map"
            description "The five logical containers inside the Next.js application and their runtime relationships."
        }

        styles {
            element "Internal" {
                background #1a6bcc
                color #ffffff
                shape RoundedBox
            }
            element "External" {
                background #6b7280
                color #ffffff
                shape RoundedBox
            }
            element "Client" {
                background #0e7490
                color #ffffff
                shape WebBrowser
            }
            element "Server" {
                background #1a6bcc
                color #ffffff
                shape RoundedBox
            }
            element "Edge" {
                background #7c3aed
                color #ffffff
                shape RoundedBox
            }
            element "Person" {
                background #374151
                color #ffffff
                shape Person
            }
            relationship "Relationship" {
                thickness 2
            }
        }

        theme default
    }
}
```

---

## Element Register
> All V1 identifiers carried forward. New containers added.

| Identifier | Type | Technology | Boundary |
|---|---|---|---|
| `endUser` | Person | — | External |
| `developer` | Person | — | External (dev-time) |
| `backendApi` | Software System | OpenAPI / REST | External |
| `identityProvider` | Software System | OAuth 2.1 | External |
| `bffApp` | Software System | — | Internal |
| `browser` | Container | React 19, TanStack Query | Client (browser) |
| `edgeMiddleware` | Container | Next.js Middleware | Vercel Edge |
| `nextServer` | Container | Next.js 16, RSC, Bun | Server |
| `bffProxy` | Container | Next.js Route Handler | Server |
| `authHandler` | Container | NextAuth.js 5 | Server |

---

## The Two Runtime Paths — Made Explicit

```
┌─ SSR Path (server-to-server) ──────────────────────────────────┐
│  nextServer  ──client credentials──▶  backendApi               │
│  (React Server Component fetches data at render time)          │
│  No browser involvement. Secrets stay server-side.             │
└────────────────────────────────────────────────────────────────┘

┌─ BFF Path (browser-initiated, server-proxied) ─────────────────┐
│  browser  ──fetch /api/[...proxy]/──▶  bffProxy                │
│                                           │                    │
│                               inject token + sanitise          │
│                                           │                    │
│                                           ▼                    │
│                                      backendApi                │
│  Client Component triggers. bffProxy holds all secrets.        │
└────────────────────────────────────────────────────────────────┘
```

**Why two paths?**

| Concern | SSR (nextServer) | BFF (bffProxy) |
|---|---|---|
| Who triggers | Next.js render cycle | Browser `fetch()` |
| Auth token | Client credentials (server OAuth) | User session JWT |
| Use case | Page data, SEO-critical content | Interactive mutations, live queries |
| Secret exposure risk | None — server-only | None — bffProxy holds secrets |
| Client JS bundle | Nothing added | Requires `use client` directive |

---

## Design Notes

### Edge Middleware as the gate
`edgeMiddleware` runs before every request — pages, API routes, and auth routes. Its sole job is enforcing authentication guards (redirect or pass-through). It does not read or write business data. This makes the security perimeter explicit and centralised.

### Five containers, one process
At runtime, `nextServer`, `bffProxy`, `authHandler`, and `edgeMiddleware` all run inside the same Bun/Next.js process. They are shown as separate containers because they have **distinct responsibilities and trust boundaries**, not because they are separate deployable units. This is a deliberate C4 modelling choice — it makes the architecture understandable.

### `browser` has no direct line to `backendApi`
This is the BFF guarantee. The browser never knows the backend URL, credentials, or token format. All access is mediated by `bffProxy`.

### Developer relationship is dev-time only
The `developer → backendApi` arrow (fetching OpenAPI spec for `bun run codegen`) is shown as a dashed note. It does not exist at runtime and will not appear in V9 (Deployment).

---

> ✅ Approve to continue to **V3 — SSR vs BFF Data Flow** (sequence diagrams).
> Or request changes to container names, descriptions, or relationships.
