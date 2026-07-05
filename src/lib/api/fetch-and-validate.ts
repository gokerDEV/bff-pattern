import type { ZodSchema } from 'zod'

export async function fetchAndValidate<T>(
  fetcher: () => Promise<unknown>,
  schema: ZodSchema<T>
): Promise<T> {
  const data = await fetcher()
  return schema.parse(data)
}
