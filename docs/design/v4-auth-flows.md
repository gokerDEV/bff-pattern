# V4 — Auth Flows

> **sysande view 4 of 10.** Review before moving to V5.
> Render diagrams at https://mermaid.live

---

## Flow 1 — User Login (OAuth 2.1 Authorization Code)

```mermaid
sequenceDiagram
    autonumber

    actor Browser
    participant EM  as Edge Middleware
    participant AH  as Auth Handler<br/>(NextAuth.js)
    participant IdP as Identity Provider<br/>(OAuth 2.1)

    Browser->>EM: GET /protected-page
    EM->>EM: No session cookie found
    EM-->>Browser: 302 Redirect → /login

    Browser->>AH: GET /api/auth/signin
    AH-->>Browser: Render sign-in page

    Browser->>AH: POST /api/auth/signin/[provider]
    AH->>AH: Generate state + code_verifier (PKCE)
    AH-->>Browser: 302 Redirect → IdP /authorize<br/>?response_type=code<br/>&client_id=…<br/>&redirect_uri=…<br/>&code_challenge=…<br/>&state=…

    Browser->>IdP: GET /authorize (user's browser)
    IdP-->>Browser: Render login / consent screen

    Browser->>IdP: POST credentials / consent
    IdP->>IdP: Validate credentials
    IdP-->>Browser: 302 Redirect → /api/auth/callback/[provider]<br/>?code=AUTH_CODE&state=…

    Browser->>AH: GET /api/auth/callback/[provider]?code=…&state=…
    AH->>AH: Validate state (CSRF)
    AH->>IdP: POST /token<br/>{ code, code_verifier, grant_type=authorization_code }
    IdP-->>AH: { access_token, refresh_token, id_token, expires_in }

    AH->>AH: jwt() callback:<br/>encode { accessToken, refreshToken,<br/>accessTokenExpiry, user } into JWT
    AH->>AH: Set HttpOnly session cookie (JWT)
    AH-->>Browser: 302 Redirect → original destination (/protected-page)

    Browser->>EM: GET /protected-page
    EM->>EM: Session cookie found, JWT valid
    EM-->>Browser: Pass through → RSC renders page
```

---

## Flow 2 — Silent Access-Token Refresh (within active session)

```mermaid
sequenceDiagram
    autonumber

    actor Browser
    participant EM  as Edge Middleware
    participant AH  as Auth Handler<br/>(NextAuth.js jwt callback)
    participant IdP as Identity Provider

    Note over Browser,IdP: User is already logged in.<br/>Access token approaching expiry.

    Browser->>EM: Any authenticated request
    EM->>AH: getServerSession() — read + validate JWT
    AH->>AH: jwt() callback:<br/>Is accessTokenExpiry within 30s?

    alt Access token still valid
        AH-->>EM: Return session unchanged
        EM-->>Browser: Pass request through
    else Access token expiring / expired
        AH->>IdP: POST /token<br/>{ grant_type=refresh_token, refresh_token }
        alt Refresh succeeds
            IdP-->>AH: { access_token, expires_in [, refresh_token] }
            AH->>AH: Update JWT: new accessToken + expiry
            AH->>AH: Re-sign session cookie
            AH-->>EM: Return updated session
            EM-->>Browser: Pass request through (seamless)
        else Refresh fails (token revoked / IdP error)
            AH->>AH: Clear session
            AH-->>EM: Return null session
            EM-->>Browser: 302 Redirect → /login
        end
    end
```

---

## Flow 3 — Server-Side Client Credentials (RSC token lifecycle)

```mermaid
sequenceDiagram
    autonumber

    participant RSC as React Server Component
    participant TM  as Token Manager<br/>(lib/auth/token-manager.ts)
    participant IdP as Identity Provider
    participant API as OpenAPI Backend

    Note over RSC,API: This flow runs entirely server-side.<br/>No browser or user session involved.

    RSC->>TM: getClientCredentialsToken()
    TM->>TM: Check in-memory token store:<br/>{ token, expiresAt }

    alt Token cached and expiresAt > now + 30s
        TM-->>RSC: Return cached access_token
    else Token missing, expired, or expiring within 30s
        TM->>IdP: POST /token<br/>{ grant_type=client_credentials,<br/>  client_id, client_secret }
        IdP-->>TM: { access_token, expires_in }
        TM->>TM: Store { token, expiresAt = now + expires_in }
        TM-->>RSC: Return fresh access_token
    end

    RSC->>API: GET /resource<br/>Authorization: Bearer <access_token>
    API-->>RSC: 200 { data }
    RSC->>RSC: Zod validate → render
```

---

## Token Ownership Table

| Token | Created by | Stored in | Used by | Visible to browser? |
|---|---|---|---|---|
| **User access token** | IdP (Authorization Code flow) | NextAuth JWT session cookie (HttpOnly) | `bffProxy` (injected into upstream calls) | ❌ Never |
| **User refresh token** | IdP (Authorization Code flow) | NextAuth JWT session cookie (HttpOnly) | `authHandler` (silent refresh, Flow 2) | ❌ Never |
| **Client credentials token** | IdP (Client Credentials flow) | In-memory server cache (`token-manager.ts`) | `nextServer` (SSR direct calls) | ❌ Never |
| **NextAuth session JWT** | `authHandler` | HttpOnly cookie | `edgeMiddleware`, `bffProxy`, `nextServer` | ❌ Never (HttpOnly) |

> **Rule:** No token of any kind is ever returned to or readable by the browser.

---

## Design Notes

### Why PKCE even with a confidential client?
OAuth 2.1 mandates PKCE for all Authorization Code flows, including those with client secrets. NextAuth.js 5 handles this automatically. It protects against authorization code interception attacks.

### The 30-second buffer (Flows 2 and 3)
Proactive refresh prevents a race condition where a token expires between the check and the upstream API call. 30 seconds is a practical default — adjustable in `auth.config.ts` and `token-manager.ts`.

### Two completely independent token lifetimes
- **User session** — long-lived (hours/days), governed by IdP's `refresh_token` TTL
- **Client credentials token** — short-lived (minutes), governed by IdP's `expires_in`
They share the same IdP but operate on separate grant flows, separate caches, and separate revocation paths.

### Session cookie is HttpOnly + Secure + SameSite=Lax
NextAuth.js sets these by default. `SameSite=Lax` prevents CSRF on GET requests while allowing top-level navigation. The BFF proxy adds an Origin check for state-changing methods (POST, PUT, DELETE, PATCH) as a second layer.

### What happens on logout
`GET /api/auth/signout` → NextAuth clears the session cookie → Edge Middleware finds no session → protected routes redirect to `/login`. The IdP session is **not** terminated by default (single-sign-out is out of scope for v1).

---

> ✅ Approve to continue to **V5 — BFF Proxy Component** (C4 L3).
> Or request changes to any flow step or design note.
