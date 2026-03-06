import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRedis } from '@/lib/redis/client'
import { TrackingService } from '@/modules/anuncios/services/tracking.service'

const RATE_LIMIT_WINDOW = 60 // seconds
const RATE_LIMIT_MAX = 100 // requests per window per IP

async function checkRateLimit(ip: string): Promise<boolean> {
  const redis = getRedis()
  const key = `rl:imp:${ip}`
  try {
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW)
    }
    return count <= RATE_LIMIT_MAX
  } catch {
    return true // Allow on Redis failure
  }
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  const allowed = await checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json({ ok: true }, { status: 200 }) // Silently drop
  }

  try {
    const body = (await request.json()) as {
      adId?: string
      context?: string
      viewerId?: string
    }

    if (!body.adId) {
      return NextResponse.json({ error: 'adId requerido' }, { status: 400 })
    }

    const supabase = await createClient()
    const redis = getRedis()
    const service = new TrackingService(supabase, redis)

    // Fire-and-forget: respond immediately, track asynchronously
    service
      .trackImpression(
        body.adId,
        body.viewerId,
        ip,
        (body.context ?? 'feed') as 'feed' | 'explorer' | 'business_profile' | 'search',
      )
      .catch(() => {
        // Non-fatal
      })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true }) // Never fail tracking silently
  }
}
