import { auth } from './auth'

export const proxy = auth

export const config = {
  // Match all paths except Next.js internals and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
