import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRedis } from '@/lib/redis/client'
import { TrackingService } from '@/modules/anuncios/services/tracking.service'

const RATE_LIMIT_WINDOW = 60
const RATE_LIMIT_MAX = 100

async function checkRateLimit(ip: string): Promise<boolean> {
  const redis = getRedis()
  const key = `rl:click:${ip}`
  try {
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW)
    }
    return count <= RATE_LIMIT_MAX
  } catch {
    return true
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
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  try {
    const body = (await request.json()) as {
      adId?: string
      impressionId?: string
      viewerId?: string
    }

    if (!body.adId) {
      return NextResponse.json({ error: 'adId requerido' }, { status: 400 })
    }

    const supabase = await createClient()
    const redis = getRedis()
    const service = new TrackingService(supabase, redis)

    service.trackClick(body.adId, body.impressionId, body.viewerId, ip).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
