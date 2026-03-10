'use client'

import { useTransition, useState } from 'react'
import Link from 'next/link'
import { BadgeCheck, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { adminToggleBusinessStatusAction, adminDeleteBusinessAction } from '../actions/admin.actions'
import type { Database } from '@/lib/supabase/database.types'

type BusinessRow = Database['public']['Tables']['businesses']['Row']

const TIER_COLORS: Record<string, string> = {
  free: 'bg-slate-700 text-slate-300',
  basic: 'bg-slate-700 text-slate-300',
  pro: 'bg-brand-accent-900/40 text-brand-accent-300',
  premium: 'bg-yellow-900/40 text-yellow-300',
}

function BusinessRow({ business }: { business: BusinessRow }) {
  const [pending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleToggleStatus() {
    startTransition(() => {
      adminToggleBusinessStatusAction(business.id, !business.is_active)
    })
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    startTransition(() => {
      adminDeleteBusinessAction(business.id)
    })
  }

  return (
    <tr className={`border-b border-slate-800/60 transition-colors hover:bg-slate-800/20 ${!business.is_active ? 'opacity-50' : ''}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-slate-800">
            {business.logo_url ? (
              <img src={business.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
                {business.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {business.name}
              {business.is_verified && (
                <BadgeCheck className="ml-1 inline h-3.5 w-3.5 text-brand-primary-400" />
              )}
            </p>
            <p className="truncate text-xs text-muted">{business.city ?? '—'}</p>
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TIER_COLORS[business.subscription_tier] ?? TIER_COLORS.free}`}>
          {business.subscription_tier}
        </span>
      </td>
      <td className="hidden px-4 py-3 text-xs text-muted lg:table-cell">
        {new Date(business.created_at).toLocaleDateString('es-CO')}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/panel/admin/negocios/${business.id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-brand-primary-600 hover:text-white"
          >
            <Edit className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Editar</span>
          </Link>
          <button
            onClick={handleToggleStatus}
            disabled={pending}
            title={business.is_active ? 'Desactivar' : 'Activar'}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
              business.is_active
                ? 'border border-red-800 text-red-400 hover:bg-red-900/20'
                : 'border border-brand-success-800 text-brand-success-400 hover:bg-brand-success-900/20'
            }`}
          >
            {business.is_active ? (
              <><ToggleRight className="h-3.5 w-3.5" /><span className="hidden sm:inline">Desactivar</span></>
            ) : (
              <><ToggleLeft className="h-3.5 w-3.5" /><span className="hidden sm:inline">Activar</span></>
            )}
          </button>
          <button
            onClick={handleDelete}
            disabled={pending}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
              confirmDelete
                ? 'border border-red-500 bg-red-900/30 text-red-300'
                : 'border border-slate-700 text-slate-400 hover:border-red-800 hover:text-red-400'
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{confirmDelete ? '¿Confirmar?' : 'Eliminar'}</span>
          </button>
        </div>
      </td>
    </tr>
  )
}

interface AdminBusinessesTableProps {
  businesses: BusinessRow[]
}

export function AdminBusinessesTable({ businesses }: AdminBusinessesTableProps) {
  if (businesses.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 border-dashed py-12 text-center">
        <p className="text-white font-medium">No hay negocios registrados</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Negocio</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted sm:table-cell">Plan</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted lg:table-cell">Registro</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((b) => (
              <BusinessRow key={b.id} business={b} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
