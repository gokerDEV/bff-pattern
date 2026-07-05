import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function ANY(
  req: NextRequest,
  { params }: { params: { proxy: string[] } }
) {
  // 1. Session Validation
  const session = await auth()
  const token = (session as any)?.accessToken

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Path rewrite
  const path = params.proxy.join('/')
  const searchParams = req.nextUrl.searchParams.toString()
  const query = searchParams ? `?${searchParams}` : ''
  const targetUrl = `${BACKEND_URL}/${path}${query}`

  // 3. Header sanitization & Injection
  const headers = new Headers(req.headers)
  headers.delete('cookie') // Never forward cookies to the backend
  headers.set('Authorization', `Bearer ${token}`)

  try {
    // 4. Forward request to backend
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : undefined,
    })

    // 5. Stream response back to client
    const responseHeaders = new Headers(response.headers)
    // Clean up backend-specific headers before sending to client if necessary
    // e.g. responseHeaders.delete('set-cookie')

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('BFF Proxy Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Next.js 15+ convention for routing all methods
export const GET = ANY
export const POST = ANY
export const PUT = ANY
export const PATCH = ANY
export const DELETE = ANY
export const OPTIONS = ANY
