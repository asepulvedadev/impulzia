import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { IncentiveService } from '@/modules/incentivos/services/incentive.service'
import { incentiveFiltersSchema } from '@/modules/incentivos/validations/incentive.schema'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const rawFilters = {
    type: searchParams.get('type') ?? undefined,
    city: searchParams.get('city') ?? 'Cúcuta',
    neighborhood: searchParams.get('neighborhood') ?? undefined,
    category_id: searchParams.get('category_id') ?? undefined,
    business_id: searchParams.get('business_id') ?? undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 12,
    offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
  }

  const parsed = incentiveFiltersSchema.safeParse(rawFilters)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message },
      { status: 400 },
    )
  }

  const supabase = await createClient()
  const service = new IncentiveService(supabase)
  const result = await service.getActiveIncentives(parsed.data)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json(result.data, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
    },
  })
}
