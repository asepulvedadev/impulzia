// Redis client — Upstash Redis for edge-compatible cache and rate limiting

export interface RedisClient {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<string | null>
  setex(key: string, ttl: number, value: string): Promise<string | null>
  del(key: string): Promise<number>
  incr(key: string): Promise<number>
  expire(key: string, ttl: number): Promise<number>
}

// Lazy-initialized Redis client
let _redis: RedisClient | null = null

function createNoopRedis(): RedisClient {
  return {
    get: async () => null,
    set: async () => null,
    setex: async () => null,
    del: async () => 0,
    incr: async () => 0,
    expire: async () => 0,
  }
}

export function getRedis(): RedisClient {
  if (_redis) return _redis

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    // Return a noop client during development / if Redis not configured
    _redis = createNoopRedis()
    return _redis
  }

  // Minimal HTTP-based Redis client compatible with edge runtime
  _redis = {
    async get(key: string): Promise<string | null> {
      const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return null
      const json = (await res.json()) as { result: string | null }
      return json.result
    },
    async set(key: string, value: string): Promise<string | null> {
      const res = await fetch(
        `${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (!res.ok) return null
      return 'OK'
    },
    async setex(key: string, ttl: number, value: string): Promise<string | null> {
      const res = await fetch(
        `${url}/setex/${encodeURIComponent(key)}/${ttl}/${encodeURIComponent(value)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (!res.ok) return null
      return 'OK'
    },
    async incr(key: string): Promise<number> {
      const res = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return 0
      const json = (await res.json()) as { result: number }
      return json.result
    },
    async del(key: string): Promise<number> {
      const res = await fetch(`${url}/del/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return 0
      const json = (await res.json()) as { result: number }
      return json.result
    },
    async expire(key: string, ttl: number): Promise<number> {
      const res = await fetch(`${url}/expire/${encodeURIComponent(key)}/${ttl}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return 0
      const json = (await res.json()) as { result: number }
      return json.result
    },
  }

  return _redis
}
