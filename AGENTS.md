<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:bff-agent-rules -->
# Agent Instructions for BFF-Pattern

You are building upon a strictly architected Next.js 16 Backend-For-Frontend (BFF) template. 
**DO NOT write any code before understanding the system.**
- Read `docs/`.

## Architectural Boundaries
DO NOT invent architecture or circumvent the security model. Read the design documents before making structural changes:
- Read `docs/design/v10-architecture-rules.md` for the strict dependency boundaries.
- Run `bun run arch:check` to verify you haven't broken any module boundaries.

## Workflow / Vibe Coding
1. **API First:** If the backend API changes, request the updated `openapi.json` and run `bun run codegen`.
2. **Data Layer:** 
   - For React Server Components (SSR), use `src/lib/api/ssr.mutator.ts`.
   - For Client Components (RQ), the generated code automatically routes through the proxy via `src/lib/api/client.mutator.ts`.
3. **Acceptance:** Verify your work against the V10 architecture rules before finishing your task.
<!-- END:bff-agent-rules -->