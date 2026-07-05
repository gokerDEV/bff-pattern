import { defineConfig } from 'orval'

// Load .env.local for local development
// In CI/CD, env vars must be set as CI secrets
const OPENAPI_SOURCE = process.env.ORVAL_REMOTE === 'true'
  ? `${process.env.BACKEND_URL}/doc-json` // remote: bun run codegen:remote
  : './src/contracts/openapi.json'         // local:  bun run codegen

export default defineConfig({

  // Target 1 — TypeScript types (interfaces, enums, type aliases)
  'api-schemas': {
    input: { target: OPENAPI_SOURCE },
    output: {
      mode: 'tags-split',
      target: './src/lib/generated/schemas/',
      client: 'fetch',
    },
  },

  // Target 2 — Zod runtime validators
  'api-zod': {
    input: { target: OPENAPI_SOURCE },
    output: {
      mode: 'tags-split',
      target: './src/lib/generated/zod/',
      client: 'zod',
    },
  },

  // Target 3 — SSR fetch clients (server-side direct calls via ssr.mutator)
  'api-ssr': {
    input: { target: OPENAPI_SOURCE },
    output: {
      mode: 'tags-split',
      target: './src/lib/generated/ssr/',
      client: 'fetch',
      override: {
        mutator: {
          path: './src/lib/api/ssr.mutator.ts',
          name: 'ssrMutator',
        },
      },
    },
  },

  // Target 4 — TanStack Query hooks (client-side, routed through BFF proxy)
  'api-rq': {
    input: { target: OPENAPI_SOURCE },
    output: {
      mode: 'tags-split',
      target: './src/lib/generated/rq/',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/lib/api/client.mutator.ts',
          name: 'clientMutator',
        },
      },
    },
  },
})
