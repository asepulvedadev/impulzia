'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BadgeCheck, MapPin, MessageCircle, Star } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useTracker } from '@/hooks/use-tracker'
import type { BusinessCard as BusinessCardType } from '../interfaces'

interface BusinessCardProps {
  business: BusinessCardType
  className?: string
}

const CATEGORY_GRADIENT: Record<string, string> = {
  restaurantes:              'from-orange-600 via-red-600 to-rose-700',
  cafeterias:                'from-amber-500 via-yellow-600 to-orange-600',
  'tiendas-de-ropa':         'from-pink-600 via-fuchsia-600 to-purple-700',
  tecnologia:                'from-cyan-600 via-blue-600 to-indigo-700',
  'belleza-y-salud':         'from-rose-500 via-pink-600 to-fuchsia-600',
  deportes:                  'from-green-600 via-emerald-600 to-teal-700',
  hogar:                     'from-teal-600 via-cyan-600 to-sky-700',
  'servicios-profesionales': 'from-slate-600 via-blue-700 to-indigo-800',
  educacion:                 'from-violet-600 via-purple-600 to-indigo-700',
  entretenimiento:           'from-fuchsia-600 via-purple-600 to-violet-700',
  mascotas:                  'from-orange-500 via-amber-500 to-yellow-600',
  automotriz:                'from-slate-700 via-gray-700 to-zinc-800',
}

const TIER_BADGE: Record<string, { label: string; style: string } | null> = {
  free:    null,
  basic:   null,
  pro:     { label: 'PRO',     style: 'bg-brand-accent-500/90 text-white' },
  premium: { label: 'PREMIUM', style: 'bg-gradient-to-r from-yellow-500 to-amber-400 text-slate-900' },
}

function waNumber(raw: string) {
  const d = raw.replace(/\D/g, '')
  return d.startsWith('57') ? d : `57${d}`
}

export function BusinessCard({ business, className }: BusinessCardProps) {
  const { track } = useTracker()
  const initial = business.name.charAt(0).toUpperCase()
  const slug = business.business_categories?.slug ?? ''
  const gradient = CATEGORY_GRADIENT[slug] ?? 'from-brand-primary-600 to-brand-primary-800'
  const tierBadge = TIER_BADGE[business.subscription_tier]
  const location = [business.neighborhood, business.city].filter(Boolean).join(', ')
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
    `${business.address ?? business.name}, Cúcuta, Colombia`,
  )}`
  const waMsg = encodeURIComponent(`Hola, vi ${business.name} en Rcomienda y quiero más información.`)

  return (
    <div className={cn(
      'group relative flex flex-col rounded-2xl border border-slate-700/60 bg-slate-900',
      'shadow-lg shadow-black/40 transition-all duration-300',
      'hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60 hover:border-slate-600',
      className,
    )}>
      {/* Cover + Logo wrapper — overflow visible so logo can overlap */}
      <div className="relative shrink-0">
        <Link
          href={`/negocio/${business.slug}`}
          className="relative block aspect-[16/9] overflow-hidden rounded-t-2xl"
          onClick={() => track({
            event_type: 'business_click',
            entity_type: 'business',
            entity_id: business.id,
            metadata: { name: business.name, category: business.business_categories?.slug },
            neighborhood: business.neighborhood ?? undefined,
          })}
        >
          {business.cover_url ? (
            <Image
              src={business.cover_url}
              alt={business.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={cn('h-full w-full bg-gradient-to-br', gradient)}>
              <div className="flex h-full items-center justify-center">
                <span className="select-none text-7xl font-black text-white/20">{initial}</span>
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900 to-transparent" />

          {/* Badges */}
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
            {tierBadge && (
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-black tracking-wider shadow-md', tierBadge.style)}>
                {tierBadge.label}
              </span>
            )}
            {business.is_featured && !tierBadge && (
              <span className="flex items-center gap-0.5 rounded-full bg-brand-primary-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
                <Star className="h-2.5 w-2.5 fill-white" /> DESTACADO
              </span>
            )}
          </div>
        </Link>

        {/* Logo — outside the Link so overflow-hidden no lo recorta */}
        <div className="absolute bottom-0 left-4 z-10 translate-y-1/2">
          {business.logo_url ? (
            <div className="relative h-14 w-14 overflow-hidden rounded-xl border-[3px] border-slate-900 shadow-xl ring-1 ring-slate-700">
              <Image
                src={business.logo_url}
                alt={`Logo ${business.name}`}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className={cn(
              'flex h-14 w-14 items-center justify-center rounded-xl border-[3px] border-slate-900 shadow-xl ring-1 ring-slate-700 text-lg font-black text-white bg-gradient-to-br',
              gradient,
            )}>
              {initial}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-10">
        <Link href={`/negocio/${business.slug}`} className="flex items-center gap-1.5">
          <h3 className="text-base font-bold text-white transition-colors group-hover:text-brand-primary-300">
            {business.name}
          </h3>
          {business.is_verified && (
            <BadgeCheck className="h-4 w-4 shrink-0 text-brand-primary-400" />
          )}
        </Link>

        {business.business_categories && (
          <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand-accent-400">
            {business.business_categories.name}
          </span>
        )}

        {business.short_description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
            {business.short_description}
          </p>
        )}

        {location && (
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {business.whatsapp && (
            <a
              href={`https://wa.me/${waNumber(business.whatsapp)}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation()
                track({
                  event_type: 'whatsapp_click',
                  entity_type: 'business',
                  entity_id: business.id,
                  metadata: { name: business.name },
                  neighborhood: business.neighborhood ?? undefined,
                })
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-green-500 active:scale-95"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation()
              track({
                event_type: 'maps_click',
                entity_type: 'business',
                entity_id: business.id,
                metadata: { name: business.name },
                neighborhood: business.neighborhood ?? undefined,
              })
            }}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 shadow-md transition hover:border-slate-600 hover:text-white active:scale-95',
              !business.whatsapp && 'flex-1',
            )}
          >
            <MapPin className="h-3.5 w-3.5" />
            {!business.whatsapp ? 'Ver ubicación' : 'Mapa'}
          </a>
        </div>
      </div>
    </div>
  )
}
