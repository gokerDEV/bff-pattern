# bff-pattern — Coverage Plan

> Views are ordered: dependencies first. We design one view at a time.

---

## Proposed Views

| # | View | Level | Concern | Notation | Tool |
|---|---|---|---|---|---|
| V1 | System Context | Context | Structure | C4 Context | Structurizr DSL |
| V2 | Container Map | Container | Structure | C4 Container | Structurizr DSL |
| V3 | SSR vs BFF Data Flow | Container | Flow | Sequence | Mermaid |
| V4 | Auth Flows | Container | Behavior | Sequence | Mermaid |
| V5 | BFF Proxy — Component | Component | Structure | C4 Component | Structurizr DSL |
| V6 | Auth Layer — Component | Component | Structure | C4 Component | Structurizr DSL |
| V7 | Data Layer — Component | Component | Structure | C4 Component | Structurizr DSL |
| V8 | Codegen Pipeline | Code | Flow | Activity / Flow | Mermaid |
| V9 | Deployment | Container | Deployment | Deployment | Structurizr DSL |
| V10 | Architecture Rules | Code | Structure | Rule table + cruiser config | Markdown |

---

## View Rationale

### V03 — System Context *(C4 L1)*
Shows `bff-pattern` as a single box surrounded by:
- **Browser User** (end user)
- **Developer** (who uses the template)
- **OpenAPI Backend** (upstream service)
- **OAuth 2.1 Identity Provider** (token issuer)

> Establishes who the system talks to and why.

---

### V04 — Container Map *(C4 L2)*
Decomposes the Next.js application into its deployable/runnable parts:
- **Browser** (React Client Components)
- **Next.js Server** (React Server Components + App Router)
- **BFF Proxy** (`app/api/[...proxy]` — runs on Next.js server)
- **Auth Subsystem** (NextAuth.js — runs on Next.js server)
- **Codegen artifacts** (generated clients — compile-time)

Shows two distinct data paths:
1. Server Component → direct API call (SSR)
2. Client Component → BFF Proxy → API call (proxied)

> This is the most important view — it makes the BFF pattern visible.

---

### V05 — SSR vs BFF Data Flow *(Sequence)*
Two side-by-side sequence diagrams in one view:

**Path A — SSR (Server Component):**
Browser → Next.js → ssr.mutator → Zod validate → render HTML → Browser

**Path B — BFF (Client Component):**
Browser → `fetch(/api/[proxy])` → BFF route → inject token → Backend API → Zod validate → JSON → Browser

> The core pattern explanation. Makes "why two paths?" immediately clear.

---

### V06 — Auth Flows *(Sequence)*
Three flows:

1. **User Login** — Browser → NextAuth `/api/auth/signin` → IdP → JWT session
2. **Protected Route Access** — middleware session check → redirect or render
3. **Server-Side Client Credentials** — Server Component → token manager → cached OAuth token → API

> Covers both auth dimensions (user session + server credentials).

---

### V07 — BFF Proxy Component *(C4 L3)*
Inside `app/api/[...proxy]/route.ts`:
- **Route Handler** — receives client request
- **Auth Guard** — checks session / validates origin (CSRF)
- **Token Injector** — attaches Bearer token (user or client credentials)
- **Header Sanitizer** — strips forbidden headers
- **Public Whitelist** — allows unauthenticated GET passthrough for listed endpoints
- **Upstream Fetcher** — forwards sanitized request to Backend API

> The security model of the BFF made explicit.

---

### V08 — Auth Layer Component *(C4 L3)*
Inside the Auth subsystem:
- **NextAuth Config** (`auth.config.ts`) — providers, callbacks
- **Token Manager** — client credentials cache + refresh logic (30-sec buffer)
- **Session Strategy** — JWT encode/decode, session shape
- **Middleware** — route protection, redirect rules

> Shows how user sessions and server credentials coexist.

---

### V09 — Data Layer Component *(C4 L3)*
Inside the generated data layer (`kodkafa/` → generic equivalent):
- **SSR Clients** — server-only fetch wrappers (direct API)
- **RQ Clients** — TanStack React Query hooks (client-side, BFF-routed)
- **Zod Schemas** — generated validators
- **TypeScript Types** — generated interfaces
- **SSR Mutator** — injects client credentials, base URL
- **Client Mutator** — routes to BFF proxy, injects no secrets

> Distinguishes what runs server-side vs client-side and why.

---

### V12 — Codegen Pipeline *(Activity / Flow)*
Dev-time workflow:
```
Backend (OpenAPI spec /doc-json)
  → orval.config.ts
    → SSR clients   (lib/generated/ssr/)
    → RQ clients    (lib/generated/rq/)
    → Zod schemas   (lib/generated/zod/)
    → TS types      (lib/generated/schemas/)
```
Shows: when to run, what gets generated, what not to edit manually.

> Essential for developer understanding — prevents "why is this generated?" confusion.

---

### V11 — Deployment *(Deployment)*
Runtime topology on Vercel:
- Serverless functions (Next.js server, BFF proxy, auth routes)
- Edge middleware (route protection)
- Static assets (CDN)
- Environment variable locations (server-only vs public)

> Clarifies what runs where and where secrets live.

---

### V12 — Architecture Rules *(dependency-cruiser)*
Forbidden dependency rules encoded as a table + `dependency-cruiser` config:

| Rule | Description |
|---|---|
| `no-client-secrets` | Client components must not import from `lib/auth/` |
| `no-generated-edit` | Nothing imports mutators directly except `lib/api/` |
| `server-only-ssr` | `ssr/` clients must not be imported in `use client` modules |
| `bff-boundary` | Client components must not call Backend API directly |
| `env-discipline` | `NEXT_PUBLIC_*` vars must not contain secrets |

> Makes architecture rules machine-checkable, not just documented.

---

## What Is NOT Covered

| Skipped | Reason |
|---|---|
| C4 Code (class diagrams) | TypeScript interfaces are self-documenting |
| Domain model / ERD | Template has no business domain |
| Multiple environments | Out of scope |
| i18n internals | Structure is standard; no custom design needed |
| CI/CD pipeline | Out of scope |

---

## Design Order

```
V1 → V2 → V3 → V4 → V5 → V6 → V7 → V8 → V9 → V10
```
Each view reuses element names and identifiers established in prior views.

---

> ✅ Approve this plan to begin with **V03 — System Context**.
> Or request changes to any view scope, notation, or order.
