import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BusinessService } from '@/modules/negocios/services/business.service'
import { BusinessForm } from '@/modules/negocios/components/business-form'
import { BusinessHoursForm } from '@/modules/negocios/components/business-hours-form'
import { Badge, Button } from '@/components/ui'
import type { Business, BusinessCategory, BusinessHours } from '@/modules/negocios/interfaces'

export default async function NegocioPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const service = new BusinessService(supabase)

  const businessResult = await service.getByOwnerId(user.id)
  const business = businessResult.data as Business | null

  const categoriesResult = await service.getCategories()
  const categories = (categoriesResult.data as BusinessCategory[]) ?? []

  // No business yet — show creation form
  if (!business) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Registra tu negocio</h1>
          <p className="mt-1 text-muted">
            Completa los datos de tu comercio para aparecer en IKARUS
          </p>
        </div>
        <BusinessForm categories={categories} />
      </div>
    )
  }

  // Has business — show management
  const hoursResult = await service.getHours(business.id)
  const hours = (hoursResult.data as BusinessHours[]) ?? []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-white">{business.name}</h1>
            <Badge variant={business.is_active ? 'success' : 'outline'}>
              {business.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">Gestiona la información de tu negocio</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/negocio/${business.slug}`} target="_blank">
            <ExternalLink className="h-4 w-4" />
            Ver perfil público
          </Link>
        </Button>
      </div>

      {/* Business info card */}
      <section className="rounded-2xl border border-slate-800 bg-card p-6">
        <h2 className="font-heading text-lg font-bold text-white">Información del negocio</h2>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted">Categoría:</span>{' '}
            <span className="font-medium">
              {business.category_id ? 'Asignada' : 'Sin categoría'}
            </span>
          </div>
          <div>
            <span className="text-muted">Teléfono:</span>{' '}
            <span className="font-medium">{business.phone || 'Sin teléfono'}</span>
          </div>
          <div>
            <span className="text-muted">Email:</span>{' '}
            <span className="font-medium">{business.email || 'Sin email'}</span>
          </div>
          <div>
            <span className="text-muted">Dirección:</span>{' '}
            <span className="font-medium">{business.address || 'Sin dirección'}</span>
          </div>
          <div>
            <span className="text-muted">Barrio:</span>{' '}
            <span className="font-medium">{business.neighborhood || 'Sin barrio'}</span>
          </div>
          <div>
            <span className="text-muted">Ciudad:</span>{' '}
            <span className="font-medium">{business.city || 'Sin ciudad'}</span>
          </div>
        </div>
        {business.short_description && (
          <p className="mt-4 text-sm text-muted">{business.short_description}</p>
        )}
      </section>

      {/* Hours management */}
      <section className="rounded-2xl border border-slate-800 bg-card p-6">
        <BusinessHoursForm
          businessId={business.id}
          initialHours={hours.map((h) => ({
            day_of_week: h.day_of_week,
            open_time: h.open_time ?? '08:00',
            close_time: h.close_time ?? '18:00',
            is_closed: h.is_closed,
          }))}
        />
      </section>

      {/* Images placeholder */}
      <section className="rounded-2xl border border-slate-800 bg-card p-6">
        <h2 className="font-heading text-lg font-bold text-white">Imágenes</h2>
        <p className="mt-2 text-sm text-muted">
          La gestión de logo y portada estará disponible próximamente.
        </p>
      </section>
    </div>
  )
}
