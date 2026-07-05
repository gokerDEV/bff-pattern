import NextAuth from 'next-auth'

// ─── Public routes — no session required ────────────────────────────────────
const PUBLIC_ROUTES = ['/', '/login', '/api/auth', '/api/revalidate']

// ─── Auth configuration ─────────────────────────────────────────────────────
// Next.js 16 proxy defaults to the Node.js runtime, so we can safely use
// Node.js APIs here if needed.
export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    // TODO: Add your OAuth 2.1 provider here.
    // Example (generic OIDC):
    //
    // import { type OIDCConfig } from 'next-auth/providers'
    // {
    //   id: 'my-provider',
    //   name: 'My Provider',
    //   type: 'oidc',
    //   issuer: process.env.AUTH_ISSUER_URL,
    //   clientId: process.env.AUTH_CLIENT_ID,
    //   clientSecret: process.env.AUTH_CLIENT_SECRET,
    //   authorization: { params: { scope: 'openid email profile offline_access' } },
    // } satisfies OIDCConfig<Record<string, unknown>>
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // ── Initial sign-in ──────────────────────────────────────────────────
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpiry: account.expires_at
            ? account.expires_at * 1000
            : undefined,
          user,
        }
      }

      // ── Token still valid ────────────────────────────────────────────────
      const expiry = token.accessTokenExpiry as number | undefined
      if (expiry && Date.now() < expiry - 30_000) {
        return token
      }

      // ── Token expiring — trigger refresh ─────────────────────────────────
      // TODO: implement token refresh for your IdP.
      // See docs/design/v4-auth-flows.md — Flow 2.
      return { ...token, error: 'RefreshAccessTokenError' as const }
    },

    async session({ session, token }) {
      return {
        ...session,
        // Expose user shape — never expose raw tokens
        user: (token.user as typeof session.user) ?? session.user,
        error: token.error as string | undefined,
      }
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublic = PUBLIC_ROUTES.some(route =>
        nextUrl.pathname.startsWith(route),
      )
      if (isPublic) return true
      if (!isLoggedIn) return false
      return true
    },
  },
})
