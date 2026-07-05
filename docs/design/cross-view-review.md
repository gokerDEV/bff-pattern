# Cross-View Consistency Review

---

## Element Register — Final State

All identifiers established in V1 and carried forward. Verified present and consistent across all views.

| Identifier | Type | Introduced | Used in |
|---|---|---|---|
| `endUser` | Person | V1 | V1, V2, V9 |
| `developer` | Person | V1 | V1, V2, V8, V9 |
| `bffApp` | Software System | V1 | V1–V9 |
| `backendApi` | Software System | V1 | V1–V7, V9 |
| `identityProvider` | Software System | V1 | V1, V2, V4, V6, V9 |
| `browser` | Container | V2 | V2, V3, V5, V9 |
| `edgeMiddleware` | Container | V2 | V2, V3, V4, V6, V9 |
| `nextServer` | Container | V2 | V2, V3, V6, V7, V9 |
| `bffProxy` | Container | V2 | V2, V3, V5–V7, V9 |
| `authHandler` | Container | V2 | V2, V4–V7, V9 |
| `dataLayer` | Container | V7 | V7 only (logical grouping — see Finding 2) |

---

## Findings

### ✅ F01 — `routeHandler` identifier used in both V5 and V6
**Type:** Naming ambiguity (not a DSL conflict)
**Severity:** Minor

In Structurizr DSL, component identifiers are scoped to their parent container, so there is no actual conflict. However, the text descriptions are clear:
- V5: **"Route Handler"** — entry point of the BFF proxy pipeline
- V6: **"Auth Route Handler"** — mounts NextAuth GET/POST handlers

**Resolution:** No change needed to the DSL. The README and ARCHITECTURE.md for the template should use the full names to avoid confusion.

---

### ✅ F02 — `dataLayer` container absent from V2
**Type:** Intentional modelling gap
**Severity:** None (by design)

V7 introduces a `dataLayer` container that does not appear in V2. This is intentional: V7's design note explicitly states it is a **logical grouping for C4 L3 clarity**, not a separate deployable process. The data layer components run inside `nextServer` (SSR clients) and `browser` (RQ clients) respectively.

**Resolution:** Add the following note to the template's `ARCHITECTURE.md`:

> The Data Layer is not a separate container. SSR Clients and the SSR Mutator run inside the Next.js Server process. RQ Clients and the Client Mutator run in the browser bundle. They are modelled as a logical container in V7 only to show their internal structure at C4 L3.

---

### ⚠️ F03 — `REVALIDATION_SECRET` missing from V9 environment variable table
**Type:** Omission
**Severity:** Minor

V9 design notes reference `REVALIDATION_SECRET` as a required secret for the ISR revalidation webhook endpoint (`app/api/revalidate/`), but the env var table in V9 does not include it.

**Resolution:** Add to the V9 env var table:

| Variable | Server-only | Required | Description |
|---|---|---|---|
| `REVALIDATION_SECRET` | ✅ | Optional | Shared secret for ISR revalidation webhook. Required only if using `app/api/revalidate/`. |

---

### ⚠️ F04 — `bun run typecheck` referenced in V8 but not defined in scripts
**Type:** Omission
**Severity:** Minor

V8's dev-time activity diagram (step 13) mentions `bun run typecheck` as an explicit command, but the scripts table in V8 only lists codegen commands. TypeScript checking is implied but not declared as a named script.

**Resolution:** Add to V8 scripts table and the template's `package.json`:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

And update V8 pipeline: `bun run codegen && bun run typecheck && bun run build`

---

### ✅ F05 — i18n in confirmed facts but no dedicated view
**Type:** Intentional gap
**Severity:** None (stated in coverage plan)

i18n (i18next / react-i18next) is confirmed in scope but the coverage plan explicitly excluded a dedicated view:
> "i18n is confirmed in scope but doesn't need a dedicated view (standard i18next structure, no custom design needed)"

i18n scaffold uses a well-established, documented pattern (i18next with `react-i18next`). No architectural decisions are required beyond the file placement.

**Resolution:** Document the i18n file placement in the template's `ARCHITECTURE.md` as a note, not a view:

