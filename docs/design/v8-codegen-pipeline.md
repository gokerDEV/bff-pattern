# V8 — Codegen Pipeline

> **sysande view 8 of 10.** Review before moving to V9.
> Render diagrams at https://mermaid.live

---

## Pipeline Overview

```mermaid
flowchart TD
    DEV(["👤 Developer\nbun run codegen"])

    DEV --> ENV{BACKEND_URL\nenv var set?}
    ENV -->|No| ERR1(["❌ Exit: set BACKEND_URL\nin .env.local"])
    ENV -->|Yes| FETCH

    FETCH["Orval fetches OpenAPI spec\nGET \${BACKEND_URL}/doc-json"]
    FETCH --> REACH{Spec endpoint\nreachable?}
    REACH -->|No| ERR2(["❌ Exit: backend not running\nor URL incorrect"])
    REACH -->|Yes| PARSE

    PARSE["Orval parses OpenAPI 3.x spec\n— resolves $refs\n— validates spec structure"]
    PARSE --> VALID{Spec valid?}
    VALID -->|No| ERR3(["❌ Exit: fix OpenAPI spec\non backend"])
    VALID -->|Yes| GEN

    subgraph GEN["⚙️ Four-Target Generation (parallel)"]
        direction LR
        G1["lib/generated/schemas/\nTypeScript Types\n(interfaces, enums, type aliases)"]
        G2["lib/generated/zod/\nZod Schemas\n(runtime validators)"]
        G3["lib/generated/ssr/\nSSR Clients\n(server fetch functions\n→ ssr.mutator.ts)"]
        G4["lib/generated/rq/\nRQ Clients\n(TanStack Query hooks\n→ client.mutator.ts)"]
    end

    GEN --> TSC

    TSC["tsc --noEmit\nTypeScript type check\nacross generated + hand-written code"]
    TSC --> TSOK{Type check\npasses?}
    TSOK -->|No| ERR4(["❌ Type errors:\nusually means API contract changed\nUpdate hand-written code to match\nthen re-run codegen"])
    TSOK -->|Yes| DONE(["✅ Codegen complete\nImport from lib/generated/ in components"])
```

---

## When to Run

| Trigger | Command | Notes |
|---|---|---|
| **Initial project setup** | `bun run codegen` | Backend must be running and accessible |
| **Backend API changed** | `bun run codegen` | Regenerates all four targets; update components if types changed |
| **Active backend development** | `bun run codegen:watch` | Watches spec endpoint; re-generates on change |
| **CI/CD deploy pipeline** | `bun run codegen && bun run build` | Codegen runs before build; backend must be reachable from CI |
| **After deleting `lib/generated/`** | `bun run codegen` | Full regeneration; TypeScript will fail until complete |

---

## Dev-Time Workflow — Activity Diagram

```mermaid
sequenceDiagram
    autonumber

    actor Dev as Developer
    participant BE  as Backend (running locally)
    participant Orval as Orval CLI
    participant FS  as lib/generated/
    participant TSC as TypeScript Compiler
    participant IDE as IDE / Editor

    Note over Dev,IDE: One-time setup after cloning template

    Dev->>Dev: cp env.example .env.local
    Dev->>Dev: Set BACKEND_URL=http://localhost:PORT

    Dev->>BE: Start backend (separate terminal)
    BE-->>Dev: Serving /doc-json

    Dev->>Orval: bun run codegen
    Orval->>BE: GET /doc-json
    BE-->>Orval: OpenAPI 3.x spec (JSON)
    Orval->>FS: Write schemas/, zod/, ssr/, rq/
    FS-->>Dev: lib/generated/ populated

    Dev->>TSC: (auto via IDE or explicit bun run typecheck)
    TSC->>FS: Type-check generated code
    TSC->>Dev: ✅ No errors — ready to build

    IDE-->>Dev: Autocomplete from generated types
    Dev->>Dev: Import from lib/generated/ssr/ in Server Components
    Dev->>Dev: Import from lib/generated/rq/ in Client Components

    Note over Dev,IDE: After any backend API change

    BE-->>Orval: Spec updated (watch mode) or Dev re-runs codegen
    Orval->>FS: Overwrite generated files
    IDE-->>Dev: Type errors surface if components use removed/changed endpoints
    Dev->>Dev: Update components to match new API contract
```

