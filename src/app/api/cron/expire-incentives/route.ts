import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const now = new Date().toISOString()

  // 1. Expire incentives past end_date
  const { data: expiredIncentives, error: expireError } = await supabase
    .from('incentives')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .not('end_date', 'is', null)
    .lt('end_date', now)
    .select('id')

  if (expireError) {
    return NextResponse.json({ error: expireError.message }, { status: 500 })
  }

  // 2. Expire pending redemptions past expires_at
  const { data: expiredRedemptions, error: redemptionError } = await supabase
    .from('redemptions')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('expires_at', now)
    .select('id')

  if (redemptionError) {
    return NextResponse.json({ error: redemptionError.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    incentives_expired: expiredIncentives?.length ?? 0,
    redemptions_expired: expiredRedemptions?.length ?? 0,
    ran_at: now,
  })
}
