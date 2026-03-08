'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Input, Button } from '@/components/ui'
import { CategoryChips } from './category-chips'
import type { BusinessCard, BusinessCategory } from '../interfaces'

interface SearchFiltersProps {
  categories: BusinessCategory[]
  basePath?: string
  showPreview?: boolean
}

export function SearchFilters({
  categories,
  basePath = '/explorar',
  showPreview = false,
}: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('query') ?? '')
  const [showFilters, setShowFilters] = useState(false)
  const [neighborhood, setNeighborhood] = useState(searchParams.get('neighborhood') ?? '')
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('is_verified') === 'true')

  // Preview state
  const [previewResults, setPreviewResults] = useState<BusinessCard[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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
      params.delete('page')
      router.push(`${basePath}?${params.toString()}`)
    },
    [router, searchParams, basePath],
  )

  // Debounced URL update
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQuery = searchParams.get('query') ?? ''
      if (query !== currentQuery) {
        updateParams({ query: query || null })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, searchParams, updateParams])

  // Live preview fetch
  useEffect(() => {
    if (!showPreview) return
    if (!query.trim() || query.trim().length < 2) {
      setPreviewResults([])
      setPreviewOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setPreviewLoading(true)
      try {
        const res = await fetch(`/api/negocios/preview?query=${encodeURIComponent(query.trim())}`)
        const json = (await res.json()) as { data: BusinessCard[] }
        setPreviewResults(json.data)
        setPreviewOpen(json.data.length > 0)
      } catch {
        // silent
      } finally {
        setPreviewLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query, showPreview])

  // Close preview on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPreviewOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleCategorySelect = (slug: string | null) => {
    updateParams({ category: slug })
  }

  const handleClearFilters = () => {
    setQuery('')
    setNeighborhood('')
    setVerifiedOnly(false)
    router.push(basePath)
  }

  const hasActiveFilters = query || activeCategory || neighborhood || verifiedOnly

  return (
    <div className="space-y-4">
      {/* Search bar with preview */}
      <div ref={containerRef} className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            placeholder="Buscar negocios..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => previewResults.length > 0 && setPreviewOpen(true)}
            className="pl-10"
          />

          {/* Preview dropdown */}
          {showPreview && previewOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
              {previewLoading ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted">
                  <span className="h-3 w-3 animate-spin rounded-full border border-slate-600 border-t-brand-primary-400" />
                  Buscando...
                </div>
              ) : (
                <>
                  <ul>
                    {previewResults.map((biz) => (
                      <li key={biz.id}>
                        <Link
                          href={`/negocio/${biz.slug}`}
                          onClick={() => setPreviewOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-slate-800"
                        >
                          {/* Logo */}
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-800">
                            {biz.logo_url ? (
                              <Image
                                src={biz.logo_url}
                                alt={biz.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-base font-bold text-brand-primary-400">
                                {biz.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-white">{biz.name}</p>
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                              {biz.business_categories?.name && (
                                <span>{biz.business_categories.name}</span>
                              )}
                              {biz.neighborhood && (
                                <>
                                  <span>·</span>
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{biz.neighborhood}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {/* Footer: see all results */}
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewOpen(false)
                      updateParams({ query })
                    }}
                    className="flex w-full items-center justify-center gap-1.5 border-t border-slate-800 px-4 py-2.5 text-xs font-medium text-brand-primary-400 transition-colors hover:bg-slate-800"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Ver todos los resultados para &ldquo;{query}&rdquo;
                  </button>
                </>
              )}
            </div>
          )}
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

      {/* Extended filters */}
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
              updateParams({ is_verified: e.target.checked ? 'true' : null })
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
