import Link from 'next/link'
import { ArrowRight, MapPin, Tag, Percent, Gift } from 'lucide-react'
import { IncentiveCard } from '@/modules/incentivos/components/incentive-card'
import { BusinessCard } from '@/modules/negocios/components/business-card'
import type { IncentiveWithBusiness } from '@/modules/incentivos/interfaces'
import type { BusinessCard as BusinessCardType } from '@/modules/negocios/interfaces'

interface UserDashboardProps {
  firstName: string
  incentives: IncentiveWithBusiness[]
  businesses: BusinessCardType[]
}

export function UserDashboard({ firstName, incentives, businesses }: UserDashboardProps) {
  return (
    <div className="space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          Hola, {firstName} 👋
        </h1>
        <p className="mt-1 text-muted">Descubre ofertas y negocios cerca de ti</p>
      </div>

      {/* Promotions banner */}
      {incentives.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-white">Ofertas para ti</h2>
              <p className="text-xs text-muted mt-0.5">Cupones y descuentos en negocios locales</p>
            </div>
            <Link
              href="/ofertas"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary-400 hover:text-brand-primary-300"
            >
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
            {incentives.map((incentive) => (
              <div key={incentive.id} className="w-64 shrink-0 sm:w-auto">
                <IncentiveCard incentive={incentive} compact />
              </div>
            ))}
          </div>

          {/* Type legend */}
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
      )}

      {/* Explore businesses */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-white">Explorar negocios</h2>
            <p className="text-xs text-muted mt-0.5 inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Cúcuta, Colombia
            </p>
          </div>
          <Link
            href="/explorar"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary-400 hover:text-brand-primary-300"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {businesses.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No hay negocios disponibles por ahora.</p>
        )}
      </section>
    </div>
  )
}
