import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import { createClient } from '@/lib/supabase/server'
import { IncentiveService } from '@/modules/incentivos/services/incentive.service'
import { IncentiveForm } from '@/modules/incentivos/components/incentive-form'
import { BusinessRedemptionsTable } from '@/modules/incentivos/components/business-redemptions-table'
import {
  updateIncentiveAction,
  publishIncentiveAction,
} from '@/modules/incentivos/actions/incentive.actions'
import type { Incentive } from '@/modules/incentivos/interfaces'

interface Props {
  params: Promise<{ id: string }>
}

export default async function IncentiveDetailPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const service = new IncentiveService(supabase)
  const { data: incentive } = await service.getById(id)
  if (!incentive) notFound()

  // Fetch redemptions
  const { data: redemptions } = await service.getRedemptionsByBusiness(incentive.business_id, 30)

  // Wrapper to satisfy void return type for form
  async function updateAction(data: unknown): Promise<{ success: boolean; error?: string | null; data?: Incentive | null }> {
    'use server'
    return updateIncentiveAction(id, data)
  }

  async function publishAction(formId: string): Promise<void> {
    'use server'
    await publishIncentiveAction(formId)
  }

  void publishAction

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/panel/incentivos"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-muted hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-white truncate max-w-xs">
            {incentive.title}
          </h1>
          <p className="text-muted text-sm capitalize">{incentive.type} · {incentive.status}</p>
        </div>
      </div>

      <Tabs.Root defaultValue="editar">
        <Tabs.List className="flex border-b border-slate-800 gap-1 mb-6">
          {['Editar', 'Canjes'].map((tab) => (
            <Tabs.Trigger
              key={tab}
              value={tab.toLowerCase()}
              className="px-4 py-2 text-sm font-medium text-muted data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-brand-primary-500 -mb-px transition-colors"
            >
              {tab}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="editar">
          <IncentiveForm
            onSubmit={updateAction}
            mode="edit"
            initialValues={{
              title: incentive.title,
              description: incentive.description ?? undefined,
              type: incentive.type,
              discount_type: incentive.discount_type ?? undefined,
              discount_value: incentive.discount_value ?? undefined,
              min_purchase: incentive.min_purchase ?? undefined,
              max_uses: incentive.max_uses ?? undefined,
              code: incentive.code ?? undefined,
              end_date: incentive.end_date ?? undefined,
              terms: incentive.terms ?? undefined,
            }}
          />
        </Tabs.Content>

        <Tabs.Content value="canjes">
          <BusinessRedemptionsTable redemptions={redemptions ?? []} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
