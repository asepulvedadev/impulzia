import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Phone, Mail, Globe, MapPin, BadgeCheck, Clock, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BusinessService } from '@/modules/negocios/services/business.service'
import { Badge, Button, Card, CardContent } from '@/components/ui'
import { formatPhone, formatWhatsAppLink, getBusinessStatus } from '@/lib/utils/format'
import { AdSlot, AdSlotSkeleton } from '@/modules/anuncios/components/ad-slot'
import type { BusinessWithCategory, BusinessHours } from '@/modules/negocios/interfaces'

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const service = new BusinessService(supabase)
  const result = await service.getBySlug(slug)

  if (!result.data) {
    return { title: 'Negocio no encontrado | IMPULZIA' }
  }

  return {
    title: `${result.data.name} | IMPULZIA`,
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

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-20">
      {/* Cover */}
      <div className="relative h-48 overflow-hidden rounded-2xl sm:h-64 lg:h-80">
        {business.cover_url ? (
          <img
            src={business.cover_url}
            alt={`Portada de ${business.name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-brand-primary-600 to-brand-accent-500" />
        )}
      </div>

      <div className="lg:flex lg:gap-8">
        {/* Main content */}
        <div className="flex-1">
          {/* Header */}
          <div className="-mt-10 flex items-end gap-4 px-2 sm:px-4">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="h-20 w-20 rounded-xl border-4 border-slate-900 object-cover shadow-lg sm:h-24 sm:w-24"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border-4 border-slate-900 bg-gradient-to-br from-brand-primary-500 to-brand-primary-700 text-2xl font-bold text-white shadow-lg sm:h-24 sm:w-24">
                {business.name.charAt(0)}
              </div>
            )}

            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">
                  {business.name}
                </h1>
                {business.is_verified && <BadgeCheck className="h-6 w-6 text-brand-success-500" />}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {business.business_categories && (
                  <Badge variant="secondary">{business.business_categories.name}</Badge>
                )}
                <Badge
                  variant={
                    status === 'open' ? 'success' : status === 'closing_soon' ? 'accent' : 'outline'
                  }
                >
                  {status === 'open'
                    ? 'Abierto ahora'
                    : status === 'closing_soon'
                      ? 'Cierra pronto'
                      : 'Cerrado'}
                </Badge>
              </div>
            </div>
          </div>

          {business.short_description && (
            <p className="mt-4 text-muted">{business.short_description}</p>
          )}

          {/* Tabs content (simplified without Radix for SSR) */}
          <div className="mt-8 space-y-8">
            {/* Description */}
            {business.description && (
              <section>
                <h2 className="font-heading text-lg font-bold text-white">Acerca del negocio</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {business.description}
                </p>
              </section>
            )}

            {/* Hours */}
            {hours.length > 0 && (
              <section>
                <h2 className="font-heading text-lg font-bold text-white">Horarios</h2>
                <div className="mt-3 space-y-1">
                  {hours
                    .sort((a, b) => a.day_of_week - b.day_of_week)
                    .map((h) => (
                      <div
                        key={h.day_of_week}
                        className={`flex justify-between rounded-lg px-3 py-2 text-sm ${
                          h.day_of_week === todayIndex
                            ? 'bg-brand-primary-900/20 font-medium text-brand-primary-300'
                            : 'text-muted'
                        }`}
                      >
                        <span>{DAY_NAMES[h.day_of_week]}</span>
                        <span>{h.is_closed ? 'Cerrado' : `${h.open_time} - ${h.close_time}`}</span>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Location */}
            {business.address && (
              <section>
                <h2 className="font-heading text-lg font-bold text-white">Ubicación</h2>
                <div className="mt-3 flex items-start gap-2 text-sm text-muted">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {business.address}
                    {business.neighborhood && `, ${business.neighborhood}`}
                    {business.city && `, ${business.city}`}
                  </span>
                </div>
                <div className="mt-4 flex h-48 items-center justify-center rounded-xl bg-slate-800 text-sm text-muted">
                  <MapPin className="mr-2 h-5 w-5" /> Mapa próximamente
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Sidebar - contact + ads */}
        <aside className="mt-8 w-full shrink-0 lg:mt-0 lg:w-80 space-y-4">
          {/* Ad slot for business profile context */}
          <Suspense fallback={<AdSlotSkeleton size="compact" />}>
            <AdSlot
              context="business_profile"
              categoryId={business.category_id ?? undefined}
              size="compact"
            />
          </Suspense>
          <Card className="sticky top-24">
            <CardContent className="space-y-3 py-4">
              <h3 className="text-sm font-semibold text-white">Contacto</h3>

              {business.whatsapp && (
                <Button variant="accent" className="w-full bg-green-600 hover:bg-green-700" asChild>
                  <a
                    href={formatWhatsAppLink(business.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
              )}

              {business.phone && (
                <Button variant="default" className="w-full" asChild>
                  <a href={`tel:${business.phone}`}>
                    <Phone className="h-4 w-4" />
                    Llamar ({formatPhone(business.phone)})
                  </a>
                </Button>
              )}

              {business.email && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={`mailto:${business.email}`}>
                    <Mail className="h-4 w-4" />
                    Enviar correo
                  </a>
                </Button>
              )}

              {business.website && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={business.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4" />
                    Sitio web
                  </a>
                </Button>
              )}

              {/* Today's hours quick view */}
              {hours.length > 0 && (
                <div className="border-t border-slate-800 pt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted" />
                    <span className="font-medium text-white">Hoy</span>
                    {(() => {
                      const today = hours.find((h) => h.day_of_week === todayIndex)
                      if (!today || today.is_closed)
                        return <span className="text-muted">Cerrado</span>
                      return (
                        <span className="text-muted">
                          {today.open_time} - {today.close_time}
                        </span>
                      )
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
