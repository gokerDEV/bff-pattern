# Architecture Design

This directory contains the canonical architecture views for the BFF Pattern Template.

## C4 Views

| View | Document | Purpose |
|---|---|---|
| V1 | [System Context](./v1-system-context.md) | Defines the system boundary and external actors. |
| V2 | [Container Map](./v2-container-map.md) | Shows the runnable parts of the Next.js BFF application. |
| V3 | [Data Flows](./v3-data-flows.md) | Explains SSR and client-side BFF request paths. |
| V4 | [Auth Flows](./v4-auth-flows.md) | Describes login, protected-route, and server credential flows. |
| V5 | [BFF Proxy Component](./v5-bff-proxy-component.md) | Details the proxy pipeline and security responsibilities. |
| V6 | [Auth Layer Component](./v6-auth-layer-component.md) | Details NextAuth, token handling, and route protection. |
| V7 | [Data Layer Component](./v7-data-layer-component.md) | Details generated clients, mutators, schemas, and runtime placement. |
| V8 | [Codegen Pipeline](./v8-codegen-pipeline.md) | Explains OpenAPI-to-client generation and generated artifact ownership. |
| V9 | [Deployment](./v9-deployment.md) | Shows deployment topology and environment boundaries. |
| V10 | [Architecture Rules](./v10-architecture-rules.md) | Lists enforceable dependency and runtime boundary rules. |

## Maintenance Rules

- Keep these files as architecture references, not process notes.
- Do not add discovery drafts, coverage plans, or review transcripts here.
- Keep tool-specific guidance out of the architecture text unless the tool is part of the runtime or build-time system.
- Keep Structurizr DSL blocks valid and copy-paste runnable.
