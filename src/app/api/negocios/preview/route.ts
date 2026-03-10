import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRedis, withCache } from '@/lib/redis'
import { BusinessService } from '@/modules/negocios/services/business.service'
import type { BusinessCard } from '@/modules/negocios/interfaces'

const RATE_LIMIT_MAX = 30 // requests per minute per IP

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')?.trim() ?? ''

  if (!query || query.length < 2) {
    return Response.json({ data: [] })
  }

  // Rate limiting
  const redis = getRedis()
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rlKey = `preview:rl:${ip}`

  try {
    const count = await redis.incr(rlKey)
    if (count === 1) await redis.expire(rlKey, 60)
    if (count > RATE_LIMIT_MAX) {
      return Response.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
    }
  } catch {
    // Redis unavailable — allow request
  }

  const supabase = await createClient()
  const service = new BusinessService(supabase)

  const cacheKey = `preview:q:${query.toLowerCase().slice(0, 50)}`
  const result = await withCache(cacheKey, 60, () =>
    service.search({ query, per_page: 5, sort_by: 'recent' }),
  )

  const businesses = (result.data?.data ?? []) as BusinessCard[]
  return Response.json({ data: businesses })
}
