import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BusinessEditForm } from '@/modules/negocios/components/business-edit-form'
import { BusinessService } from '@/modules/negocios/services/business.service'
import type { Business, BusinessCategory } from '@/modules/negocios/interfaces'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminBusinessEditPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/panel')

  const service = new BusinessService(supabase)

  const [businessResult, categoriesResult] = await Promise.all([
    supabase.from('businesses').select('*').eq('id', id).single(),
    service.getCategories(),
  ])

  if (!businessResult.data) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/panel/admin/negocios"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-muted hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-bold text-white truncate">
            {businessResult.data.name}
          </h1>
          <p className="text-muted text-sm">Editar negocio · Admin</p>
        </div>
      </div>

      <BusinessEditForm
        business={businessResult.data as Business}
        categories={(categoriesResult.data as BusinessCategory[]) ?? []}
      />
    </div>
  )
}
