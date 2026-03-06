import { Suspense } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Megaphone,
  Gift,
  Zap,
  ShoppingBag,
  Sparkles,
  Brain,
  MessageSquareText,
  TrendingUp,
  BadgeCheck,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase/server'
import { BusinessService } from '@/modules/negocios/services/business.service'
import { IncentiveService } from '@/modules/incentivos/services/incentive.service'
import { AdSlot, AdSlotSkeleton } from '@/modules/anuncios/components/ad-slot'
import { IncentiveCard } from '@/modules/incentivos/components/incentive-card'
import type { BusinessCard as BusinessCardType } from '@/modules/negocios/interfaces'
import type { IncentiveWithBusiness } from '@/modules/incentivos/interfaces'

const CATEGORY_EMOJI: Record<string, string> = {
  Utensils: '🍽️',
  Store: '🏪',
  Scissors: '✂️',
  Dumbbell: '💪',
  GraduationCap: '🎓',
  Heart: '❤️',
  Wrench: '🔧',
  ShoppingBag: '🛍️',
  Car: '🚗',
  Palette: '🎨',
}

function getBusinessGradient(index: number) {
  const gradients = [
    'from-brand-primary-600 to-brand-primary-800',
    'from-brand-accent-500 to-brand-accent-700',
    'from-brand-success-500 to-brand-success-700',
  ]
  return gradients[index % gradients.length]
}

