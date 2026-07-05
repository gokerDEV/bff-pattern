import { getClientCredentialsToken } from '../auth/token-manager'

export const ssrMutator = async <T>(
  config: { url: string; method: string; data?: unknown; headers?: HeadersInit }
): Promise<T> => {
  const token = await getClientCredentialsToken()
  const backendUrl = process.env.BACKEND_URL
  if (!backendUrl) throw new Error('BACKEND_URL is not configured')

  const url = `${backendUrl}${config.url}`
  const response = await fetch(url, {
    method: config.method,
    headers: {
      ...config.headers,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: config.data ? JSON.stringify(config.data) : undefined,
  })

  if (!response.ok) {
    throw new Error(`SSR Mutator Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
