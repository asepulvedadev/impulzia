import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AdForm } from '@/modules/anuncios/components/ad-form'

export default async function NuevoAnuncioPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!business) redirect('/panel/negocio')

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
        <span className="text-white">Nuevo anuncio</span>
      </nav>

      <h1 className="font-heading text-2xl font-bold text-white">Crear anuncio</h1>

      <AdForm businessId={business.id} mode="create" />
    </div>
  )
}
