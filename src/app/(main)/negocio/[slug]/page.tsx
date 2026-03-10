import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  BadgeCheck,
  Clock,
  MessageCircle,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BusinessService } from '@/modules/negocios/services/business.service'
import { formatPhone, formatWhatsAppLink, getBusinessStatus } from '@/lib/utils/format'
import { AdSlot, AdSlotSkeleton } from '@/modules/anuncios/components/ad-slot'
import { SimilarBusinesses, SimilarBusinessesSkeleton } from '@/modules/negocios/components/similar-businesses'
import { TrackBusinessView } from '@/modules/analytics/components/track-business-view'
import type { BusinessWithCategory, BusinessHours } from '@/modules/negocios/interfaces'

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

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

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const result = await new BusinessService(supabase).getBySlug(slug)
  if (!result.data) return { title: 'Negocio no encontrado | Rcomienda' }
  return {
    title: `${result.data.name} | Rcomienda`,
    description: result.data.short_description ?? result.data.description ?? undefined,
  }
}

export default async function NegocioPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const service = new BusinessService(supabase)

  const result = await service.getBySlug(slug)
  if (!result.data) notFound()

  const business = result.data as BusinessWithCategory
  const hoursResult = await service.getHours(business.id)
  const hours = (hoursResult.data as BusinessHours[]) ?? []
  const todayIndex = new Date().getDay()
  const status = getBusinessStatus(hours)
  const todayHours = hours.find((h) => h.day_of_week === todayIndex)
  const categorySlug = business.business_categories?.slug ?? ''
  const gradient = CATEGORY_GRADIENT[categorySlug] ?? 'from-brand-primary-600 to-brand-accent-500'
  const initial = business.name.charAt(0).toUpperCase()
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
    `${business.address ?? business.name}, Cúcuta, Colombia`,
  )}`

  return (
    <>
      {/* Tracking invisible — registra business_view en el cliente */}
      <TrackBusinessView businessId={business.id} neighborhood={business.neighborhood} />

      {/* ── Hero ── */}
      <div className="relative">
        {/* Cover image */}
        <div className="relative h-56 w-full overflow-hidden sm:h-72 lg:h-80">
          {business.cover_url ? (
            <img
              src={business.cover_url}
              alt={business.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${gradient}`}>
              <div className="flex h-full items-center justify-center">
                <span className="text-8xl font-black text-white/10 select-none">{initial}</span>
              </div>
            </div>
          )}
          {/* Gradient overlay bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          {/* Back button */}
          <Link
            href="/explorar"
            className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/60"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Explorar</span>
          </Link>
        </div>

        {/* Name + logo (overlaps cover bottom) */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8">
          <div className="flex items-end gap-3">
            {/* Logo */}
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="h-16 w-16 shrink-0 rounded-2xl border-2 border-slate-700 object-cover shadow-xl sm:h-20 sm:w-20"
              />
            ) : (
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-700 bg-gradient-to-br text-2xl font-black text-white shadow-xl sm:h-20 sm:w-20 ${gradient}`}>
                {initial}
              </div>
            )}

            {/* Name block */}
            <div className="min-w-0 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate font-heading text-xl font-bold text-white drop-shadow-lg sm:text-2xl lg:text-3xl">
                  {business.name}
                </h1>
                {business.is_verified && (
                  <BadgeCheck className="h-5 w-5 shrink-0 text-brand-primary-400 drop-shadow" />
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {business.business_categories && (
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                    {business.business_categories.name}
                  </span>
                )}
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  status === 'open'
                    ? 'bg-brand-success-500/80 text-white'
                    : status === 'closing_soon'
                      ? 'bg-brand-accent-500/80 text-white'
                      : 'bg-slate-700/80 text-slate-300'
                }`}>
                  {status === 'open' ? '● Abierto ahora' : status === 'closing_soon' ? '● Cierra pronto' : '● Cerrado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:pb-8 lg:px-8">
        <div className="lg:flex lg:gap-8">

          {/* ── Main content ── */}
          <div className="min-w-0 flex-1 space-y-8">

            {/* Short description */}
            {business.short_description && (
              <p className="text-base leading-relaxed text-slate-300">
                {business.short_description}
              </p>
            )}

            {/* About */}
            {business.description && (
              <section>
                <h2 className="mb-3 font-heading text-lg font-bold text-white">Acerca del negocio</h2>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-400">
                    {business.description}
                  </p>
                </div>
              </section>
            )}

            {/* Hours */}
            {hours.length > 0 && (
              <section>
                <h2 className="mb-3 font-heading text-lg font-bold text-white">Horarios</h2>
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                  {hours
                    .slice()
                    .sort((a, b) => a.day_of_week - b.day_of_week)
                    .map((h, i) => {
                      const isToday = h.day_of_week === todayIndex
                      return (
                        <div
                          key={h.day_of_week}
                          className={`flex items-center justify-between px-4 py-3 text-sm ${
                            i !== 0 ? 'border-t border-slate-800/60' : ''
                          } ${isToday ? 'bg-brand-primary-900/20' : ''}`}
                        >
                          <span className={isToday ? 'font-semibold text-brand-primary-300' : 'text-slate-400'}>
                            {isToday ? '→ ' : ''}{DAY_NAMES[h.day_of_week]}
                          </span>
                          <span className={h.is_closed ? 'text-slate-600' : isToday ? 'font-medium text-white' : 'text-slate-300'}>
                            {h.is_closed ? 'Cerrado' : `${h.open_time?.slice(0,5)} – ${h.close_time?.slice(0,5)}`}
                          </span>
                        </div>
                      )
                    })}
                </div>
              </section>
            )}

            {/* Location */}
            {(business.address || business.neighborhood) && (
              <section>
                <h2 className="mb-3 font-heading text-lg font-bold text-white">Ubicación</h2>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800">
                      <MapPin className="h-4 w-4 text-brand-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-300">
                        {[business.address, business.neighborhood, business.city]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary-400 hover:text-brand-primary-300"
                      >
                        Ver en Google Maps
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* También visitaron — Jaccard similarity */}
            <Suspense fallback={<SimilarBusinessesSkeleton />}>
              <SimilarBusinesses businessId={business.id} limit={4} />
            </Suspense>
          </div>

          {/* ── Sidebar (desktop) ── */}
          <aside className="mt-8 hidden w-72 shrink-0 space-y-4 lg:block xl:w-80">
            <div className="sticky top-6 space-y-4">
              {/* Contact card */}
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
                {/* Today hours header */}
                {todayHours && (
                  <div className={`flex items-center justify-between border-b border-slate-800 px-4 py-3 ${
                    status === 'open' ? 'bg-brand-success-900/20' : 'bg-slate-800/40'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-white">Hoy</span>
                    </div>
                    <span className="text-sm text-slate-300">
                      {todayHours.is_closed
                        ? 'Cerrado'
                        : `${todayHours.open_time?.slice(0,5)} – ${todayHours.close_time?.slice(0,5)}`}
                    </span>
                  </div>
                )}

                <div className="space-y-2.5 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contacto</h3>

                  {business.whatsapp && (
                    <a
                      href={formatWhatsAppLink(business.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-500"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>
                  )}
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
                    >
                      <Phone className="h-4 w-4" />
                      {formatPhone(business.phone)}
                    </a>
                  )}
                  {business.email && (
                    <a
                      href={`mailto:${business.email}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
                    >
                      <Mail className="h-4 w-4" />
                      Enviar correo
                    </a>
                  )}
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
                    >
                      <Globe className="h-4 w-4" />
                      Sitio web
                    </a>
                  )}
                </div>
              </div>

              {/* Ad slot */}
              <Suspense fallback={<AdSlotSkeleton size="compact" />}>
                <AdSlot
                  context="business_profile"
                  categoryId={business.category_id ?? undefined}
                  size="compact"
                />
              </Suspense>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-950/95 p-3 backdrop-blur-md lg:hidden">
        <div className="flex gap-2">
          {business.whatsapp && (
            <a
              href={formatWhatsAppLink(business.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-500"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              <Phone className="h-4 w-4" />
              Llamar
            </a>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <MapPin className="h-4 w-4" />
          </a>
        </div>
      </div>
    </>
  )
}
