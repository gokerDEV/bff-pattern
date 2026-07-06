<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:bff-agent-rules -->
# Agent Instructions for BFF-Pattern

You are building upon a strictly architected Next.js 16 Backend-For-Frontend (BFF) template.
**CRITICAL: DO NOT write any code or propose architectural changes without first understanding the system.**

## How to Acquire Context
1. Start by reading `docs/design/README.md`. It contains the exact reading order for the system design documents.
2. Read `docs/design/v04-container-map.md` to understand the boundaries between Server Components, Client Components, and the BFF Proxy.
3. Read `docs/design/v05-data-flows.md` to understand how data is fetched in both SSR and Client modes.

## Architectural Boundaries
DO NOT invent architecture or circumvent the security model. 
- You MUST adhere strictly to the boundaries defined in `docs/design/v12-architecture-rules.md`.
- Never expose server secrets or direct upstream API URLs to the client.
- Run `bun run arch:check` frequently to verify you haven't broken any module dependencies.

## Workflow / Vibe Coding
1. **API First:** If the backend API schema changes, request the updated `openapi.json` from the user and run `bun run codegen`.
2. **Data Layer:** 
   - For React Server Components (SSR), use the generated fetchers via `src/lib/api/ssr.mutator.ts`.
   - For Client Components (React Query hooks), the generated code automatically routes through the BFF proxy via `src/lib/api/client.mutator.ts`.
3. **Acceptance:** Verify your work against the `docs/design/v12-architecture-rules.md` document before finalizing any task.
<!-- END:bff-agent-rules -->