---

## `orval.config.ts` Structure

```ts
// orval.config.ts — root of the project
import { defineConfig } from 'orval'

export default defineConfig({

  // Target 1: TypeScript types
  'api-schemas': {
    input: {
      target: `${process.env.BACKEND_URL}/doc-json`,
    },
    output: {
      mode: 'tags-split',           // one file per API tag
      target: 'lib/generated/schemas/',
      client: 'fetch',
      override: {
        mutator: { path: 'lib/api/ssr.mutator.ts', name: 'ssrMutator' },
      },
    },
  },

  // Target 2: Zod runtime validators
  'api-zod': {
    input: {
      target: `${process.env.BACKEND_URL}/doc-json`,
    },
    output: {
      mode: 'tags-split',
      target: 'lib/generated/zod/',
      client: 'zod',
    },
  },

  // Target 3: SSR fetch clients (server-side direct calls)
  'api-ssr': {
    input: {
      target: `${process.env.BACKEND_URL}/doc-json`,
    },
    output: {
      mode: 'tags-split',
      target: 'lib/generated/ssr/',
      client: 'fetch',
      override: {
        mutator: { path: 'lib/api/ssr.mutator.ts', name: 'ssrMutator' },
      },
    },
  },

  // Target 4: TanStack React Query hooks (client-side BFF-routed calls)
  'api-rq': {
    input: {
      target: `${process.env.BACKEND_URL}/doc-json`,
    },
    output: {
      mode: 'tags-split',
      target: 'lib/generated/rq/',
      client: 'react-query',
      override: {
        mutator: { path: 'lib/api/client.mutator.ts', name: 'clientMutator' },
      },
    },
  },
})
```

---

## Output Structure

```
lib/
└── generated/               ← DO NOT EDIT (gitignore or regenerate on deploy)
    ├── schemas/             ← TypeScript interfaces & types
    │   ├── posts.ts
    │   ├── users.ts
    │   └── index.ts
    ├── zod/                 ← Zod validators
    │   ├── posts.zod.ts
    │   ├── users.zod.ts
    │   └── index.ts
    ├── ssr/                 ← Server-side fetch functions
    │   ├── posts.ts
    │   ├── users.ts
    │   └── index.ts
    └── rq/                  ← TanStack Query hooks
        ├── posts.ts
        ├── users.ts
        └── index.ts
```

---

## `.gitignore` and Deployment Guidance

```gitignore
# Codegen output — regenerated from backend spec at build time
lib/generated/
```

> **Deployment pipeline must run codegen before build:**
> ```bash
> bun run codegen && bun run build
> ```
> The backend must be reachable from the CI/CD environment at build time.
> Store `BACKEND_URL` as a CI/CD secret — not in the repository.

---

## Design Notes

### Four targets, one spec fetch per target
Orval fetches the spec once per target definition. For efficiency in CI, all four targets share the same `input.target` URL. A future optimisation is to download the spec once to a local file (`spec.json`) and point all targets at it — avoiding four network calls to the backend.

### `mode: 'tags-split'` keeps generated files manageable
Without splitting, Orval generates a single large file per target. `tags-split` creates one file per OpenAPI tag (e.g. `posts.ts`, `users.ts`), matching the backend's resource organisation and making diffs easier to review after backend changes.

### Watch mode is for development only — not CI
`bun run codegen:watch` polls the spec endpoint. It should never run in production or CI environments. Use a single `bun run codegen` in the deployment pipeline.

### TypeScript errors after codegen signal a breaking change
If `tsc --noEmit` fails after codegen, it means the backend removed or renamed an endpoint or field that hand-written code depends on. This is intentional — it surfaces breaking API changes at build time rather than at runtime.

---

> ✅ Approve to continue to **V9 — Deployment**.
> Or request changes to the pipeline flow, orval config structure, or output layout.
