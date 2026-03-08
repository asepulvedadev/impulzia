import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { BusinessService } from '@/modules/negocios/services/business.service'
import { BusinessGrid } from '@/modules/negocios/components/business-grid'
import { SearchFilters } from '@/modules/negocios/components/search-filters'
import { Pagination } from '@/modules/negocios/components/pagination'
import { AdSlot, AdSlotSkeleton } from '@/modules/anuncios/components/ad-slot'
import type { BusinessCategory, BusinessCard } from '@/modules/negocios/interfaces'

interface ExplorarPanelPageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function ExplorarPanelPage({ searchParams }: ExplorarPanelPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const service = new BusinessService(supabase)

  const categoriesResult = await service.getCategories()
  const categories = (categoriesResult.data as BusinessCategory[]) ?? []

  let categoryId: string | undefined
  if (params.category) {
    const cat = categories.find((c) => c.slug === params.category)
    if (cat) categoryId = cat.id
  }

  const searchResult = await service.search({
    query: params.query,
    category_id: categoryId,
    city: params.city,
    neighborhood: params.neighborhood,
    is_verified: params.is_verified === 'true' ? true : undefined,
    sort_by: (params.sort_by as 'recent' | 'name' | 'rating') ?? 'recent',
    page: params.page ? Number(params.page) : 1,
    per_page: 12,
  })

  const result = searchResult.data
  const businesses = (result?.data ?? []) as BusinessCard[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Explorar negocios</h1>
        <p className="mt-1 text-muted">
          Descubre comercios locales, restaurantes, tiendas y servicios en Cúcuta
        </p>
      </div>

      <Suspense fallback={null}>
        <SearchFilters categories={categories} />
      </Suspense>

      <Suspense fallback={<AdSlotSkeleton size="full" />}>
        <AdSlot context="explorer" categoryId={categoryId} />
      </Suspense>

      <BusinessGrid businesses={businesses} />

      {result && result.total_pages > 1 && (
        <Suspense fallback={null}>
          <Pagination page={result.page} totalPages={result.total_pages} />
        </Suspense>
      )}
    </div>
  )
}
