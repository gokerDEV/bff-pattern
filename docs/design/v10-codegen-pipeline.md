# V10 — Codegen Pipeline

---

## Purpose

The codegen pipeline turns an OpenAPI contract into type-safe frontend data access code. It produces four generated targets:

1. TypeScript API types
2. Zod response validators
3. SSR fetch clients for React Server Components
4. TanStack React Query clients for Client Components

Generated files are build artefacts. They are not edited by hand.

---

## Pipeline Overview

```mermaid
flowchart TD
    DEV(["👤 Developer\nbun run codegen"])

    DEV --> SOURCE{OpenAPI source}
    SOURCE -->|Default| LOCAL["src/contracts/openapi.json"]
    SOURCE -->|ORVAL_REMOTE=true| REMOTE["${BACKEND_URL}/doc-json"]

    LOCAL --> PARSE
    REMOTE --> ENV{BACKEND_URL\nset?}
    ENV -->|No| ERR1(["❌ Exit: set BACKEND_URL"])
    ENV -->|Yes| FETCH["Orval fetches remote OpenAPI spec"]
    FETCH --> REACH{Spec endpoint\nreachable?}
    REACH -->|No| ERR2(["❌ Exit: backend not reachable"])
    REACH -->|Yes| PARSE

    PARSE["Orval parses OpenAPI 3.x spec\n— resolves $refs\n— validates spec structure"]
    PARSE --> VALID{Spec valid?}
    VALID -->|No| ERR3(["❌ Exit: fix OpenAPI spec"])
    VALID -->|Yes| GEN

    subgraph GEN["⚙️ Four-target generation"]
        direction LR
        G1["src/lib/generated/schemas/\nTypeScript Types"]
        G2["src/lib/generated/zod/\nZod Schemas"]
        G3["src/lib/generated/ssr/\nSSR Clients\n→ ssr.mutator.ts"]
        G4["src/lib/generated/rq/\nRQ Clients\n→ client.mutator.ts"]
    end

    GEN --> TSC["bun run typecheck\ntsc --noEmit"]
    TSC --> TSOK{Type check\npasses?}
    TSOK -->|No| ERR4(["❌ Type errors:\nhand-written code no longer matches API contract"])
    TSOK -->|Yes| DONE(["✅ Codegen validated"])
```

---

## OpenAPI Source Modes

The actual `orval.config.ts` supports two modes:

| Mode | Command | Source | Use case |
|---|---|---|---|
| Local contract | `bun run codegen` | `./src/contracts/openapi.json` | Stable template development, offline-safe generation |
| Remote backend | `bun run codegen:remote` | `${BACKEND_URL}/doc-json` | Syncing against a live backend |
| Validated local generation | `bun run codegen:check` | `./src/contracts/openapi.json` + `tsc --noEmit` | Fast verification after contract updates |

`codegen:watch` is intentionally not documented as a supported script in this version because the repository does not define a watch-mode implementation.

---

## Repository Scripts

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "codegen": "orval",
    "codegen:remote": "ORVAL_REMOTE=true orval",
    "codegen:check": "bun run codegen && bun run typecheck"
  }
}
```

---

## Dev-Time Workflow — Activity Diagram

```mermaid
sequenceDiagram
    autonumber

    actor Dev as Developer
    participant Spec as OpenAPI Contract
    participant Orval as Orval CLI
    participant FS as src/lib/generated/
    participant TSC as TypeScript Compiler
    participant IDE as IDE / Editor

    Note over Dev,IDE: One-time setup after cloning template

    Dev->>Spec: Place or update src/contracts/openapi.json
    Dev->>Orval: bun run codegen
    Orval->>Spec: Read OpenAPI 3.x spec
    Orval->>FS: Write schemas/, zod/, ssr/, rq/
    FS-->>Dev: Generated API layer populated

    Dev->>TSC: bun run typecheck
    TSC->>FS: Type-check generated + hand-written code
    TSC-->>Dev: Pass or report contract mismatch

    IDE-->>Dev: Autocomplete from generated types
    Dev->>Dev: Import SSR clients from src/lib/generated/ssr/ in Server Components
    Dev->>Dev: Import RQ hooks from src/lib/generated/rq/ in Client Components

    Note over Dev,IDE: Remote sync when backend contract changes

    Dev->>Orval: bun run codegen:remote
    Orval->>Spec: GET ${BACKEND_URL}/doc-json
    Orval->>FS: Overwrite generated files
    IDE-->>Dev: Type errors surface if hand-written code must be updated
```

---

## `orval.config.ts` Structure

```ts
import { defineConfig } from 'orval'

const OPENAPI_SOURCE = process.env.ORVAL_REMOTE === 'true'
  ? `${process.env.BACKEND_URL}/doc-json`
  : './src/contracts/openapi.json'

export default defineConfig({
  'api-schemas': {
    input: { target: OPENAPI_SOURCE },
    output: {
      mode: 'tags-split',
      target: './src/lib/generated/schemas/',
      client: 'fetch',
    },
  },

  'api-zod': {
    input: { target: OPENAPI_SOURCE },
    output: {
      mode: 'tags-split',
      target: './src/lib/generated/zod/',
      client: 'zod',
    },
  },

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
```

---

## Output Structure

```
src/lib/generated/              ← DO NOT EDIT
├── schemas/                    ← TypeScript interfaces & types
│   ├── posts.ts
│   ├── users.ts
│   └── index.ts
├── zod/                        ← Zod validators
│   ├── posts.zod.ts
│   ├── users.zod.ts
│   └── index.ts
├── ssr/                        ← Server-side fetch functions
│   ├── posts.ts
│   ├── users.ts
│   └── index.ts
└── rq/                         ← TanStack Query hooks
    ├── posts.ts
    ├── users.ts
    └── index.ts
```

---

## Build Guidance

| Context | Recommended command | Notes |
|---|---|---|
| Local template work | `bun run codegen:check` | Uses local contract and validates TypeScript |
| Sync with live backend | `bun run codegen:remote && bun run typecheck` | Requires `BACKEND_URL` |
| CI with committed local contract | `bun run codegen:check && bun run build` | Backend does not need to be reachable |
| CI against live backend | `bun run codegen:remote && bun run typecheck && bun run build` | Backend must be reachable from CI |

---

## Design Notes

### Local contract is the default

The template defaults to `src/contracts/openapi.json` so the repository remains usable without a live backend. Remote codegen is explicit through `ORVAL_REMOTE=true`.

### Four targets, one contract

All generated targets use the same OpenAPI source. The split exists because server-side rendering and browser-side fetching need different transport boundaries.

### The mutator is the boundary seam

SSR clients use `src/lib/api/ssr.mutator.ts` and call the backend directly from the server. RQ clients use `src/lib/api/client.mutator.ts` and route through the BFF proxy.

### Type errors after codegen are expected signals

If `tsc --noEmit` fails after generation, the OpenAPI contract and hand-written code no longer match. The correct fix is to update the hand-written code or the contract, not to edit generated files.