export default async function HomePage() {
  const supabase = await createClient()
  const service = new BusinessService(supabase)
  const incentiveService = new IncentiveService(supabase)

  const [featuredResult, incentivesResult] = await Promise.all([
    service.getFeatured(3),
    incentiveService.getActiveIncentives({ city: 'Cúcuta', limit: 4 }),
  ])

  const featured = (featuredResult.data as BusinessCardType[]) ?? []
  const featuredIncentives = (incentivesResult.data as IncentiveWithBusiness[]) ?? []

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="bg-hero-gradient px-6 py-16 lg:py-24 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Tu negocio,
              <br />
              impulsado por IA
            </h1>
            <p className="mt-6 text-lg text-white/80">
              La plataforma que conecta comercios locales con clientes usando inteligencia
              artificial. Publicidad, incentivos, marketplace y red social comercial en un solo
              lugar.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-white text-brand-primary-700 shadow-lg hover:bg-white/90 hover:scale-105"
                asChild
              >
                <Link href="/signup">Registra tu negocio</Link>
              </Button>
              <Button
                size="lg"
                className="border-2 border-white bg-transparent text-white hover:bg-white/10 hover:scale-105"
                asChild
              >
                <Link href="/explorar">Explorar negocios</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Businesses ── */}
      {featured.length > 0 && (
        <section className="px-6 py-16 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold text-white">Negocios Destacados</h2>
              <Link
                href="/explorar"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary-600 hover:text-brand-primary-700"
              >
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((business, index) => {
                const categoryEmoji = business.business_categories?.icon
                  ? (CATEGORY_EMOJI[business.business_categories.icon] ?? '🏢')
                  : '🏢'

                return (
                  <Link
                    key={business.id}
                    href={`/negocio/${business.slug}`}
                    className="group block overflow-hidden rounded-xl border border-slate-800 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Card image area */}
                    <div
                      className={`relative aspect-[16/10] bg-gradient-to-br ${getBusinessGradient(index)}`}
                    >
                      {/* Category badge */}
                      {business.business_categories && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm">
                            {categoryEmoji} {business.business_categories.name}
                          </span>
                        </div>
                      )}
                      {/* Business initial or logo */}
                      <div className="flex h-full items-center justify-center">
                        {business.logo_url ? (
                          <img
                            src={business.logo_url}
                            alt={business.name}
                            className="h-16 w-16 rounded-full object-cover ring-2 ring-white/30"
                          />
                        ) : (
                          <span className="text-5xl font-extrabold text-white/30">
                            {business.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Card info */}
                    <div className="p-4">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-white">{business.name}</h3>
                        {business.is_verified && (
                          <BadgeCheck className="h-4 w-4 text-brand-primary-600" />
                        )}
                      </div>
                      {business.neighborhood && (
                        <p className="mt-1 text-sm text-muted">{business.neighborhood}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Ad Slot — feed hero ── */}
      <section className="px-6 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<AdSlotSkeleton size="hero" />}>
            <AdSlot context="feed" size="hero" />
          </Suspense>
        </div>
      </section>

      {/* ── Featured Incentives ── */}
      {featuredIncentives.length > 0 && (
        <section className="px-6 py-12 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">Ofertas Locales</h2>
                <p className="text-muted text-sm mt-1">Descuentos y premios en negocios de Cúcuta</p>
              </div>
              <Link
                href="/ofertas"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary-600 hover:text-brand-primary-700"
              >
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredIncentives.map((incentive) => (
                <IncentiveCard key={incentive.id} incentive={incentive} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Bento Features Grid ── */}
      <section className="px-6 py-16 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-white">
              Potencia tu crecimiento local
            </h2>
            <p className="mt-4 text-lg text-muted">
              Herramientas diseñadas para impulsar el comercio local en tu ciudad
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {/* Marketing IA — col-span-2 */}
            <div className="rounded-2xl border border-slate-800 bg-card p-8 sm:col-span-1 lg:col-span-2">
              <div className="mb-4 inline-flex rounded-lg bg-brand-primary-900/20 p-3">
                <Megaphone className="h-6 w-6 text-brand-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-white">Marketing IA</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Crea campañas publicitarias inteligentes que llegan al público correcto en tu zona.
              </p>
            </div>

            {/* Recompensas — col-span-2, dark */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-800 p-8 text-center sm:col-span-1 lg:col-span-2">
              <div className="mb-4 inline-flex rounded-lg bg-brand-accent-500/20 p-3">
                <Gift className="h-6 w-6 text-brand-accent-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Recompensas</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Cupones, descuentos y combos que atraen clientes recurrentes a tu comercio.
              </p>
            </div>

            {/* Impulso Local — col-span-2, gradient bg */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary-600 to-brand-accent-500 p-8 sm:col-span-2 lg:col-span-2">
              <Zap className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10" />
              <div className="relative">
                <h3 className="text-lg font-bold text-white">Impulso Local</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  Destaca tu negocio en tu barrio y conecta con clientes que buscan lo que ofreces.
                </p>
              </div>
            </div>

            {/* Marketplace — col-span-3 */}
            <div className="rounded-2xl border border-slate-800 bg-card p-8 sm:col-span-1 lg:col-span-3">
              <div className="mb-4 inline-flex rounded-lg bg-brand-success-900/20 p-3">
                <ShoppingBag className="h-6 w-6 text-brand-success-600" />
              </div>
              <h3 className="text-lg font-bold text-white">Marketplace</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Vende online sin complicaciones. Tu vitrina digital disponible 24/7 para tus
                clientes.
              </p>
            </div>

            {/* Asistente Inteligente — col-span-3, gradient */}
            <div className="rounded-2xl bg-gradient-to-br from-brand-primary-600 to-brand-primary-800 p-8 sm:col-span-1 lg:col-span-3">
              <div className="mb-4 inline-flex rounded-lg bg-white/20 p-3">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Asistente Inteligente</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Genera contenido, mejora imágenes y optimiza tu estrategia comercial con IA
                avanzada.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                  Copywriting
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                  Análisis
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                  Estrategia
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Showcase ── */}
      <section className="border-y border-slate-800 bg-slate-900/30 px-6 py-16 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Text + mini cards */}
            <div className="flex flex-col justify-center">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-white">
                Optimiza tu tiempo con nuestra IA
              </h2>
              <p className="mt-4 text-lg text-muted">
                Herramientas de inteligencia artificial diseñadas para que tu negocio crezca sin
                esfuerzo adicional.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-700 bg-card p-5">
                  <div className="mb-3 inline-flex rounded-lg bg-purple-900/20 p-2.5">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-white">Análisis de Mercado</h3>
                  <p className="mt-1 text-sm text-muted">
                    Entiende tu competencia y oportunidades locales.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-card p-5">
                  <div className="mb-3 inline-flex rounded-lg bg-brand-primary-900/20 p-2.5">
                    <MessageSquareText className="h-5 w-5 text-brand-primary-600" />
                  </div>
                  <h3 className="font-semibold text-white">Copywriting IA</h3>
                  <p className="mt-1 text-sm text-muted">
                    Genera textos persuasivos para tus productos.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Fake terminal UI */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-card shadow-xl">
                {/* Terminal header */}
                <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs font-semibold tracking-wider text-muted">
                    IMPULZIA CORE V2.0
                  </span>
                </div>
                {/* Terminal body */}
                <div className="space-y-4 p-5">
                  {/* AI suggestion card */}
                  <div className="rounded-xl bg-gradient-to-r from-brand-primary-900/20 to-brand-accent-900/20 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-brand-primary-600" />
                      <span className="text-xs font-bold text-brand-primary-400">
                        Sugerencia IA
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">
                      &quot;Ofrece un 15% de descuento en combos los viernes para aumentar ventas en
                      un 23%.&quot;
                    </p>
                  </div>
                  {/* Chart placeholder */}
                  <div className="rounded-xl border border-slate-700 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Ventas Semanales</span>
                      <TrendingUp className="h-4 w-4 text-brand-success-500" />
                    </div>
                    <div className="flex items-end gap-1.5">
                      {[40, 55, 45, 65, 50, 75, 85].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-brand-primary-400/20"
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