```
lib/
├── i18n.ts                # Client-side i18next init
├── i18n-server.ts         # Server-side i18next init (for RSC)
└── translations.ts        # Translation key types / helpers

public/
└── locales/
    ├── en/
    │   └── common.json
    └── tr/
        └── common.json
```

---

## Terminology Consistency Check

| Term | V1 | V2 | V3 | V4 | V5 | V6 | V7 | V8 | V9 | V10 |
|---|---|---|---|---|---|---|---|---|---|---|
| `backendApi` / OpenAPI Backend | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| BFF Proxy / `bffProxy` | — | ✅ | ✅ | — | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| `ssr.mutator.ts` | — | — | ✅ | — | — | — | ✅ | ✅ | — | ✅ |
| `client.mutator.ts` | — | — | ✅ | — | — | — | ✅ | ✅ | — | ✅ |
| `auth.config.ts` | — | — | — | — | — | ✅ | — | — | — | ✅ |
| `token-manager.ts` | — | — | ✅ | ✅ | ✅ | ✅ | — | — | — | ✅ |
| `BACKEND_URL` | — | — | — | — | — | — | ✅ | ✅ | ✅ | — |
| 30-second buffer | — | — | ✅ | ✅ | — | ✅ | — | — | — | — |
| Edge Runtime | — | ✅ | — | — | — | ✅ | — | — | ✅ | ✅ |

> **All terms are consistent.** No drift detected.

---

## Relationship Coverage Check

| Relationship | Introduced | Confirmed in |
|---|---|---|
| `browser → backendApi` ❌ (forbidden) | V2 | V3 (BFF guarantee), V10 R08 |
| `nextServer → backendApi` (SSR) | V2 | V3 Path A, V7 SSR Clients |
| `bffProxy → backendApi` (BFF) | V2 | V3 Path B, V5 Upstream Fetcher |
| `authHandler → identityProvider` | V2 | V4 Flow 1+2, V6 Auth Layer |
| `nextServer → tokenManager` | V2 | V3 step 4, V6 Token Manager |
| `bffProxy → authHandler` | V2 | V3 step 9, V5 Token Injector, V6 |
| `edgeMiddleware → authorizedCallback` | V2 | V4 Flow 1, V6 Authorized Callback |
| `ssrClients → ssrMutator` | V7 | V8 orval.config.ts target 3, V10 R06 |
| `rqClients → clientMutator` | V7 | V8 orval.config.ts target 4, V10 R05 |
| `clientMutator → bffProxy` | V7 | V3 Path B, V10 R01, R08 |

> **All relationships from V2 are traced to at least one subsequent view.** No orphaned arrows.

---

## Summary

| Finding | Type | Action |
|---|---|---|
| F01 `routeHandler` naming | Ambiguity | Document in template README — no DSL change |
| F02 `dataLayer` absent from V2 | Intentional | Note in ARCHITECTURE.md |
| F03 `REVALIDATION_SECRET` missing | Omission | Add to V9 env var table |
| F04 `typecheck` script missing | Omission | Add to V8 scripts + `package.json` |
| F05 i18n no view | Intentional | Note file layout in ARCHITECTURE.md |

**Overall verdict: ✅ Architecture is consistent across all 10 views.**

The two omissions (F03, F04) are low-severity and do not affect any architectural decision. No view contradicts another. All element identifiers, terminology, file paths, and relationships are coherent end-to-end.

---

## Next Steps

| Output | File |
|---|---|
| Discovery Summary | `discovery-summary.md` |
| Coverage Plan | `coverage-plan.md` |
| V1 System Context | `views/v1-system-context.md` |
| V2 Container Map | `views/v2-container-map.md` |
| V3 SSR vs BFF Data Flow | `views/v3-data-flows.md` |
| V4 Auth Flows | `views/v4-auth-flows.md` |
| V5 BFF Proxy Component | `views/v5-bff-proxy-component.md` |
| V6 Auth Layer Component | `views/v6-auth-layer-component.md` |
| V7 Data Layer Component | `views/v7-data-layer-component.md` |
| V8 Codegen Pipeline | `views/v8-codegen-pipeline.md` |
| V9 Deployment | `views/v9-deployment.md` |
| V10 Architecture Rules | `views/v10-architecture-rules.md` |
| Cross-View Review | `cross-view-review.md` (this file) |

**Ready to move to: defining libs, tools, and rules for the template.**
