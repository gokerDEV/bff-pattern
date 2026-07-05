# BFF Pattern Template

A secure, scalable Next.js 16 template implementing the Backend-For-Frontend (BFF) pattern with NextAuth 5 (OAuth 2.1) and fully typed Orval generation for OpenAPI backends.

## Philosophy

We design the system first, after we define libs/tools and rules. This template provides a robust architectural foundation for frontend developers to build securely against an OpenAPI spec, without reinventing auth or data fetching loops.

- **Single Backend**: This template connects to ONE upstream backend.
- **AI Coding Ready**: Drop in an `openapi.json` and generate your API clients.
- **Machine-enforced Architecture**: Rules verified by `dependency-cruiser` (`bun run arch:check`).

## Generation Instructions

To start building with this template, follow these exact steps:

1. **Provide OpenAPI Spec**: 
   Place your backend's `openapi.json` at the project root (or configure the remote URL in `orval.config.ts`).
2. **Generate API Clients**: 
   Run `bun run codegen`. This uses Orval to generate fully-typed React Query hooks, SSR fetchers, and Zod schemas in `src/lib/generated/`.
3. **Configure Authentication**: 
   Set up your OAuth 2.1 provider in `auth.ts` and populate the `.env` variables (use `.env.example` as a reference).
4. **Build the UI**: 
   Ask the AI agent to build out your UI components. The agent is instructed to read `AGENTS.md` which restricts it to using the generated code and enforcing the BFF architecture.
5. **Verify Architecture**: 
   Run `bun run arch:check` to ensure no boundaries (like leaking server secrets to the client) have been violated.

## Tech Stack (Locked)

- **Framework**: Next.js 16.2.10 (App Router, Node.js proxy)
- **Auth**: NextAuth.js 5.0.0-beta.31
- **API Codegen**: Orval (React Query + Zod)
- **Styling**: Tailwind CSS + shadcn/ui
- **Tooling**: Bun (package manager), Biome (lint/format), Dependency-cruiser (architecture enforcement)

## Architecture & System Design

The canonical architecture documentation is under [`docs/`](docs/). Start with the design index:

- [Documentation Index](docs/README.md)
- [Architecture Design Index](docs/design/README.md)
- [System Context](docs/design/v1-system-context.md)
- [Container Map](docs/design/v2-container-map.md)
- [Data Flows](docs/design/v3-data-flows.md)
- [Auth Flows](docs/design/v4-auth-flows.md)
- [BFF Proxy Component](docs/design/v5-bff-proxy-component.md)
- [Auth Layer Component](docs/design/v6-auth-layer-component.md)
- [Data Layer Component](docs/design/v7-data-layer-component.md)
- [Codegen Pipeline](docs/design/v8-codegen-pipeline.md)
- [Deployment](docs/design/v9-deployment.md)
- [Architecture Rules](docs/design/v10-architecture-rules.md)

## Development

```bash
bun install
# Verify architecture rules
bun run arch:check
```
