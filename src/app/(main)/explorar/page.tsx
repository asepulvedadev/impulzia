import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BusinessService } from '@/modules/negocios/services/business.service'
import { BusinessGrid } from '@/modules/negocios/components/business-grid'
import { SearchFilters } from '@/modules/negocios/components/search-filters'
import { Pagination } from '@/modules/negocios/components/pagination'
import { AdSlot, AdSlotSkeleton } from '@/modules/anuncios/components/ad-slot'
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

  // Get categories for filters
  const categoriesResult = await service.getCategories()
  const categories = (categoriesResult.data as BusinessCategory[]) ?? []

  // Find category_id from slug
  let categoryId: string | undefined
  if (params.category) {
    const cat = categories.find((c) => c.slug === params.category)
    if (cat) categoryId = cat.id
  }

  // Search businesses
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
    <div className="mx-auto max-w-7xl px-6 py-8 sm:py-12 lg:px-20">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white">Explora negocios en Cúcuta</h1>
        <p className="mt-2 text-muted">
          Descubre comercios locales, restaurantes, tiendas y servicios cerca de ti
        </p>
      </div>

      <Suspense fallback={null}>
        <SearchFilters categories={categories} />
      </Suspense>

      {/* Ad slot — displayed between search results */}
      <Suspense fallback={<AdSlotSkeleton size="full" />}>
        <AdSlot context="explorer" categoryId={categoryId} className="mt-6" />
      </Suspense>

      <div className="mt-8">
        <BusinessGrid businesses={businesses} />
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
