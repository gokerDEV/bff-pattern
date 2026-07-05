export interface ApiError {
  status: number
  message: string
  details?: unknown
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return { status: 500, message: error.message }
  }
  return { status: 500, message: 'Unknown API error' }
}
