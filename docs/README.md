# bff-pattern

> A generic, open-source Next.js starter template built around the **Backend-for-Frontend (BFF) pattern**.

An opinionated, secure, server-first Next.js template for developers building a frontend against any OpenAPI-compliant backend. The design is documented first — the template code follows.

---

## What this is

- A **well-defined system design** — architecture diagrams, data flow sequences, security model, and machine-enforceable architecture rules
- A **minimal GitHub template** — clone and start building immediately, without coupling to any specific API or business domain
- **Not** a framework, not a renderer, not a code generator

## Tech Stack

| Concern | Tool |
|---|---|
| Framework | Next.js 16.2.10 (App Router, RSC) |
| Language | TypeScript 5 (strict) |
| Auth | NextAuth.js 5.0.0-beta.31 (OAuth 2.1) |
| API codegen | Orval + Zod 4 |
| Client data | TanStack React Query |
| UI | shadcn/ui + Tailwind CSS 4 |
| Package manager | Bun |
| Linter / Formatter | Biome |
| Architecture guard | dependency-cruiser |
| i18n | i18next + react-i18next |
| Deployment | Vercel (reference) |

---

## Architecture

The template implements two distinct data paths:

```
SSR Path  → React Server Component → ssr.mutator → backend (direct, server-side)
BFF Path  → Client Component → /api/[...proxy] → backend (proxied, token-injected)
```

No client component ever calls the backend directly. All secrets stay server-side.

---

## Documentation

The full system design lives in [`docs/design/`](./docs/design/):

| Document | Description |
|---|---|
| [discovery-summary.md](./docs/design/discovery-summary.md) | System purpose, actors, constraints, confirmed facts |
| [coverage-plan.md](./docs/design/coverage-plan.md) | 10 planned views and their rationale |
| [v1-system-context.md](./docs/design/v1-system-context.md) | C4 L1 — system in its environment |
| [v2-container-map.md](./docs/design/v2-container-map.md) | C4 L2 — the two runtime paths |
| [v3-data-flows.md](./docs/design/v3-data-flows.md) | SSR vs BFF sequence diagrams |
| [v4-auth-flows.md](./docs/design/v4-auth-flows.md) | Login, token refresh, client credentials |
| [v5-bff-proxy-component.md](./docs/design/v5-bff-proxy-component.md) | C4 L3 — BFF proxy security pipeline |
| [v6-auth-layer-component.md](./docs/design/v6-auth-layer-component.md) | C4 L3 — NextAuth.js internals |
| [v7-data-layer-component.md](./docs/design/v7-data-layer-component.md) | C4 L3 — Orval clients and mutators |
| [v8-codegen-pipeline.md](./docs/design/v8-codegen-pipeline.md) | Dev-time codegen workflow |
| [v9-deployment.md](./docs/design/v9-deployment.md) | Vercel topology and environment variables |
| [v10-architecture-rules.md](./docs/design/v10-architecture-rules.md) | dependency-cruiser rules and config |
| [cross-view-review.md](./docs/design/cross-view-review.md) | Consistency review across all views |

---

## Design methodology

This project was designed using [sysande](https://github.com/gokerDEV/sysande) — an open-source definition repository for AI-assisted system analysis and design.

---

## License

MIT
