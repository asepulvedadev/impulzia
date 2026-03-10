import { getRedis } from './client'

/**
 * Cache-aside wrapper. Tries Redis first; on miss runs fn(), stores result, returns it.
 * Falls back to fn() transparently if Redis is unavailable.
 */
export async function withCache<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  const redis = getRedis()

  try {
    const cached = await redis.get(key)
    if (cached) return JSON.parse(cached) as T
  } catch {
    // Redis unavailable — fall through
  }

  const data = await fn()

  try {
    await redis.setex(key, ttl, JSON.stringify(data))
  } catch {
    // Redis unavailable — non-fatal
  }

  return data
}
