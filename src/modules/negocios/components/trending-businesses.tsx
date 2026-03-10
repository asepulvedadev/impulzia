import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, ArrowRight, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils/cn'

const CATEGORY_GRADIENT: Record<string, string> = {
  restaurantes:              'from-orange-600 to-red-700',
  cafeterias:                'from-amber-500 to-orange-600',
  'tiendas-de-ropa':         'from-pink-600 to-purple-700',
  tecnologia:                'from-cyan-600 to-blue-700',
  'belleza-y-salud':         'from-rose-500 to-fuchsia-600',
  deportes:                  'from-green-600 to-teal-700',
  hogar:                     'from-teal-600 to-sky-700',
  'servicios-profesionales': 'from-slate-600 to-indigo-800',
  educacion:                 'from-violet-600 to-indigo-700',
  entretenimiento:           'from-fuchsia-600 to-violet-700',
  mascotas:                  'from-orange-500 to-yellow-600',
  automotriz:                'from-slate-700 to-zinc-800',
}

const BUSINESS_CARD_SELECT =
  'id, name, slug, short_description, logo_url, cover_url, neighborhood, city, is_verified, is_featured, subscription_tier, business_categories(name, slug, icon)'

export async function TrendingBusinesses({ limit = 6 }: { limit?: number }) {
  const supabase = await createClient()

  // Obtener los IDs trending desde business_stats
  const { data: statsRows } = await supabase
    .from('business_stats' as 'businesses')
    .select('business_id, views_7d, velocity_ratio')
    .order('velocity_ratio', { ascending: false })
    .limit(limit)

  const stats = statsRows as unknown as {
    business_id: string
    views_7d: number
    velocity_ratio: number
  }[] | null

  if (!stats || stats.length === 0) return null

  const ids = stats.map((s) => s.business_id)
  const statsMap = new Map(stats.map((s) => [s.business_id, s]))

  const { data: businesses } = await supabase
    .from('businesses')
    .select(BUSINESS_CARD_SELECT)
    .in('id', ids)
    .eq('is_active', true)

  if (!businesses || businesses.length === 0) return null

  // Mantener orden del score
  const sorted = [...businesses].sort((a, b) => {
    const rA = statsMap.get(a.id)?.velocity_ratio ?? 0
    const rB = statsMap.get(b.id)?.velocity_ratio ?? 0
    return rB - rA
  })

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-brand-accent-900/20 p-1.5">
            <Flame className="h-4 w-4 text-brand-accent-400" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-white">Trending ahora</h2>
            <p className="text-xs text-slate-500">Los más visitados esta semana</p>
          </div>
        </div>
        <Link
          href="/explorar?sort_by=rating"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary-400 hover:text-brand-primary-300"
        >
          Ver más <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
        {sorted.map((biz, idx) => {
          const cats = biz.business_categories as { name: string; slug: string } | null
          const gradient = CATEGORY_GRADIENT[cats?.slug ?? ''] ?? 'from-brand-primary-600 to-brand-primary-800'
          const initial = biz.name.charAt(0).toUpperCase()
          const stat = statsMap.get(biz.id)
          const isHot = idx === 0

          return (
            <Link
              key={biz.id}
              href={`/negocio/${biz.slug}`}
              className="group relative w-48 shrink-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition-all hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-lg sm:w-auto"
            >
              {/* Cover */}
              <div className="relative aspect-[16/9] overflow-hidden">
                {biz.cover_url ? (
                  <Image
                    src={biz.cover_url}
                    alt={biz.name}
                    fill
                    sizes="(max-width: 640px) 192px, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className={cn('h-full w-full bg-gradient-to-br', gradient)}>
                    <div className="flex h-full items-center justify-center">
                      <span className="select-none text-4xl font-black text-white/20">{initial}</span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-900 to-transparent" />

                {/* Rank badge */}
                <div className="absolute left-2.5 top-2.5">
                  {isHot ? (
                    <span className="flex items-center gap-1 rounded-full bg-brand-accent-500/90 px-2 py-0.5 text-[10px] font-black text-white">
                      <Flame className="h-2.5 w-2.5 fill-white" /> HOT
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                      <TrendingUp className="h-2.5 w-2.5" /> #{idx + 1}
                    </span>
                  )}
                </div>

                {/* Logo */}
                <div className="absolute bottom-0 left-2.5 translate-y-1/2">
                  {biz.logo_url ? (
                    <div className="relative h-8 w-8 overflow-hidden rounded-lg border-2 border-slate-900 shadow">
                      <Image src={biz.logo_url} alt={biz.name} fill sizes="32px" className="object-cover" />
                    </div>
                  ) : (
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-900 shadow text-xs font-black text-white bg-gradient-to-br',
                      gradient,
                    )}>
                      {initial}
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="px-2.5 pb-2.5 pt-5">
                <p className="truncate text-xs font-semibold text-white">{biz.name}</p>
                <div className="mt-0.5 flex items-center justify-between">
                  <span className="truncate text-[10px] text-muted">
                    {cats?.name ?? biz.neighborhood ?? biz.city}
                  </span>
                  {stat && stat.views_7d > 0 && (
                    <span className="ml-1 shrink-0 text-[10px] font-medium text-brand-success-400">
                      {stat.views_7d} vistas
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function TrendingBusinessesSkeleton() {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-800" />
        <div className="h-5 w-32 animate-pulse rounded bg-slate-800" />
      </div>
      <div className="flex gap-3 sm:grid sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-48 shrink-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 sm:w-auto">
            <div className="aspect-[16/9] animate-pulse bg-slate-800" />
            <div className="p-2.5 pt-5">
              <div className="h-3 w-3/4 animate-pulse rounded bg-slate-800" />
              <div className="mt-1 h-2.5 w-1/2 animate-pulse rounded bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
