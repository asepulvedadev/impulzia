'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import { CategoryChips } from './category-chips'
import type { BusinessCategory } from '../interfaces'

interface SearchFiltersProps {
  categories: BusinessCategory[]
}

export function SearchFilters({ categories }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('query') ?? '')
  const [showFilters, setShowFilters] = useState(false)
  const [neighborhood, setNeighborhood] = useState(searchParams.get('neighborhood') ?? '')
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('is_verified') === 'true')

  const activeCategory = searchParams.get('category') ?? null

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      params.delete('page') // Reset page on filter change
      router.push(`/explorar?${params.toString()}`)
    },
    [router, searchParams],
  )

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQuery = searchParams.get('query') ?? ''
      if (query !== currentQuery) {
        updateParams({ query: query || null })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, searchParams, updateParams])

  const handleCategorySelect = (slug: string | null) => {
    updateParams({ category: slug })
  }

  const handleClearFilters = () => {
    setQuery('')
    setNeighborhood('')
    setVerifiedOnly(false)
    router.push('/explorar')
  }

  const hasActiveFilters = query || activeCategory || neighborhood || verifiedOnly

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            placeholder="Buscar negocios..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Category chips */}
      <CategoryChips
        categories={categories}
        activeSlug={activeCategory}
        onSelect={handleCategorySelect}
      />

      {/* Extended filters (mobile: collapsible, desktop: visible) */}
      <div
        className={`space-y-3 md:flex md:items-center md:gap-3 md:space-y-0 ${showFilters ? 'block' : 'hidden md:flex'}`}
      >
        <Input
          placeholder="Barrio"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          onBlur={() => updateParams({ neighborhood: neighborhood || null })}
          className="md:w-40"
        />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => {
              setVerifiedOnly(e.target.checked)
              updateParams({
                is_verified: e.target.checked ? 'true' : null,
              })
            }}
            className="rounded border-card-border"
          />
          Solo verificados
        </label>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="h-3.5 w-3.5" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
