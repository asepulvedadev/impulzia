import Link from 'next/link'
import { Store, Megaphone, Gift, Sparkles, Pencil } from 'lucide-react'
import { Card, CardContent, Button } from '@/components/ui'
import { BusinessInsightsPanel } from '@/modules/analytics/components/business-insights-panel'
import { getBusinessInsightsAction } from '@/modules/analytics/actions/insights.actions'
import type { Database } from '@/lib/supabase/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type BusinessRow = Database['public']['Tables']['businesses']['Row']

interface DashboardContentProps {
  profile: ProfileRow | null
  business: BusinessRow | null
}

const quickActions = [
  {
    href: '/panel/negocio',
    label: 'Editar mi negocio',
    description: 'Actualiza la información de tu comercio',
    icon: Pencil,
  },
  {
    href: '/panel/anuncios',
    label: 'Crear anuncio',
    description: 'Llega a más clientes con publicidad',
    icon: Megaphone,
  },
  {
    href: '/panel/ia',
    label: 'Centro IA',
    description: 'Genera contenido con inteligencia artificial',
    icon: Sparkles,
  },
  {
    href: '/panel/incentivos',
    label: 'Mis incentivos',
    description: 'Crea cupones y descuentos',
    icon: Gift,
  },
]

export async function DashboardContent({ profile, business }: DashboardContentProps) {
  const firstName = profile?.full_name?.split(' ')[0] || 'Usuario'

  const insights = business
    ? await getBusinessInsightsAction(business.id)
    : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          Hola, {firstName} 👋
        </h1>
        <p className="mt-1 text-muted">Bienvenido a tu panel de control</p>
      </div>

      {!business ? (
        <Card className="border-2 border-dashed border-brand-primary-700 bg-brand-primary-900/10">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="rounded-2xl bg-brand-primary-900/30 p-4">
              <Store className="h-10 w-10 text-brand-primary-600" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">Registra tu negocio en Rcomienda</h2>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Crea tu perfil comercial para empezar a publicar anuncios, ofrecer cupones y usar
              herramientas de IA para tu negocio.
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link href="/panel/negocio">Registrar mi negocio</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {insights && <BusinessInsightsPanel data={insights} />}

          <div>
            <h2 className="font-heading mb-4 text-lg font-bold text-white">Acciones rápidas</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group rounded-2xl border border-slate-800 bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="inline-flex rounded-lg bg-brand-primary-900/20 p-2.5">
                    <action.icon className="h-5 w-5 text-brand-primary-600" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-white">{action.label}</h3>
                  <p className="mt-1 text-xs text-muted">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
