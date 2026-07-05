# bff-pattern — Discovery Summary

---

## System Purpose

`bff-pattern` is an **open-source, generic Next.js starter template** that demonstrates a well-designed Backend-for-Frontend (BFF) pattern. Its goal is twofold:

1. **Design reference** — a clearly documented, well-reasoned architecture for developers building a secure frontend against any OpenAPI-compliant backend.
2. **Minimal starter** — enough scaffolding to clone and begin building immediately ("vibe coding"), without coupling to any specific API or business domain.

---

## Primary Actors

| Actor | Role |
|---|---|
| **Frontend Developer** | Primary consumer. Uses the template to scaffold a new project. |
| **End User (Browser)** | Person using the running frontend application. |
| **Backend API** | Any single, OpenAPI-compliant backend service. Not owned by this template. |
| **Identity Provider** | OAuth 2.0/2.1 provider (may be the backend itself or a separate service). |

---

## System Boundary

Everything inside the Next.js application:

- **Server Components** — SSR data fetching (direct backend calls, server-only)
- **BFF Proxy Layer** — `app/api/[...proxy]` route forwarding client-side requests to backend
- **Auth Layer** — session management, token refresh, credential injection
- **Codegen Pipeline** — OpenAPI spec → type-safe TypeScript clients
- **UI Component System** — design primitives and feature component structure
- **Configuration & Env** — typed environment variables, constants

---

## External Systems

| System | Relationship |
|---|---|
| **OpenAPI Backend** | Single upstream; accessed directly by Server Components (SSR) and proxied for Client Components (BFF) |
| **OAuth 2.0/2.1 Provider** | Issues access tokens; may be the backend itself or a standalone IdP |
| **Deployment Platform** | Vercel (primary), adaptable to others |
| **OpenAPI Spec Endpoint** | Consumed by codegen tool at build/dev time |

---

## In-Scope Capabilities

- BFF proxy pattern (catch-all route, token injection, CSRF protection, header sanitization)
- Server-side data fetching pattern (direct API access from Server Components)
- Authentication (OAuth 2.1 client credentials for SSR; user sessions via NextAuth.js for client)
- Type-safe API client generation from OpenAPI spec (Orval → SSR clients, RQ clients, Zod schemas)
- Runtime validation of API responses (Zod)
- Security model (CSRF, origin validation, public endpoint whitelist, env-var discipline)
- Component organization (ui primitives / common / features hierarchy)
- Error handling patterns (404, unexpected errors, validation errors)
- SEO fundamentals (metadata generation, structured data / JSON-LD, sitemap, robots.txt)
- Environment variable management (server-only secrets, typed config)

---

## Out-of-Scope

- Multiple backend support
- Business domain logic (no posts, users, products, etc.)
- Database / ORM / direct data store access
- Mobile or non-web clients
- Infrastructure as Code (Docker, CI/CD pipelines)
- Full i18n system *(assumed out — see open questions)*
- Template implementation code *(design & documentation come first)*

---

## Constraints

| Constraint | Detail |
|---|---|
| **Generic** | Zero coupling to any specific API domain or provider |
| **Single backend** | One upstream OpenAPI service |
| **Open source** | MIT license, public audience |
| **Minimal** | Enough to start, not a kitchen sink |
| **Server-first** | Prefer Server Components; `use client` only when necessary |
| **TypeScript strict** | No `any` types; full type coverage |
| **Security by default** | Secrets server-only, tokens never exposed to client |

---

## Quality Priorities

1. **Security** — BFF proxy, CSRF, token management, header sanitization
2. **Correctness of pattern** — well-reasoned, documented design decisions
3. **Developer experience** — codegen, type safety, clear folder structure
4. **Minimal footprint** — avoid feature creep, easy to extend

---

## Confirmed Facts

- Next.js **16.2.10**, App Router (React Server Components)
- **next-auth 5.0.0-beta.31** — full user auth (login/logout, protected routes) + server-side client credentials flow
- Single OpenAPI-compliant backend
- OAuth 2.1 authentication
- **Orval** (locked) — generates SSR clients, RQ clients, Zod schemas from OpenAPI spec
- **Zod 4** — runtime validation of all API responses
- **TanStack React Query** — client-side data fetching (minimal usage)
- **shadcn/ui + Tailwind CSS 4** (locked)
- **Bun** — package manager and dev runtime
- **Biome** — linter + formatter (replaces ESLint/Prettier)
- **dependency-cruiser** — architecture boundary enforcement
- **GitHub Template Repository** — clone-and-go starter
- **i18n** — included (i18next / react-i18next)
- TypeScript strict mode, no `any`
- Open source, MIT
- Reference: `next.template.kodkafa` (v3.2.0) — pattern inspiration only

---

## Assumptions

> ⚠️ These are not confirmed — see open questions below.

~~All assumptions promoted to confirmed facts — see below.~~

---

> ✅ All open questions resolved. Confirmed facts updated above. Moving to coverage planning.
