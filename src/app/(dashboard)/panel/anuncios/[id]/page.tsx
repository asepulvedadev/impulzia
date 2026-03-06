import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import { createClient } from '@/lib/supabase/server'
import { AdService } from '@/modules/anuncios/services/ad.service'
import { AdForm } from '@/modules/anuncios/components/ad-form'
import { AdStatsDashboard } from '@/modules/anuncios/components/ad-stats-dashboard'
import { Button } from '@/components/ui/button'
import {
  publishAdAction,
  pauseAdAction,
  resumeAdAction,
} from '@/modules/anuncios/actions/ad.actions'

// Wrapper actions returning void for use in form action prop
async function publishAction(id: string): Promise<void> {
  'use server'
  await publishAdAction(id)
}
async function pauseAction(id: string): Promise<void> {
  'use server'
  await pauseAdAction(id)
}
async function resumeAction(id: string): Promise<void> {
  'use server'
  await resumeAdAction(id)
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AnuncioDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const service = new AdService(supabase)
  const { data: ad } = await service.getById(id)

  if (!ad || ad.owner_id !== user.id) notFound()

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()

  const { data: stats } = await service.getStats(id, user.id)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted">
        <Link href="/panel" className="hover:text-white transition-colors">
          Panel
        </Link>
        <ChevronRight size={14} />
        <Link href="/panel/anuncios" className="hover:text-white transition-colors">
          Anuncios
        </Link>
        <ChevronRight size={14} />
        <span className="text-white truncate max-w-[200px]">{ad.title}</span>
      </nav>

      {/* Header with actions */}
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-xl font-bold text-white flex-1 min-w-0 truncate">
          {ad.title}
        </h1>
        {ad.status === 'draft' && (
          <form action={publishAction.bind(null, id)}>
            <Button type="submit" size="sm">
              Publicar
            </Button>
          </form>
        )}
        {ad.status === 'active' && (
          <form action={pauseAction.bind(null, id)}>
            <Button type="submit" size="sm" variant="outline">
              Pausar
            </Button>
          </form>
        )}
        {ad.status === 'paused' && (
          <form action={resumeAction.bind(null, id)}>
            <Button type="submit" size="sm">
              Reactivar
            </Button>
          </form>
        )}
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="edit">
        <Tabs.List className="flex gap-1 border-b border-slate-800 mb-6">
          {[
            { value: 'edit', label: 'Editar' },
            { value: 'stats', label: 'Estadísticas' },
          ].map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="px-4 py-2.5 text-sm font-medium text-muted border-b-2 border-transparent data-[state=active]:text-white data-[state=active]:border-brand-primary-500 transition-colors"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="edit">
          <AdForm businessId={business?.id ?? ''} ad={ad} mode="edit" />
        </Tabs.Content>

        <Tabs.Content value="stats">
          <AdStatsDashboard ad={ad} stats={stats ?? null} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
