'use client'

import { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import { Search, MapPin, ArrowRight, Tag, Percent, Gift, Store, X } from 'lucide-react'
import { PromoBannerSlider } from '@/components/shared/promo-banner-slider'
import { IncentiveCard } from '@/modules/incentivos/components/incentive-card'
import { BusinessMarkerMap } from '@/components/map/BusinessMarkerMap'
import { ZeroResults } from '@/modules/negocios/components/zero-results'
import { searchBusinessesAction } from '@/modules/negocios/actions/search.actions'
import type { PromoBanner } from '@/components/shared/promo-banner-slider'
import type { IncentiveWithBusiness } from '@/modules/incentivos/interfaces'
import type { BusinessCard } from '@/modules/negocios/interfaces'
import { clsx } from 'clsx'

interface UserDashboardProps {
  banners: PromoBanner[]
  incentives: IncentiveWithBusiness[]
  businesses: BusinessCard[]
}

const NEIGHBORHOODS = [
  'Cúcuta centro',
  'Los Patios',
  'Villa del Rosario',
  'San Cayetano',
  'El Zulia',
  'Atalaya',
  'Quinta Oriental',
  'Cundinamarca',
]

export function UserDashboard({ banners, incentives, businesses }: UserDashboardProps) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [results, setResults] = useState<BusinessCard[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const resultsRef = useRef<HTMLDivElement>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSelectedId(null)
    startTransition(async () => {
      const res = await searchBusinessesAction(query, location)
      if (res.success) {
        setResults(res.data ?? [])
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      } else {
        setError(res.error ?? 'Error al buscar')
      }
    })
  }

  function clearSearch() {
    setQuery('')
    setLocation('')
    setResults(null)
    setSelectedId(null)
    setError(null)
  }

  const displayBusinesses = results ?? businesses
  const hasSearched = results !== null

  return (
    <div className="space-y-8">
      {/* ── Buscador + Mapa (un solo viewport) ───────────────────── */}
      <section
        ref={resultsRef}
        className="flex flex-col gap-2"
        style={{ height: 'calc(100dvh - 120px)', minHeight: 420, maxHeight: 780 }}
      >
        {/* Buscador compacto */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 backdrop-blur-sm sm:flex-row sm:items-center"
        >
          {/* Ubicación */}
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-accent-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Barrio o municipio"
              list="neighborhoods"
              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-800 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/30"
            />
            <datalist id="neighborhoods">
              {NEIGHBORHOODS.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>

          {/* Qué buscas */}
          <div className="relative flex-[1.4]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Librería, restaurante, peluquería..."
              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-800 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/30"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-primary-500 disabled:opacity-60 sm:flex-none"
            >
              {isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span>Buscar</span>
            </button>
            {hasSearched && (
              <button
                type="button"
                onClick={clearSearch}
                className="flex h-10 items-center gap-1 rounded-xl border border-slate-700 px-3 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {error && (
            <p className="col-span-full text-xs text-red-400">{error}</p>
          )}
        </form>

        {/* Contador de resultados */}
        {hasSearched && (
          <p className="px-1 text-xs text-slate-400">
            {results!.length === 0
              ? 'Sin resultados'
              : `${results!.length} negocio${results!.length !== 1 ? 's' : ''} encontrado${results!.length !== 1 ? 's' : ''}`}
            {(query || location) && (
              <span className="text-slate-500">
                {' · '}
                {[query && `"${query}"`, location].filter(Boolean).join(' en ')}
              </span>
            )}
          </p>
        )}

        {/* Mapa — ocupa el resto del viewport */}
        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl">
          <BusinessMarkerMap
            businesses={displayBusinesses}
            selectedId={selectedId}
            onSelect={setSelectedId}
            className="h-full w-full"
          />
        </div>

      </section>

      {/* ── Cards de resultados (scroll adicional bajo el viewport) */}
      {hasSearched && results!.length > 0 && (
        <section>
          <h2 className="font-heading mb-3 text-base font-bold text-white">Negocios encontrados</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results!.map((b) => (
              <BusinessResultCard
                key={b.id}
                business={b}
                isSelected={b.id === selectedId}
                onClick={() => setSelectedId(b.id === selectedId ? null : b.id)}
              />
            ))}
          </div>
        </section>
      )}

      {hasSearched && results!.length === 0 && (
        <ZeroResults query={query} neighborhood={location || undefined} />
      )}

      {/* ── Ofertas ─────────────────────────────────────────────── */}
      {!hasSearched && incentives.length > 0 && (
        <>
          {banners.length > 0 && <PromoBannerSlider banners={banners} />}

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-white">Ofertas para ti</h2>
                <p className="text-xs text-slate-400 mt-0.5">Cupones y descuentos en negocios locales</p>
              </div>
              <Link
                href="/ofertas"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary-400 hover:text-brand-primary-300"
              >
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
              {incentives.map((incentive) => (
                <div key={incentive.id} className="w-64 shrink-0 sm:w-auto">
                  <IncentiveCard incentive={incentive} compact />
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {[
                { icon: Tag, label: 'Cupón', color: 'text-brand-primary-400' },
                { icon: Percent, label: 'Combo', color: 'text-brand-accent-400' },
                { icon: Gift, label: 'Premio', color: 'text-brand-success-400' },
              ].map(({ icon: Icon, label, color }) => (
                <span key={label} className={`inline-flex items-center gap-1 text-xs ${color}`}>
                  <Icon className="h-3 w-3" /> {label}
                </span>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

// ── Business result card ────────────────────────────────────────────────────
interface BusinessResultCardProps {
  business: BusinessCard
  isSelected: boolean
  onClick: () => void
}

function BusinessResultCard({ business: b, isSelected, onClick }: BusinessResultCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'group cursor-pointer rounded-2xl border bg-slate-900 transition-all',
        isSelected
          ? 'border-brand-primary-500 ring-1 ring-brand-primary-500/40'
          : 'border-slate-800 hover:border-slate-700',
      )}
    >
      {/* Cover / logo strip */}
      <div className="relative h-24 overflow-hidden rounded-t-2xl bg-slate-800">
        {b.cover_url ? (
          <img src={b.cover_url} alt={b.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-primary-900 to-slate-800" />
        )}
        {b.logo_url && (
          <img
            src={b.logo_url}
            alt={b.name}
            className="absolute bottom-2 left-3 h-10 w-10 rounded-xl border-2 border-slate-900 object-cover"
          />
        )}
        {b.is_featured && (
          <span className="absolute right-2 top-2 rounded-md bg-brand-accent-500 px-2 py-0.5 text-[10px] font-bold text-white">
            Destacado
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="font-bold text-sm text-white leading-tight">{b.name}</p>
        {b.business_categories?.name && (
          <p className="text-xs text-brand-primary-400 mt-0.5">{b.business_categories.name}</p>
        )}
        {b.address && (
          <p className="mt-1 flex items-start gap-1 text-xs text-slate-500">
            <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-600" />
            <span className="line-clamp-1">{b.neighborhood ?? b.city ?? b.address}</span>
          </p>
        )}
        <Link
          href={`/negocio/${b.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-brand-primary-600 py-1.5 text-xs font-semibold text-white hover:bg-brand-primary-500"
        >
          Ver negocio <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
