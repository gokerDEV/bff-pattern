# V03 — System Context

---

## Structurizr DSL

```structurizr
workspace "bff-pattern" "Generic Next.js BFF starter template — System Context" {

    model {

        # ── People ─────────────────────────────────────────────────────────────
        endUser = person "End User" {
            description "A person using the frontend application in a browser."
            tags "External"
        }

        developer = person "Developer" {
            description "A frontend developer who uses the bff-pattern GitHub template to scaffold a new project and builds on top of it."
            tags "External"
        }

        # ── Software Systems ────────────────────────────────────────────────────
        bffApp = softwareSystem "bff-pattern App" {
            description "A server-first Next.js application generated from the bff-pattern template. Provides a secure BFF proxy layer, server-side rendering, authentication, and type-safe API access for any OpenAPI-compliant backend."
            tags "Internal"
        }

        backendApi = softwareSystem "OpenAPI Backend" {
            description "Any single, OpenAPI-compliant backend service. Not owned or modified by the template. Exposes a REST API and an OpenAPI spec endpoint (/doc-json or equivalent)."
            tags "External"
        }

        identityProvider = softwareSystem "Identity Provider" {
            description "OAuth 2.1 authorization server. Issues access tokens for both user sessions (Authorization Code flow) and server-to-server calls (Client Credentials flow). May be the backend itself or a standalone IdP (e.g. Keycloak, Auth0)."
            tags "External"
        }

        # ── Relationships ───────────────────────────────────────────────────────
        endUser -> bffApp "Browses the frontend application via HTTPS"
        developer -> bffApp "Scaffolds, customises, and deploys"
        developer -> backendApi "Reads OpenAPI spec to generate typed clients"

        bffApp -> backendApi "Fetches data (SSR direct + BFF proxied) via HTTPS / REST"
        bffApp -> identityProvider "Obtains and refreshes access tokens via OAuth 2.1"
        endUser -> identityProvider "Authenticates (login / OAuth flow)"
    }

    views {

        systemContext bffApp "V1_SystemContext" {
            include *
            autoLayout lr
            title "V03 — bff-pattern: System Context"
            description "The bff-pattern application in its environment."
        }

        styles {
            element "Internal" {
                background #1a6bcc
                color #ffffff
                shape RoundedBox
            }
            element "External" {
                background #6b7280
                color #ffffff
                shape RoundedBox
            }
            element "Person" {
                background #374151
                color #ffffff
                shape Person
            }
            relationship "Relationship" {
                thickness 2
            }
        }

        theme default
    }
}
```

---

## Element Register
> Identifiers established here are reused in all subsequent views.

| Identifier | Type | Description |
|---|---|---|
| `endUser` | Person | Browser-based end user of the running application |
| `developer` | Person | Frontend developer using the template |
| `bffApp` | Software System | The Next.js application (this system) |
| `backendApi` | Software System | Upstream OpenAPI-compliant backend service |
| `identityProvider` | Software System | OAuth 2.1 token issuer |

---

## Design Notes

### Two distinct relationships to `backendApi`
The `bffApp → backendApi` relationship covers **two** runtime paths that will be separated in V2 and V3:
1. **SSR path** — Server Components call the backend directly (server-to-server, no browser involvement)
2. **BFF path** — Client Components call `bffApp` which proxies the request to the backend

At context level both appear as one arrow — that is intentional and correct for C4 L1.

### `developer → backendApi`
This relationship is **dev-time only** (running `bun run codegen` to fetch the OpenAPI spec). It is not a runtime dependency. It is shown at context level to establish that the backend drives type generation.

### Identity Provider placement
The IdP is shown as a separate external system. In many setups the backend and IdP share the same host. That is an implementation detail — kept separate here to make the two OAuth flows (user login vs server client credentials) unambiguous in V4 and V6.

### Out of context level
- BFF proxy internals → **V5**
- Auth layer internals → **V6**
- Codegen pipeline → **V8**
- Deployment topology → **V9**

---

> ✅ Approve to continue to **V04 — Container Map**.
> Or request changes to element names, relationships, or descriptions.
