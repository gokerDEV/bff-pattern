# V05 — SSR vs BFF Data Flow

> Render diagrams at https://mermaid.live

---

## Path A — SSR: Server Component fetches data directly

```mermaid
sequenceDiagram
    autonumber

    actor Browser
    participant EM as Edge Middleware
    participant RSC as Next.js Server<br/>(React Server Component)
    participant TC as Token Cache<br/>(Auth Handler)
    participant API as OpenAPI Backend

    Browser->>EM: GET /some-page (HTTPS)
    EM->>EM: Check session cookie
    alt No valid session & route is protected
        EM-->>Browser: 302 Redirect → /login
    else Session valid or route is public
        EM->>RSC: Forward request
    end

    Note over RSC: Page component begins rendering

    RSC->>TC: getClientCredentialsToken()
    alt Token cached & not expiring within 30s
        TC-->>RSC: Return cached access token
    else Token missing or expiring
        TC->>API: POST /oauth/token (client_credentials grant)
        API-->>TC: { access_token, expires_in }
        TC->>TC: Store token with expiry
        TC-->>RSC: Return fresh access token
    end

    RSC->>API: GET /resource (Authorization: Bearer <token>)
    API-->>RSC: 200 OK { data }

    RSC->>RSC: Zod safeParse(response.data)
    alt Validation fails
        RSC->>RSC: Log error (dev only)
        RSC-->>Browser: Render error boundary
    else Validation passes
        RSC->>RSC: Render HTML with validated data
        RSC-->>Browser: 200 HTML (fully rendered, SEO-ready)
    end
```

---

## Path B — BFF: Client Component fetches via proxy

```mermaid
sequenceDiagram
    autonumber

    actor Browser
    participant RQ as TanStack Query<br/>(Client Component)
    participant EM as Edge Middleware
    participant BFF as BFF Proxy<br/>/api/[...proxy]
    participant AH as Auth Handler<br/>(Session)
    participant API as OpenAPI Backend

    Note over Browser,RQ: User interaction triggers data fetch<br/>(e.g. pagination, mutation, live query)

    RQ->>EM: fetch(/api/proxy/resource, { method, headers })
    EM->>EM: Check session cookie
    alt No valid session
        EM-->>Browser: 401 Unauthorised
    else Session valid
        EM->>BFF: Forward request
    end

    BFF->>BFF: Validate Origin header (CSRF check)
    alt Origin mismatch
        BFF-->>Browser: 403 Forbidden
    end

    BFF->>BFF: Sanitise request headers<br/>(strip cookie, host, forwarded-for, etc.)

    BFF->>AH: getServerSession()
    AH-->>BFF: JWT session { accessToken, user }

    alt accessToken present (user-authenticated endpoint)
        BFF->>BFF: Set Authorization: Bearer <accessToken>
    else Public-whitelist endpoint (GET only)
        BFF->>BFF: Set Authorization: Bearer <clientCredentialsToken>
    end

    BFF->>API: Forward sanitised request (HTTPS)
    API-->>BFF: Response { status, data }

    alt API error (4xx / 5xx)
        BFF-->>Browser: Propagate error status + sanitised message
        RQ->>RQ: onError callback / retry logic
    else API success
        BFF-->>Browser: 200 JSON { data }
        RQ->>RQ: Zod safeParse(response.data)
        alt Validation fails
            RQ->>RQ: Log error (dev only), invalidate cache
        else Validation passes
            RQ->>RQ: Update query cache
            RQ-->>Browser: Re-render with new data
        end
    end
```

---

## Side-by-Side Comparison

| Step | SSR Path | BFF Path |
|---|---|---|
| **Trigger** | Next.js render cycle (server) | User action / RQ hook (browser) |
| **Entry point** | `/some-page` → RSC | `fetch /api/[...proxy]/resource` |
| **Auth token source** | Token Cache (client credentials) | Auth Handler (user JWT session) |
| **CSRF check** | Not needed (server-to-server) | ✅ Required — Origin validation |
| **Header sanitisation** | Not needed | ✅ Required — strip sensitive headers |
| **API caller** | `nextServer` (ssr.mutator.ts) | `bffProxy` (client.mutator.ts) |
| **Validation** | Zod `safeParse` on server | Zod `safeParse` on client (via RQ) |
| **Error surface** | Next.js `error.tsx` boundary | RQ `onError` + component state |
| **Browser JS added** | None | RQ runtime + component bundle |
| **SEO** | ✅ Full — HTML served pre-rendered | ❌ No — rendered after fetch |
| **Use for** | Page data, initial load, SEO content | Mutations, interactive queries |

---

## Decision Rule (for template users)

```
Does this data need to be in the HTML for SEO?
  └─ YES → Use SSR path (Server Component + ssr.mutator)

Does this fetch happen in response to a user action?
  └─ YES → Use BFF path (Client Component + RQ hook + client.mutator)

Can this page be fully static (no per-request data)?
  └─ YES → Use generateStaticParams / ISR — no fetch at render time
```

---

## Design Notes

### Token cache prevents per-request OAuth round-trips (SSR path)
The 30-second expiry buffer ensures the token is refreshed proactively, not reactively. A reactive refresh would cause the first request after expiry to block while waiting for a new token, adding latency to page renders.

### CSRF protection is only on the BFF path
Server-to-server (SSR) requests originate inside the trusted server boundary — there is no browser origin to spoof. CSRF is only meaningful for browser-initiated requests.

### Public whitelist (BFF path, step 12)
Some GET endpoints are safe to expose with client credentials rather than requiring a user session (e.g. public content APIs). The whitelist is defined in `bffProxy` configuration — not hardcoded per route.

### Two mutators, one contract
Both paths call the same generated API clients (from Orval), but with different mutators:
- `ssr.mutator.ts` — injects client credentials, sets base URL, runs server-side only
- `client.mutator.ts` — points to `/api/[...proxy]/`, runs browser-side only, carries no secrets

The mutator swap is the only difference between SSR and RQ generated clients. This is a key design insight for template users.

---

> ✅ Approve to continue to **V06 — Auth Flows**.
> Or request changes to any step, actor, or decision rule.
