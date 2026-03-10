import Link from 'next/link'
import Image from 'next/image'
import { BadgeCheck, MapPin } from 'lucide-react'
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

interface SimilarBusinessesProps {
  businessId: string
  limit?: number
}

export async function SimilarBusinesses({ businessId, limit = 4 }: SimilarBusinessesProps) {
  const supabase = await createClient()

  // 1. Obtener IDs similares via Jaccard + fallback categoría
  const { data: similar } = await supabase.rpc('get_similar_businesses', {
    p_business_id: businessId,
    p_limit: limit,
  })

  if (!similar || similar.length === 0) return null

  const ids = similar.map((s) => s.business_id)

  // 2. Obtener datos completos de los negocios similares
  const { data: businesses } = await supabase
    .from('businesses')
    .select(
      'id, name, slug, logo_url, cover_url, neighborhood, is_verified, subscription_tier, business_categories(name, slug)',
    )
    .in('id', ids)
    .eq('is_active', true)

  if (!businesses || businesses.length === 0) return null

  // Mantener el orden del score
  const scoreMap = new Map(similar.map((s) => [s.business_id, s]))
  const sorted = [...businesses].sort((a, b) => {
    const sA = scoreMap.get(a.id)?.jaccard_score ?? 0
    const sB = scoreMap.get(b.id)?.jaccard_score ?? 0
    return sB - sA
  })

  return (
    <section>
      <h2 className="mb-4 font-heading text-lg font-bold text-white">
        Usuarios también visitaron
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {sorted.map((biz) => {
          const cats = biz.business_categories as { name: string; slug: string } | null
          const gradient = CATEGORY_GRADIENT[cats?.slug ?? ''] ?? 'from-brand-primary-600 to-brand-primary-800'
          const initial = biz.name.charAt(0).toUpperCase()
          const isSimilarity = (scoreMap.get(biz.id)?.source ?? '') === 'similarity'

          return (
            <Link
              key={biz.id}
              href={`/negocio/${biz.slug}`}
              className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition-all hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-lg"
            >
              {/* Mini cover */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {biz.cover_url ? (
                  <Image
                    src={biz.cover_url}
                    alt={biz.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className={cn('h-full w-full bg-gradient-to-br', gradient)}>
                    <div className="flex h-full items-center justify-center">
                      <span className="select-none text-3xl font-black text-white/20">{initial}</span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-900 to-transparent" />

                {/* Logo solapado */}
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

                {/* Badge de similitud */}
                {isSimilarity && (
                  <div className="absolute right-2 top-2">
                    <span className="rounded-full bg-brand-primary-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      Popular
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="px-2.5 pb-2.5 pt-5">
                <div className="flex items-center gap-1">
                  <p className="truncate text-xs font-semibold text-white">{biz.name}</p>
                  {biz.is_verified && (
                    <BadgeCheck className="h-3 w-3 shrink-0 text-brand-primary-400" />
                  )}
                </div>
                {(cats?.name || biz.neighborhood) && (
                  <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted">
                    {biz.neighborhood && <MapPin className="h-2.5 w-2.5 shrink-0" />}
                    <span className="truncate">{biz.neighborhood ?? cats?.name}</span>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function SimilarBusinessesSkeleton() {
  return (
    <section>
      <div className="mb-4 h-6 w-48 animate-pulse rounded-lg bg-slate-800" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="aspect-[4/3] animate-pulse bg-slate-800" />
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
