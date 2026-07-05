export const clientMutator = async <T>(
  config: { url: string; method: string; data?: unknown; headers?: HeadersInit }
): Promise<T> => {
  const url = `/api/proxy${config.url}`
  const response = await fetch(url, {
    method: config.method,
    headers: {
      ...config.headers,
      'Content-Type': 'application/json',
    },
    body: config.data ? JSON.stringify(config.data) : undefined,
  })

  if (!response.ok) {
    throw new Error(`Client Mutator Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
