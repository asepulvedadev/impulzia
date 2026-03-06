import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AdService } from '@/modules/anuncios/services/ad.service'
import { getActiveAdsUseCase } from '@/modules/anuncios/use-cases/get-active-ads'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const filters: Record<string, unknown> = {}
  const type = searchParams.get('type')
  const category_id = searchParams.get('category_id')
  const neighborhood = searchParams.get('neighborhood')
  const city = searchParams.get('city')
  const limit = searchParams.get('limit')

  if (type) filters.type = type
  if (category_id) filters.category_id = category_id
  if (neighborhood) filters.neighborhood = neighborhood
  if (city) filters.city = city
  if (limit) filters.limit = Number(limit)

  const supabase = await createClient()
  const service = new AdService(supabase)
  const result = await getActiveAdsUseCase(service, filters)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json(
    { data: result.data },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    },
  )
}
