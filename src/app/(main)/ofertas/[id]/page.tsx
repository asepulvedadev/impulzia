import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { IncentiveService } from '@/modules/incentivos/services/incentive.service'
import { IncentiveCard } from '@/modules/incentivos/components/incentive-card'
import type { IncentiveWithBusiness } from '@/modules/incentivos/interfaces'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OfertaDetailPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const service = new IncentiveService(supabase)
  const { data: incentive } = await service.getById(id)

  if (!incentive || incentive.status !== 'active') notFound()

  return (
    <div className="min-h-screen">
      <div className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Link
          href="/ofertas"
          className="flex items-center gap-1 text-sm text-muted hover:text-white transition-colors"
        >
          <ChevronLeft size={14} />
          Volver a ofertas
        </Link>

        <IncentiveCard
          incentive={incentive as IncentiveWithBusiness}
          compact={false}
        />

        {incentive.terms && (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-medium text-white mb-2">Términos y condiciones</h3>
            <p className="text-xs text-muted">{incentive.terms}</p>
          </div>
        )}
      </div>
    </div>
  )
}
