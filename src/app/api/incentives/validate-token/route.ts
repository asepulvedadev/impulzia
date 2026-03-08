import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { IncentiveService } from '@/modules/incentivos/services/incentive.service'
import { validateTokenSchema } from '@/modules/incentivos/validations/incentive.schema'
import { getRedis } from '@/lib/redis/client'

const RATE_LIMIT_MAX = 20 // validations per minute per IP

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const redis = getRedis()

  if (redis) {
    const key = `validate:${ip}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, 60)
    if (count > RATE_LIMIT_MAX) {
      return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
    }
  }

  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Validate body
  const body = await req.json().catch(() => null)
  const parsed = validateTokenSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const service = new IncentiveService(supabase)
  const result = await service.confirmRedemption(parsed.data.token, user.id)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 422 })
  }

  return NextResponse.json(result.data)
}
