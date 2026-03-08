'use client'

import { useTransition } from 'react'
import { BadgeCheck, UserX, UserCheck } from 'lucide-react'
import { updateUserRoleAction, toggleUserStatusAction } from '../actions/admin.actions'
import type { Database } from '@/lib/supabase/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

const ROLE_LABELS: Record<string, string> = {
  user: 'Usuario',
  business_owner: 'Negocio',
  admin: 'Admin',
}

const ROLE_COLORS: Record<string, string> = {
  user: 'bg-slate-700 text-slate-300',
  business_owner: 'bg-brand-accent-900/40 text-brand-accent-300',
  admin: 'bg-brand-primary-900/40 text-brand-primary-300',
}

function UserRow({ user, currentAdminId }: { user: ProfileRow; currentAdminId: string }) {
  const [pending, startTransition] = useTransition()
  const isSelf = user.id === currentAdminId

  function handleRoleChange(role: string) {
    startTransition(() => {
      updateUserRoleAction(user.id, role)
    })
  }

  function handleToggleStatus() {
    startTransition(() => {
      toggleUserStatusAction(user.id, !user.is_active)
    })
  }

  const initial = user.full_name?.charAt(0).toUpperCase() ?? user.email.charAt(0).toUpperCase()

  return (
    <tr className={`border-b border-slate-800/60 transition-colors hover:bg-slate-800/20 ${!user.is_active ? 'opacity-50' : ''}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary-700 to-brand-accent-600 text-sm font-bold text-white">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user.full_name || '—'}
              {isSelf && (
                <span className="ml-1.5 text-xs font-normal text-muted">(tú)</span>
              )}
            </p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-3 text-sm text-muted sm:table-cell">
        {user.city || '—'}
      </td>
      <td className="px-4 py-3">
        {isSelf ? (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLORS[user.role]}`}>
            <BadgeCheck className="h-3 w-3" />
            {ROLE_LABELS[user.role] ?? user.role}
          </span>
        ) : (
          <select
            value={user.role}
            disabled={pending}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brand-primary-500 disabled:opacity-50"
          >
            <option value="user">Usuario</option>
            <option value="business_owner">Negocio</option>
            <option value="admin">Admin</option>
          </select>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-muted hidden lg:table-cell">
        {new Date(user.created_at).toLocaleDateString('es-CO')}
      </td>
      <td className="px-4 py-3 text-right">
        {!isSelf && (
          <button
            onClick={handleToggleStatus}
            disabled={pending}
            title={user.is_active ? 'Desactivar usuario' : 'Activar usuario'}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
              user.is_active
                ? 'border border-red-800 text-red-400 hover:bg-red-900/20'
                : 'border border-brand-success-800 text-brand-success-400 hover:bg-brand-success-900/20'
            }`}
          >
            {user.is_active ? (
              <><UserX className="h-3.5 w-3.5" /> Desactivar</>
            ) : (
              <><UserCheck className="h-3.5 w-3.5" /> Activar</>
            )}
          </button>
        )}
      </td>
    </tr>
  )
}

interface UsersTableProps {
  users: ProfileRow[]
  currentAdminId: string
}

export function UsersTable({ users, currentAdminId }: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Usuario</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted sm:table-cell">Ciudad</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Rol</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted lg:table-cell">Registro</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Acción</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow key={user.id} user={user} currentAdminId={currentAdminId} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
