import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { withCache } from '@/lib/redis'
import { BusinessService } from '@/modules/negocios/services/business.service'
import { BusinessGrid } from '@/modules/negocios/components/business-grid'
import { SearchFilters } from '@/modules/negocios/components/search-filters'
import { Pagination } from '@/modules/negocios/components/pagination'
import { AdSlot, AdSlotSkeleton } from '@/modules/anuncios/components/ad-slot'
import { ZeroResults } from '@/modules/negocios/components/zero-results'
import type { BusinessCategory, BusinessCard } from '@/modules/negocios/interfaces'

export const metadata: Metadata = {
  title: 'Explorar negocios en Cúcuta | Rcomienda',
  description:
    'Descubre los mejores comercios locales en Cúcuta. Restaurantes, tiendas, servicios y más.',
}

interface ExplorarPageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function ExplorarPage({ searchParams }: ExplorarPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const service = new BusinessService(supabase)

  // Fetch categories first to resolve categoryId, then search in parallel with nothing else
  const categoriesResult = await withCache('catalog:categories', 3600, () =>
    service.getCategories(),
  )
  const categories = (categoriesResult.data as BusinessCategory[]) ?? []

  const categoryId = params.category
    ? (categories.find((c) => c.slug === params.category)?.id ?? undefined)
    : undefined

  // Search businesses (parallelized with AdSlot via Suspense streaming)
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
  const hasQuery = !!(params.query?.trim())
  const zeroResults = hasQuery && businesses.length === 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-12 lg:px-20">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white">Explora negocios en Cúcuta</h1>
        <p className="mt-2 text-muted">
          Descubre comercios locales, restaurantes, tiendas y servicios cerca de ti
        </p>
      </div>

      <Suspense fallback={null}>
        <SearchFilters categories={categories} />
      </Suspense>

      <Suspense fallback={<AdSlotSkeleton size="full" />}>
        <AdSlot context="explorer" categoryId={categoryId} className="mt-6" />
      </Suspense>

      <div className="mt-8">
        {zeroResults ? (
          <ZeroResults
            query={params.query!}
            neighborhood={params.neighborhood}
          />
        ) : (
          <BusinessGrid businesses={businesses} />
        )}
      </div>

      {result && result.total_pages > 1 && (
        <div className="mt-8">
          <Suspense fallback={null}>
            <Pagination page={result.page} totalPages={result.total_pages} />
          </Suspense>
        </div>
      )}
    </div>
  )
}
