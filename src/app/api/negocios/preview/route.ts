import { createClient } from '@/lib/supabase/server'
import { BusinessService } from '@/modules/negocios/services/business.service'
import type { BusinessCard } from '@/modules/negocios/interfaces'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') ?? ''

  if (!query.trim() || query.trim().length < 2) {
    return Response.json({ data: [] })
  }

  const supabase = await createClient()
  const service = new BusinessService(supabase)
  const result = await service.search({ query: query.trim(), per_page: 5, sort_by: 'recent' })
  const businesses = (result.data?.data ?? []) as BusinessCard[]

  return Response.json({ data: businesses })
}
