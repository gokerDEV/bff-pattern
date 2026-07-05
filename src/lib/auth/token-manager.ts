import { auth } from '@/auth'

/**
 * Retrieves the access token for the current user session (BFF / proxy / SSR mutator).
 * Uses NextAuth's auth() to extract the token stored in the session.
 */
export async function getClientCredentialsToken(): Promise<string> {
  const session = await auth()
  
  // Cast session to access NextAuth extended session properties
  const token = (session as any)?.accessToken

  if (!token) {
    throw new Error('No access token available in the current session')
  }

  return token
}
